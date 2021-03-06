const express = require('express')
const { WebClient } = require('@slack/web-api')
const qs = require('querystring')

const API_TOKEN = process.env.token
const ADMIN = process.env.admin
const BOT = process.env.botId

const web = new WebClient(API_TOKEN)

const { getSheetData, writeSheetData } = require('./sheet')
const getRestaurantData = require('./kakao')
const getMessage = require('./message')
const commandLunch = require('./restaurants')
const manageInteractive = require('./manageInteractive')

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
  let body = ''

  req.on('data', function (data) {
    body += data

    if (body.length > 1e6) request.connection.destroy()
  })

  req.on('end', async () => {
    const post = qs.parse(body)
    const { channel, actions } = JSON.parse(post.payload)

    console.log(post.payload)
    console.log('\n\n')
    console.log(channel)
    console.log('\n\n')
    console.log(actions)

    const { text, blocks } = await manageInteractive(actions[0])
    await sendMessage(channel.id, text, blocks)

    res.sendStatus(200)
  })
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
    return await commandLunch(text)
  } else if (command === 'update') {
    return await commandUpdata(channel, user)
  } else if (command == 'test') {
    return {
      text: 'Button Test',
      blocks: [
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '????????? ????????? ???????????????',
            },
          ],
        },
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
      console.log('Command Update Start')
      await sendMessage(channel, getMessage('UPDATE_START'))
      console.log('Send 01')
      const sheetData = await getSheetData()
      let writeData = []

      for (let i = 1; i < 46; i++) {
        const { isEnd, newData } = await getRestaurantData(i)
        const refineData = await refineRestaurants(sheetData, newData, writeData)

        writeData = writeData.concat(refineData)
        if (isEnd) break
      }

      await writeSheetData(writeData)
      console.log('Command Update End')
      return { text: `DB ??????????????? ?????????????????????. \n??? ${writeData.length}?????? ????????? ???????????? ?????? ???????????????.` }
    } catch (error) {
      console.log(error)
      return { text: getMessage('UPDATE_FAILURE') }
    }
  } else {
    return { text: getMessage('UPDATE_NO_AUTH') }
  }
}

const refineRestaurants = async (sheetData, newData, writeData) => {
  const refineData = newData
    .filter((el) => sheetData.find((e) => e.name === el.name) === undefined)
    .filter((el) => writeData.find((e) => e.name === el.name) === undefined)

  return refineData
}

module.exports = app
