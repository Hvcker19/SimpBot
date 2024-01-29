const path = require('path');
const fs = require('fs');
const axios = require('axios');

const cacheFolder = path.join(__dirname, 'cache');

module.exports = {
  name: 'pinte',
  category: 'image',
  description: 'Send Pinterest images based on a keyword',
  cooldown: 3,
  usage: '(keyword) - (count)',
  run: async ({ api, event, args }) => {
    if (!fs.existsSync(cacheFolder)) {
      fs.mkdirSync(cacheFolder);
    }

    const [searchTerm, imageCount] = args.split('-').map(str => str.trim());
    const count = imageCount ? parseInt(imageCount, 10) : 1;

    let pintApi = `https://redapi-kpdc.onrender.com/pinterest?search=${searchTerm}`;

    try {
      const response = await axios.get(pintApi);

      if (response.data.count > 0) {
        const availableCount = Math.min(response.data.count, count);

        for (let i = 0; i < availableCount; i++) {
          const randomImageUrl = response.data.data[Math.floor(Math.random() * response.data.count)];
          const imageName = `${searchTerm}_${i + 1}.jpg`;
          const imagePath = path.join(cacheFolder, imageName);

          const imageResponse = await axios.get(randomImageUrl, { responseType: 'arraybuffer' });
          const buffer = Buffer.from(imageResponse.data, 'binary');

          fs.writeFileSync(imagePath, buffer);

          let pm = {
            attachment: fs.createReadStream(imagePath),
          };
          api.sendMessage(pm, event.threadID);

          setTimeout(() => {
            fs.unlinkSync(imagePath);
          }, 5000); 
        }
      } else {
        api.sendMessage("No images found for the given keyword.", event.threadID);
      }
    } catch (error) {
      console.error(error);
      api.sendMessage("An error occurred while fetching Pinterest images.", event.threadID);
    }
  },
};
