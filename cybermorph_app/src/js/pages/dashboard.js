import { initLayout, enforceAuth } from '../utils.js';
import { predictMalware } from '../api/malware.js';
import { toggleLoader } from '../components/loader.js';

// Enforce redirect if not logged in (shouldBeLoggedIn = true)
enforceAuth(true);

document.addEventListener('DOMContentLoaded', () => {
    // Get user state and initialize layout
    const user = initLayout();
    
    // Safety check: The user should exist because of enforceAuth(true)
    if (!user) {
        // Fallback: This should ideally not be hit
        console.error("User not authenticated after layout initialization.");
        return;
    }

    const dashboardContent = document.getElementById('dashboard-content');

    /**
     * Renders the Malware Prediction Form
     */
    function renderMalwareForm() {
        dashboardContent.innerHTML = `
            <div id="malware-form-card" class="p-8 bg-white shadow-2xl rounded-xl border border-blue-100">
                <h3 class="text-2xl font-bold mb-6 text-gray-700">Submit Features for Prediction</h3>
                
                <form id="prediction-form">
                    <label for="features-input" class="block text-sm font-medium text-gray-700 mb-2">
                        Malware Features (Comma-separated numbers)
                    </label>
                    <textarea
                        id="features-input"
                        placeholder="e.g., 10,25,0.5,1.2,..."
                        required
                        rows="4"
                        class="border border-gray-300 p-3 w-full rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 mb-4"
                    ></textarea>
                    <button type="submit" id="predict-button"
                            class="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md">
                        Predict Malware
                    </button>
                </form>
                
                <div id="result-display" class="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200 hidden">
                    <p class="font-bold text-lg text-gray-800">Prediction Result:</p>
                    <p id="result-text" class="mt-2 text-xl"></p>
                </div>
                <p id="error-display" class="mt-4 text-red-500 font-medium hidden"></p>
            </div>
        `;

        const form = document.getElementById('prediction-form');
        const featuresInput = document.getElementById('features-input');
        const resultDisplay = document.getElementById('result-display');
        const resultText = document.getElementById('result-text');
        const errorDisplay = document.getElementById('error-display');
        const formCard = document.getElementById('malware-form-card');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            resultDisplay.classList.add('hidden');
            errorDisplay.classList.add('hidden');

            const featuresString = featuresInput.value.trim();
            const values = featuresString.split(',').map(s => Number(s.trim()));
            
            // Simple validation
            if (values.some(isNaN)) {
                errorDisplay.textContent = "Error: Features must be comma-separated numbers.";
                errorDisplay.classList.remove('hidden');
                return;
            }

            toggleLoader(formCard, true);

            try {
                const res = await predictMalware(values, user.token);
                const probability = res.malware_probability;
                
                resultText.textContent = `Malware Probability: ${probability.toFixed(4)}`;
                resultText.classList.remove('text-green-600', 'text-red-600');
                
                if (probability > 0.5) {
                    resultText.classList.add('text-red-600');
                } else {
                    resultText.classList.add('text-green-600');
                }
                
                resultDisplay.classList.remove('hidden');

            } catch (err) {
                const detail = err.detail || 'Prediction failed. Check API status or features format.';
                errorDisplay.textContent = `Error: ${detail}`;
                errorDisplay.classList.remove('hidden');
                
                resultDisplay.classList.add('hidden');
            } finally {
                toggleLoader(formCard, false);
            }
        });
    }

    renderMalwareForm();
});