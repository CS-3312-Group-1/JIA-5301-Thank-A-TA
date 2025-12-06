/**
 * Login page JavaScript
 */

// Toggle password visibility
function togglePassword() {
  const passwordInput = document.getElementById('password');
  const toggleIcon = document.getElementById('toggleIcon');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleIcon.textContent = '🙈';
  } else {
    passwordInput.type = 'password';
    toggleIcon.textContent = '👁';
  }
}

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Show loading state
  const submitButton = document.querySelector('.btn-login');
  const buttonText = document.getElementById('loginButtonText');
  const spinner = document.getElementById('loginSpinner');

  submitButton.disabled = true;
  buttonText.style.display = 'none';
  spinner.style.display = 'inline-block';

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Login failed');
    }

    // Show success message
    showToast('Login successful!', 'success', 1500);

    // Redirect based on role after a short delay
    setTimeout(() => {
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else if (data.user) {
        // Fallback redirect logic
        if (data.user.isAdmin) {
          window.location.href = '/admin';
        } else if (data.user.isTa) {
          window.location.href = '/inbox';
        } else {
          window.location.href = '/';
        }
      } else {
        window.location.href = '/';
      }
    }, 1500);

  } catch (error) {
    // Show error message
    showToast(error.message, 'error');

    // Reset button state
    submitButton.disabled = false;
    buttonText.style.display = 'inline';
    spinner.style.display = 'none';

    // Clear password field
    document.getElementById('password').value = '';
  }
});

// Auto-focus email field on page load
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('email').focus();
});
