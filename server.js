import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const app = express();
const server = createServer(app);
const io = new Server(server);
const allusers = {};

const __dirname = dirname(fileURLToPath(import.meta.url));

// Exposing public library to use in client-side
app.use(express.static("public"));

// Handle incoming HTTP requests
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, "app", "index.html"));
});

// Handle socket connections
io.on("connection", (socket) => {
    console.log(`Someone got connected to socket server: ${socket.id}`); 
    socket.on('join-user', (username) => {
        console.log(`${username} joined the socket connection`);
        allusers[username] = { username, id: socket.id };
        // Inform all users about the new user
        io.emit("joined", allusers);
    });

    socket.on("offer", ({ from, to, offer }) => {
        console.log({ from, to, offer });
        io.to(allusers[to].id).emit("offer", { from, to, offer });
    });

    socket.on("answer", ({ from, to, answer }) => {
        io.to(allusers[from].id).emit("answer", { from, to, answer });
    });

    socket.on("end-call", ({ from, to }) => {
        io.to(allusers[to].id).emit("end-call", { from, to });
    });

    socket.on("call-ended", caller => {
        const [from, to] = caller;
        io.to(allusers[from].id).emit("call-ended", caller);
        io.to(allusers[to].id).emit("call-ended", caller);
    });

    socket.on("icecandidate", candidate => {
        console.log({ candidate });
        // Broadcast to other peers
        socket.broadcast.emit("icecandidate", candidate);
    });
});

server.listen(9080, () => {
  console.log('Server is running on http://localhost:9080');
});