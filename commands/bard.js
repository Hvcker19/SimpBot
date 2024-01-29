const axios = require('axios');

module.exports = {
  name: 'bard',
  category: 'ai',
  description: 'Interact with the AI',
  cooldown: 10,
  usage: '<query>',
  run: async ({ api, event, args }) => {
    try {
      const apiUrl = `https://bardai-cxjq.onrender.com/bard/?ask=${encodeURIComponent(args)}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.result) {
        const resultMessage = response.data.result;
        api.sendMessage(resultMessage, event.threadID);

        // Check if there are images in the response
        if (response.data.image && Array.isArray(response.data.image)) {
          // Send each image with its tag
          response.data.image.forEach((image) => {
            api.sendMessage(`${image.url}`, event.threadID);
          });
        }
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
