const commandLunch = require('./restaurants')
const getMessage = require('./message')

const manageInteractive = async (action) => {
  console.log('manageInteractive')
  console.log(action)
  if (action.type === 'button') {
    return await manageButtonType(action.value)
  } else if (action.type === 'static_select') {
    return await manageSelectType(action.selected_option)
  }

  return
}

const manageButtonType = async (value) => {
  switch (value) {
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

const manageSelectType = async (option) => {
  return await commandLunch(`--lunch -category ${option.value}`)
}

module.exports = manageInteractive
