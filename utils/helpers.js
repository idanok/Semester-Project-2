/**
 * Display an error message on a given DOM element.
 *
 * Removes any "success" styling and applies error styling before
 * setting the message text.
 *
 * @function showError
 * @param {HTMLElement|null} element - The DOM element where the message will be shown.
 * @param {string} message - The error message to display.
 * @returns {void}
 */
export function showError(element, message) {
    if (!element) return;
    element.classList.remove("text-green-600");
    element.classList.add("text-red-600");
    element.textContent = message;
}

/**
   * Display a success message on a given DOM element.
   *
   * Removes any "error" styling and applies success styling before
   * setting the message text.
   *
   * @function showSuccess
   * @param {HTMLElement|null} element - The DOM element where the message will be shown.
   * @param {string} message - The success message to display.
   * @returns {void}
   */
export function showSuccess(element, message) {
    if (!element) return;
    element.classList.remove("text-red-600");
    element.classList.add("text-green-600");
    element.textContent = message;
}

/**
   * Validates an image URL by attempting to load it.
   *
   * If the image loads successfully, the original URL is returned.
   * If it fails to load, a fallback placeholder image path is returned instead.
   *
   * This ensures broken image URLs don't break your UI.
   *
   * @function validateImage
   * @param {string} url - The URL of the image to validate.
   * @returns {Promise<string>} Resolves with either the valid URL or a fallback placeholder.
   *
   * @example
   * const safeUrl = await validateImage(listing.media?.[0]?.url);
   * img.src = safeUrl;
   */
export function validateImage(url) {
    return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => resolve("../assets/images/fallback.svg");
    img.src = url;
});
}
