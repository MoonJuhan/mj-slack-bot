const commandLunch = require('./restaurants')
const getMessage = require('./message')

const manageInteractive = async (command) => {
  console.log(command)
  switch (command) {
    case 'button_about':
      return await buttonAbout()
    case 'button_random':
      return await buttonRandom()
    case 'button_category':
      return await buttonCategory()
  }
}

const buttonAbout = async () => {
  return { text: getMessage('HELP') }
}

const buttonRandom = async () => {
  return await commandLunch('--lunch -random')
}

const buttonCategory = async () => {
  return await commandLunch('--lunch -category')
}

module.exports = manageInteractive
