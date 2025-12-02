const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const listingsContainer = document.getElementById("listingsContainer");

const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");

let listings = [];

/**
 * Redirect to login page.
 *
 * @function
 */
loginBtn.onclick = () => (window.location.href = "../pages/login.html");

/**
 * Redirect to register page.
 *
 * @function
 */
registerBtn.onclick = () => (window.location.href = "../pages/register.html");

/**
 * Validate an image URL.  
 * If the image fails to load, a fallback image is returned.
 *
 * @async
 * @function validateImage
 * @param {string} url - Image URL to validate
 * @returns {Promise<string>} Valid URL or fallback
 */
function validateImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => resolve("../assets/images/fallback.svg");
    img.src = url;
  });
}

/**
 * Fetch all listings from the API and attach a validated image URL.
 *
 * @async
 * @function fetchListings
 * @returns {Promise<void>}
 */
async function fetchListings() {
  try {
    const res = await fetch(
      "https://v2.api.noroff.dev/auction/listings?_seller=true&_bids=true"
    );

    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    const data = await res.json();

    listings = await Promise.all(
      data.data.map(async (listing) => ({
        ...listing,
        mediaUrl: await validateImage(listing.media?.[0]?.url || "")
      }))
    );

    renderListings(listings);
  } catch (err) {
    console.error("Failed to load listings", err);
    listingsContainer.innerHTML =
      "<p class='text-red-600 text-center'>Failed to load listings.</p>";
  }
}

/**
 * Render listing cards into the page.
 *
 * @function renderListings
 * @param {Array<Object>} listingsToRender - Array of listing objects to display
 */
function renderListings(listingsToRender) {
  listingsContainer.innerHTML = listingsToRender
    .map((listing) => {
      const highestBid = listing.bids?.length
        ? Math.max(...listing.bids.map((b) => b.amount))
        : listing.price || 0;

      const sellerName = listing.seller?.name || "Unknown";

      return `
        <div class="listing-card bg-white rounded-lg shadow p-4 flex flex-col 
                    hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              data-id="${listing.id}">

          <div class="h-48 w-full overflow-hidden rounded mb-4 bg-gray-200">
            <img 
              src="${listing.mediaUrl}"
              alt="${listing.media?.[0]?.alt || listing.title || "Listing image"}"
              class="w-full h-full object-cover"
            />
          </div>

          <h3 class="text-lg font-bold text-center mb-1">${listing.title}</h3>

          <p class="text-sm text-gray-500 text-center mb-1">Posted by: ${sellerName}</p>

          <p class="text-sm mb-2">${listing.description || "No description"}</p>

          <p class="text-sm mb-1">Ends: ${new Date(listing.endsAt).toLocaleString()}</p>

          <p class="font-semibold">Highest Bid: ${highestBid} credits</p>
        </div>
      `;
    })
    .join("");

  attachCardClickEvents();
}

/**
 * Add click handlers so each listing card opens the view page.
 *
 * @function attachCardClickEvents
 */
function attachCardClickEvents() {
  document.querySelectorAll(".listing-card").forEach((card) => {
    const id = card.dataset.id;

    card.addEventListener("click", () => {
      window.location.href = `../pages/view.html?id=${id}`;
    });
  });
}

/**
 * Apply both search and filter based on input text and filter dropdown.
 *
 * @function applySearchAndFilter
 */
function applySearchAndFilter() {
  const term = searchInput.value.toLowerCase();
  const filter = filterSelect.value;
  const now = new Date();

  const filtered = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(term) ||
      listing.description?.toLowerCase().includes(term);

    let matchesFilter = true;
    if (filter === "active") matchesFilter = new Date(listing.endsAt) > now;
    if (filter === "ended") matchesFilter = new Date(listing.endsAt) <= now;

    return matchesSearch && matchesFilter;
  });

  renderListings(filtered);
}

// Filter listeners
searchInput.addEventListener("input", applySearchAndFilter);
filterSelect.addEventListener("change", applySearchAndFilter);

/**
 * Initialize the page by fetching listings.
 *
 * @function
 */
fetchListings();
