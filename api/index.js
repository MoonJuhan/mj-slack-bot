const express = require('express')

const app = express()
app.use(express.json())

const { WebClient } = require('@slack/web-api')

// 생성한 token
const API_TOKEN = process.env.TOKEN

const web = new WebClient(API_TOKEN)

app.get('/api', (req, res) => {
  console.log('API Call')
  const path = `PATH`
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
  res.end(`Hello! Go to item: <a>${path}</a>`)
})

app.post('/api/slack/event', (req, res) => {
  console.log('API POST Call')
  console.log(req.body)
  const body = req.body

  if (body.challenge && body.type === 'url_verification') {
    res.json({ challenge: body.challenge })
  } else if (body.type === 'event_callback') {
    const event = body.event

    console.log(event)

    console.log(web)
    try {
      web.chat
        .postMessage({ channel: event.channel, text: '안녕하세요.' })
        .then((result) => {
          console.log('Message sent: ' + result.ts)
        })
    } catch (error) {
      console.log(error)
    }

    res.sendStatus(200)
  }
})

module.exports = app
