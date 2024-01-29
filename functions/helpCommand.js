const fs = require('fs');
const path = require('path');

const config = require('../config.json');

const botMenu = async (api, event) => {
  const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
  const availableCommands = commandFiles.map(file => require(path.join(__dirname, '..', 'commands', file)));

  const commandsByCategory = {};
  availableCommands.forEach(command => {
    const category = command.category || 'Uncategorized';
    commandsByCategory[category] = commandsByCategory[category] || [];
    commandsByCategory[category].push(command);
  });

  let listMenu = `Available Commands:\n`;

  Object.entries(commandsByCategory).forEach(([category, commands]) => {
    listMenu += `[${category.toUpperCase()}]\n`;

    commands.forEach(command => {
      listMenu += `  ${config.prefix}${command.name} ${(command.usage || '')}\n CoolDown: ${command.cooldown}\n `;
    });
  });

  api.sendMessage(listMenu, event.threadID);

  const botInfo = api.getCurrentUserID() === api.getCurrentUserID() ? " (You are the Bot Owner)" : ` (Bot Owner: ${config.botOwner || 'Unknown'})`;
  listMenu += `\n${botInfo}`;
};

const botPrefix = async (api, event) => {
  api.sendMessage(`The command prefix is: ${config.prefix}`, event.threadID);
};

const sendWelcomeMessage = async (api, event) => {
  try {
    const welcomeMessage = `Welcome to the chat! I am ${config.botName} and This is my prefix \n "${config.prefix}"!`;
    api.sendMessage(welcomeMessage, event.threadID);
  } catch (error) {
    console.error('Error sending welcome message:', error);
  }
};

const sendFarewellMessage = async (api, event) => {
  try {
    const farewellMessage = `Farewell! ${config.botName} will miss you. Goodbye!`;
    api.sendMessage(farewellMessage, event.threadID);
  } catch (error) {
    console.error('Error sending farewell message:', error);
  }
};

const sendKickMessage = async (api, event) => {
  try {
    const kickMessage = `You've been kicked! ${config.botName} wishes you the best. Goodbye!`;
    api.sendMessage(kickMessage, event.threadID);
  } catch (error) {
    console.error('Error sending kick message:', error);
  }
};

const collectUserIds = async (api, event, sender) => {
  try {
    const participants = await api.getThreadInfo(event.threadID);
    const userIds = participants.participantIDs;
    userIds.push(sender);

    fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(userIds));

    console.log('User IDs have been collected and saved to users.json:', userIds);
  } catch (error) {
    console.error('Error collecting user IDs:', error);
  }
};

module.exports = {
  botMenu,
  botPrefix,
  sendWelcomeMessage,
  sendFarewellMessage,
  sendKickMessage,
  collectUserIds, // Add the new function to export
};
