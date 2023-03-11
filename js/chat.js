const createMessage = (username, datetime, message, options={anonymous:false, currentUser:false}) => {
    const messageElement = document.createElement('div');

    if (options.anonymous) {
        username = 'Anonymous'
        $(messageElement).addClass('anonymousMessage');
    }

    if (options.currentUser) {
        $(messageElement).addClass('currentUserMessage');
    }   
    
    const messageInfo = document.createElement('div');
    messageInfo.textContent = `${username}: ${datetime}`;
    $(messageInfo).addClass('messageInfo').appendTo($(messageElement));
    
    const messageContent = document.createElement('div');
    messageContent.textContent = message;
    $(messageContent).addClass('messageContent').appendTo($(messageElement));

    $(messageElement).addClass('messageInstance').appendTo($('#chat'));

    return messageElement;
}


// Write current messages from localStorage
let currentMessages  = localStorage.getItem('messages');
let currentUser = localStorage.getItem('username');

if (!currentMessages) {
    currentMessages = [
        {
            username: 'Johnny354',
            datetime: 'Thursday March 9th at 8:03',
            message: 'Hello everybody! how is it going today?'
        },
        {
            username: currentUser,
            datetime: 'Thursday March 9th at 9:13',
            message: 'I\'m doing pretty decently, how about you?'
        },
        {
            username: 'Johnny354',
            datetime: 'Thursday March 9th at 13:05',
            message: 'I\'m doing alright.  Just another day and another day\'s worth of work.  You know how it can be.'
        },
        {
            username: 'Johnny354',
            datetime: 'Thursday March 9th at 19:02',
            message: 'I\'m doing alright.  Wish I was doing better though.',
            anonymous: true
        },
        {
            username: currentUser,
            datetime: 'Thursday March 9th at 9:37',
            message: 'I definitely feel that.',
            anonymous: true
        }
    ]
}

for (const chat of currentMessages) {
    createMessage(chat.username, chat.datetime, chat.message, {anonymous: chat.anonymous, currentUser: chat.username == currentUser});
}

$('#send').click(() => {
    
});