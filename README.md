
![logo](https://github.com/user-attachments/assets/5bb67bd7-ab61-4d11-8bd6-479178df8c1f)

# PiFmRds Web Application | Realtime Playback Monitoring | Live Hardware Health Monitoring (v4)

This package provides a web interface to control the PiFmRds FM transmission software on a Raspberry Pi OS Lite. The application allows you to upload audio files, schedule playback, and monitor the FM transmission status in real-time. New feature for Live / Realtime Monitoring of Hardware Health has been added. 

## Video Tutorials (Installation and Usage)
- Installation: https://youtu.be/hmHKN9e0MNk
- Usage / Demo: https://youtu.be/elIC_mO1Xac
---

## Before Installation

1. Login to SSH using PuTTy and run these commands:
   ```bash
   sudo apt update
   sudo apt full-upgrade -y
   sudo apt install git
   sudo raspi-config     # Expand filesystem
   ```

---

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/furipaf/PiFmRds-WebApp.git
   cd PiFmRds-WebApp
   ```

2. Make the script executable and run it:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

3. Test the FM Transmission by running (optional):
   ```bash
   cd PiFmRds/src
   sudo ./pi_fm_rds
   ```

   This will generate an FM transmission on **107.9 MHz**, with default station name (PS), radiotext (RT), and PI-code, without audio. The radiofrequency signal is emitted on **GPIO 4 (pin 7 on header P1)**. For more details on custom commands, visit the repository: [PiFmRds](https://github.com/ChristopheJacquet/PiFmRds).

4. After installation, start the web application:
   ```bash
   node server.js
   ```

5. Open a browser and navigate to:
   ```bash
   http://<Raspberry-Pi-IP>:3000
   ```

---

## Features in v4

- **On Air Indicator**: A visual indicator shows whether the FM transmission is active (green) or inactive (red).
- **Track Information**: Displays detailed metadata for each track, including title, artist, codec, sample rate, duration, and more.
- **Scheduler**: Schedule multiple tracks with custom gaps between them.
- **Responsive Design**: The dashboard is optimized for both desktop and mobile devices.
- **Metadata Storage**: Metadata for all audio files is stored in the `metadata` folder for quick access.
- **Real-Time Updates**: The dashboard updates every 2 seconds to reflect the latest status.

---

## Directory Structure

Here’s the structure of the package:

```bash
PiFmRds-WebApp/
├── PiFmRds/                # PiFmRds source code
├── public/                 # Web application frontend
│   ├── index.html          # Frontend HTML file
│   ├── dashboard.html      # Dashboard HTML file
│   └── logo.png            # Logo image
├── uploads/                # Uploaded audio files
├── metadata/               # Metadata for audio files
├── server.js               # Backend script
├── install.sh              # Installation script
├── README.md               # Documentation
└── .gitignore              # Git ignore file
```

---

## Notes

1. **File Uploads**:
   - Do not upload files with the same name. Delete existing files from `/PiFmRds-WebApp/uploads/` before re-uploading.
   - Only **WAV files** with the following formats are supported:
     - PCM, 44.1 kHz, Stereo, 16-bit
     - PCM, 44.1 kHz, Mono, 16-bit
   - File names must contain only **alphanumeric characters**. No spaces, parentheses, or special characters.

2. **FM Transmission**:
   - Always use the web application to start/stop FM transmission. Avoid using `Control + C` in PuTTy.

3. **Scheduler**:
   - The scheduler automatically loops through the playlist when it reaches the end.
   - Metadata for all tracks is stored in the `metadata` folder and deleted when the scheduler stops.

4. **Dashboard**:
   - The dashboard is fully responsive and works on both desktop and mobile devices.
   - Track information is displayed in a fixed-size box with scrolling text for long titles and artist names.

---

## Acknowledgments

This project was developed with the assistance of **DeepSeek**, an AI-powered coding assistant. DeepSeek provided guidance, code snippets, and troubleshooting support to help bring this project to life. Special thanks to the DeepSeek team for their invaluable help!

---

**Disclaimer**: This project is intended for educational and experimental purposes only. Please ensure compliance with local regulations when transmitting FM signals.

---

## Changelog (v4)

### Added
- **On Air Indicator**: Visual indicator for FM transmission status.
- **Track Information Boxes**: Detailed metadata for each track in a fixed-size box.
- **Responsive Design**: Optimized for mobile and desktop devices.
- **Metadata Storage**: Metadata is stored in the `metadata` folder for quick access.

### Fixed
- **Metadata Loading**: Metadata for queued and played tracks is now displayed correctly.
- **Scheduler Issues**: Improved handling of track transitions and metadata updates.

### Improved
- **User Interface**: Enhanced dashboard layout and design.
- **Performance**: Reduced latency in metadata fetching and display.
---

## Screenshots

<p align="center"> 
 <img src="https://github.com/user-attachments/assets/6bfb98f8-a25a-46fd-b0b2-e608b026690b" width="31%">
 <img src="https://github.com/user-attachments/assets/678ebb5d-ecde-4867-a780-d75d8b87bd12" width="31%">
 <img src="https://github.com/user-attachments/assets/f41ce8fb-6023-4503-98f2-883ae3d1a196" width="31%">
</p>

## DashBoard
![dashboard](https://github.com/user-attachments/assets/6bce7db7-4f9b-412e-be54-632f3be8e81c)

---
