// Firebase Configuration
// IMPORTANT: Replace these placeholder values with your actual Firebase project configuration
// 
// To get these values:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select an existing one
// 3. Click on the gear icon (⚙️) next to "Project Overview"
// 4. Select "Project settings"
// 5. Scroll down to "Your apps" section
// 6. Click on the web app icon (</>) or create a new web app
// 7. Copy the configuration values from the provided config object

const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Check if configuration is properly set
const isConfigValid = firebaseConfig.apiKey !== "your-api-key-here" && 
                     firebaseConfig.projectId !== "your-project-id";

if (!isConfigValid) {
    console.error('❌ Firebase configuration not set!');
    console.error('Please update firebase-config.js with your actual Firebase project credentials.');
    console.error('Visit: https://console.firebase.google.com/ to get your configuration.');
    
    // Show user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc2626;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        font-family: Arial, sans-serif;
    `;
    errorDiv.innerHTML = `
        <strong>⚠️ Firebase Configuration Error</strong><br>
        Please update firebase-config.js with your Firebase credentials.<br>
        <a href="https://console.firebase.google.com/" target="_blank" style="color: #fbbf24; text-decoration: underline;">Get Configuration →</a>
    `;
    document.body.appendChild(errorDiv);
} else {
    console.log('✅ Firebase configuration loaded successfully');
}

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    
    // Initialize Firebase services
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // Export for use in other files
    window.auth = auth;
    window.db = db;
    
    console.log('✅ Firebase services initialized successfully');
} catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    
    // Show user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc2626;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        font-family: Arial, sans-serif;
    `;
    errorDiv.innerHTML = `
        <strong>❌ Firebase Initialization Error</strong><br>
        ${error.message}<br>
        Please check your configuration and try again.
    `;
    document.body.appendChild(errorDiv);
}
