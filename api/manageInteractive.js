const commandLunch = require('./restaurants')
const getMessage = require('./message')

const manageInteractive = async (action) => {
  if (action.type === 'button') {
    return await manageButtonType(action.value)
  } else if (action.type === 'static_select') {
    return await manageSelectType(action.selected_option)
  }

  return
}

const manageButtonType = async (value) => {
  switch (action.value) {
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

const manageSelectType = async (category) => {
  return await commandLunch(`--lunch -category ${category}`)
}

module.exports = manageInteractive
