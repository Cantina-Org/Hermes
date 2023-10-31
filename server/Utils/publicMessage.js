import { writeFileSync } from "fs";

export function sendMessage(socket, message, time, author, sendTo, token) {
    let data  = {
        content: message,
        time: time,
        author: author,
        isMine: sendTo === author,
        token: token
    };
    socket.emit('message', data);
}


export async function broadcast(message, time, author, token) {
    for (let element of userLogged){
        sendMessage(element.sock, message, time, author, element.userName, token);
    }
}

export function savePublicMessages(messagesToSave) {
    writeFileSync('./messages/general.json', JSON.stringify(messagesToSave));
}
