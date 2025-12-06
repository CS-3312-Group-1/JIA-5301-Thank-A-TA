/**
 * Shared utility functions for the Thank-A-TA application
 */

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of toast (success, error, info, warning)
 * @param {number} duration - How long to show the toast in milliseconds (default: 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Auto-remove after duration
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * API call wrapper with error handling
 * @param {string} url - The API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} - Returns the JSON response
 */
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Important for session cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }

      return data;
    } else {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response;
    }
  } catch (err) {
    console.error('API Error:', err);
    showToast(err.message || 'An error occurred', 'error');
    throw err;
  }
}

/**
 * API call for multipart/form-data (file uploads)
 * @param {string} url - The API endpoint
 * @param {FormData} formData - The form data to send
 * @returns {Promise} - Returns the response
 */
async function apiUpload(url, formData) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData
      // Don't set Content-Type header - browser sets it with boundary
    });

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }

      return data;
    } else {
      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || `HTTP ${response.status}`);
      }

      return { message: text };
    }
  } catch (err) {
    console.error('Upload Error:', err);
    showToast(err.message || 'Upload failed', 'error');
    throw err;
  }
}

/**
 * Toggle password visibility
 * @param {string} inputId - ID of the password input
 * @param {HTMLElement} button - The toggle button element
 */
function togglePasswordVisibility(inputId, button) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    button.innerHTML = '🙈';
  } else {
    input.type = 'password';
    button.innerHTML = '👁';
  }
}

/**
 * Debounce function for search inputs
 * @param {Function} func - The function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} - Debounced function
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Safely parse JSON from sessionStorage
 * @param {string} key - Storage key
 * @returns {any} - Parsed value or null
 */
function getFromSession(key) {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (err) {
    console.error('Session storage parse error:', err);
    return null;
  }
}

/**
 * Safely set JSON to sessionStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
function setInSession(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Session storage set error:', err);
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showToast,
    apiCall,
    apiUpload,
    togglePasswordVisibility,
    debounce,
    formatDate,
    getFromSession,
    setInSession
  };
}
