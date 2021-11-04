const { getSheetData } = require('./sheet')
const getMessage = require('./message')

const commandLunch = async (string) => {
  if (string.indexOf('--lunch ') !== -1) {
    const nextCommand = string.split('--lunch ')[1].split(' ')
    if (nextCommand.join(' ').indexOf('-') !== -1) {
      switch (nextCommand[0]) {
        case '-help':
          return { text: getMessage('LUNCH_HELP') }
        case '-random':
          return { text: await getRandom() }
        case '-category':
          let returnText = 'MJ Slack Bot Recommend \n'
          const categories = await getCategories()
          if (nextCommand[1]) {
            const category = nextCommand[1]
            if (categories.indexOf(category) !== -1) {
              return await getRandom(category)
            } else {
              returnText += '입력한 카테고리의 식당이 없습니다.\n'
            }
          }
          return {
            text: returnText + refineCategories(categories),
            blocks: [
              {
                type: 'actions',
                elements: [
                  {
                    type: 'section',
                    block_id: 'section678',
                    text: {
                      type: 'mrkdwn',
                      text: 'Pick an item from the dropdown list',
                    },
                    accessory: {
                      action_id: 'text1234',
                      type: 'static_select',
                      placeholder: {
                        type: 'plain_text',
                        text: 'Select an item',
                      },
                      options: [
                        {
                          text: {
                            type: 'plain_text',
                            text: '*this is plain_text text*',
                          },
                          value: 'value-0',
                        },
                        {
                          text: {
                            type: 'plain_text',
                            text: '*this is plain_text text*',
                          },
                          value: 'value-1',
                        },
                        {
                          text: {
                            type: 'plain_text',
                            text: '*this is plain_text text*',
                          },
                          value: 'value-2',
                        },
                      ],
                    },
                  },
                ],
              },
            ],
          }
      }
      // 사용법 설명
      return { text: getMessage('LUNCH_HELP') }
    } else {
      return { text: getMessage('LUNCH') }
    }
  } else {
    return { text: getMessage('LUNCH') }
  }
}

const getRandom = async (category) => {
  const sheetData = await getSheetData(category)
  const randomIndex = []

  if (sheetData.length > 0) {
    while (sheetData.length > 5 ? randomIndex.length < 5 : randomIndex.length < sheetData.length) {
      const random = Math.ceil(Math.random() * sheetData.length) - 1

      if (randomIndex.indexOf(random) === -1) randomIndex.push(random)
    }

    let returnText = 'MJ Slack Bot Recommend \n'

    console.log(randomIndex)

    randomIndex.forEach((i) => {
      returnText += restaurantMessage(sheetData[i])
      returnText += '\n'
    })

    return returnText
  } else {
    return getMessage('LUNCH_HELP')
  }
}

const restaurantMessage = (restaurant) => {
  return `- ${restaurant.category1} <${restaurant.url}|${restaurant.name}> ${Math.ceil(restaurant.distance / 15)}min`
}

const getCategories = async () => {
  const sheetData = await getSheetData()
  const categories = sheetData.map((el) => el.category1)

  return categories.filter((cat, index) => categories.indexOf(cat) === index)
}

const refineCategories = (categories) => {
  let returnText = `현재 등록되어 있는 식당 분류는 총 ${categories.length}개 입니다.\n종류는 아래와 같습니다.\n \n`
  categories.forEach((cat, index) => {
    if (index !== 0) returnText += ', '
    returnText += cat
  })

  return returnText
}

module.exports = commandLunch
