import { renderHeader } from "../../utils/header.js";
import { getUser, isLoggedIn } from "../../utils/auth.js";
import { apiGet, apiPost } from "../../utils/api.js";
import { validateImage } from "../../utils/helpers.js";

/* ------------------------------------------
INIT: Load header + get user session
------------------------------------------- */

renderHeader(); // Header auto-hides elements for guests

const user = getUser();
const isAuth = isLoggedIn();

const listingContainer = document.getElementById("listingContainer");

const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

if (!listingId) {
  listingContainer.innerHTML = `<p class="text-red-600">No listing selected.</p>`;
}

/* ------------------------------------------
FETCH LISTING
------------------------------------------- */

/**
 * Fetch the listing from the API and render it.
 *
 * @async
 * @function loadListing
 * @returns {Promise<void>}
 */
async function loadListing() {
  try {
    const listing = await apiGet(
      `/auction/listings/${listingId}?_seller=true&_bids=true`,
      user.token,
      user.apiKey
    );

    listing.mediaUrl = await validateImage(listing.media?.[0]?.url || "");

    renderListing(listing);
  } catch (err) {
    listingContainer.innerHTML = `<p class="text-red-600">${err.message}</p>`;
  }
}

loadListing();

/* ------------------------------------------
  RENDER LISTING
------------------------------------------- */

/**
 * Render a single listing into the page.
 *
 * @function renderListing
 * @param {Object} listing - Listing object returned by the API
 */
function renderListing(listing) {
  const seller = listing.seller?.name || "Unknown";

  const highestBid = listing.bids?.length
    ? Math.max(...listing.bids.map((b) => b.amount))
    : listing.startingPrice || listing.price || 0;

  const isOwner = isAuth && user.username === seller;

  // ---------------- PRODUCE BID AREA ---------------- //
  let bidSection = "";

  if (!isAuth) {
    bidSection = `
      <button class="bg-[#4B3028] text-white px-4 py-2 rounded w-full mt-4"
              onclick="window.location.href='../pages/login.html'">
        Log in to place a bid
      </button>`;
  } else if (isOwner) {
    bidSection = `<p class="text-gray-500 italic mt-4">(You cannot bid on your own listing)</p>`;
  } else {
    bidSection = `
      <div class="mt-4">
        <input id="bidAmount" type="number" min="${highestBid + 1}"
          class="border rounded px-2 py-1 w-full mb-3"
          placeholder="Enter your bid (min ${highestBid + 1})"/>

        <button id="placeBidBtn"
          class="bg-[#4B3028] text-white px-4 py-2 rounded w-full">
          Place Bid
        </button>
      </div>`;
  }

  // ---------------- BID HISTORY ---------------- //
  const bidHistory = listing.bids?.length
    ? listing.bids
        .sort((a, b) => b.amount - a.amount)
        .map(
          (b) => `
            <div class="border p-2 rounded bg-gray-50">
              <p><strong>${b.bidder}</strong>: ${b.amount} credits</p>
              <p class="text-xs text-gray-500">${new Date(
                b.created
              ).toLocaleString()}</p>
            </div>`
        )
        .join("")
    : "<p>No bids yet.</p>";

  // ---------------- OUTPUT HTML ---------------- //
  listingContainer.innerHTML = `
    <img src="${
      listing.mediaUrl
    }" class="w-full h-64 object-cover rounded mb-4"/>

    <h2 class="text-2xl font-bold text-[#4B3028] mb-2">${listing.title}</h2>
    <p class="text-gray-700 mb-2">${
      listing.description || "No description."
    }</p>

    <p class="text-gray-600 mb-1"><strong>Seller:</strong> ${seller}</p>
    <p class="text-gray-600 mb-3">
      <strong>Ends:</strong> ${new Date(listing.endsAt).toLocaleString()}
    </p>

    <p class="text-lg font-semibold text-[#4B3028]">
      Highest Bid: ${highestBid} credits
    </p>

    ${bidSection}

    <h3 class="text-xl font-semibold mt-6 mb-2 text-[#4B3028]">Bid History</h3>

    <div class="space-y-2">${bidHistory}</div>
  `;

  if (isAuth && !isOwner) attachBidHandler(highestBid);
}

/* ------------------------------------------
PLACE BID HANDLER
------------------------------------------- */

/**
 * Attach click handler for bidding.
 *
 * @function attachBidHandler
 * @param {number} highestBid - Current highest bid used for validation
 */
function attachBidHandler(highestBid) {
  const btn = document.getElementById("placeBidBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const bidAmount = Number(document.getElementById("bidAmount").value);

    if (isNaN(bidAmount) || bidAmount <= highestBid) {
      alert(`Bid must be higher than ${highestBid}`);
      return;
    }

    try {
      await apiPost(
        `/auction/listings/${listingId}/bids`,
        { amount: bidAmount },
        user.token,
        user.apiKey
      );

      alert("Bid placed successfully!");
      loadListing();
    } catch (err) {
      alert("Bid failed: " + err.message);
    }
  });
}
