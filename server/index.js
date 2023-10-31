let debug = false;

import { networkInterfaces } from 'os';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { resolve } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import express from 'express';
import confirm from '@inquirer/confirm'
import { queryDatabase } from './Utils/database.js';
import { savePrivateMessage, showPrivateMessage } from './Utils/privateMessage.js';
import { broadcast, savePublicMessages, sendMessage } from "./Utils/publicMessage.js";
import { broadcastAnnouncement } from "./Utils/announcement.js";
import { prettyTime } from "./Utils/prettyTime.js";


// Verification mode débug
if (debug) {
    console.log('Attention: le mode debug est activé. Ce qui veux dire qu\'un utilisateur peux se connecter à tout les comptes sans mot de passe!');
    const answer = await confirm({ message: 'Voulez vous continuer en mode debug ?' });

    if (answer) {
        console.log('Mode Débug Activé! Faites attention!')
    } else if (!answer){
        console.log('Désactivation du mode Débug...')
        debug = false
        console.log('Mode Débug désactivé!')
    }
}


if (!existsSync('./messages/general.json')){
    writeFileSync('./messages/general.json', '[]');
}


// Constante pour les serveurs
const port = 3003; // Port à prendre dans le fichier config.json
const address = networkInterfaces()['wlo1'][0].address;
const userLogged = [];
const globalMessages = JSON.parse(readFileSync('./messages/general.json'));
let id = 0;

// Création des serveurs
const serverExpress = express();
const serverHTTP = createServer(serverExpress);
const serverSocket = new SocketIOServer(serverHTTP);

serverExpress.use(express.urlencoded({ extended: true }));

// Web Socket:
serverSocket.on('connection', (socket) => {
    console.log("Nouvelle connexion: " + socket.conn.remoteAddress);
    let logged = false;
    let token = null;
    let userName = null;

    socket.on('login', (data) => {
        queryDatabase(`SELECT user_name FROM cantina_administration.user WHERE token='${data.userToken}'`, (results) => {
            if (results.length === 0) {
                queryDatabase(`SELECT fqdn FROM cantina_administration.domain WHERE name='cerbere'`, (results) => {
                    socket.emit('login-error', data={
                        name: "Unauthorized: User Not Logged",
                        code: 401,
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
                if (data.privateMessage){
                    queryDatabase(`SELECT user_name, token FROM cantina_administration.user`, (results) => {
                        socket.emit('user-list', {userList: results});
                    });
                } else {
                    globalMessages.forEach((msg) => {
                        sendMessage(socket, msg.content, msg.time, msg.author, null, token);
                    });
                }
            }
        });
    });

    socket.on('message', (data) => {
        if (!logged) {
            queryDatabase(`SELECT fqdn FROM cantina_administration.domain WHERE name='cerbere'`, () => {
                socket.emit('redirect', '/login');
                console.log('User not logged in');
            });
        } else {
            globalMessages.push({content: data.content, time: prettyTime(Date.now()), author: userName.user_name, token: token});
            void broadcast(data.content, prettyTime(Date.now()), userName.user_name, token);
            savePublicMessages(globalMessages);
        }
    });

    socket.on('private-messages-get', (data) => {
        let privateMessages = showPrivateMessage({author: data.user_1, receiver: data.user_2});
        privateMessages.forEach((msg) => {
            for (let users of userLogged) {
                if (users.token === data.user_1) {
                    queryDatabase(`SELECT user_name FROM cantina_administration.user WHERE token='${msg.author}'`, (results) => {
                        msg.author_name =  results[0].user_name;
                        msg.time = prettyTime(msg.time);
                        users.sock.emit('message-private-receive', msg);
                    });
                }
            }
        });
    });

    socket.on('message-private', (data) => {
        queryDatabase(`SELECT user_name FROM cantina_administration.user WHERE token='${data.author}'`, (results) => {
            data.author_name =  results[0].user_name;
            data.time = prettyTime(Date.now())

            savePrivateMessage({author: data.author, receiver: data.receiver, content: data.content, time: data.time})
            for(let user of userLogged) {
                if (user.token === data.receiver || user.token === data.author) {
                    user.sock.emit('message-private-receive', data);
                }
            }
        });
    });

    socket.on('announcement-send', (data) => {
        queryDatabase(`SELECT admin, user_name FROM cantina_administration.user WHERE token="${data.author}"`, (results) => {
            if (results[0].admin) {
                void broadcastAnnouncement(data.content, Date.now(), results[0].user_name, data.token);
            }
        });
    });

    socket.on('is-user-admin', (data) => {
        queryDatabase(`SELECT admin FROM cantina_administration.user WHERE token="${data.token}"`, (results) => {
            socket.emit('is-user-admin-response', {isAdmin: !!results[0].admin});
        });
    });

    socket.on('debug-select-user', () => {
        if (debug){
            queryDatabase(`SELECT user_name FROM cantina_administration.user`, (results) => {
                socket.emit('debug-select-user-final', results);
            });
        }
    });

    socket.on('debug-choose-user', (data) => {
        if (data){
            queryDatabase(`SELECT token FROM cantina_administration.user WHERE user_name="${data}"`, (results) => {
                socket.emit('debug-choose-user-final', results[0]);
            });
        }
    });
});

serverHTTP.listen(port, () => {
    console.log(`Écoute en cours sur: ${address}:${port}`);
});
serverExpress.get('/', (request, response) => {
    response.sendFile(resolve('../client/index.html'));
});

serverExpress.get('/private/', (request, response) => {
    response.sendFile(resolve('../client/private-message.html'));
});

serverExpress.get('/announcement/', (request, response) => {
    response.sendFile(resolve('../client/announcement.html'));
});

serverExpress.get('/js/:fileName', (request, response) => {
    response.sendFile(resolve('../client/js/' + request.params.fileName));
});

serverExpress.get('/css/:fileName', (request, response) => {
    response.sendFile(resolve('../client/css/' + request.params.fileName));
});

serverExpress.get('/favicon.ico', (request, response) => {
    response.sendFile(resolve('../client/favicon.ico'));
});

serverExpress.get('/login', (request, response) => {
    queryDatabase("SELECT fqdn FROM cantina_administration.domain WHERE name='cerbere'", (results) => {
        response.redirect(`https://${results[0].fqdn}/auth/hermes`)
    });
});

if (debug) {
    serverExpress.get('/debug/choose_user', (request, response) => {
        response.sendFile(resolve('../client/debug/choose_user.html'))
    });
}


setInterval(() => {
    for (let i = 0; userLogged.length-1>i; i++) {
        if (!userLogged[i].sock.connected) {
            userLogged.splice(i, 1);
        }
    }
}, 60000);