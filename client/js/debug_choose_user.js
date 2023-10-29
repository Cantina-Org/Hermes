let socket = io();

socket.emit('debug_choose_user');

socket.on('message-private-debug_select_user_final', (data) => {
    const sel = document.getElementById("select_user");
    for (let element of data) {
        console.log(element)
        const opt = document.createElement("option");
        opt.value = element.user_name;
        opt.text = element.user_name;
        sel.add(opt, null)
    }
});
