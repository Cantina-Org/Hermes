import { writeFileSync } from "fs";

export async function broadcastAnnouncement(message, time, author, token){
    saveAnnouncement({content: message, time: time, author: author, token: token})
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

function saveAnnouncement(data) {
    writeFileSync('./messages/annoucement.json', JSON.stringify(data))
}