import { requireAuth, getUser } from "../../utils/auth.js";
import { renderHeader } from "../../utils/header.js";
import { apiGet } from "../../utils/api.js";
import { validateImage } from "../../utils/helpers.js";

// Require login before viewing the page
requireAuth();

// Render reusable site header
renderHeader();

// DOM elements
const listingsContainer = document.getElementById("listingsContainer");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const createBtn = document.getElementById("createBtn");

let listings = [];

const user = getUser();

/**
 * Load all global listings + the user's own listings.
 *
 * @async
 * @function loadListings
 * @returns {Promise<void>}
 *
 * @description
 * Fetches:
 *  - All listings from the API  
 *  - The user's own listings  
 *
 * Then validates images, merges them, and renders.
 */
async function loadListings() {
  try {
    const globalListings = await apiGet(
      "/auction/listings?_seller=true&_bids=true"
    );

    const myListings = await loadMyListings();

    const combined = [...myListings, ...globalListings];

    listings = await Promise.all(
      combined.map(async (listing) => ({
        ...listing,
        mediaUrl: await validateImage(listing.media?.[0]?.url || "")
      }))
    );

    renderListings(listings);

  } catch (err) {
    console.error(err);
    listingsContainer.innerHTML =
      `<p class="text-red-600 text-center">Failed to load listings.</p>`;
  }
}

/**
 * Load listings created by the currently logged-in user.
 *
 * @async
 * @function loadMyListings
 * @returns {Promise<Array>} Array of user-created listings
 */
async function loadMyListings() {
  const { username, token, apiKey } = user;

  if (!username || !token || !apiKey) return [];

  try {
    const data = await apiGet(
      `/auction/profiles/${username}?_listings=true`,
      token,
      apiKey
    );

    return data.listings || [];
  } catch (err) {
    console.warn("Could not load user listings:", err);
    return [];
  }
}

/**
 * Render listing cards in the grid layout.
 *
 * @function renderListings
 * @param {Array} listData - Array of listings to render.
 */
function renderListings(listData) {
  listingsContainer.innerHTML = listData
    .map((l) => {
      const highestBid = l.bids?.length
        ? Math.max(...l.bids.map((b) => b.amount))
        : l.startingPrice || l.price || 0;

      const isOwner = l.seller?.name === user.username;

      return `
        <div class="listing-card bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition"
            data-id="${l.id}">

          <div class="h-[240px] bg-gray-200 rounded overflow-hidden mb-3">
            <img src="${l.mediaUrl}" class="w-full h-full object-cover" />
          </div>

          <h3 class="font-bold text-lg text-[#4B3028] mb-1 truncate">${l.title}</h3>
          <p class="text-sm text-gray-600 mb-1">Seller: ${l.seller?.name}</p>
          <p class="text-sm text-gray-700 mb-2 line-clamp-2">${l.description || ""}</p>
          <p class="text-sm text-gray-500">Ends: ${new Date(l.endsAt).toLocaleString()}</p>
          <p class="font-semibold text-[#4B3028] mt-1">Highest Bid: ${highestBid} credits</p>

          ${
            isOwner
              ? `<button class="update-btn bg-teal-600 text-white px-3 py-2 rounded mt-3 text-sm" data-id="${l.id}">
                  Update
                  </button>`
              : ""
          }
        </div>
      `;
    })
    .join("");

  attachCardEvents();
}

/**
 * Attach click events to each listing card and update button.
 *
 * @function attachCardEvents
 */
function attachCardEvents() {
  document.querySelectorAll(".listing-card").forEach((card) => {
    const id = card.dataset.id;

    // Open listing view page
    card.addEventListener("click", () => {
      window.location.href = `./view.html?id=${id}`;
    });

    // Update button (only shows for owner)
    const btn = card.querySelector(".update-btn");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        localStorage.setItem("editListingId", btn.dataset.id);
        window.location.href = "./edit.html";
      });
    }
  });
}

/**
 * Search + filter listings based on text and activity.
 *
 * @function applyFilters
 */
function applyFilters() {
  const term = searchInput.value.toLowerCase();
  const filter = filterSelect.value;
  const now = new Date();

  const filtered = listings.filter((l) => {
    const matchesText =
      l.title.toLowerCase().includes(term) ||
      l.description?.toLowerCase().includes(term);

    let matchesFilter = true;
    if (filter === "active") matchesFilter = new Date(l.endsAt) > now;
    if (filter === "ended") matchesFilter = new Date(l.endsAt) <= now;

    return matchesText && matchesFilter;
  });

  renderListings(filtered);
}

/* Search + Filter listeners */
searchInput.addEventListener("input", applyFilters);
filterSelect.addEventListener("change", applyFilters);

/**
 * Navigate to create listing page.
 */
createBtn.addEventListener("click", () => {
  window.location.href = "./create.html";
});

/**
 * Initialize listing loading.
 */
loadListings();
