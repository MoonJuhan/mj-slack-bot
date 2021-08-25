const messages = require('./messages.json')

const getMessage = (key) => {
  return typeof messages[key] === 'string'
    ? messages[key]
    : messages[key][Math.ceil(Math.random() * messages[key].length) - 1]
}

module.exports = getMessage
