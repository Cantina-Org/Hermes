import { writeFileSync } from "fs";

export async function broadcastAnnouncement(message, time, author, token, userLogged){
    for (let element of userLogged){
        sendAnnoucement(element.sock, message, time, author, element.userName, token)
    }
}

function sendAnnoucement(socket, message, time, author, sendTo, token) {
    let data  = {
        content: message,
        time: time,
        author: author,
        isMine: sendTo === author,
        token: token
    };
    socket.emit('announcement', data);
}

export function saveAnnouncement(messagesToSave) {
    writeFileSync('./messages/announcement.json', JSON.stringify(messagesToSave))
}