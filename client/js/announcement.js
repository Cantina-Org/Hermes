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

socket.emit('is-user-admin', {token: getCookie('token')});

socket.on('is-user-admin-response', (data) => {
    if (data.isAdmin) {
        document.getElementById('message-form').hidden = false;
    }
});
