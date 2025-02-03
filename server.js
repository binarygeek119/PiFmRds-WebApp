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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Web application running on http://localhost:${PORT}`);
});