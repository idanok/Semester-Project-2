/**
 * Save a value to localStorage under the given key.
 *
 * @function save
 * @param {string} key - The storage key to save under.
 * @param {string} value - The value to store.
 * @returns {void}
 *
 * @example
 * save("accessToken", "12345");
 */
export function save(key, value) {
    localStorage.setItem(key, value);
}

/**
   * Load a value from localStorage by key.
   *
   * @function load
   * @param {string} key - The storage key to retrieve.
   * @returns {string|null} The stored value, or null if not found.
   *
   * @example
   * const token = load("accessToken");
   */
export function load(key) {
    return localStorage.getItem(key);
}

/**
   * Remove a specific key/value pair from localStorage.
   *
   * @function remove
   * @param {string} key - The storage key to remove.
   * @returns {void}
   *
   * @example
   * remove("accessToken");
   */
export function remove(key) {
    localStorage.removeItem(key);
}

/**
   * Clear all data from localStorage.
   *
   * ⚠️ WARNING: This removes *everything*, not just your auth session.
   *
   * @function clearStorage
   * @returns {void}
   *
   * @example
   * clearStorage();
   */
export function clearStorage() {
    localStorage.clear();
}
