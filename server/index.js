import { networkInterfaces } from 'os';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createConnection} from "mysql";

function queryDatabase(query, callback) {
    const connection = createConnection({
        host: 'localhost',
        user: 'cantina',
        password: 'LeMdPDeTest',
        database: 'cantina_administration'
    });
    connection.connect((err) => {
        if (err) {
            console.error('Erreur de connexion à la base de données:', err);
            return;
        }
        console.log('Connexion à la base de données réussie!');
        connection.query(query, (error, results) => {
            if (error) {
                console.error('Erreur lors de l\'exécution de la requête:', error);
                return;
            }
            let finalResults = JSON.parse(JSON.stringify(results))
            callback(finalResults);
            connection.end((err) => {
                if (err) {
                    console.error('Erreur lors de la fermeture de la connexion à la base de données:', err);
                    return;
                }
                console.log('Connexion à la base de données fermée!');
            });
        });
    });
}

function prettyTime() {
    const time = new Date();

    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');

    return hours+':'+minutes+':'+seconds
}

function sendMessage(socket, message, time, author) {
    let data = {
        content: message,
        time: time,
        author: author,
        isMine: socket.token === author
    };
    socket.emit('message', data)
}

async function broadcast(message, time, author) {
    const sockets = await serverSocket.of('/').sockets;
    for (let sock of sockets){
        sendMessage(sock, message, time, author);
    }
}

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
    socket.logged = false;
    socket.token = null;
    socket.on('message', (data) => {
        if (!socket.logged) {
            socket.emit('redirect', '/login');
            console.log('User not logged in');
        } else {
            broadcast(data.content, prettyTime(), socket.token);
        }
        console.log(data);
    });
    socket.on('login', (data) => {
       queryDatabase(`SELECT user_name FROM cantina_administration.user WHERE token='${data.userToken}'`, (results) => {
           if (results.length === 0) {
               socket.emit('error', data={
                   name: "User Not Found",
                   code: 404
               });
           }
           else {
               socket.logged = true;
               socket.token = data.userToken;
           }
       });
        console.log(data)
    });
});

serverHTTP.listen(port, () => {
    console.log(`Écoute en cours sur: ${address}:${port}`);
});