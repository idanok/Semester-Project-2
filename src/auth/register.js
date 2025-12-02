import { apiPost } from "../../utils/api.js";
import { showError } from "../../utils/helpers.js";

const form = document.getElementById("registerForm");
const errorMessage = document.getElementById("errorMessage");

/**
 * Displays an error message inside the register page UI.
 *
 * @param {string} msg - The error text to display.
 * @returns {void}
 */
function displayError(msg) {
  showError(errorMessage, msg);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  displayError("");

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  /**
   * Username must be alphanumeric or underscore
   * Example: john_doe123
   * @type {RegExp}
   */
  const nameRegex = /^[a-zA-Z0-9_]+$/;

  /**
   * Only valid Noroff student emails are allowed
   * Example: example@stud.noroff.no
   * @type {RegExp}
   */
  const emailRegex = /^[a-zA-Z0-9._%+-]+@stud\.noroff\.no$/;

  // ----------------------------
  // VALIDATION
  // ----------------------------

  if (!nameRegex.test(name)) {
    displayError("Username can only contain letters, numbers, or underscores.");
    return;
  }

  if (!emailRegex.test(email)) {
    displayError("Email must be a valid stud.noroff.no email.");
    return;
  }

  if (password.length < 8) {
    displayError("Password must be at least 8 characters long.");
    return;
  }

  // ----------------------------
  // API REQUEST
  // ----------------------------
  try {
    /**
     * Register a new user
     *
     * @typedef {Object} RegisterPayload
     * @property {string} name - The chosen username.
     * @property {string} email - The Noroff student email.
     * @property {string} password - The user's password.
     * @property {string} bio - Optional profile bio (empty at creation).
     *
     * @type {RegisterPayload}
     */
    const body = {
      name,
      email,
      password,
      bio: "",
    };

    await apiPost("/auth/register", body);

    alert("Registration successful! Please log in.");
    window.location.href = "login.html";
  } catch (err) {
    displayError(err.message);
  }
});
