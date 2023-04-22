const { AceBase } = require('acebase');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

const db = new AceBase('database');

// Database Collections
const userPath = 'users';
const messagePath = 'messages';

// Get a user from the database based on username
async function getUser(username) {
    return (await db.query(userPath)
        .filter('username', '==', username)
        .take(1)
        .get())
        .getValues()[0];
}

// Get a user from the database based on session token
async function getUserBySession(session) {
    return (await db.query(userPath)
        .filter('session', '==', session)
        .take(1)
        .get())
        .getValues()[0];
}

// Create a user and assign a session token
async function createUser(username, password) {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
        username: username,
        password: passwordHash,
        session: uuid.v4(),
    };

    console.log(user)

    db.ref(userPath).push(user);

    return user;
}

// Store a message in the database and generate a client-safe representation
async function createMessage(username, anonymous = false, content, epoch) {
    const message = { username: username, anonymous: anonymous, content: content, datetime: epoch };
    const anonymousMessage = { username: 'Anonymous', anonymous: anonymous, content: content, datetime: epoch };
    
    db.ref(messagePath).push(message);
    
    return [message, anonymousMessage]
}

// Get the latest `num` messages from the database
async function getMessages(num = 15, opts = { before: Infinity, after: 0 }) {
    return (await db.query(messagePath)
        .filter('datetime', '>', opts.after)
        .filter('datetime', '<', opts.before)
        .sort('datetime', false)
        .take(num)
        .get())
        .getValues();
}

module.exports = {
    getUser,
    getUserBySession,
    createUser,
    createMessage,
    getMessages
}