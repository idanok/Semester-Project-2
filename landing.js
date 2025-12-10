const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const listingsContainer = document.getElementById("listingsContainer");

const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");

let listings = [];

/* Redirect buttons */
loginBtn.onclick = () => (window.location.href = "../pages/login.html");
registerBtn.onclick = () => (window.location.href = "../pages/register.html");

/* Convert large Noroff images → optimized 300px thumbnails */
function optimizeImage(url) {
  if (!url) return "../assets/images/fallback.webp";
  return url.replace(
    "https://cdn.noroff.dev/images",
    "https://cdn.noroff.dev/300/images"
  );
}

/* Validate optimized image */
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

/* Preload first image (improves LCP massively) */
function preloadFirstImage(url) {
  if (!url) return;
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = url;
  link.fetchPriority = "high";
  document.head.appendChild(link);
}

/* Fetch ALL listings (you keep all of them!) */
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
        altText:
          listing.media?.[0]?.alt ||
          listing.title ||
          "Auction listing image"
      }))
    );

    /* Preload the first listing image for better LCP */
    preloadFirstImage(listings[0]?.mediaUrl);

    renderListings(listings);

  } catch (err) {
    console.error("Failed to load listings", err);
    listingsContainer.innerHTML =
      "<p class='text-red-600 text-center'>Failed to load listings.</p>";
  }
}

/* Render all listing cards */
function renderListings(listingsToRender) {
  listingsContainer.innerHTML = listingsToRender
    .map((listing, index) => {
      const eager = index === 0 ? "loading='eager' fetchpriority='high'" : "loading='lazy'";

      const highestBid = listing.bids?.length
        ? Math.max(...listing.bids.map((b) => b.amount))
        : listing.price || 0;

      return `
        <div class="listing-card bg-white rounded-lg shadow p-4 flex flex-col 
                    hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              data-id="${listing.id}">

          <div class="h-48 w-full overflow-hidden rounded mb-4 bg-gray-200">
            <img 
              src="${listing.mediaUrl}"
              ${eager}
              srcset="${listing.mediaUrl} 300w, ${listing.mediaUrl} 600w"
              sizes="(max-width: 600px) 100vw, 300px"
              alt="${listing.altText}"
              class="w-full h-full object-cover"
            />
          </div>

          <h3 class="text-lg font-bold text-center mb-1">${listing.title}</h3>
          <p class="text-sm text-gray-500 text-center mb-1">Posted by: ${listing.seller?.name || "Unknown"}</p>
          <p class="text-sm mb-2">${listing.description || "No description available"}</p>
          <p class="text-sm mb-1">Ends: ${new Date(listing.endsAt).toLocaleString()}</p>
          <p class="font-semibold">Highest Bid: ${highestBid} credits</p>
        </div>
      `;
    })
    .join("");

  attachCardClickEvents();
}

/* Click event for each card */
function attachCardClickEvents() {
  document.querySelectorAll(".listing-card").forEach((card) => {
    const id = card.dataset.id;
    card.addEventListener("click", () => {
      window.location.href = `../pages/view.html?id=${id}`;
    });
  });
}

/* Search + Filter */
function applySearchAndFilter() {
  const term = searchInput.value.toLowerCase();
  const filter = filterSelect.value;
  const now = new Date();

  const filtered = listings.filter((listing) => {
    const matchesText =
      listing.title.toLowerCase().includes(term) ||
      listing.description?.toLowerCase().includes(term);

    let matchesFilter = true;
    if (filter === "active") matchesFilter = new Date(listing.endsAt) > now;
    if (filter === "ended") matchesFilter = new Date(listing.endsAt) <= now;

    return matchesText && matchesFilter;
  });

  renderListings(filtered);
}

searchInput.addEventListener("input", applySearchAndFilter);
filterSelect.addEventListener("change", applySearchAndFilter);

/* LOAD EVERYTHING */
fetchListings();
