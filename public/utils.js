// utils.js

// Encryption function (AES)
function encryptMessage(message) {
    console.log("Encrypting message:", message);
    const secretKey = 'my_super_secret_key_123!';
    return CryptoJS.AES.encrypt(message, secretKey).toString();
  }
  
  function decryptMessage(encryptedMessage) {
    console.log("Decrypting message:", encryptedMessage);
    const secretKey = 'my_super_secret_key_123!';
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  
  
  // Function to show feedback messages in the UI
  function showMessage(message, type = 'error') {
    const authErrorElement = document.getElementById('auth-error');
    authErrorElement.textContent = message;
    authErrorElement.style.color = type === 'success' ? 'green' : 'red';
  }
  