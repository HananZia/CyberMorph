// Uses native fetch API to replace axios calls

const API_URL = "http://127.0.0.1:8000";

/**
 * Handles API fetch requests and basic error checking.
 * @param {string} url 
 * @param {object} options 
 * @returns {Promise<object>}
 */
async function safeFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            // Throw a structured error object if the response status is not 2xx
            throw { 
                status: response.status, 
                detail: data.detail || 'An unknown error occurred',
                data: data
            };
        }
        return data;
    } catch (error) {
        console.error("API Fetch Error:", error);
        // Re-throw the error for the calling function to handle
        throw error;
    }
}

export const registerUser = async (user) => {
    return safeFetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
    });
};

export const loginUser = async (user) => {
    return safeFetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
    });
};