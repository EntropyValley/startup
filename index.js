const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

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
    console.log(req.body);

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