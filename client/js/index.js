document.cookie = 'token=f899c755-a1f2-35cc-81d2-02d90db2816f';
let socket = io();
socket.on('connect', function() {
    socket.emit('login', {userToken: 'f899c755-a1f2-35cc-81d2-02d90db2816f'});
});
socket.on('message', (data) => {
    console.log(data);
    addMessage(data.content, data.time + ' • ' + data.author, data.isMine);
})
socket.on('redirect', (destination) => {
    window.location.href = destination;
});


addEventListener('submit', (event) => {
    event.preventDefault();
    const messageInput = document.getElementById('message-input')


    const msg = {
        content: messageInput.value,
    }
    if (msg !== '') {
        socket.emit('message', msg);
        messageInput.value = '';
    }
});


function addMessage(content, time, isMine){
    const messageFeed = document.getElementById('message-feed');
    const messageElement = document.createElement('p');

    messageElement.setAttribute('class', isMine ? 'message message-me' : 'message');

    const messageTime = document.createElement('p');
    messageTime.setAttribute('class', 'message-time');
    messageTime.innerText = time;

    const messageContent = document.createElement('p');
    messageContent.setAttribute('class', 'message-content');
    messageContent.innerText = content;

    messageElement.appendChild(messageTime);
    messageElement.appendChild(messageContent);

    messageFeed.appendChild(messageElement);
    messageFeed.scrollTo(0, messageFeed.scrollHeight);
}