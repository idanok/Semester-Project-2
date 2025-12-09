import { getUser, isLoggedIn, logout } from "./auth.js";
import { apiGet } from "./api.js";

/**
 * Renders the BidHub global header into the element with ID `siteHeader`.
 * 
 * Injects the header markup, loads the user's profile (if logged in),
 * displays avatar + username + credits, and attaches all dropdown
 * and navigation interactions.
 *
 * This function should be called at the top of any authenticated page:
 * 
 * @example
 * import { renderHeader } from "../utils/header.js";
 * renderHeader();
 *
 * @async
 * @function renderHeader
 * @returns {Promise<void>} Nothing (renders directly to the DOM).
 */
export async function renderHeader() {
    const headerContainer = document.getElementById("siteHeader");
    if (!headerContainer) return;

  // ----------------------------------
  // Inject header HTML layout
  // ----------------------------------
headerContainer.innerHTML = `
    <header class="bg-[#4B3028] text-white px-6 py-4 flex justify-between items-center shadow">

    <div class="flex flex-col leading-tight cursor-pointer" id="homeLogo">
        <h1 class="text-3xl font-bold">BidHub</h1>
        <p class="text-sm opacity-90 -mt-1">Where bids meets opportunities</p>
    </div>

        <div class="flex items-center gap-6">

        <div id="userCredit"
            class="hidden bg-[#B87A62] text-white text-sm font-semibold px-4 py-2 rounded-xl shadow">
        Credits: --
        </div>

        <!-- userMenuWrapper: added overflow-visible so the arrow won't be clipped on small screens -->
        <div id="userMenuWrapper" class="relative hidden overflow-visible">
        <div id="userMenuButton" class="flex items-center gap-3 cursor-pointer select-none">

            <img id="headerAvatar"
            class="w-10 h-10 rounded-full border-2 border-white object-cover shadow" />

            <span id="navUsername" class="text-lg font-medium"></span>

            <!-- svg: added flex-shrink-0 ml-1 block to ensure it's visible on small screens -->
            <svg id="dropdownArrow" class="w-4 h-4 flex-shrink-0 ml-1 block transition-transform"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 9l-7 7-7-7" />
            </svg>
        </div>


        <div id="userDropdown"
            class="hidden absolute right-0 mt-3 bg-white text-black rounded-lg shadow-lg w-44 py-2 z-50">
            <button id="profileDropdown"
            class="w-full text-left px-4 py-2 hover:bg-gray-100">My Profile</button>
            <button id="logoutDropdown"
            class="w-full text-left px-4 py-2 hover:bg-gray-100">Log Out</button>
        </div>
        </div>

    </div>
    </header>
`;

  // Stop here if the visitor is NOT logged in
if (!isLoggedIn()) return;

const { username, token, apiKey } = getUser();

  // ----------------------------------
  // Element references
  // ----------------------------------
const homeLogo = document.getElementById("homeLogo");
const userMenuWrapper = document.getElementById("userMenuWrapper");
const userMenuButton = document.getElementById("userMenuButton");
const userDropdown = document.getElementById("userDropdown");
const dropdownArrow = document.getElementById("dropdownArrow");
const logoutDropdown = document.getElementById("logoutDropdown");
const profileDropdown = document.getElementById("profileDropdown");
const headerAvatar = document.getElementById("headerAvatar");
const navUsername = document.getElementById("navUsername");
const userCredit = document.getElementById("userCredit");

  // ----------------------------------
  // Load Profile Data
  // ----------------------------------
try {
    const profile = await apiGet(
    `/auction/profiles/${username}?_listings=true`,
    token,
    apiKey
);

    navUsername.textContent = profile.name;
    headerAvatar.src = profile.avatar?.url || "https://via.placeholder.com/150";

    userCredit.textContent = `Credits: ${profile.credits}`;
    userCredit.classList.remove("hidden");

    userMenuWrapper.classList.remove("hidden");

} catch (err) {
    console.error("HEADER LOAD ERROR:", err);
}

  // ----------------------------------
  // Navigation
  // ----------------------------------
homeLogo.addEventListener("click", () => {
    window.location.href = "../pages/home.html";
});

profileDropdown.addEventListener("click", () => {
    window.location.href = "../pages/profile.html";
});

logoutDropdown.addEventListener("click", () => {
    logout();
    window.location.href = "../pages/index.html";
});


  // ----------------------------------
  // Dropdown logic
  // ----------------------------------
userMenuButton.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle("hidden");
    dropdownArrow.classList.toggle("rotate-180");
});

document.addEventListener("click", (e) => {
    if (!userMenuWrapper.contains(e.target)) {
    userDropdown.classList.add("hidden");
    dropdownArrow.classList.remove("rotate-180");
    }
});
}
