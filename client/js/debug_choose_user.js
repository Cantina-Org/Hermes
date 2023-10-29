let socket = io();

socket.emit('debug-select-user');

socket.on('debug-select-user-final', (data) => {
    const sel = document.getElementById("select_user");
    for (let element of data) {
        const opt = document.createElement("option");
        opt.value = element.user_name;
        opt.text = element.user_name;
        sel.add(opt, null);
    }
});

socket.on('debug-choose-user-final', (data) => {
    console.log(data)
   if (data){
        document.cookie = `token=${data.token}`;
   }
});

addEventListener('submit', (data) => {
    data.preventDefault();

    const sel = document.getElementById("select_user");

    socket.emit('debug-choose-user', sel.value);
});
