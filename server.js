const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto-js');

// Initialize app and HTTP server
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

// Middleware for security and body parsing
app.use(helmet()); // Secure headers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies

// Set up static file serving
app.use(express.static('public')); // Serve static files from "public" directory

// CSRF protection middleware (using cookies)
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection); // Enable CSRF protection

// Rate limiting middleware to prevent DoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// Set up secret keys for JWT and AES encryption
const jwtSecretKey = 'your_jwt_secret_key';
const aesSecretKey = 'my_super_secret_key_123!';

// In-memory "database" for users (replace with a real DB later)
let users = {};

// Serve CSRF token to client (e.g., for registration and login forms)
app.get('/get-csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// User registration route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users[username] = { password: hashedPassword };
  res.status(201).json({ message: 'User registered successfully!' });
});

// User login route (generates JWT token)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!users[username]) {
    return res.status(400).json({ message: 'Invalid username or password.' });
  }

  const validPassword = await bcrypt.compare(password, users[username].password);
  if (!validPassword) {
    return res.status(400).json({ message: 'Invalid username or password.' });
  }

  const token = jwt.sign({ username }, jwtSecretKey, { expiresIn: '1h' });
  res.status(200).json({ token });
});

// WebSocket authentication middleware (using JWT)
io.use((socket, next) => {
  const token = socket.handshake.query.token;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  jwt.verify(token, jwtSecretKey, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));

    socket.username = decoded.username; // Attach username to the socket session
    next();
  });
});

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log(`User ${socket.username} connected`);

  // Broadcast when a user joins
  io.emit('user joined', { username: socket.username });

  // Handle incoming messages (encrypted)
  socket.on('chat message', (encryptedMessage) => {
    const decryptedMessage = crypto.AES.decrypt(encryptedMessage, aesSecretKey).toString(crypto.enc.Utf8);
    console.log(`${socket.username} sent: ${decryptedMessage}`);

    // Broadcast the decrypted message with the username
    io.emit('chat message', {
      username: socket.username, // Include the username of the sender
      message: decryptedMessage   // Send the decrypted message
    });
  });

  // Handle disconnects
  socket.on('disconnect', () => {
    io.emit('user left', { username: socket.username });
    console.log(`User ${socket.username} disconnected`);
  });
});

// Fallback route to send the main index.html file for any unknown paths (catch-all route)
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Start HTTP server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
