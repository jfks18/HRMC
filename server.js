// Minimal socket server that attaches socket-integration.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { attachSocket } = require('./socket-integration');

const app = express();
app.use(express.json());

// Example health route
app.get('/health', (req, res) => res.json({ ok: true }));

// If you have a DB pool module, require and pass it here. For now it's optional.
let db = null;
try {
  // attempt to require an existing db/pool module if present
  db = require('./db').pool;
} catch (e) {
  // no DB available; chat will work but without persistence
  console.warn('No DB pool found, chat message persistence disabled.');
}

const server = http.createServer(app);

// attach socket.io and return the io instance
const { io } = attachSocket({ app, server, db });

const PORT = process.env.SOCKET_PORT || process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket server listening on port ${PORT}`);
});

module.exports = { app, server, io };
