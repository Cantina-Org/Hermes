import {existsSync, readFileSync, writeFileSync} from "fs";

export function savePrivateMessage(data){
    let privateMessages;

    if (existsSync(`./messages/private-messages/${data.author}|${data.receiver}.json`)){
        privateMessages = JSON.parse(readFileSync(`./messages/private-messages/${data.author}|${data.receiver}.json`));
        privateMessages.push(data)
        writeFileSync(`./messages/private-messages/${data.author}|${data.receiver}.json`, privateMessages);
    } else if (existsSync(`./messages/private-messages/${data.receiver}|${data.author}.json`)){
        privateMessages = JSON.parse(readFileSync(`./messages/private-messages/${data.receiver}|${data.author}.json`));
        privateMessages.push(data)
        writeFileSync(`./messages/private-messages/${data.receiver}|${data.author}.json`, privateMessages);
    } else {
        privateMessages.push(data)
        writeFileSync(`./messages/private-messages/${data.author}|${data.receiver}.json`, privateMessages);
    }
}
