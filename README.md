# Auction Application
A Semester Project 2 by Ida Nøkland

# 📌 Overview

BidHub is a fully functional auction web application built using HTML, TailwindCSS, and vanilla JavaScript, connected to the Noroff Auction API.

The platform allows users to:

- Register and log in (restricted to @stud.noroff.no emails)
- Create and manage auction listings
- Upload media for listings
- Place bids on other users' listings
- View bid history on each listing
- Manage profile information (bio, avatar, banner)
- View personal credits across all pages
- View listings created and listings bid on (“My Listings” and “My Bids”)
- Browse, search, and filter listings without logging in

The application emphasizes modern UI design, responsive layout, accessibility, and modular code structure.

# 🛠️ Technologies Used

- HTML5
- Tailwind CSS
- Vanilla JavaScript
- Noroff Auction API
- LocalStorage for authentication state
- Figma for design and prototyping
- GitHub Projects for planning

# 🎨 Design & UX

A complete style guide and wireframes were created in Figma for both mobile and desktop.

The design focuses on:
- Clean, modern visual style
- Strong accessibility and color contrast
- Mobile-first responsive layout
- Simple and intuitive navigation
- Consistent UI components across all pages

# 🧩 Features
Authentication
- Register using a verified @stud.noroff.no email
- Log in and receive your accessToken
- API key stored locally for API requests
- Protected pages (profile, home, create, edit, etc.) redirect if user is not logged in

Listings
Create new listings with:
- Title
- Description
- End date
- Media images
- View full listing details on view.html
- User cannot bid on their own listing

# 💸 Bidding
- Logged-in users can place bids
Users see:
- Highest bid
- Bid history
- End date
- Logged-out users see “Log in to place a bid”

# 🧑‍💼 Profile Management
- Update avatar, banner, and bio
View:
- My Listings
- My Bids (wins)
- Edit or delete your listings
- View button added for easy navigation
- Credits always visible when logged in

# 🔍 Listings Browse
- Public listing browsing (no login required)
- Search input (title & description)
Filter by:
- Active listings
- Ended listings
- All listings
Click any listing card to view details

# 📂 Project Structure
root/
├── assets/
│   └── css/
├── auth/
│   ├── login.js
│   └── register.js
├── account/
│   └── profile.js
├── listings/
│   ├── create.js
│   ├── edit.js
│   └── view.js
├── html/
│   ├── login.html
│   ├── register.html
│   ├── home.html
│   ├── profile.html
│   ├── create.html
│   ├── edit.html
│   └── view.html
└── README.md

# 🚀 Installation & Setup
To run this project locally:

1. Clone the repository
2. git clone <repository-url>
3. Open the project folder
4. cd project-folder
5. Open any HTML file in a browser (Live Server recommended)
6. No build steps are required — the project is fully static.

# 🔑 API Requirements
To use the Noroff Auction API you need:
- A registered @stud.noroff.no account
- Your accessToken (stored on login)
- A Noroff API Key stored in localStorage
- The project automatically handles this once the user logs in.


# 🧠 Key Challenges & Solutions
 1. Authentication & API Keys
Struggled to generate and validate API keys and tokens.
Solution: Built helper functions to check token + username + API key securely in localStorage.

2. Logged-in State Detection
Pages were showing logged-in UI even when not authenticated.
Solution: Added a global isLoggedIn() and redirect logic for protected pages.

3. “Place Bid” Not Showing Correctly
The wrong button displayed depending on login state.
Solution: Added conditional rendering:
- Place Bid
- Log in to place bid
- You cannot bid on your own listing

4. Credits Not Updating
Credits didn’t update after bidding.
Solution: Re-fetched the user profile after placing a bid.

5. Dropdown Menu Not Closing Smoothly
Dropdown stayed open or closed unexpectedly.
Solution: Added click-outside detection + improved toggle logic.

6. Matching Figma Design in Code
Spacing and sizing didn’t match my wireframes.
Solution: Inspected elements in the browser and adjusted Tailwind classes until it matched.

# 📚 Reflection Summary
This project strengthened my skills in:
- Writing clean and modular JavaScript
- API communication and async operations
- Building responsive, accessible layouts
- Authentication and access control
- Debugging complex UI logic
- Project planning and documentation

It allowed me to apply everything I’ve learned in the last two years in a complete, fully functional application.

# 📦 Deployment

Live project URL:
(Add your Netlify/Vercel/GitHub Pages link here)

👤 Author

Ida Nøkland
Front-End Developer Student — Noroff
Semester Project 2
