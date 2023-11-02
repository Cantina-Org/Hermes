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
        socket.emit('login', {userToken: getCookie('token'), privateMessage: false});
    }

});

socket.on('announcement-receive', (data) => {

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