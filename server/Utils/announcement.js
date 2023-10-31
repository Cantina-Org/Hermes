import { writeFileSync } from "fs";

export function saveAnnouncement(data) {
    writeFileSync('./messages/annoucement.json', JSON.stringify(data))
}

export async function broadcastAnnouncement(data){
    console.log('diffusion du message..')
}