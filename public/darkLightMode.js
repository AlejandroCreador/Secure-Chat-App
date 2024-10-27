// darkLightMode.js

// Get the current hour and automatically set dark mode if it's between 22:00 and 6:00
function setAutomaticMode() {
    const currentHour = new Date().getHours();
    if (currentHour >= 22 || currentHour < 6) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }
  
  // Toggle dark/light mode manually
  function toggleDarkLightMode() {
    const body = document.body;
    const darkLightToggle = document.getElementById('dark-light-toggle');
    const currentMode = body.classList.contains('dark-mode') ? 'dark' : 'light';
  
    if (currentMode === 'dark') {
      body.classList.remove('dark-mode');
      body.classList.add('light-mode');
      darkLightToggle.innerHTML = '<span>🌞</span>';
      localStorage.setItem('preferredMode', 'light');
    } else {
      body.classList.remove('light-mode');
      body.classList.add('dark-mode');
      darkLightToggle.innerHTML = '<span>🌙</span>';
      localStorage.setItem('preferredMode', 'dark');
    }
  }
  
  // Load user's preferred mode from localStorage
  function loadPreferredMode() {
    const preferredMode = localStorage.getItem('preferredMode');
    if (preferredMode) {
      if (preferredMode === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
      } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
      }
    } else {
      // No preference, use automatic mode
      setAutomaticMode();
    }
  }
  
  // Initialize dark/light mode on page load
  window.onload = () => {
    loadPreferredMode();
  
    // Set up event listener for toggle
    document.getElementById('dark-light-toggle').addEventListener('click', toggleDarkLightMode);
  };
  