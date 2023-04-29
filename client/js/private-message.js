let socket = io();
let selection = null;

function addMessage(content, time, isMine, token){
   const messageFeed = document.getElementById('message-feed');
   const messageElement = document.createElement('p');

   messageElement.setAttribute('class', isMine ? 'message message-me' : 'message');

   const messageTime = document.createElement('a');
   messageTime.setAttribute('class', 'message-time');
   messageTime.innerText = time;
   console.log(token)
   messageTime.href = '/private/'+token

   const messageContent = document.createElement('p');
   messageContent.setAttribute('class', 'message-content');
   messageContent.innerText = content;

   messageElement.appendChild(messageTime);
   messageElement.appendChild(messageContent);

   messageFeed.appendChild(messageElement);
   messageFeed.scrollTo(0, messageFeed.scrollHeight);
}

function getCookie(name){
   const pattern = RegExp(name + "=.[^;]*");
   const matched = document.cookie.match(pattern);
   if(matched){
       const cookie = matched[0].split('=');
       return cookie[1]
   }
   return false
}

function addUserToList(
    id,
    name = 'NO NAME',
    onClick
) {
   const userList = document.querySelector('.user-list');

   const cellRow = document.createElement('li');
   cellRow.setAttribute('id', id);
   cellRow.setAttribute('class', 'cell-row');

   const cellRowText = document.createElement('div');
   cellRowText.setAttribute('class', 'cell-row-text');
   cellRow.appendChild(cellRowText);

   const cellName = document.createElement('p');
   cellName.setAttribute('class', 'cell-name');
   cellName.innerText = name;
   cellRowText.appendChild(cellName);

   userList.appendChild(cellRow);

   cellRow.addEventListener('click', () => {
      for (let c of userList.children) c.setAttribute('selected', false);
      cellRow.setAttribute('selected', true);
      onClick(cellRow.attributes.id.nodeValue);
   });
}

socket.on('connect', () => {
   socket.emit('login', {userToken: getCookie('token'), privateMessage: true});
});

socket.on('user-list', (data) => {
   const userList = document.querySelector('.user-list');
   userList.innerHTML = '';
   for (const i of data.userList){
      if (i.token === getCookie('token')) continue
      addUserToList(i.token, i.user_name, () => {
         socket.emit('private-messages-get', {sender: getCookie('token'), token: i.token});
         selection = i.token;
      });
   }
});

socket.on('private-messages-send', (data) => {
   console.log(data)
   addMessage(data.content, data.time + ' • ' + data.author, data.isMine, data.token);
});
