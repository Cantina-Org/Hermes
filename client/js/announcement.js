let socket = io();

function getCookie(name){
    const pattern = RegExp(name + "=.[^;]*");
    const matched = document.cookie.match(pattern);
    if(matched){
        const cookie = matched[0].split('=');
        return cookie[1];
    }
    return false;
}

socket.on('connect', function() {
    if (!getCookie('token')){
        socket.emit('get-cerbere-fqdn');
    } else {
        socket.emit('login', {userToken: getCookie('token'), privateMessage: false, announcement: true});
    }

});

socket.on('announcement-receive-first', (data) => {
    for (let element of data) {
        addMessage(element.content, element.time + ' • ' + element.author, element.token);
    }
});

socket.on('announcement-receive-new', (data) => {
    addMessage(data.content, data.time + ' • ' + data.author, data.token);
});

socket.on('login-error', (data) => {
    if (data.code === 404 && data.name === 'User Not Found'){
        window.location.replace(`https://${data.cerbere_fqdn}/auth/hermes`);
    } else if (data.code === 401 && data.name === 'Unauthorized: User Not Logged') {
        window.location.replace(`https://${data.cerbere_fqdn}/auth/hermes`);
    }
});

socket.emit('is-user-admin', {
    token: getCookie('token')
});

socket.on('is-user-admin-response', (data) => {
    if (data.isAdmin) {
        document.getElementById('message-form').hidden = false;
    }
});

socket.on('send-cerbere-fqdn', (data) => {
    window.location.replace(`https://${data.fqdn}/auth/hermes`);
});


addEventListener('submit', (event) => {
    event.preventDefault();
    const messageInput = document.getElementById('message-input');


    const data = {
        content: messageInput.value,
    }
    socket.emit('announcement-send', data);
    messageInput.value = '';
});


function addMessage(content, time, token){
    const messageFeed = document.getElementById('message-feed');
    const messageElement = document.createElement('p');

    const messageTime = document.createElement('a');
    messageTime.setAttribute('class', 'message-time');
    messageTime.innerText = time;
    messageTime.href = '/private/?receiver='+token;

    const messageContent = document.createElement('p');
    messageContent.setAttribute('class', 'message-content');
    messageContent.innerText = content;

    messageElement.appendChild(messageTime);
    messageElement.appendChild(messageContent);

    messageFeed.appendChild(messageElement);
    messageFeed.scrollTo(0, messageFeed.scrollHeight);
}