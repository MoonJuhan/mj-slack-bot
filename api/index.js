const express = require('express')
const { WebClient } = require('@slack/web-api')

const API_TOKEN = process.env.token
const ADMIN = process.env.admin
const BOT = process.env.botId

const web = new WebClient(API_TOKEN)

const { getSheetData, writeSheetData } = require('./sheet')
const getRestaurantData = require('./kakao')
const getMessage = require('./message')
const commandLunch = require('./restaurants')

const app = express()
app.use(express.json())

app.post('/api/slack/event', async (req, res) => {
  const body = req.body

  console.log(body)

  console.log('\n')

  console.log(req.headers)

  if (body.challenge && body.type === 'url_verification') {
    res.json({ challenge: body.challenge })
  } else if (body.type === 'event_callback' && !req.headers['x-slack-retry-num'] && body.event.user !== BOT) {
    const event = body.event

    console.log(event)

    const { text, blocks } = await refineText(event)

    try {
      await sendMessage(event.channel, text, blocks)
      res.sendStatus(200)
    } catch (error) {
      console.log(error)
      res.sendStatus(500)
    }
  } else {
    console.log('What is this? or Bot Id Check')
    res.sendStatus(200)
  }
})

app.post('/api/slack/interactive', async (req, res) => {
  try {
    const t1 = { ...req }

    for (const [key, value] of Object.entries(t1)) {
      console.log(`${key} ${t1[key]}`)
      console.log('\n')
    }
  } catch (error) {
    console.log('first Err')
  }

  res.sendStatus(200)
})

const sendMessage = async (channel, text, blocks) => {
  await web.chat.postMessage({ channel, text, unfurl_media: false, blocks }).then((result) => {
    console.log(`Message sent: ${Math.floor(result.ts / 10000000) / 100}sec`)
  })
}

const refineText = async ({ channel, text, user }) => {
  const command = text.indexOf('--') !== -1 ? text.split('--')[1].split(' ')[0] : false

  if (command === 'help') {
    return { text: getMessage('HELP') }
  } else if (command === 'lunch') {
    return { text: await commandLunch(text) }
  } else if (command === 'update') {
    return { text: commandUpdata(channel, user) }
  } else if (command == 'test') {
    return {
      text: 'Button Test',
      blocks: [
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'About',
              },
              value: 'button_about',
              action_id: 'button_1',
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Lunch Random',
              },
              value: 'button_random',
              action_id: 'button_2',
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Lunch Category',
              },
              value: 'button_category',
              action_id: 'button_3',
            },
          ],
          block_id: 'testBlock',
        },
      ],
    }
  } else {
    return { text: getMessage('RANDOM') }
  }
}

const commandUpdata = async (channel, user) => {
  if (user === ADMIN) {
    try {
      await sendMessage(channel, getMessage('UPDATE_START'))
      const sheetData = await getSheetData()
      let writeData = []

      for (let i = 1; i < 46; i++) {
        const { isEnd, newData } = await getRestaurantData(i)
        const refineData = await refineRestaurants(sheetData, newData, writeData)

        writeData = writeData.concat(refineData)
        if (isEnd) break
      }

      await writeSheetData(writeData)
      return `DB 업데이트를 완료하였습니다. \n총 ${writeData.length}개의 식당을 업데이트 새로 찾았습니다.`
    } catch (error) {
      console.log(error)
      return getMessage('UPDATE_FAILURE')
    }
  } else {
    return getMessage('UPDATE_NO_AUTH')
  }
}

const refineRestaurants = async (sheetData, newData, writeData) => {
  const refineData = newData
    .filter((el) => sheetData.find((e) => e.name === el.name) === undefined)
    .filter((el) => writeData.find((e) => e.name === el.name) === undefined)

  return refineData
}

module.exports = app
