// -----------------------------
// Import utilities
// -----------------------------
import { requireAuth, getUser } from "../../utils/auth.js";
import { renderHeader } from "../../utils/header.js";
import { apiGet, apiPut, apiDelete } from "../../utils/api.js";
import { showError, showSuccess } from "../../utils/helpers.js";

// -----------------------------
// Protect page & load header
// -----------------------------
requireAuth();
renderHeader();

// -----------------------------
// Elements
// -----------------------------
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const startingPriceInput = document.getElementById("startingPrice");
const mediaInput = document.getElementById("media");
const endsAtInput = document.getElementById("endsAt");

const msg = document.getElementById("msg");
const errorMsg = document.getElementById("error");

const updateForm = document.getElementById("updateForm");
const deleteBtn = document.getElementById("deleteBtn");

// -----------------------------
// User + Listing ID
// -----------------------------
const { token, username, apiKey } = getUser();
const listingId = localStorage.getItem("editListingId");

// Redirect if no listing selected
if (!listingId) {
  window.location.href = "../pages/profile.html";
}

/**
 * Load existing listing data into the form.
 *
 * @async
 * @function loadListing
 * @returns {Promise<void>}
 *
 * @description
 * Fetches the listing using the Listing ID stored in localStorage,
 * fills the form fields with the existing data, and handles any errors.
 */
async function loadListing() {
  try {
    const listing = await apiGet(
      `/auction/listings/${listingId}`,
      token,
      apiKey
    );

    titleInput.value = listing.title || "";
    descriptionInput.value = listing.description || "";
    startingPriceInput.value = listing.startingPrice || "";
    mediaInput.value = listing.media?.[0]?.url || "";

    endsAtInput.value = listing.endsAt
      ? new Date(listing.endsAt).toISOString().slice(0, 16)
      : "";

  } catch (err) {
    showError(errorMsg, err.message);
    console.error("LOAD LISTING ERROR:", err);
  }
}

// Initialize listing load
loadListing();

/**
 * Handle updating an existing listing when the form is submitted.
 *
 * @event submit
 * @param {SubmitEvent} e
 *
 * @description
 *  - Validates fields  
 *  - Builds the request body  
 *  - Sends the PUT update request  
 *  - Displays success/error messages  
 *  - Redirects after successful update  
 */
updateForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";
  errorMsg.textContent = "";

  const body = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    startingPrice: Number(startingPriceInput.value),
    media: mediaInput.value ? [{ url: mediaInput.value.trim() }] : [],
    endsAt: endsAtInput.value
      ? new Date(endsAtInput.value).toISOString()
      : null,
  };

  try {
    await apiPut(`/auction/listings/${listingId}`, body, token, apiKey);

    showSuccess(msg, "Listing updated!");

    setTimeout(() => {
      window.location.href = "../pages/profile.html";
    }, 800);

  } catch (err) {
    showError(errorMsg, err.message);
    console.error("UPDATE LISTING ERROR:", err);
  }
});

/**
 * Delete a listing permanently.
 *
 * @event click
 * @description
 * Shows a confirmation dialog.  
 * If confirmed, sends DELETE request.  
 * Removes listingId from storage and redirects back to profile.
 */
deleteBtn.addEventListener("click", async () => {
  if (!confirm("Are you sure you want to delete this listing?")) return;

  try {
    await apiDelete(`/auction/listings/${listingId}`, token, apiKey);

    localStorage.removeItem("editListingId");
    alert("Listing deleted successfully!");
    window.location.href = "../pages/profile.html";

  } catch (err) {
    showError(errorMsg, err.message);
    console.error("DELETE ERROR:", err);
  }
});
