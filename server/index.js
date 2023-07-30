import { networkInterfaces } from 'os';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { resolve } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import express from 'express';
import { queryDatabase } from './Utils/database.js'


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

function sendMessage(socket, message, time, author, sendTo, token) {
    let data  = {
        content: message,
        time: time,
        author: author,
        isMine: sendTo === author,
        token: token
    }
    socket.emit('message', data);
}


async function broadcast(message, time, author, token) {
    for (let element of userLogged){
        sendMessage(element.sock, message, time, author, element.userName, token);
    }
}

function savePublicMessages() {
    writeFileSync('./messages/general.json', JSON.stringify(globalMessages));
}

if (!existsSync('./messages/general.json')){
    writeFileSync('./messages/general.json', '[]');
}


// Constante pour les serveurs
const port = 3002;
const address = networkInterfaces()['wlo1'][0].address;
const userLogged = [];
const globalMessages = JSON.parse(readFileSync('./messages/general.json'))
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
                        socket.emit('user-list', {userList: results})
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
            globalMessages.push({content: data.content, time: prettyTime(), author: userName.user_name, token: token})
            broadcast(data.content, prettyTime(), userName.user_name, token);
            savePublicMessages();
        }
    });

    socket.on('private-messages-get', (data) => {
        let privateMessages;
        let file1 = existsSync(`./messages/private-messages/${data.sender}|${data.token}.json`);
        let file2 = existsSync(`./messages/private-messages/${data.token}|${data.sender}.json`);
        if (file1){
            privateMessages = JSON.parse(readFileSync(`./messages/private-messages/${data.sender}|${data.token}.json`));
        } else if (file2){
            privateMessages = JSON.parse(readFileSync(`./messages/private-messages/${data.token}|${data.sender}.json`));
        } else {
           writeFileSync(`./messages/private-messages/${data.sender}|${data.token}.json`, '[]');
           privateMessages = JSON.parse(readFileSync(`./messages/private-messages/${data.sender}|${data.token}.json`));
        }
        privateMessages.forEach((msg) => {
            let receiver;
            for (let users of userLogged) {
                if (users.sock.connected && users.token === data.sender) {
                    receiver = users;
                    break;
                }
            }
        });
    });

    socket.on('message-private', (data) => {
        for(let user of userLogged) {
            if (user.token === data.receiver || user.token === data.author) {
                user.sock.emit('message-private-receive', data)
            }
        }
    });
});

serverHTTP.listen(port, () => {
    console.log(`Écoute en cours sur: ${address}:${port}`);
});
serverExpress.get('/', (request, response) => {
    response.sendFile(resolve('../client/index.html'));
});

serverExpress.get('/private/:userid'                                       , (request, response) => {
    response.sendFile(resolve('../client/private-message.html'));
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

setInterval(() => {
    for (let i = 0; userLogged.length-1>i; i++) {
        if (!userLogged[i].sock.connected) {
            userLogged.splice(i, 1);
        }
    }
}, 60000);