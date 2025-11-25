// A simple function to display a loading state

/**
 * Toggles a simple loading spinner/message.
 * @param {HTMLElement} targetElement - The element where the loader should be injected.
 * @param {boolean} show - True to show the loader, False to hide it.
 */
export function toggleLoader(targetElement, show) {
    const loaderId = 'app-loader-overlay';
    let loader = document.getElementById(loaderId);

    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = loaderId;
            loader.className = 'absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-xl z-10';
            loader.innerHTML = `
                <div class="flex flex-col items-center text-blue-700">
                    <div class="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-700"></div>
                    <p class="mt-3 text-sm font-medium">Processing...</p>
                </div>
            `;
            targetElement.style.position = 'relative'; // Ensure target is a positioning context
            targetElement.appendChild(loader);
        }
        loader.classList.remove('hidden');
    } else {
        if (loader) {
            loader.classList.add('hidden');
        }
    }
}