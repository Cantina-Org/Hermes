import {existsSync, readFileSync, writeFileSync} from "fs";

export function savePrivateMessage(data){
    let privateMessages;

    if (existsSync(`./messages/private-messages/${data.author}|${data.receiver}.json`)){
        privateMessages = JSON.parse(readFileSync(`./messages/private-messages/${data.author}|${data.receiver}.json`));
        privateMessages.push(data);
        writeFileSync(`./messages/private-messages/${data.author}|${data.receiver}.json`, JSON.stringify(privateMessages));
    } else if (existsSync(`./messages/private-messages/${data.receiver}|${data.author}.json`)){
        privateMessages = JSON.parse(readFileSync(`./messages/private-messages/${data.receiver}|${data.author}.json`));
        privateMessages.push(data);
        writeFileSync(`./messages/private-messages/${data.receiver}|${data.author}.json`, JSON.stringify(privateMessages));
    } else {
        let privateMessages = [];
        privateMessages.push(data);
        writeFileSync(`./messages/private-messages/${data.author}|${data.receiver}.json`, JSON.stringify(privateMessages));
    }
}


export function showPrivateMessage(data){
    let privateMessages;

    if (existsSync(`./messages/private-messages/${data.author}|${data.receiver}.json`)){
        privateMessages = JSON.parse(readFileSync(`./messages/private-messages/${data.author}|${data.receiver}.json`));
    } else if (existsSync(`./messages/private-messages/${data.receiver}|${data.author}.json`)){
        privateMessages = JSON.parse(readFileSync(`./messages/private-messages/${data.receiver}|${data.author}.json`));
    } else {
        writeFileSync(`./messages/private-messages/${data.author}|${data.receiver}.json`, '[]');
        privateMessages = JSON.parse(readFileSync(`./messages/private-messages/${data.author}|${data.receiver}.json`));
    }

    return privateMessages;
}