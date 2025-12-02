import { requireAuth, getUser } from "../../utils/auth.js";
import { renderHeader } from "../../utils/header.js";
import { apiPost } from "../../utils/api.js";
import { showError, showSuccess } from "../../utils/helpers.js";

/**
 * 🔒 Redirects the user if they are not authenticated.
 * Loads the header UI for authenticated users.
 */
requireAuth();
renderHeader();

const form = document.getElementById("createListingForm");
const formMessage = document.getElementById("formMessage");

// Logged-in user data
const { token, apiKey } = getUser();

/**
 * Handle submission of the "Create Listing" form.
 *
 * @function handleCreateListing
 * @param {SubmitEvent} e - The form submit event.
 * @returns {Promise<void>}
 *
 * @description
 *  - Prevents default form behavior  
 *  - Validates input fields  
 *  - Sends POST request to create a listing  
 *  - Displays success/error messages  
 *  - Redirects user after creation  
 */
async function handleCreateListing(e) {
  e.preventDefault();
  formMessage.textContent = "";

  const formData = new FormData(form);

  const title = formData.get("title").trim();
  const description = formData.get("description").trim();
  const price = Number(formData.get("price"));
  const endsAt = new Date(formData.get("endsAt")).toISOString();
  const mediaUrl = formData.get("mediaUrl").trim();

  // Required field validation
  if (!title || !price || !endsAt) {
    showError(formMessage, "Please fill in all required fields.");
    return;
  }

  /**
   * Body payload for API request.
   * @type {Object}
   */
  const body = {
    title,
    description,
    startingPrice: price,
    endsAt,
    media: mediaUrl ? [{ url: mediaUrl }] : [],
  };

  try {
    // POST request to create listing
    await apiPost("/auction/listings", body, token, apiKey);

    showSuccess(formMessage, "Listing created successfully!");

    // Redirect after success
    setTimeout(() => {
      window.location.href = "../pages/profile.html";
    }, 800);

  } catch (err) {
    showError(formMessage, err.message);
    console.error("Create Listing Error:", err);
  }
}

/** Attach form submit listener */
form.addEventListener("submit", handleCreateListing);
