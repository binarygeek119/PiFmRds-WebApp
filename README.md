# PiFmRds Web Application

This package provides a web interface to control the PiFmRds FM transmission software on a Raspberry Pi OS Lite.

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
   sudo ./install.sh

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
   ```bash
   PiFmRds-WebApp/
   ├── PiFmRds/                # PiFmRds source code
   ├── public/                 # Web application frontend
   ├── server.js               # Web application backend
   ├── install.sh              # Installation script
   ├── README.md               # Documentation
   └── .gitignore              # Git ignore file

## Acknowledgments

This project was developed with the assistance of **DeepSeek**, an AI-powered coding assistant. DeepSeek provided guidance, code snippets, and troubleshooting support to help bring this project to life. Special thanks to the DeepSeek team for their invaluable help!

---

**Disclaimer**: This project is intended for educational and experimental purposes only. Please ensure compliance with local regulations when transmitting FM signals.
