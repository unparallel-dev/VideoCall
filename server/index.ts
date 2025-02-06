import express, { type Request, type Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { v4 as uuidV4 } from 'uuid';
import { Server } from 'socket.io';
import { ExpressPeerServer } from "peer";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173', // Replace with your frontend origin
        methods: ['GET', 'POST']
    }
});

const options={
    debug:true
} as Partial<any>

// Use the cors middleware
app.use(cors());
app.use('/', ExpressPeerServer(httpServer, options));
io.on("connection", (socket) => {
    socket.on("join-room", (roomid, userid) => {
        socket.join(roomid);
        (socket.to(roomid)).emit('user-connected', userid)
        console.log(userid)
    });
});

// Start the server
const port = 3000;
httpServer.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
