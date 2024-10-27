// Fetch the CSRF token from the server
async function getCsrfToken() {
  try {
    const response = await fetch('/get-csrf-token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    showMessage('Failed to fetch CSRF token. Please try again.', 'error');
  }
}

// Show message on registration or login status
function showMessage(message, type = 'error') {
  const authErrorElement = document.getElementById('auth-error');
  authErrorElement.textContent = message;
  authErrorElement.style.color = type === 'success' ? 'green' : 'red';
}

// Register a new user
document.getElementById('register-btn').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Validate input fields
  if (!username || !password) {
    showMessage('Username and password are required.', 'error');
    return;
  }

  const csrfToken = await getCsrfToken();

  if (!csrfToken) {
    showMessage('CSRF token could not be fetched. Please try again.', 'error');
    return;
  }

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken, // Add CSRF token to the request header
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      showMessage('Registered successfully! Now you can log in.', 'success');
    } else {
      showMessage(data.message || 'Registration failed.', 'error');
    }
  } catch (error) {
    console.error('Error during registration:', error);
    showMessage('Registration failed due to a server error.', 'error');
  }
});

// Log in a user
document.getElementById('login-btn').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Validate input fields
  if (!username || !password) {
    showMessage('Username and password are required.', 'error');
    return;
  }

  const csrfToken = await getCsrfToken();

  if (!csrfToken) {
    showMessage('CSRF token could not be fetched. Please try again.', 'error');
    return;
  }

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken, // Add CSRF token to the request header
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      // Save the username to localStorage and connect to WebSocket
      localStorage.setItem('username', username);
      const token = data.token;
      document.getElementById('auth-container').style.display = 'none';
      document.getElementById('chat-container').style.display = 'block';
      connectToSocket(token);  // Connect to WebSocket with the token
    } else {
      showMessage(data.message || 'Login failed.', 'error');
    }
  } catch (error) {
    console.error('Error during login:', error);
    showMessage('Login failed due to a server error.', 'error');
  }
});
