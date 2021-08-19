const express = require('express')
const app = express()

const { WebClient } = require('@slack/web-api')

// 생성한 token
const API_TOKEN = process.env.TOKEN

const web = new WebClient(API_TOKEN)

app.get('/api', (req, res) => {
  const path = `PATH`
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
  res.end(`Hello! Go to item: <a>${path}</a>`)
})

app.post('/api/slack/event', (req, res) => {
  const body = req.body
  const event = body.event

  web.chat
    .postMessage({ channel: event.channel, text: '안녕하세요.' })
    .then((result) => {
      console.log('Message sent: ' + result.ts)
    })

  res.json({challenge: body.challenge})
})

module.exports = app
