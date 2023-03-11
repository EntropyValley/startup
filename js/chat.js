const createMessage = (username, datetime, message) => {
    const messageElement = document.createElement('div');
    
    const messageInfo = document.createElement('div');
    messageInfo.textContent = `${username}: ${datetime}`;
    $(messageInfo).appendTo($(message));
    
    const messageContent = document.createElement('div');
    messageContent.textContent = message;
    $(messageContent).appendTo($(message));

   $(messageElement).appendTo($('#chat'));

}


// Write current messages from localStorage
let currentMessages  = localStorage.getItem('messages');

if (currentMessages) {
    for (const chat of currentMessages) {
        createMessage(chat.username, chat.datetime, chat.message);
    }
}