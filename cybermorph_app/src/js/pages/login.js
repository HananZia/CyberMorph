import { loginUser } from '../api/auth.js';
import { initLayout, enforceAuth } from '../utils.js';
import { toggleLoader } from '../components/loader.js';

// Enforce redirect if already logged in (shouldBeLoggedIn = false)
enforceAuth(false);

document.addEventListener('DOMContentLoaded', () => {
    // Initialize layout (Header/Footer)
    initLayout();

    const form = document.getElementById('login-form');
    const errorDisplay = document.getElementById('error-message');
    const loginContainer = document.getElementById('login-container');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDisplay.classList.add('hidden');
        errorDisplay.textContent = '';
        
        const username = form.elements.username.value;
        const password = form.elements.password.value;

        toggleLoader(loginContainer, true);

        try {
            const data = await loginUser({ username, password });
            
            // Success: Store token and redirect
            if (data.access_token) {
                localStorage.setItem("token", data.access_token);
                window.location.href = '/dashboard.html';
            } else {
                throw new Error("Login failed: No token received.");
            }
        } catch (err) {
            const detail = err.detail || 'Login failed. Please check your credentials.';
            errorDisplay.textContent = detail;
            errorDisplay.classList.remove('hidden');
        } finally {
            toggleLoader(loginContainer, false);
        }
    });
});