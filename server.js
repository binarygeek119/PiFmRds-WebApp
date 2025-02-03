const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer'); // For handling file uploads
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Configure multer for file uploads
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

let piFmProcess = null;

// API endpoint to handle file upload and start FM transmission
app.post('/start', upload.single('audioFile'), (req, res) => {
    const { frequency } = req.body;
    const uploadedFile = req.file;

    if (!frequency || !uploadedFile) {
        return res.status(400).send('Frequency and audio file are required');
    }

    // Convert the uploaded file to the correct format
    const inputFilePath = uploadedFile.path;
    const outputFilePath = path.join(__dirname, 'uploads/', 'converted.wav');
    const ffmpegCommand = `ffmpeg -i ${inputFilePath} -ac 2 -ar 44100 -sample_fmt s16 ${outputFilePath}`;

    exec(ffmpegCommand, (ffmpegError, ffmpegStdout, ffmpegStderr) => {
        if (ffmpegError) {
            console.error(`FFmpeg Error: ${ffmpegStderr}`);
            return res.status(500).send('Error converting audio file');
        }

        // Start PiFmRds with the converted file
        const piFmCommand = `sudo ${path.join(__dirname, 'PiFmRds/src/pi_fm_rds')} -freq ${frequency} -audio ${outputFilePath}`;
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Web application running on http://localhost:${PORT}`);
});