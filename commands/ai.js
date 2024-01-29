// Import the required module
const axios = require('axios');

module.exports = {
  name: 'ai',
  category: 'ai',
  cmdVersion: '1.0.0',
  author: 'Rony',
  description: 'Interact with the AI',
  cooldown: 10,
  usage: '<question>',
  needPrefix: false,
  run: async ({ api, event, args }) => {
    try {
      const apiUrl = `https://redapi-kpdc.onrender.com/blackai?question=${encodeURIComponent(args)}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.message) {
        api.sendMessage(response.data.message, event.threadID);
      } else {
        api.sendMessage('Unable to get a response from the AI.', event.threadID);
      }
    } catch (error) {
      console.error(error);

      // Log the error response
      if (error.response) {
        console.error('Error Response:', error.response.data);
      }

      api.sendMessage('An error occurred while processing the AI command.', event.threadID);
    }
  },
};
