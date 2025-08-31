// Firebase Authentication Handler
class FirebaseAuth {
    constructor() {
        this.auth = window.auth;
        this.db = window.db;
        this.currentUser = null;
        this.init();
    }

    init() {
        // Listen for auth state changes
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.handleAuthSuccess(user);
            } else {
                this.currentUser = null;
                this.handleAuthLogout();
            }
        });

        // Initialize password toggles
        this.initPasswordToggles();
        
        // Initialize password strength checker
        this.initPasswordStrength();
        
        // Initialize form validation
        this.initFormValidation();
        
        // Initialize social auth buttons
        this.initSocialAuth();
        
        // Load saved form data
        this.loadSavedFormData();
    }

    // Password visibility toggle
    initPasswordToggles() {
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const input = e.target.closest('.password-input').querySelector('input');
                const icon = e.target.closest('.password-toggle').querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            });
        });
    }

    // Password strength checker
    initPasswordStrength() {
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.checkPasswordStrength(e.target.value);
            });
        }
    }

    checkPasswordStrength(password) {
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        if (!strengthFill || !strengthText) return;

        let strength = 0;
        let feedback = '';

        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        switch (strength) {
            case 0:
            case 1:
                feedback = 'Very Weak';
                strengthFill.style.width = '20%';
                strengthFill.style.backgroundColor = '#ff4444';
                break;
            case 2:
                feedback = 'Weak';
                strengthFill.style.width = '40%';
                strengthFill.style.backgroundColor = '#ff8800';
                break;
            case 3:
                feedback = 'Fair';
                strengthFill.style.width = '60%';
                strengthFill.style.backgroundColor = '#ffaa00';
                break;
            case 4:
                feedback = 'Good';
                strengthFill.style.width = '80%';
                strengthFill.style.backgroundColor = '#00aa00';
                break;
            case 5:
                feedback = 'Strong';
                strengthFill.style.width = '100%';
                strengthFill.style.backgroundColor = '#008800';
                break;
        }

        strengthText.textContent = feedback;
    }

    // Form validation
    initFormValidation() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }
    }

    // Handle login
    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe')?.checked || false;

        if (!this.validateLoginForm(email, password)) return;

        this.showLoading('loginForm');
        this.clearMessages();

        try {
            // Set persistence based on remember me
            const persistence = rememberMe ? 
                firebase.auth.Auth.Persistence.LOCAL : 
                firebase.auth.Auth.Persistence.SESSION;
            
            await this.auth.setPersistence(persistence);
            
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            this.showSuccess('Login successful! Redirecting...');
            
            // Save form data if remember me is checked
            if (rememberMe) {
                this.saveFormData({ email, rememberMe });
            }
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            this.handleAuthError(error);
        } finally {
            this.hideLoading('loginForm');
        }
    }

    // Handle signup
    async handleSignup() {
        const formData = this.getSignupFormData();
        
        if (!this.validateSignupForm(formData)) return;

        this.showLoading('signupForm');
        this.clearMessages();

        try {
            // Create user with email and password
            const userCredential = await this.auth.createUserWithEmailAndPassword(
                formData.email, 
                formData.password
            );

            // Save additional user data to Firestore
            await this.saveUserData(userCredential.user, formData);
            
            this.showSuccess('Account created successfully! Redirecting to dashboard...');
            
            // Save form preferences
            this.saveFormData(formData);
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);

        } catch (error) {
            this.handleAuthError(error);
        } finally {
            this.hideLoading('signupForm');
        }
    }

    // Save user data to Firestore
    async saveUserData(user, formData) {
        try {
            await this.db.collection('users').doc(user.uid).set({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                educationLevel: formData.educationLevel,
                newsletter: formData.newsletter,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    // Social authentication
    initSocialAuth() {
        const googleLogin = document.getElementById('googleLogin');
        const googleSignup = document.getElementById('googleSignup');
        const facebookLogin = document.getElementById('facebookLogin');
        const facebookSignup = document.getElementById('facebookSignup');

        if (googleLogin || googleSignup) {
            const googleBtn = googleLogin || googleSignup;
            googleBtn.addEventListener('click', () => this.signInWithGoogle());
        }

        if (facebookLogin || facebookSignup) {
            const facebookBtn = facebookLogin || facebookSignup;
            facebookBtn.addEventListener('click', () => this.signInWithFacebook());
        }
    }

    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await this.auth.signInWithPopup(provider);
            
            // Check if this is a new user
            if (result.additionalUserInfo.isNewUser) {
                await this.saveUserData(result.user, {
                    firstName: result.user.displayName?.split(' ')[0] || '',
                    lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
                    email: result.user.email,
                    educationLevel: 'other',
                    newsletter: false
                });
            }
            
            this.showSuccess('Google sign-in successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } catch (error) {
            this.handleAuthError(error);
        }
    }

    async signInWithFacebook() {
        try {
            const provider = new firebase.auth.FacebookAuthProvider();
            const result = await this.auth.signInWithPopup(provider);
            
            // Check if this is a new user
            if (result.additionalUserInfo.isNewUser) {
                await this.saveUserData(result.user, {
                    firstName: result.user.displayName?.split(' ')[0] || '',
                    lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
                    email: result.user.email,
                    educationLevel: 'other',
                    newsletter: false
                });
            }
            
            this.showSuccess('Facebook sign-in successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } catch (error) {
            this.handleAuthError(error);
        }
    }

    // Form validation methods
    validateLoginForm(email, password) {
        if (!email || !password) {
            this.showError('Please fill in all required fields.');
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            this.showError('Please enter a valid email address.');
            return false;
        }
        
        return true;
    }

    validateSignupForm(formData) {
        if (!formData.firstName || !formData.lastName || !formData.email || 
            !formData.password || !formData.confirmPassword || !formData.educationLevel) {
            this.showError('Please fill in all required fields.');
            return false;
        }
        
        if (!this.isValidEmail(formData.email)) {
            this.showError('Please enter a valid email address.');
            return false;
        }
        
        if (formData.password.length < 8) {
            this.showError('Password must be at least 8 characters long.');
            return false;
        }
        
        if (formData.password !== formData.confirmPassword) {
            this.showError('Passwords do not match.');
            return false;
        }
        
        if (!formData.termsAccepted) {
            this.showError('Please accept the terms of service.');
            return false;
        }
        
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Get signup form data
    getSignupFormData() {
        return {
            firstName: document.getElementById('firstName')?.value || '',
            lastName: document.getElementById('lastName')?.value || '',
            email: document.getElementById('email')?.value || '',
            password: document.getElementById('password')?.value || '',
            confirmPassword: document.getElementById('confirmPassword')?.value || '',
            educationLevel: document.getElementById('educationLevel')?.value || '',
            termsAccepted: document.getElementById('termsAccepted')?.checked || false,
            newsletter: document.getElementById('newsletter')?.checked || false
        };
    }

    // Form data persistence
    saveFormData(data) {
        try {
            localStorage.setItem('eduguru_form_data', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving form data:', error);
        }
    }

    loadSavedFormData() {
        try {
            const savedData = localStorage.getItem('eduguru_form_data');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // Fill in saved data
                if (data.email) {
                    const emailInput = document.getElementById('email');
                    if (emailInput) emailInput.value = data.email;
                }
                
                if (data.rememberMe) {
                    const rememberMeCheckbox = document.getElementById('rememberMe');
                    if (rememberMeCheckbox) rememberMeCheckbox.checked = data.rememberMe;
                }
                
                if (data.newsletter) {
                    const newsletterCheckbox = document.getElementById('newsletter');
                    if (newsletterCheckbox) newsletterCheckbox.checked = data.newsletter;
                }
            }
        } catch (error) {
            console.error('Error loading saved form data:', error);
        }
    }

    // UI helper methods
    showLoading(formId) {
        const form = document.getElementById(formId);
        if (form) {
            const btnText = form.querySelector('.btn-text');
            const btnLoading = form.querySelector('.btn-loading');
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline-block';
        }
    }

    hideLoading(formId) {
        const form = document.getElementById(formId);
        if (form) {
            const btnText = form.querySelector('.btn-text');
            const btnLoading = form.querySelector('.btn-loading');
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Remove existing messages
        this.clearMessages();
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message auth-message-${type}`;
        messageDiv.textContent = message;
        
        // Insert message after form
        const form = document.querySelector('.auth-form');
        if (form) {
            form.parentNode.insertBefore(messageDiv, form.nextSibling);
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    clearMessages() {
        const messages = document.querySelectorAll('.auth-message');
        messages.forEach(msg => msg.remove());
    }

    // Handle authentication success
    handleAuthSuccess(user) {
        console.log('User authenticated:', user);
        // Update UI if needed
    }

    // Handle authentication logout
    handleAuthLogout() {
        console.log('User logged out');
        // Redirect to login if on dashboard
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'login.html';
        }
    }

    // Handle authentication errors
    handleAuthError(error) {
        console.error('Authentication error:', error);
        
        let message = 'An error occurred during authentication.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'No account found with this email address.';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password. Please try again.';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address format.';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak. Please choose a stronger password.';
                break;
            case 'auth/email-already-in-use':
                message = 'An account with this email already exists.';
                break;
            case 'auth/too-many-requests':
                message = 'Too many failed attempts. Please try again later.';
                break;
            case 'auth/popup-closed-by-user':
                message = 'Sign-in popup was closed. Please try again.';
                break;
            case 'auth/cancelled-popup-request':
                message = 'Sign-in was cancelled.';
                break;
        }
        
        this.showError(message);
    }
}

// Initialize Firebase Authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase is available
    if (typeof firebase !== 'undefined' && window.auth && window.db) {
        new FirebaseAuth();
    } else {
        console.error('Firebase not initialized. Please check your configuration.');
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-message auth-message-error';
        errorDiv.textContent = 'Firebase configuration error. Please check your setup.';
        document.body.appendChild(errorDiv);
    }
});
