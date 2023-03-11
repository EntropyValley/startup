const createMessage = (username, datetime, message, options={anonymous:false, currentUser:false}) => {
    const messageElement = document.createElement('div');
    
    const messageInfo = document.createElement('div');
    messageInfo.textContent = `${username}: ${datetime}`;
    $(messageInfo).addClass('messageInfo').appendTo($(messageElement));
    
    const messageContent = document.createElement('div');
    messageContent.textContent = message;
    $(messageContent).addClass('messageContent').appendTo($(messageElement));

   $(messageElement).addClass('messageInstance').appendTo($('#chat'));

   if (options.anonymous) {
    $(messageElement).addClass('anonymousMessage');
   }

   if (options.currentUser) {
    $(messageElement).addClass('currentUserMessage');
   }   

   return messageElement;
}


// Write current messages from localStorage
let currentMessages  = localStorage.getItem('messages');

if (currentMessages) {
    for (const chat of currentMessages) {
        createMessage(chat.username, chat.datetime, chat.message);
    }
}