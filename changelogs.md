# v1: Initial Release

## Description:
This is the initial release of the PiFmRds Web Application, providing basic functionality for controlling FM transmission via a web interface. Users can upload .wav files and start/stop transmission with custom frequency, PS (Program Service), and RT (Radio Text). This version focuses on core functionality and lays the foundation for future enhancements.

## Features:
   - Upload .wav files for FM transmission.
   - Set custom frequency, PS (8 characters), and RT (64 characters).
   - Start and stop FM transmission via the web interface.

## Limitations:
   - No logo or copyright information.
   - No support for selecting existing files or scheduling.
   - Manual server startup required.
---
# v2: Enhanced Features and Bug Fixes

## Description:
This release introduces significant improvements and bug fixes, making the PiFmRds Web Application more user-friendly and feature-rich. Users can now select existing .wav files from the uploads folder, and the application includes a logo and copyright information. The scheduler feature is planned for v3.

## Features:
   - Upload Tab: Upload .wav files for FM transmission.
   - Existing Files Tab: Select and play existing .wav files from the uploads folder.
   - Custom frequency, PS (8 characters), and RT (64 characters) for both tabs.
   - Shared status display for real-time feedback.
   - Added logo and GPLv3 license information in the footer.

## Bug Fixes:
   - Fixed issues with file uploads and playback.
   - Improved error handling and user feedback.

## Limitations:
   - Scheduler functionality is not yet available.
   - Manual server startup required.
---
# v3: Scheduler and Advanced Features

## Description:
The v3 release introduces the highly anticipated Scheduler Tab, allowing users to schedule multiple .wav files for playback throughout the day. This version also includes a standalone installation package, enabling users to access the controller app directly after installation. Additionally, remote access and SSL support are added for secure, global access.

## Features:
   - Scheduler Tab: Schedule multiple .wav files with custom gaps between playback.

## Enhancements:
   - Improved UI/UX for better usability.
   - Robust error handling and user feedback.
---
# Features in v4

- **On Air Indicator**: A visual indicator shows whether the FM transmission is active (green) or inactive (red).
- **Track Information**: Displays detailed metadata for each track, including title, artist, codec, sample rate, duration, and more.
- **Scheduler**: Schedule multiple tracks with custom gaps between them.
- **Responsive Design**: The dashboard is optimized for both desktop and mobile devices.
- **Metadata Storage**: Metadata for all audio files is stored in the `metadata` folder for quick access.
- **Real-Time Updates**: The dashboard updates every 2 seconds to reflect the latest status.
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
# Future Plans:
1. Expand scheduler functionality with advanced options.
2. Add support for additional audio formats.
3. Integrate with external APIs (YouTube, Spotify etc) for enhanced features.
4. Standalone Installation: Automatic server startup after installation.
5. Remote Access: Access the controller app from anywhere in the world.
6. SSL Support: Secure communication with HTTPS.
7. Live Broadcast Tab: Stream live audio directly through the web interface (optional).

# How to Use
- v1: Upload .wav files and start FM transmission with custom settings.
- v2: Use the Upload and Existing Files tabs for more flexibility.
- v3: Schedule playback.
- v4: Live / Real Time Dashboard 
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
