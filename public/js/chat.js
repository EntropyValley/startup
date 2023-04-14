(async () => {
    let authenticated = false;
    const username = localStorage.getItem('username');

    if (username) {
        const user = await getUser(username);
        authenticated = user?.authenticated;
    }

    if (authenticated) {
        $('#navbar-logout').removeClass('hidden');
    } else {
        window.location.href = '/';
    }
})();

// Get a user from the server
async function getUser(username) {
    const response = await fetch(`/api/user/${username}`);

    if (response.status === 200) {
        return response.json();
    }

    return null; // No user
}

// Set up Websocket
let socket = null

const configureWebSocket = async () => {
    return new Promise((resolve, reject) => {
        if (!socket || socket?.readyState === WebSocket.CLOSED) {
            const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
            socket = new WebSocket(`${protocol}://${window.location.host}/ws`)

            socket.onclose = () => {
                console.log('Connection Closed. Reconnecting...');
            }

            socket.onopen = () => {
                console.log('Connection Established!');
                resolve(socket);
            }

            socket.onmessage = async (event) => {
                document.tempEvent = event;
                const message = JSON.parse(await event.data);

                if (!message?.type) { // Invalid message
                    return;
                }

                switch (message.type) {
                    case 'message':
                        for (messageObj of message.messages) {
                            createMessage(messageObj.username, epochMillisToFormattedDate(messageObj.datetime), messageObj.content, {
                                anonymous: messageObj.anonymous,
                                currentUser: messageObj.username === localStorage.getItem('username')
                            });
                        }
                        break;
                    default:
                        return;
                }
            }
        }
    });
}

// Logout on navbar button press
$('#navbar-logout').click(() => {
    fetch(`/api/auth/logout`, {
        method: 'delete',
    }).then(() => (window.location.href = '/'));
});

// Convert an epoch timestamp (in milliseconds) to a formatted date string
const epochMillisToFormattedDate = (datetime) => {
    const datetimeObj = new Date(datetime);
    return `${datetimeObj.getMonth() + 1}/${datetimeObj.getDate()}/${datetimeObj.getFullYear()} at ${String(datetimeObj.getHours()).padStart(2, '0')}:${String(datetimeObj.getMinutes()).padStart(2, '0')}`;
}

// Create a message element in the DOM
const createMessage = (username, datetime, message, options = { anonymous: false, currentUser: false }) => {
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

    // Scroll to new position
    window.scrollTo(0, document.body.scrollHeight);

    return messageElement;
}

// Add Message to Database
const addMessageToDatabase = (message, anonymous) => {
    const message_obj = {
        type: 'message_new',
        content: message,
        anonymous: anonymous
    };

    const package = JSON.stringify(message_obj)

    socket.send(package);
}

// Get information from Input and create message in DOM / Database
const createMessageFromInput = () => {
    const messageContent = $('#message').val().trim();
    const anonymous = $('#anonymous').hasClass('active');

    if (messageContent === '') {
        return
    }

    // Add message to database
    addMessageToDatabase(messageContent, anonymous);

    // Clear Message Box
    $('#message').val([]);
}

// Bind Send and Enter to "Send Message"
$('#send').click(createMessageFromInput);
$('#message').keypress((e) => {
    if (e.which == 13) {
        createMessageFromInput();
        return false;
    }
});

$(document).ready(async () => {
    // Start WebSocket Connection
    await configureWebSocket()

    // Check for closed connections on interval
    setInterval(configureWebSocket, 5000);

    // Scroll to bottom of page
    window.scrollTo(0, document.body.scrollHeight);

    setTimeout(() => {
        socket.send(JSON.stringify({ type: 'message_request', num: 50 }));
    }, 100)

});


