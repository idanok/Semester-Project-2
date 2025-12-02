import { requireAuth, getUser, logout } from "../../utils/auth.js";
import { renderHeader } from "../../utils/header.js";
import { apiGet, apiPut, apiDelete } from "../../utils/api.js";
import { validateImage, showError, showSuccess } from "../../utils/helpers.js";

/* ------------------------------------------
AUTH + HEADER
------------------------------------------- */

requireAuth();
renderHeader();

const { token, username, apiKey } = getUser();

/* ------------------------------------------
ELEMENT REFERENCES
------------------------------------------- */

const profileAvatar = document.getElementById("profileAvatar");
const profileBanner = document.getElementById("profileBanner");
const profileName = document.getElementById("profileName");
const profileBio = document.getElementById("profileBio");
const profileCredits = document.getElementById("profileCredits");

const editProfileForm = document.getElementById("editProfileForm");
const bioInput = document.getElementById("bio");
const avatarUrlInput = document.getElementById("avatarUrl");
const bannerUrlInput = document.getElementById("bannerUrl");

const editMsg = document.getElementById("editMsg");
const editError = document.getElementById("editError");

const listingsContainer = document.getElementById("listingsContainer");
const winsContainer = document.getElementById("winsContainer");

/* ------------------------------------------
RENDER LISTING CARDS
------------------------------------------- */

/**
 * Render listings or bid-wins into a container.
 *
 * @param {Array<Object>} items - Listing objects.
 * @param {HTMLElement} container - Target container element.
 * @param {boolean} isOwner - Whether the user owns these listings.
 */
function renderListings(items, container, isOwner) {
  container.innerHTML = items
    .map((item) => {
      const mediaUrl = item.media?.[0]?.url || "";
      const endsAt = item.endsAt ? new Date(item.endsAt).toLocaleString() : "";

      const buttons = isOwner
        ? `
          <div class="flex gap-2 mt-2">
            <button class="viewBtn bg-blue-600 text-white px-3 py-2 rounded text-sm" data-id="${item.id}">View</button>
            <button class="editBtn bg-[#4B3028] text-white px-3 py-2 rounded text-sm" data-id="${item.id}">Edit</button>
            <button class="deleteBtn bg-red-600 text-white px-3 py-2 rounded text-sm" data-id="${item.id}">Delete</button>
          </div>`
        : `
          <button class="viewBtn bg-blue-600 text-white px-3 py-2 rounded text-sm mt-2" data-id="${item.id}">
            View
          </button>`;

      return `
        <div class="profile-listing-card bg-white rounded-lg shadow p-4 flex flex-col cursor-pointer"
            data-id="${item.id}">
          <img src="${mediaUrl}" alt="${item.title}" class="h-32 md:h-40 w-full object-cover rounded mb-3" />

          <h4 class="font-semibold text-[#4B3028] mb-1">${item.title}</h4>
          <p class="text-gray-600 text-sm mb-1">${item.description || ""}</p>
          <p class="text-gray-500 text-xs">Ends: ${endsAt}</p>

          ${buttons}
        </div>`;
    })
    .join("");

  // CARD CLICK → View
  container.querySelectorAll(".profile-listing-card").forEach((card) => {
    const id = card.dataset.id;
    card.addEventListener("click", () => {
      window.location.href = `../pages/view.html?id=${id}`;
    });
  });

  // VIEW BUTTON
  container.querySelectorAll(".viewBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.location.href = `../pages/view.html?id=${btn.dataset.id}`;
    });
  });

  if (!isOwner) return;

  // EDIT BUTTON
  container.querySelectorAll(".editBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      localStorage.setItem("editListingId", btn.dataset.id);
      window.location.href = "../pages/edit.html";
    });
  });

  // DELETE BUTTON
  container.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteListing(btn.dataset.id);
    });
  });
}

/* ------------------------------------------
LOAD PROFILE
------------------------------------------- */

/**
 * Fetch the user's full profile (listings & wins) and update the UI.
 *
 * @async
 * @function fetchProfile
 * @returns {Promise<void>}
 */
async function fetchProfile() {
  try {
    const profile = await apiGet(
      `/auction/profiles/${username}?_listings=true&_wins=true`,
      token,
      apiKey
    );

    profileName.textContent = profile.name;
    profileBio.textContent = profile.bio || "";
    profileCredits.textContent = `Credits: ${profile.credits ?? 0}`;

    profileAvatar.src = await validateImage(profile.avatar?.url || "");
    profileBanner.src = await validateImage(profile.banner?.url || "");

    // Fill edit form
    bioInput.value = profile.bio || "";
    avatarUrlInput.value = profile.avatar?.url || "";
    bannerUrlInput.value = profile.banner?.url || "";

    // Render listings
    const validatedListings = await Promise.all(
      (profile.listings || []).map(async (l) => ({
        ...l,
        mediaUrl: await validateImage(l.media?.[0]?.url || ""),
      }))
    );

    renderListings(validatedListings, listingsContainer, true);

    await fetchUserBids();
  } catch (err) {
    showError(editError, "Failed to load profile.");
    console.error("PROFILE LOAD ERROR:", err);
  }
}

/* ------------------------------------------
LOAD USER BIDS
------------------------------------------- */

/**
 * Fetch all listings from API and filter the ones the user has bid on.
 *
 * @async
 * @function fetchUserBids
 * @returns {Promise<void>}
 */
async function fetchUserBids() {
  try {
    const all = await apiGet("/auction/listings?_seller=true&_bids=true", token, apiKey);

    const myBids = all.filter((listing) =>
      listing.bids?.some((b) => b.bidder === username)
    );

    const validated = await Promise.all(
      myBids.map(async (l) => ({
        ...l,
        mediaUrl: await validateImage(l.media?.[0]?.url || ""),
      }))
    );

    renderListings(validated, winsContainer, false);
  } catch (err) {
    console.error("FETCH USER BIDS ERROR:", err);
  }
}

/* ------------------------------------------
DELETE LISTING
------------------------------------------- */

/**
 * Delete a listing the user owns.
 *
 * @async
 * @function deleteListing
 * @param {string} id - Listing ID
 */
async function deleteListing(id) {
  if (!confirm("Are you sure you want to delete this listing?")) return;

  try {
    await apiDelete(`/auction/listings/${id}`, token, apiKey);
    fetchProfile(); // Refresh UI
  } catch (err) {
    alert("Could not delete listing: " + err.message);
    console.error("DELETE ERROR:", err);
  }
}

/* ------------------------------------------
UPDATE PROFILE
------------------------------------------- */

/**
 * Handle profile update form submission.
 *
 * Updates avatar, banner, and bio.
 */
editProfileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  editMsg.textContent = "";
  editError.textContent = "";

  const body = {
    bio: bioInput.value,
    avatar: { url: avatarUrlInput.value, alt: "" },
    banner: { url: bannerUrlInput.value, alt: "" },
  };

  try {
    await apiPut(`/auction/profiles/${username}`, body, token, apiKey);
    showSuccess(editMsg, "Profile updated!");
    fetchProfile();
  } catch (err) {
    showError(editError, err.message);
    console.error("UPDATE PROFILE ERROR:", err);
  }
});

/* ------------------------------------------
INITIALIZE PAGE
------------------------------------------- */

fetchProfile();

