const express = require('express')

const app = express()
app.use(express.json())

const { WebClient } = require('@slack/web-api')

const API_TOKEN = process.env.token

const web = new WebClient(API_TOKEN)

app.get('/api', (req, res) => {
  console.log('API Call')
  const path = `PATH`
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
  res.end(`Hello! Go to item: <a>${path}</a>`)
})

app.post('/api/slack/event', async (req, res) => {
  console.log('API POST Call')
  console.log(req.body)
  const body = req.body

  if (body.challenge && body.type === 'url_verification') {
    res.json({ challenge: body.challenge })
  } else if (body.type === 'event_callback') {
    const event = body.event

    console.log(event)

    try {
      console.log('chat start')
      await web.chat
        .postMessage({ channel: event.channel, text: '안녕하세요.' })
        .then((result) => {
          console.log('Message sent: ' + result.ts)
        })
      console.log('chat end')
    } catch (error) {
      console.log(error)
    }
    console.log('END')
    res.sendStatus(200)
  }
})


const commandUpdata = async (channel, user) => {
  if (user === ADMIN) {
    try {
      await sendMessage(channel, getMessage('UPDATE_START'))
      const sheetData = await getSheetData()
      let writeData = []

      for (let i = 1; i < 46; i++) {
        const { isEnd, newData } = await getRestaurantData(i)
        const refineData = await refineRestaurants(
          sheetData,
          newData,
          writeData
        )

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
