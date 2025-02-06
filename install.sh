#!/bin/bash

# Update and install dependencies
sudo apt update
sudo apt full-upgrade -y
sudo apt install -y nodejs npm ffmpeg libsndfile1-dev git

# Ensure Node.js and npm are up to date
sudo npm install -g n
sudo n stable
sudo npm install -g npm@latest

# Install Node.js dependencies
cd /home/$USER/PiFmRds-WebApp
npm install express body-parser multer fluent-ffmpeg

# Clone PiFmRds Repository
if [ ! -d "PiFmRds" ]; then
    git clone https://github.com/ChristopheJacquet/PiFmRds.git
fi

# Build PiFmRds
cd PiFmRds/src
make clean
make

# Create necessary directories
mkdir -p /home/$USER/PiFmRds-WebApp/uploads
mkdir -p /home/$USER/PiFmRds-WebApp/metadata

# Set permissions for the uploads and metadata directories
sudo chown -R $USER:$USER /home/$USER/PiFmRds-WebApp/uploads
sudo chown -R $USER:$USER /home/$USER/PiFmRds-WebApp/metadata

echo "================================="
echo "Installation complete!"
echo "To start the web application, run:"
echo "cd /home/$USER/PiFmRds-WebApp"
echo "node server.js"
echo "================================="
echo "                         "
echo "   __            _       "
echo "  / _|          (_)      "
echo " | |_ _   _ _ __ _  ___  "
echo " |  _| | | | '__| |/ _ \ "
echo " | | | |_| | |  | | (_) |"
echo " |_|  \__,_|_|  |_|\___/ "
echo "                         "
echo "                         "
echo "================================="
echo " Here is the Directory Structure "
echo "                                 "
echo "   PiFmRds-WebApp/               "
echo "   ├── PiFmRds/                # PiFmRds source code      "
echo "   ├── public/                 # Web application frontend "
echo "   │   ├── index.html          # Frontend HTML file       "
echo "   │   ├── dashboard.html      # Frontend DASHBOARD       "
echo "   │   └── logo.png            # Logo image               "
echo "   ├── uploads/                # Uploaded audio files     "
echo "   ├── metadata/               # Metadata of audio files  "
echo "   ├── server.js               # Backend script           "
echo "   ├── install.sh              # Installation script      "
echo "   ├── README.md               # Documentation            "
echo "   └── .gitignore              # Git ignore file          "
echo "                           "
echo "================================="
