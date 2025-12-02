// utils/api.js

/**
 * Base URL for all Noroff API requests.
 * @constant {string}
 */
const BASE_URL = "https://v2.api.noroff.dev";

/**
 * Performs a generic GET request to the Noroff API.
 *
 * @async
 * @function apiGet
 * @param {string} endpoint - API endpoint (e.g. `/auction/listings`).
 * @param {string|null} [token=null] - Optional Bearer token for authenticated requests.
 * @param {string|null} [apiKey=null] - Optional Noroff API key.
 * @returns {Promise<any>} Resolves with the `data` object from the API response.
 *
 * @throws {Error} If the request fails or API returns an error response.
 *
 * @example
 * const listings = await apiGet("/auction/listings");
 */
export async function apiGet(endpoint, token = null, apiKey = null) {
const headers = {};

if (token) headers.Authorization = `Bearer ${token}`;
if (apiKey) headers["X-Noroff-API-Key"] = apiKey;

const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
const json = await res.json();

if (!res.ok) {
    throw new Error(json?.errors?.[0]?.message || "API GET error");
}

return json.data;
}

/**
 * Performs a generic POST request to the Noroff API.
 *
 * @async
 * @function apiPost
 * @param {string} endpoint - API endpoint (e.g. `/auth/login`).
 * @param {Object} [body={}] - The JSON body to send in the request.
 * @param {string|null} [token=null] - Optional Bearer token.
 * @param {string|null} [apiKey=null] - Optional Noroff API key.
 * @returns {Promise<any>} Resolves with the `data` from the API response.
 *
 * @throws {Error} If the POST request fails.
 *
 * @example
 * const loginData = await apiPost("/auth/login", {
 *   email: "user@stud.noroff.no",
 *   password: "12345678"
 * });
 */
export async function apiPost(
    endpoint,
    body = {},
    token = null,
    apiKey = null
) {
const headers = { "Content-Type": "application/json" };

if (token) headers.Authorization = `Bearer ${token}`;
if (apiKey) headers["X-Noroff-API-Key"] = apiKey;

const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
});

const json = await res.json();

if (!res.ok) {
    throw new Error(json?.errors?.[0]?.message || "API POST error");
}

return json.data;
}

/**
 * Performs a generic PUT request to the Noroff API.
 *
 * @async
 * @function apiPut
 * @param {string} endpoint - API endpoint (e.g. `/auction/listings/:id`).
 * @param {Object} [body={}] - Updated data for the request.
 * @param {string} token - Bearer token for authentication.
 * @param {string} apiKey - Noroff API key.
 * @returns {Promise<any>} Resolves with updated resource data.
 *
 * @throws {Error} If the PUT request fails.
 *
 * @example
 * await apiPut("/auction/profiles/john", { bio: "Updated bio" }, token, apiKey);
 */
export async function apiPut(endpoint, body = {}, token, apiKey) {
const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Noroff-API-Key": apiKey,
    },
    body: JSON.stringify(body),
});

const json = await res.json();

if (!res.ok) {
    throw new Error(json?.errors?.[0]?.message || "API PUT error");
}

return json.data;
}

/**
 * Performs a generic DELETE request to the Noroff API.
 *
 * @async
 * @function apiDelete
 * @param {string} endpoint - API endpoint (e.g. `/auction/listings/:id`).
 * @param {string} token - Bearer token.
 * @param {string} apiKey - Noroff API key.
 * @returns {Promise<boolean>} Resolves `true` on successful deletion.
 *
 * @throws {Error} If the DELETE request fails.
 *
 * @example
 * await apiDelete("/auction/listings/123", token, apiKey);
 */
export async function apiDelete(endpoint, token, apiKey) {
const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: {
    Authorization: `Bearer ${token}`,
    "X-Noroff-API-Key": apiKey,
    },
});

if (!res.ok) {
    const json = await res.json();
    throw new Error(json?.errors?.[0]?.message || "API DELETE error");
}

    return true;
}
