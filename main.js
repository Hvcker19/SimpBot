const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const login = require('./functions/Fca');
const helpCommand = require('./functions/helpCommand.js');
const log = require('./functions/log');

const {
  logReceivedMessage, 
  logLoginFailed, 
  logError,
  logAppState, 
  logConfigLoaded, 
  logCommandsLoaded,
  echoBotAscii,
} = log;

const {
  botMenu,
  botPrefix,
  sendWelcomeMessage,
  sendFarewellMessage,
  sendKickMessage,
  collectUserIds
} = helpCommand;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Add this line to parse JSON in requests

app.use('/', (req, res) => {
  res.send(new Date());
});


// Declare config once
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const botConfig = JSON.parse(fs.readFileSync('goibot.json', 'utf8'));
const commandPrefix = config.prefix;
const theme = config.echoTheme.themeColor; 

const options = config.options || {};

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = commandFiles.map(file => require(path.join(__dirname, 'commands', file)));

logCommandsLoaded(commands, config.echoTheme.themeColor);

const commandCooldowns = config.options.commandCooldowns || {};
const commandCooldownTimers = {};

const processCommand = async (api, event) => {
  try {
    const messageBody = event.body.trim();

    if (!messageBody.startsWith(commandPrefix)) {
      return;
    }

    const [command, ...args] = messageBody.substring(commandPrefix.length).split(/ +/);
    const lowerCaseCommand = command.toLowerCase();

    if (lowerCaseCommand === 'prefix') {
      botPrefix(api, event);
      return;
    }

    if (lowerCaseCommand === 'menu') {
      botMenu(api, event);
      return;
    }

    // Check if the command has a cooldown
    const cooldownTime = commandCooldowns[lowerCaseCommand];
    if (cooldownTime !== undefined) {
      const lastExecutionTime = commandCooldownTimers[lowerCaseCommand] || 0;
      const currentTime = Date.now();

      if (currentTime - lastExecutionTime < cooldownTime * 1000) {
        api.sendMessage(`Command '${lowerCaseCommand}' is on cooldown. Please wait.`, event.threadID);
        return;
      }

      // Update the cooldown timer
      commandCooldownTimers[lowerCaseCommand] = currentTime;
    }

    const commandFunction = commands.find(cmd => cmd.name === lowerCaseCommand);

    if (commandFunction && commandFunction.run) {
      const replyFunction = (text) => api.sendMessage(text, event.threadID);
      await commandFunction.run({ api, event, args: args.join(' '), reply: replyFunction });
    } else {
      api.sendMessage("Unknown command. Type /help for a list of commands.", event.threadID, event.messageID);
    }
  } catch (error) {
    logError(error, config.echoTheme.themeColor);
    api.sendMessage('Oops! Something went wrong while processing your command. Please try again later.', event.threadID, event.messageID);
  }
};

logConfigLoaded(config.echoTheme.themeColor);

const appStateFile = 'appstate.json';
let appState;

try {
  appState = JSON.parse(fs.readFileSync(appStateFile, 'utf8'));
} catch (error) { 
}

login({ appState }, options, (err, api) => {
  if (err) {
    log.logLoginFailed(err, config.echoTheme.themeColor);
    return;
  }

  logAppState(appState, config.echoTheme.themeColor);
  echoBotAscii(theme); 

  // Set the bot's presence status
  const presenceStatus = options.presenceStatus || 'online';
  api.setOptions({ listenEvents: true, presence: presenceStatus });

  api.listen((err, event) => {
    if (err) {
      console.error(err);
      return;
    }

    api.markAsRead(event.threadID, (err) => {
      if (err) {
        console.error(err);
      }
    });

    switch (event.type) {
      case 'message':
        logReceivedMessage(event.senderID, event.body, commandPrefix, config.echoTheme.themeColor); 
        checkCustomReactions(api, event);
        checkAutoResponseRules(api, event);
        processCommand(api, event);
        break;

      case 'event':
        if (event.logMessageType === 'log:subscribe') {
          sendWelcomeMessage(api, event);
        } else if (event.logMessageType === 'log:unsubscribe' && event.logMessageData.leftParticipantFbId) {
          const leftUserId = event.logMessageData.leftParticipantFbId;
          if (event.author === leftUserId) {
            sendFarewellMessage(api, event); 
          } else {
            sendKickMessage(api, event); 
          }
        } else if (event.logMessageType === 'log:thread-name') {
          // Check if the bot joined a new group chat
          if (event.logMessageData && event.logMessageData.addedParticipants) {
            // Collect user IDs when the bot joins a group chat
            collectUserIds(api, event);
          }
        }
        break;
    }
  });
});

const checkCustomReactions = (api, event) => {
  const messageBody = event.body.toLowerCase();
  const customReactions = botConfig.customReactions || {};

  Object.entries(customReactions).forEach(([keyword, reaction]) => {
    if (messageBody.includes(keyword.toLowerCase())) {
      api.setMessageReaction(reaction, event.messageID, (err) => {}, true);
    }
  });
};

const checkAutoResponseRules = (api, event) => {
  const messageBody = event.body.toLowerCase();
  const autoResponseRules = botConfig.autoResponseRules || {};

  Object.entries(autoResponseRules).forEach(([keyword, response]) => {
    if (messageBody.includes(keyword.toLowerCase())) {
      api.sendMessage(response, event.threadID);
    }
  });
};
