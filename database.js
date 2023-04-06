const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

// MongoDB Credentials
const userName = process.env.MONGOUSER;
const password = process.env.MONGOPASSWORD;
const hostname = process.env.MONGOHOSTNAME;

if (!userName) {
  throw Error('Database not configured. Set environment variables');
}

// Connect to MongoDB
const url = `mongodb+srv://${userName}:${password}@${hostname}`;
const client = new MongoClient(url);

// Database Collections
const userCollection = client.db('startup').collection('user');

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

module.exports = {
    getUser,
    getUserBySession,
    createUser
}