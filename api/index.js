const express = require('express')
const app = express()

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
  console.log(req)
  console.log(req.body)

  // web.chat
  //   .postMessage({ channel: event.channel, text: '안녕하세요.' })
  //   .then((result) => {
  //     console.log('Message sent: ' + result.ts)
  //   })

  // res.json({challenge: body.challenge})
  res.json({challenge:'hello'})
})

module.exports = app
