# Heruko_BOT

EchoBot is a simple chatbot built with Node.js using the FACEBOOK CHAT API - FCA. It features commands, event handling, and supports image and media processing.

## Features

- Command-based interactions
- Welcome and farewell messages
- Event handling for user subscriptions and unsubscriptions

## Setup

1. Clone the repository.
2. Install dependencies: `npm install`
3. Run the bot: `node index.js`

## Commands

- `/prefix`: Change the command prefix.
- `/menu`: Display the bot menu.
- Other custom commands based on your implementation.


## Creating Custom Commands

You can easily extend EchoBot by creating your own custom commands. Follow the steps below to add a new command:

1. **Create a New Command File:**
   - In the `commands` directory, create a new JavaScript file for your command, for example, `myCommand.js`.

2. **Define the Command Logic:**
   - Open `myCommand.js` and define your command logic. Use the following template:

   ```javascript
   // myCommand.js
   const myCommandFunction = async (api, event, args) => {
     // Your command logic here
     api.sendMessage(`My custom command executed with args: ${args.join(' ')}`, event.threadID);
   };

   module.exports = {
     name: 'mycommand',  // Command name (lowercase)
     category: 'custom',  // Category for your command
     cooldown: 5,         // Cooldown in seconds
     usage: '(usage)',    //  Usage for your command
     execute: myCommandFunction,
   };

   This example provides a step-by-step guide for users to create their own custom commands for the EchoBot. Users can replace "myCommand" with the desired name for their custom command.

