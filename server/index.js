import { networkInterfaces } from 'os';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Constante pour les serveurs
const port = 3002;
const address = networkInterfaces()['wlo1'][0].address;

// Création des serveurs
const serverExpress = express();
const serverHTTP = createServer(serverExpress);
const serverSocket = new SocketIOServer(serverHTTP);

serverExpress.use(express.static("../client/"));

// Web Socket:
serverSocket.on('connection', (socket) => {
    console.log("Nouvelle connexion: " + socket.conn.remoteAddress);
});

serverHTTP.listen(port, () => {
    console.log(`Écoute en cours sur: ${address}:${port}`);
});