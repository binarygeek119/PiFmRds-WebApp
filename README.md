# PiFmRds Web Application (V3)

This package provides a web interface to control the PiFmRds FM transmission software on a Raspberry Pi OS Lite. Version 3 introduces a scheduler feature, allowing you to queue and loop audio files with customizable gaps between them. It also includes improvements to the user interface and error handling.

## Before Installation

1. Login to SSH using PuTTy and run these commands
   ```bash
   sudo apt update
   sudo apt full-upgrade -y
   sudo apt install git
   sudo raspi-config     # Expand filesystem


## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/furipaf/PiFmRds-WebApp.git
   cd PiFmRds-WebApp

2. Make the script executable and run it
   ```bash
   chmod +x install.sh
   ./install.sh

3. Test the FM Trasmission by running
   ```bash
   cd /PiFmRds/src
   sudo ./pi_fm_rds

This will generate an FM transmission on 107.9 MHz, with default station name (PS), radiotext (RT) and PI-code, without audio. The radiofrequency signal is emitted on GPIO 4 (pin 7 on header P1). For more details on custom command please visit the repository https://github.com/ChristopheJacquet/PiFmRds 

4. After installation, start the web application
   ```bash
   node server.js

5. Open a browser and navigate to:
   ```bash
   http://<Raspberry-Pi-IP>:3000

6. Here’s the structure of the package:
   ---
   ```bash
   PiFmRds-WebApp/
   ├── PiFmRds/                # PiFmRds source code
   ├── public/                 # Web application frontend
   │   ├── index.html          # Frontend HTML file
   │   └── logo.png            # Logo image
   ├── uploads/                # Uploaded audio files
   ├── server.js               # Backend script
   ├── install.sh              # Installation script
   ├── README.md               # Documentation
   └── .gitignore              # Git ignore file
   ---
# Features in Version 3
## 1. Scheduler:
   - Queue multiple audio files for playback.
   - Specify custom gaps (in seconds) between files.
   - Loop the playlist indefinitely until manually stopped.
   - Set frequency, PS (Program Service), and RT (Radio Text) for the scheduler.

## 2. Improved Error Handling:
   - Default gap of 3 seconds if no valid input is provided.
   - Better error messages for invalid inputs.

## 3. User Interface Enhancements:
   - Added frequency, PS, and RT fields in the scheduler tab.
   - Updated labels for better clarity (e.g., "Segue (Seconds | Default: 3 Sec)").

## 4. Bug Fixes:
   - Fixed issues with the scheduler loop causing errors after the playlist ends.

# Notes
## 1. File Uploads:
   - Do not upload files with the same name. If needed, delete all files from /PiFmRds-WebApp/uploads/ before uploading.
## 2. Playable WAV File Formats:
   - PCM, 44.1 kHz, Stereo, 16-bit
   - PCM, 44.1 kHz, Mono, 16-bit
## 3. File Naming:
   - Only alphanumeric characters are allowed in WAV file names. Avoid spaces, parentheses, or special characters.
## 4. FM Transmission Control:
   - Always use the web application buttons to start/stop FM transmission. Avoid using Control + C in PuTTy to stop transmission.
## 5. Scheduler:
   - If no gap is specified or the input is invalid, the default gap of 3 seconds will be used.
   - The scheduler will loop the playlist indefinitely until manually stopped or another schedule is activated.

---

## Acknowledgments

This project was developed with the assistance of **DeepSeek**, an AI-powered coding assistant. DeepSeek provided guidance, code snippets, and troubleshooting support to help bring this project to life. Special thanks to the DeepSeek team for their invaluable help!

---

**Disclaimer**: This project is intended for educational and experimental purposes only. Please ensure compliance with local regulations when transmitting FM signals.

## ScreenShot

<p align="center"> <img src="https://github.com/user-attachments/assets/6bfb98f8-a25a-46fd-b0b2-e608b026690b" width="31%"> <img src="https://github.com/user-attachments/assets/678ebb5d-ecde-4867-a780-d75d8b87bd12" width="31%"> <img src="https://github.com/user-attachments/assets/c942ed90-70c1-4acc-907c-0290ae1aae1b" width="31%"> </p>

