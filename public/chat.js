// chat.js

// WebSocket connection using the token
function connectToSocket(token) {
  const socket = io({ query: { token } });

  let username = localStorage.getItem('username'); // Retrieve the username from localStorage

  // Inform the server that this user has joined the chat
  socket.emit('join chat', { username });

  // Log connection for debugging
  socket.on('connect', () => {
    console.log('Connected to WebSocket with token:', token);
  });

  // Listen for chat messages
  socket.on('chat message', (data) => {
    // Display the message with the sender's username
    const li = document.createElement('li');
    li.textContent = `${data.username}: ${data.message}`; // Show the username and the decrypted message
    document.getElementById('messages').appendChild(li);
  });

  // Listen for notification when a user joins
  socket.on('user joined', (data) => {
    showSystemMessage(`${data.username} has joined the chat.`);
  });

  // Listen for notification when a user leaves
  socket.on('user left', (data) => {
    showSystemMessage(`${data.username} has left the chat.`);
  });

  // Handle message sending
  document.getElementById('send-btn').addEventListener('click', () => {
    sendMessage(socket);
  });

  document.getElementById('input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage(socket);
    }
  });
}

// Function to handle sending the message
function sendMessage(socket) {
  const message = document.getElementById('input').value;
  if (message.trim()) {
    const encryptedMessage = encryptMessage(message); // Encrypt the message
    socket.emit('chat message', encryptedMessage);    // Send the encrypted message

    // Clear the input field after sending
    document.getElementById('input').value = '';
  }
}

// Function to display system messages (like "User joined the chat")
function showSystemMessage(message) {
  const li = document.createElement('li');
  li.textContent = message;
  li.style.fontStyle = 'italic'; // Italic style for system messages
  document.getElementById('messages').appendChild(li);
}
