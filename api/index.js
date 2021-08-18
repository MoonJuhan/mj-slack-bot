const express = require('express')
const app = express()

const Slack = require('slack-node')

// 생성한 token
const API_TOKEN = process.env.token

const slack = new Slack(API_TOKEN)

const send = async (sender, message) => {
  slack.api(
    'chat.postMessage',
    {
      text: `${sender}:\n${message}`,
      channel: '#general',
      icon_emoji: 'slack',
    },
    (error, response) => {
      if (error) {
        console.log(error)
        return
      }
      console.log(response)
    }
  )
}



app.get('/api', (req, res) => {
  const path = `PATH`
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
  res.end(`Hello! Go to item: <a>${path}</a>`)
})

app.get('/api/test', async (req, res) => {
  await send('user1', 'send message')

  res.setHeader('Content-Type', 'application/json')
  const testJSON = {
    key: 'value',
  }
  res.json(testJSON)
})

module.exports = app
