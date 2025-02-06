const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create metadata folder if it doesn't exist
const metadataDir = path.join(__dirname, 'metadata');
if (!fs.existsSync(metadataDir)) {
    fs.mkdirSync(metadataDir);
}

// Configure multer to save files with their original names
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads/'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Save with the original filename
    }
});

const upload = multer({ storage });

let piFmProcess = null;
let schedulerQueue = [];
let isSchedulerRunning = false;
let currentFileIndex = 0;

// Global variables for dashboard data
let currentFrequency = 'N/A';
let currentPS = 'N/A';
let currentRT = 'N/A';
let currentFileName = 'N/A';
let playedTracks = 0;
let queuedTracks = 0;
let totalPlayedDuration = 0;
let totalRemainingDuration = 0;

// Function to get metadata for a file using ffprobe
function getFileMetadata(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                console.error(`Error fetching metadata for ${filePath}:`, err);
                reject(err);
            } else {
                resolve(metadata);
            }
        });
    });
}

// Function to analyze all files in the uploads folder and store metadata
async function analyzeFiles() {
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsDir).filter(file => file.endsWith('.wav'));

    for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const metadataFilePath = path.join(metadataDir, `${file}.json`);

        try {
            const metadata = await getFileMetadata(filePath);
            fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2));
            console.log(`Metadata saved for ${file}`);
        } catch (err) {
            console.error(`Failed to analyze ${file}:`, err);
        }
    }
}

// Function to delete all metadata files
function clearMetadata() {
    const files = fs.readdirSync(metadataDir);
    for (const file of files) {
        fs.unlinkSync(path.join(metadataDir, file));
    }
    console.log('Metadata folder cleared.');
}

// API endpoint to list WAV files in the uploads folder
app.get('/files', (req, res) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan files');
        }
        const wavFiles = files.filter(file => file.endsWith('.wav'));
        res.send(wavFiles);
    });
});

// API endpoint to handle file upload and start FM transmission
app.post('/start', upload.single('audioFile'), (req, res) => {
    const { frequency, ps, rt, useExistingFile } = req.body;
    const uploadedFile = req.file;

    if (!frequency || (!uploadedFile && !useExistingFile)) {
        return res.status(400).send('Frequency and audio file are required');
    }

    // Stop any existing transmission
    if (piFmProcess) {
        piFmProcess.kill();
    }

    let outputFilePath;

    if (useExistingFile) {
        // Use the existing file directly
        outputFilePath = path.join(__dirname, 'uploads/', useExistingFile);
        currentFileName = useExistingFile;
    } else {
        // Verify the uploaded file has a .wav extension
        if (!uploadedFile.originalname.endsWith('.wav')) {
            return res.status(400).send('Only .wav files are allowed');
        }

        // Use the uploaded file directly
        outputFilePath = path.join(__dirname, 'uploads/', uploadedFile.originalname);
        currentFileName = uploadedFile.originalname;
    }

    // Update global variables for dashboard
    currentFrequency = frequency;
    currentPS = ps;
    currentRT = rt;

    // Start PiFmRds with the selected file and RDS options
    const piFmCommand = `sudo ${path.join(__dirname, 'PiFmRds/src/pi_fm_rds')} -freq ${frequency} -audio ${outputFilePath} -ps "${ps}" -rt "${rt}"`;
    console.log(`Executing command: ${piFmCommand}`);
    piFmProcess = exec(piFmCommand, (piFmError, piFmStdout, piFmStderr) => {
        if (piFmError) {
            console.error(`PiFmRds Error: ${piFmStderr}`);
            return res.status(500).send('Error starting FM transmission');
        }
        console.log(`PiFmRds Output: ${piFmStdout}`);
    });

    // Log the process ID
    console.log(`PiFmRds process started with PID: ${piFmProcess.pid}`);
    res.send('FM transmission started');
});

// API endpoint to stop FM transmission
app.post('/stop', (req, res) => {
    if (piFmProcess) {
        piFmProcess.kill();
        piFmProcess = null;
        console.log('FM transmission stopped');

        // Reset dashboard data
        currentFrequency = 'N/A';
        currentPS = 'N/A';
        currentRT = 'N/A';
        currentFileName = 'N/A';

        res.send('FM transmission stopped');
    } else {
        console.log('No active FM transmission');
        res.status(400).send('No active FM transmission');
    }
});

// API endpoint to start the scheduler
app.post('/scheduler/start', async (req, res) => {
    const { frequency, ps, rt, files, gaps } = req.body;

    // Validate input
    if (!frequency || !files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).send('Frequency and files array are required');
    }
    if (!gaps || !Array.isArray(gaps) || gaps.length !== files.length - 1) {
        return res.status(400).send('Invalid gaps array');
    }
    if (gaps.some(gap => isNaN(gap) || gap < 0)) {
        return res.status(400).send('Gaps must be non-negative numbers');
    }

    // Stop any existing scheduler
    if (isSchedulerRunning) {
        stopScheduler();
    }

    // Analyze files and store metadata
    await analyzeFiles();

    // Initialize the scheduler queue
    schedulerQueue = files.map((file, index) => ({
        file,
        gap: gaps[index] || 3 // Default gap of 3 seconds if not specified
    }));

    // Update global variables for dashboard
    currentFrequency = frequency;
    currentPS = ps;
    currentRT = rt;
    currentFileName = files[0]; // Set the first file as the current file
    queuedTracks = files.length;
    playedTracks = 0;
    totalPlayedDuration = 0;
    totalRemainingDuration = calculateTotalDuration(files);

    // Start the scheduler
    currentFileIndex = 0;
    isSchedulerRunning = true;
    playNextScheduledFile(frequency, ps, rt);

    res.send('Scheduler started');
});

function calculateTotalDuration(files) {
    let totalDuration = 0;
    files.forEach(file => {
        const metadataFilePath = path.join(metadataDir, `${file}.json`);
        if (fs.existsSync(metadataFilePath)) {
            const metadata = JSON.parse(fs.readFileSync(metadataFilePath, 'utf8'));
            totalDuration += metadata.format.duration || 0;
        }
    });
    return totalDuration;
}

// API endpoint to stop the scheduler
app.post('/scheduler/stop', (req, res) => {
    stopScheduler();
    res.send('Scheduler stopped');
});

// Function to stop the scheduler
function stopScheduler() {
    isSchedulerRunning = false;
    schedulerQueue = [];
    currentFileIndex = 0;

    // Stop any ongoing transmission
    if (piFmProcess) {
        piFmProcess.kill();
        piFmProcess = null;
    }

    // Reset dashboard data
    currentFrequency = 'N/A';
    currentPS = 'N/A';
    currentRT = 'N/A';
    currentFileName = 'N/A';
    queuedTracks = 0;
    playedTracks = 0;
    totalPlayedDuration = 0;
    totalRemainingDuration = 0;

    // Clear metadata folder
    clearMetadata();
}

function playNextScheduledFile(frequency, ps, rt) {
    if (!isSchedulerRunning || currentFileIndex >= schedulerQueue.length) {
        // Loop the scheduler if it reaches the end
        currentFileIndex = 0;
    }

    const { file, gap } = schedulerQueue[currentFileIndex];
    const filePath = path.join(__dirname, 'uploads/', file);

    // Update global variables for dashboard
    currentFileName = file;
    queuedTracks--; // Decrement queuedTracks before starting the next track

    // Start PiFmRds with the current file
    const piFmCommand = `sudo ${path.join(__dirname, 'PiFmRds/src/pi_fm_rds')} -freq ${frequency} -audio ${filePath} -ps "${ps}" -rt "${rt}"`;
    console.log(`Playing file: ${file}`);
    piFmProcess = exec(piFmCommand, (piFmError, piFmStdout, piFmStderr) => {
        if (piFmError) {
            console.error(`PiFmRds Error: ${piFmStderr}`);
        }
    });

    // Get the duration of the current file and schedule the next file
    const metadataFilePath = path.join(metadataDir, `${file}.json`);
    if (fs.existsSync(metadataFilePath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataFilePath, 'utf8'));
        const duration = metadata.format.duration || 0;

        setTimeout(() => {
            // Increment playedTracks and update durations AFTER the track finishes
            playedTracks++;
            totalPlayedDuration += duration;
            totalRemainingDuration -= duration;

            currentFileIndex++;
            playNextScheduledFile(frequency, ps, rt);
        }, (duration + gap) * 1000);
    } else {
        console.error(`Metadata not found for ${file}`);
        currentFileIndex++;
        playNextScheduledFile(frequency, ps, rt); // Skip to the next file if metadata is missing
    }
}

// API endpoint to provide dashboard data
app.get('/dashboard-data', (req, res) => {
    const queuedTracksList = schedulerQueue.slice(currentFileIndex).map(item => item.file);
    const playedTracksList = schedulerQueue.slice(0, currentFileIndex).map(item => item.file);

    // Fetch metadata for the currently playing track
    const metadataFilePath = path.join(metadataDir, `${currentFileName}.json`);
    if (fs.existsSync(metadataFilePath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataFilePath, 'utf8'));
        const currentTrack = {
            name: currentFileName,
            artist: metadata.format.tags?.artist || 'N/A',
            album: metadata.format.tags?.album || 'N/A',
            duration: metadata.format.duration ? metadata.format.duration.toFixed(2) : 'N/A',
            url: `/uploads/${currentFileName}`,
            metadata: metadata // Include full metadata for detailed display
        };

        res.json({
            frequency: currentFrequency,
            rt: currentRT,
            ps: currentPS,
            playedTracks: playedTracks,
            queuedTracks: queuedTracks,
            totalPlayedDuration: totalPlayedDuration.toFixed(2),
            totalRemainingDuration: totalRemainingDuration.toFixed(2),
            queuedTracksList: queuedTracksList,
            playedTracksList: playedTracksList,
            currentTrack: currentTrack,
            isSchedulerRunning: isSchedulerRunning // Add scheduler status for the "On Air" indicator
        });
    } else {
        res.json({
            frequency: currentFrequency,
            rt: currentRT,
            ps: currentPS,
            playedTracks: playedTracks,
            queuedTracks: queuedTracks,
            totalPlayedDuration: totalPlayedDuration.toFixed(2),
            totalRemainingDuration: totalRemainingDuration.toFixed(2),
            queuedTracksList: queuedTracksList,
            playedTracksList: playedTracksList,
            currentTrack: {
                name: currentFileName,
                artist: 'N/A',
                album: 'N/A',
                duration: 'N/A',
                url: `/uploads/${currentFileName}`,
                metadata: null
            },
            isSchedulerRunning: isSchedulerRunning // Add scheduler status for the "On Air" indicator
        });
    }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Web application running on http://localhost:${PORT}`);
});
