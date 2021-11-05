const axios = require('axios')
const { google } = require('googleapis')

const GOOGLE_CREDENTIALS = JSON.parse(process.env.googleCredentials)
const GOOGLE_TOKEN = JSON.parse(process.env.googleToken)
const GOOGLE_SCRIPT_ID = process.env.googleScriptId
const GOOGLE_SHEET_ID = process.env.googleSheetId

let _auth

const getSheetData = async (category) => {
  try {
    const { data } = await axios({
      method: 'get',
      url: `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?sheet=Restaurants${
        category ? '&tq=SELECT+*+WHERE+C+=+%27' + encodeURI(category) + '%27' : ''
      }`,
    })

    return await refindSheetsData(data)
  } catch (error) {
    console.log(error)
  }
}

const refindSheetsData = (string) => {
  const firstSplit = string.split('google.visualization.Query.setResponse(')[1]

  const jsonData = JSON.parse(firstSplit.slice(0, firstSplit.length - 2))

  const restaurantList = []
  jsonData.table.rows.forEach((el) => {
    const row = el.c

    restaurantList.push({
      name: row[1]?.v,
      category1: row[2]?.v,
      category2: row[3]?.v,
      distance: row[4]?.v,
      url: row[5]?.v,
      address: row[6]?.v,
      updatedAt: row[7]?.f,
    })
  })

  return restaurantList
}

const writeSheetData = async (params) => {
  console.log(writeSheetData)
  if (!_auth) authorize(GOOGLE_CREDENTIALS, GOOGLE_TOKEN)

  await callAppsScript(GOOGLE_SCRIPT_ID, 'writeRestaurantsData', params)
}

const authorize = (credentials, token) => {
  const { client_secret, client_id, redirect_uris } = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

  oAuth2Client.setCredentials(token)
  _auth = oAuth2Client
}

const callAppsScript = async (scriptId, functionName, parameters) => {
  console.log(callAppsScript)
  const script = google.script({ version: 'v1', auth: _auth })

  script.scripts.run(
    {
      scriptId,
      resource: {
        function: functionName,
        parameters: [parameters],
        devMode: true,
      },
    },
    (err, res) => {
      console.log('Call Apps Script Done')
      if (err) {
        console.log('The API returned an error: ' + err)
        return
      }

      if (res.error) {
        console.log(res.error)
      } else {
        console.log(res.data)
      }
    }
  )
}

module.exports = { getSheetData, writeSheetData }
