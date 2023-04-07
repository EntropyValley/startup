const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

// MongoDB Credentials
const userName = process.env.MONGOUSER;
const password = process.env.MONGOPASSWORD;
const hostname = process.env.MONGOHOSTNAME;

if (!userName) {
    throw Error('Database not configured. Set Environment Variables');
}

// Connect to MongoDB
const url = `mongodb+srv://${userName}:${password}@${hostname}`;
const client = new MongoClient(url);

// Database Collections
const userCollection = client.db('startup').collection('user');
const messageCollection = client.db('startup').collection('user');

// Get a user from the database based on username
function getUser(username) {
    return userCollection.findOne({ username: username });
}

// Get a user from the database based on session token
function getUserBySession(session) {
    return userCollection.findOne({ session: session });
}

// Create a user and assign a session token
async function createUser(username, password) {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
        username: username,
        password: passwordHash,
        session: uuid.v4(),
    };
    await userCollection.insertOne(user);

    return user;
}

// Store a message in the database and generate a client-safe representation
async function createMessage(username, anonymous, content, epoch) {
    const message = { username: username, anonymous: anonymous, content: content, datetime: epoch };
    await messageCollection.insertOne(message);

    // Anonymize data sent to client
    if (!anonymous) {
        return message
    } else {
        return { username: null, anonymous: true, content: content, datetime: epoch };
    }
}

// Get the latest `num` messages from the database
function getMessages(num = 15) {
    const query = {}
    const options = {
        sort: { datetime: -1 },
        limit: num
    }
    const cursor = messageCollection.find(query, options);
    return cursor.toArray();
}

module.exports = {
    getUser,
    getUserBySession,
    createUser,
    createMessage,
    getMessages
}