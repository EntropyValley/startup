const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

// Default to port 4000 if not given on command line
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// Middleware
app.use(express.json()); // JSON Body Parsing
app.use(cookieParser()); // Cookie Parsing
app.use(express.static('public')); // Static Files

// Start HTTP Service
const service = app.listen(port, () => {
    console.log(`Listening on Port ${port}`);
});