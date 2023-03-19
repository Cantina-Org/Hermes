document.cookie = 'token=f899c755-a1f2-35cc-81d2-02d90db2816f';
let socket = io();
socket.on('connect', function() {
    socket.emit('login', {userToken: 'f899c755-a1f2-35cc-81d2-02d90db2816f'});
});
socket.on('message', (data) => {
    console.log(data);
})
socket.on('redirect', (destination) => {
    window.location.href = destination;
});