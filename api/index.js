const express = require('express')
const app = express()

app.get('/api', (req, res) => {
    const path = `PATH`;
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.end(`Hello! Go to item: <a>${path}</a>`);
  });

module.exports = app;