const uuid = require('uuid');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const express = require('express');
const expressWs = require(`@wll8/express-ws`)
const { app, wsRoute } = expressWs(express())

// Load Database Hooks
const DB = require('./database.js')

// Default to port 4000 if not given on command line
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// Middleware
app.use(express.json()); // JSON Body Parsing
app.use(cookieParser()); // Cookie Parsing
app.use(express.static('public')); // Static Files

// API Endpoints
var apiRouter = express.Router();
app.use('/api', apiRouter);

// Create Session token and account entry for new user
apiRouter.post('/auth/create', async (req, res) => {
    if (await DB.getUser(req.body.username)) {
        res.status(409).send({ msg: 'Existing user' });
    } else {
        const user = await DB.createUser(req.body.username, req.body.password);

        setAuthCookie(res, user.session); // Set Auth Cookie

        res.send({ id: user._id });
    }
});

// Get session token for the provided credentials
apiRouter.post('/auth/login', async (req, res) => {
    const user = await DB.getUser(req.body.username);
    if (user) {
        if (await bcrypt.compare(req.body.password, user.password)) {
            setAuthCookie(res, user.session);
            res.send({ id: user._id });
            return;
        }
    }
    res.status(401).send({ msg: 'Incorrect Credentials' });
});

// Logout; Remove session token if stored in cookie
apiRouter.delete('/auth/logout', (_req, res) => {
    res.clearCookie('session');
    res.status(204).end();
});

// Get Authentication state for a given user
apiRouter.get('/user/:username', async (req, res) => {
    const user = await DB.getUser(req.params.username);
    if (user) {
        const sessionToken = req?.cookies.session;
        res.send({ username: user.username, authenticated: sessionToken === user.session });
        return;
    }
    res.status(404).send({ msg: 'Unknown' });
});

// Secure Routing for authenticated endpoints
var secureRouter = express.Router();
apiRouter.use(secureRouter);

secureRouter.use(async (req, res, next) => {
    const session = req.cookies['session'];
    const user = await DB.getUserBySession(session);
    if (user) {
        next();
    } else {
        res.status(401).send({ msg: 'Unauthorized' });
    }
});

// Websocket connections
let ws_connections = []

// Keep connections alive until they do not respond to ping attempts
setInterval(() => {
    ws_connections.forEach((connection) => {
        if (!connection.alive) {
            connection.ws.terminate();
        } else {
            connection.alive = false;
            connection.ws.ping();
        }
    })
}, 10000);

// Websocket Endpoints
app.ws('/ws', async (ws, req) => {
    // Handle Authentication - manually parse cookies
    const cookies = req.headers.cookie.split('; ').reduce((prev, current) => {
        const [name, ...value] = current.split('=');
        prev[name] = value.join('=');
        return prev;
    }, {});
    const session = cookies['session'];
    const user = await DB.getUserBySession(session);

    const connection = { id: uuid.v4(), alive: true, ws: ws, user: user };
    ws_connections.push(connection);

    // Log pong messages
    ws.on('pong', () => {
        connection.alive = true;
    });

    // Remove closed connections
    ws.on('close', () => {
        ws_connections.findIndex((obj, index) => {
            if (obj.id === connection.id) {
                ws_connections.splice(index, 1);
                return true;
            }
        });
    });

    // Kill connections that are not authenticated
    if (!user) {
        ws.send(JSON.stringify({ type: 'error', msg: 'Not Authenticated' }));
        connection.terminate();
    }

    // Handle Messages from clients
    ws.on('message', async (data) => {
        message = JSON.parse(data);

        if (!message?.type) {
            console.log(`Recieved invalid Websocket Request: ${data}`);
            return
        }

        switch (message.type) {
            case 'message_new':
                const messageTypes = await DB.createMessage(user.username, message.anonymous, message.content, Date.now())
                const clientMessage = messageTypes[0];
                const anonymousMessage = messageTypes[1];

                // Package JSON so that it only needs to be stringified once and not for each active client
                const anonymizedPackage = JSON.stringify(
                    {
                        type: 'message',
                        messages: [
                            message.anonymous ? anonymousMessage : clientMessage
                        ]
                    }
                );

                const userPackage = JSON.stringify(
                    {
                        type: 'message',
                        messages: [
                            clientMessage
                        ]
                    }
                )

                // Send message to live peers
                ws_connections.forEach((peer) => {
                    if (peer === connection) {
                        peer.ws.send(userPackage);
                    } else if (message.anonymous) {
                        peer.ws.send(anonymizedPackage)
                    } else {
                        peer.ws.send(userPackage);
                    }
                });

                break;
            case 'message_request':
                const messages = JSON.parse(JSON.stringify(await DB.getMessages(message?.num)));

                for (const requestedMessage of messages) {
                    if (requestedMessage.anonymous == true && requestedMessage.username !== user.username) {
                        requestedMessage.username = 'Anonymous';
                    }
                }

                connection.ws.send(JSON.stringify(
                    {
                        type: 'message',
                        messages: messages.reverse()
                    }
                ));
                break;
            default:
                console.log(`Invalid Websocket Message Type: ${message.type}`);
                return;
        }
    });
});

// Default Error Handler
app.use(function (err, req, res, next) {
    res.status(500).send({ type: err.name, message: err.message });
});

// Default to homepage if route DNE
app.use((_req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

// setAuthCookie in the HTTP response
function setAuthCookie(res, sessionToken) {
    res.cookie('session', sessionToken, {
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
    });
}

// Start HTTP Service
const service = app.listen(port, () => {
    console.log(`Listening on Port ${port}`);
});