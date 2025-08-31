# EduGuru - Education Website with Firebase Integration

A comprehensive education-themed website featuring user authentication, dashboard management, notes, to-do lists, and user management capabilities.

## Features

- **Landing Page**: Modern, responsive design with hero section and course information
- **User Authentication**: Firebase-powered login and signup system
- **Dashboard**: Comprehensive learning management dashboard
- **Notes Management**: Create, edit, and organize study notes
- **To-Do Lists**: Task management with priority levels and due dates
- **Calendar**: Monthly calendar view with event indicators
- **User Management**: View and manage all registered users
- **Responsive Design**: Mobile-friendly interface

## Setup Instructions

### 1. Firebase Configuration

**IMPORTANT**: You must configure Firebase before the application will work!

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Click on the gear icon (⚙️) next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. Click on the web app icon (</>) or create a new web app
7. Copy the configuration values from the provided config object
8. Open `firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-actual-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-actual-messaging-sender-id",
    appId: "your-actual-app-id"
};
```

### 2. Firebase Services Setup

1. **Authentication**: 
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication
   - Optionally enable Google and Facebook authentication

2. **Firestore Database**:
   - Go to Firestore Database
   - Create database in test mode (for development)
   - Set up security rules as needed

### 3. Running the Application

1. Open `index.html` in your web browser
2. Navigate to the signup page to create an account
3. Login with your credentials
4. Access the dashboard to manage notes, todos, and view users

## File Structure

```
edugh/
├── index.html              # Main landing page
├── login.html             # User login page
├── signup.html            # User registration page
├── dashboard.html         # Main dashboard interface
├── styles.css             # Main website styles
├── auth.css               # Authentication page styles
├── dashboard.css          # Dashboard-specific styles
├── script.js              # Main website functionality
├── auth.js                # Firebase authentication logic
├── dashboard.js           # Dashboard functionality
├── firebase-config.js     # Firebase configuration
└── README.md              # This file
```

## Troubleshooting

### Common Issues

1. **"Firebase not initialized" Error**
   - Check that `firebase-config.js` has been updated with your actual Firebase credentials
   - Ensure Firebase SDK scripts are loading properly
   - Check browser console for detailed error messages

2. **Authentication Not Working**
   - Verify Firebase Authentication is enabled in your project
   - Check that email/password sign-in method is enabled
   - Ensure Firestore Database is created and accessible

3. **Dashboard Not Loading**
   - Check that you're logged in
   - Verify Firebase services are properly initialized
   - Check browser console for JavaScript errors

4. **Styling Issues**
   - Ensure all CSS files are properly linked
   - Check that Font Awesome icons are loading
   - Verify Google Fonts are accessible

### Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Development Notes

- The application uses Firebase v9 compatibility mode
- Local storage is used for notes and todos (Firestore integration planned)
- All authentication is handled through Firebase
- The dashboard dynamically renders content based on user interactions

## Security Considerations

- Firebase security rules should be configured for production use
- User data is stored in Firestore with user-specific access controls
- Authentication state is managed securely through Firebase Auth
- Consider implementing additional security measures for production deployment

## Future Enhancements

- Real-time collaboration features
- Advanced course management
- Progress tracking and analytics
- Mobile app development
- Integration with external learning platforms

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify Firebase configuration is correct
3. Ensure all required services are enabled in Firebase
4. Check that all files are properly linked and accessible

## License

This project is open source and available under the MIT License.
