const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

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
    } else {
        // Verify the uploaded file has a .wav extension
        if (!uploadedFile.originalname.endsWith('.wav')) {
            return res.status(400).send('Only .wav files are allowed');
        }

        // Use the uploaded file directly
        outputFilePath = path.join(__dirname, 'uploads/', uploadedFile.originalname);
    }

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
        res.send('FM transmission stopped');
    } else {
        console.log('No active FM transmission');
        res.status(400).send('No active FM transmission');
    }
});

// API endpoint to start the scheduler
app.post('/scheduler/start', (req, res) => {
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

    // Initialize the scheduler queue
    schedulerQueue = files.map((file, index) => ({
        file,
        gap: gaps[index] || 3 // Default gap of 3 seconds if not specified
    }));

    // Start the scheduler
    currentFileIndex = 0;
    isSchedulerRunning = true;
    playNextScheduledFile(frequency, ps, rt);

    res.send('Scheduler started');
});

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
}

// Function to play the next file in the scheduler queue
function playNextScheduledFile(frequency, ps, rt) {
    if (!isSchedulerRunning || currentFileIndex >= schedulerQueue.length) {
        // Loop the scheduler if it reaches the end
        currentFileIndex = 0;
    }

    const { file, gap } = schedulerQueue[currentFileIndex];
    const filePath = path.join(__dirname, 'uploads/', file);

    // Start PiFmRds with the current file
    const piFmCommand = `sudo ${path.join(__dirname, 'PiFmRds/src/pi_fm_rds')} -freq ${frequency} -audio ${filePath} -ps "${ps}" -rt "${rt}"`;
    console.log(`Playing file: ${file}`);
    piFmProcess = exec(piFmCommand, (piFmError, piFmStdout, piFmStderr) => {
        if (piFmError) {
            console.error(`PiFmRds Error: ${piFmStderr}`);
        }
    });

    // Get the duration of the current file and schedule the next file
    getFileDuration(filePath)
        .then(duration => {
            setTimeout(() => {
                currentFileIndex++;
                playNextScheduledFile(frequency, ps, rt);
            }, (duration + gap) * 1000);
        })
        .catch(error => {
            console.error(`Error getting file duration: ${error}`);
            currentFileIndex++;
            playNextScheduledFile(frequency, ps, rt); // Skip to the next file if duration cannot be determined
        });
}

// Function to get the duration of a file (in seconds) using ffprobe
function getFileDuration(filePath) {
    return new Promise((resolve, reject) => {
        const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running ffprobe: ${stderr}`);
                reject(new Error('Unable to get file duration'));
            } else {
                const duration = parseFloat(stdout.trim());
                if (isNaN(duration)) {
                    reject(new Error('Invalid duration'));
                } else {
                    resolve(duration);
                }
            }
        });
    });
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Web application running on http://localhost:${PORT}`);
});
