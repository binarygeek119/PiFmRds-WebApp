# PiFmRds Web Application

This package provides a web interface to control the PiFmRds FM transmission software on a Raspberry Pi.


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
