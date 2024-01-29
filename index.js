const { createServer } = require("http");
const express = require('express');
const { writeFileSync } = require("fs");
const { startBot } = require("./main.js");
const { logServerStart } = require('./functions/log.js');
const { parse } = require('url'); 
const config = require('./config.json');

const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
  const html = readFileSync('public/index.html', 'utf8');
  res.send(html);
});

app.get('/startBot', (req, res) => {
  startBot("Starting the bot!");
  res.send('<h1>startBot triggered!</h1>');
});
const port = process.env.PORT || 8080;

const server = createServer(app);

server.listen(port, () => {
  logServerStart(port, config.echoTheme.themeColor);
});
