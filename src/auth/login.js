/**
 * Handles the login logic for BidHub
 * @module login
 */

import { saveUserSession } from "../../utils/auth.js";
import { apiPost } from "../../utils/api.js";
import { showError } from "../../utils/helpers.js";

const form = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

/**
 * Display an error message in the UI.
 * Wraps showError() for convenience.
 *
 * @param {string} msg - The message to display.
 */
function displayError(msg) {
  showError(errorMessage, msg);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  displayError("");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  /**
   * Validate form input fields
   */
  if (!email || !password) {
    displayError("Both email and password are required.");
    return;
  }

  try {
    /**
     * Call Noroff API to log the user in
     *
     * @typedef {Object} LoginResponse
     * @property {string} accessToken - Auth token returned by the API
     * @property {string} name - Username
     *
     * @type {LoginResponse}
     */
    const data = await apiPost("/auth/login", { email, password });

    /**
     * Save user session using utilities
     */
    saveUserSession({
      token: data.accessToken,
      username: data.name,
      apiKey: "ff589792-c9c6-4fc6-9cd6-2a5365505e90", // static API key
    });

    // Redirect user to home page
    window.location.href = "../../pages/home.html";
  } catch (err) {
    /**
     * Display API error message
     *
     * @type {Error}
     */
    displayError(err.message);
  }
});
