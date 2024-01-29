const gradientString = require('gradient-string');

const getEchoThemeColor = (theme) => {
  switch (theme) {
    case 'BlueEcho':
      return ['#3498db', '#9b59b6', '#229954']; 
    case 'YellowEcho':
      return ['#f1c40f', '#d35400', '#922b21'];
    case 'CyanEcho':
      return ['#00bcd4', '#00796b', '#b9134d'];
    case 'IndigoEcho':
      return ['#3f51b5', '#3498db', '#f1c40f'];
    default:
      return null;
  }
};


const log = (message, theme) => {
  const themeColors = getEchoThemeColor(theme);
  console.log(themeColors ? gradientString(themeColors)(message) : message);
};

const logError = (error, theme) => {
  const errorMessage = error ? `Error: ${error}` : "An unknown error occurred.";
  log(('ERROR', errorMessage), theme);
};

const logReceivedMessage = (sender, body, prefix, theme) => {
  const currentDate = new Date().toLocaleString();
  const logContent = `Received message from ${sender}\nPrefix: ${prefix}\nReply: ${body}\nDate: ${currentDate}\n CREDITS TO: Rony L. Borja`;
  log(('SYSTEM', logContent), theme);
};
const logLoginFailed = (error, theme) => {
  const errorMessage = error ? `Login failed: ${error}` : "Login Failed Wrong Appstate";
  log(('LOG-IN FAILURE', errorMessage), theme);
};

const logAppState = (appState, theme) => {
  const message = !appState || Object.keys(appState).length === 0
    ? "Can't find the bot's (appstate file)."
    : 'Your EchoBot is now Ready';

  log(('APP STATE', message), theme);
};

const logConfigLoaded = (theme) => {
  log(('CONFIG LOADED', 'Found the (config.json file)!\nConfig Loaded!'), theme);
};

const logServerStart = (port, theme) => {
  log(('SERVER START', ` Server is running on port ${port}`), theme);
};

const logCommandsLoaded = (commands, theme) => {
  log(('COMMANDS LOADED', commands.map(cmd => `${cmd.name} = ${cmd.category}`).join('\n')), theme);
};

const echoBotAscii = (theme) => {
  log('░█▀▀ ░█▀▀ ░█░█ ░█▀█ ░█▄▄ ░█▀█  ▀█▀ ░', theme);
  log('░██▄ ░█▄▄ ░█▀█ ░█▄█ ░█▄█ ░█▄█ ░░█░ ▄', theme);
};

module.exports = {
  log,
  logError,
  logReceivedMessage,
  logAppState,
  logConfigLoaded,
  logServerStart,
  logLoginFailed,
  logCommandsLoaded,
  echoBotAscii,
};
