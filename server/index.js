import { networkInterfaces } from 'os';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createConnection} from 'mysql';
import { resolve } from 'path';
import {existsSync, readFileSync, writeFileSync} from 'fs';
import express from 'express';
import nunjucks from "nunjucks";


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
                }
            });
        });
    });
}

function prettyTime() {
    const time = new Date();

    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    const day = time.getDay().toString().padStart(2, '0');
    const month = time.getMonth().toString().padStart(2, '0');
    const year = time.getFullYear().toString().padStart(2, '0');

    return day+'/'+month+'/'+year+' '+hours+':'+minutes+':'+seconds
}

function sendMessage(socket, message, time, author, sendTo) {
    let data  = {
        content: message,
        time: time,
        author: author,
        isMine: sendTo === author
    }
    socket.emit('message', data);
}

async function broadcast(message, time, author) {
    for (let element of userLogged){
        sendMessage(element.sock, message, time, author, element.userName);
    }
}

function savePublicMessages() {
    writeFileSync('./messages/general.json', JSON.stringify(messages));
}

if (!existsSync('./messages/general.json')){
    writeFileSync('./messages/general.json', '[]');
}


// Constante pour les serveurs
const port = 3002;
const address = networkInterfaces()['lo'][0].address;
const userLogged = [];
const messages = JSON.parse(readFileSync('./messages/general.json'))
let id = 0;

// Création des serveurs
const serverExpress = express();
const serverHTTP = createServer(serverExpress);
const serverSocket = new SocketIOServer(serverHTTP);

// Pour faire des HTML avec des data
nunjucks.configure('views', {
    autoescape: true,
    express: serverExpress
});

// serverExpress.use(express.static("../client/"));
serverExpress.use(express.urlencoded({ extended: true }));

// Web Socket:
serverSocket.on('connection', (socket) => {
    console.log("Nouvelle connexion: " + socket.conn.remoteAddress);
    messages.forEach((msg) => {
        sendMessage(socket, msg.content, msg.time, msg.author);
    })
    let logged = false;
    let token = null;
    let userName = null;
    socket.on('message', (data) => {
        if (!logged) {
            queryDatabase(`SELECT fqdn FROM cantina_administration.domain WHERE name='cerbere'`, (results) => {
                console.log(results)
                socket.emit('redirect', '/login');
                console.log('User not logged in');
            });
        } else {
            messages.push({content: data.content, time: prettyTime(), author: userName.user_name})
            broadcast(data.content, prettyTime(), userName.user_name);
            savePublicMessages();
        }
    });
    socket.on('private-message', (data) => {
       console.log(data);
    });
    socket.on('login', (data) => {
       queryDatabase(`SELECT user_name FROM cantina_administration.user WHERE token='${data.userToken}'`, (results) => {
           if (results.length === 0) {
               queryDatabase(`SELECT fqdn FROM cantina_administration.domain WHERE name='cerbere'`, (results) => {
                   socket.emit('login-error', data={
                       name: "User Not Found",
                       code: 404,
                       cerbere_fqdn: results[0].fqdn
                   });
               });
           }
           else {
               logged = true;
               token = data.userToken;
               userName = results[0];
               id++;
               userLogged.push({
                   id: id,
                   sock: socket,
                   token: data.userToken,
                   userName: results[0],
               });
           }
       });
        console.log(data)
    });
});

serverHTTP.listen(port, () => {
    console.log(`Écoute en cours sur: ${address}:${port}`);
});
serverExpress.get('/', (request, response) => {
    response.sendFile(resolve('../client/index.html'));
});

serverExpress.get('/private/', (request, response) => {
    queryDatabase(`SELECT user_name, token FROM cantina_administration.user`, (results) => {
        console.log(results)
        response.sendFile(resolve('../client/list-private-message.html'), {results});
    });
});

serverExpress.get('/private/:token', (request, response) => {
    if (!request.params.token){
        response.redirect('/private');
    } else {
        response.sendFile(resolve('../client/private-message.html'));
    }
});

serverExpress.get('/js/:fileName', (request, response) => {
    response.sendFile(resolve('../client/js/' + request.params.fileName));
});

serverExpress.get('/css/:fileName', (request, response) => {
    response.sendFile(resolve('../client/css/' + request.params.fileName));
});
