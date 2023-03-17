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
            console.log('Résultats de la requête:', finalResults);
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
    let logged = false;
    socket.on('message', (data) => {
        console.log(logged)
        if (!logged) {
            socket.emit('redirect', '/login');
            console.log('User not logged in');
        }
        console.log(data);
    });
    socket.on('login', (data) => {
       queryDatabase(`SELECT user_name FROM cantina_administration.user WHERE token='${data.userToken}'`, (results) => {
           console.log('Not Raw Data: ' + results)
       })
        console.log(data)
    });
});

serverHTTP.listen(port, () => {
    console.log(`Écoute en cours sur: ${address}:${port}`);
});