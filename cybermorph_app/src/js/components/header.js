import { decodeJwt } from '../utils.js';

/**
 * Manages the user state (logged in/out) and renders the header.
 * @returns {{user: object|null, logout: function}}
 */
function getAuthState() {
    const token = localStorage.getItem("token");
    let user = null;

    if (token) {
        const decoded = decodeJwt(token);
        if (decoded && decoded.sub) {
            // Reconstruct user object similar to React context
            user = { 
                username: decoded.sub, 
                role: decoded.role || 'user', 
                token: token 
            };
        }
    }

    const logout = () => {
        localStorage.removeItem("token");
        // Redirect to login page immediately
        window.location.href = '/index.html'; 
    };

    return { user, logout };
}

/**
 * Renders the header into the target element.
 * @param {object} authState 
 */
function renderHeader(authState) {
    const headerElement = document.getElementById('app-header');
    if (!headerElement) return;

    const { user, logout } = authState;
    
    // Header HTML structure (similar to React component)
    headerElement.innerHTML = `
        <div class="bg-blue-700 text-white p-4 flex justify-between items-center shadow-lg">
            <h1 class="text-xl font-bold">AI-Based Antivirus & Malware Detection</h1>
            ${user ? `
                <div class="flex items-center space-x-4">
                    <span class="text-sm">Hello, ${user.username}</span>
                    <button id="logout-button" class="bg-red-500 px-3 py-1 text-sm rounded-lg font-medium hover:bg-red-600 transition duration-150 shadow-md">
                        Logout
                    </button>
                </div>
            ` : `
                <div>
                    <a href="/index.html" class="bg-blue-500 px-3 py-1 text-sm rounded-lg font-medium hover:bg-blue-600 transition duration-150">Login</a>
                </div>
            `}
        </div>
    `;

    // Attach event listener only if the user is logged in
    if (user) {
        document.getElementById('logout-button')?.addEventListener('click', logout);
    }
}

/**
 * Renders the footer into the target element.
 */
function renderFooter() {
    const footerElement = document.getElementById('app-footer');
    if (!footerElement) return;

    footerElement.innerHTML = `
        <footer class="bg-gray-100 text-gray-600 p-4 text-center border-t border-gray-200 mt-8">
            © 2025 CyberMorph - AI Antivirus & Malware Detection System
        </footer>
    `;
}


/**
 * Initializes the header and footer, returning the current user state.
 * @returns {object} The current user object or null.
 */
export function initLayout() {
    const authState = getAuthState();
    renderHeader(authState);
    renderFooter();
    return authState.user;
}