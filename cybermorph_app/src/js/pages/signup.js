import { registerUser } from '../api/auth.js';
import { initLayout, enforceAuth } from '../utils.js';
import { toggleLoader } from '../components/loader.js';

// Enforce redirect if already logged in (shouldBeLoggedIn = false)
enforceAuth(false);

document.addEventListener('DOMContentLoaded', () => {
    // Initialize layout (Header/Footer)
    initLayout();

    const form = document.getElementById('signup-form');
    const messageDisplay = document.getElementById('message-display');
    const signupContainer = document.getElementById('signup-container');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageDisplay.classList.add('hidden');
        messageDisplay.textContent = '';
        
        const username = form.elements['reg-username'].value;
        const email = form.elements['reg-email'].value;
        const password = form.elements['reg-password'].value;

        toggleLoader(signupContainer, true);

        try {
            await registerUser({ username, email, password });
            
            // Success: Display success message and style
            messageDisplay.textContent = "Account created successfully! Redirecting to login...";
            messageDisplay.classList.remove('hidden');
            messageDisplay.classList.remove('text-red-500');
            messageDisplay.classList.add('text-green-600', 'font-semibold');

            // Redirect after a delay
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 3000);

        } catch (err) {
            const detail = err.detail || 'Signup failed. Please try again.';
            messageDisplay.textContent = detail;
            messageDisplay.classList.remove('hidden');
            messageDisplay.classList.remove('text-green-600');
            messageDisplay.classList.add('text-red-500', 'font-semibold');
        } finally {
            toggleLoader(signupContainer, false);
        }
    });
});