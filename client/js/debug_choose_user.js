let socket = io();

socket.emit('debug_choose_user');

socket.on('message-private-debug_choose_user_final', (data) => {
    console.log(data)
});
