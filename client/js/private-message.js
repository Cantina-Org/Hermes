let socket = io();

function getCookie(name){
   const pattern = RegExp(name + "=.[^;]*");
   const matched = document.cookie.match(pattern);
   if(matched){
       const cookie = matched[0].split('=');
       return cookie[1]
   }
   return false
}


socket.on('connect', () => {
   socket.emit('login', {userToken: getCookie('token'), privateMessage: true});
});

socket.on('user-list', (data) => {
   console.log(typeof data);
   console.log(data)
   for (const i of data.userList){
      console.log('userToken: ' + i.token);
      console.log('userName: ' + i.user_name);
   }
});