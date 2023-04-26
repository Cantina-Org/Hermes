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

function addUserToList(
    id,
    name = 'NO NAME',
    color = '#000',
    onClick
) {
   const userList = document.querySelector('.user-list');

   const cellRow = document.createElement('li');
   cellRow.setAttribute('id', id);
   cellRow.setAttribute('class', 'cell-row');

   const cellImage = document.createElement('div');
   cellImage.setAttribute('class', 'cell-image');
   cellImage.setAttribute('style', `background-color: ${color}`);
   cellRow.appendChild(cellImage);

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
   console.log(typeof data);
   console.log(data)
   for (const i of data.userList){
      console.log('userToken: ' + i.token);
      console.log('userName: ' + i.user_name);
      if (i.token === getCookie('token')) continue
      addUserToList(i.token, i.user_name, '#da04f1', () => {console.log(i.token)});
   }
});