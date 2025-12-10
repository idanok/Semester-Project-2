import { save, load, remove } from "./storage.js";

/**
 * Saves the current authenticated user session (token, username, API key)
 * into localStorage using the storage utils.
 *
 * @function saveUserSession
 * @param {Object} session - Session details.
 * @param {string} session.token - User's access token.
 * @param {string} session.username - Username returned from login.
 * @param {string} session.apiKey - Noroff API key for authenticated routes.
 *
 * @example
 * saveUserSession({
 *   token: "abc123",
 *   username: "johnDoe",
 *   apiKey: "my-api-key"
 * });
 */
export function saveUserSession({ token, username, apiKey }) {
    save("accessToken", token);
    save("userName", username);
    save("apiKey", apiKey);
}

/**
 * Retrieves the currently stored user session from localStorage.
 *
 * @function getUser
 * @returns {{token: string|null, username: string|null, apiKey: string|null}}
 * Object containing saved authentication details.
 *
 * @example
 * const user = getUser();
 * console.log(user.token);
 */
export function getUser() {
    return {
    token: load("accessToken"),
    username: load("userName"),
    apiKey: load("apiKey"),
};
}

/**
 * Determines whether a user is currently logged in.
 *
 * @function isLoggedIn
 * @returns {boolean} True if both token and username are stored.
 *
 * @example
 * if (isLoggedIn()) {
 *   console.log("User is authenticated");
 * }
 */
export function isLoggedIn() {
    const { token, username } = getUser();
    return Boolean(token && username);
}

/**
 * Protects a page by redirecting unauthenticated users to the login page.
 *
 * @function requireAuth
 *
 * @example
 * //-- Call at top of any protected page JS --
 * requireAuth();
 */
export function requireAuth() {
    if (!isLoggedIn()) {
    window.location.href = "../../pages/login.html";
}
}

/**
 * Logs out the current user by clearing all related stored values
 * and redirecting to the login page.
 *
 * @function logout
 *
 * @example
 * document.getElementById("logoutBtn").onclick = logout;
 */
export function logout() {
    remove("accessToken");
    remove("userName");
    remove("apiKey");

window.location.href = "../../pages/login.html";
}
