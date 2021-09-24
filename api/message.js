const messages = require('./messages.json')

const getMessage = (key) => {
  return typeof messages[key] === 'string'
    ? messages[key]
    : messages[key].map((el) => 'MJ Slack Bot Talking \n' + el)[Math.ceil(Math.random() * messages[key].length) - 1]
}

module.exports = getMessage
