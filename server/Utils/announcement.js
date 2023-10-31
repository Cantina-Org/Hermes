import { writeFileSync } from "fs";

export function saveAnnouncement(data) {
    writeFileSync('./messages/annoucement.json', JSON.stringify(data))
}