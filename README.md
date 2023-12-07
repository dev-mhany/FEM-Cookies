MyChromeExtension/
│
├── manifest.json # Extension's metadata and configuration
│
├── background.js # Background script for handling cookie fetching and Firestore interaction
││
├── popup/ # Folder for popup UI components (optional)
│ ├── popup.html # HTML for the popup UI
│ ├── popup.js # JavaScript for popup UI logic
│ └── popup.css # CSS for styling the popup UI
│
├── content_scripts/ # Folder for content scripts (optional)
│ └── content.js # JavaScript to be injected into web pages
│
└── icons/ # Folder for extension icons
├── icon16.png # 16x16 icon
├── icon48.png # 48x48 icon
└── icon128.png # 128x128 icon (used in the Chrome Web Store)
│ Created by Muhammad Hany :)
