const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const listingsContainer = document.getElementById("listingsContainer");
const lcpImg = document.getElementById("lcp-img");

const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");

let listings = [];

/* Redirect buttons */
loginBtn.onclick = () => (window.location.href = "../pages/login.html");
registerBtn.onclick = () => (window.location.href = "../pages/register.html");

/* Convert Noroff URL → 300px thumbnail */
function optimizeImage(url) {
  if (!url) return "../assets/images/fallback.webp";
  return url.replace(
    "https://cdn.noroff.dev/images",
    "https://cdn.noroff.dev/300/images"
  );
}

/* Validate image */
function validateImage(url) {
  return new Promise((resolve) => {
    if (!url) return resolve("../assets/images/fallback.webp");

    const optimized = optimizeImage(url);

    const img = new Image();
    img.onload = () => resolve(optimized);
    img.onerror = () => resolve("../assets/images/fallback.webp");

    img.src = optimized;
  });
}

/* Fetch listings */
async function fetchListings() {
  try {
    const res = await fetch(
      "https://v2.api.noroff.dev/auction/listings?_seller=true&_bids=true"
    );

    const data = await res.json();

    listings = await Promise.all(
      data.data.map(async (listing) => ({
        ...listing,
        mediaUrl: await validateImage(listing.media?.[0]?.url),
        altText: listing.media?.[0]?.alt || listing.title || "Listing image"
      }))
    );

    /* Paint LCP immediately */
    showLCPImage(listings[0]);

    /* Render everything */
    renderListings(listings);

  } catch (err) {
    console.error("Failed to load listings", err);
    listingsContainer.innerHTML =
      "<p class='text-red-600 text-center'>Failed to load listings.</p>";
  }
}

/* Paint LCP image instantly */
function showLCPImage(firstListing) {
  if (!firstListing) return;

  lcpImg.src = firstListing.mediaUrl;
  lcpImg.alt = firstListing.altText;
  lcpImg.classList.remove("hidden");
}

/* Render all cards */
function renderListings(listingsToRender) {
  listingsContainer.innerHTML = listingsToRender
    .map((listing) => {
      const highestBid = listing.bids?.length
        ? Math.max(...listing.bids.map((b) => b.amount))
        : listing.price || 0;

      return `
        <div class="listing-card bg-white rounded-lg shadow p-4 flex flex-col 
          hover:shadow-lg transition-shadow cursor-pointer" data-id="${listing.id}">
          
          <div class="h-48 w-full overflow-hidden rounded mb-4 bg-gray-200">
            <img src="${listing.mediaUrl}" loading="lazy" 
                 alt="${listing.altText}" 
                 class="w-full h-full object-cover" />
          </div>

          <h3 class="text-lg font-bold text-center mb-1">${listing.title}</h3>
          <p class="text-sm text-gray-500 text-center mb-1">Posted by: ${listing.seller?.name || "Unknown"}</p>
          <p class="text-sm mb-2">${listing.description || ""}</p>
          <p class="text-sm mb-1">Ends: ${new Date(listing.endsAt).toLocaleString()}</p>
          <p class="font-semibold">Highest Bid: ${highestBid} credits</p>

        </div>
      `;
    })
    .join("");

  attachCardClickEvents();
}

/* Click */
function attachCardClickEvents() {
  document.querySelectorAll(".listing-card").forEach((card) => {
    card.addEventListener("click", () => {
      window.location.href = `../pages/view.html?id=${card.dataset.id}`;
    });
  });
}

fetchListings();
