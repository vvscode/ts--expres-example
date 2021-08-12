import express from  'express';
import {json}  from 'body-parser';
import session from 'express-session';
import { dbRun, dbGet } from './sqlite3db';

import './types'


export const app = express();

app.set('views', `${__dirname }/views`)
app.set('view engine', 'ejs')

app.use(json({}));

app.use(session({
  secret:'Some secret here'
}));

let count = 0;

app.get('/', (req, res) => {
  res.send(`Hello World!`)
});

app.post('/json', (req, res) => {
  count += req.body.value;
  res.send({
    count
  });
});

app.post('/personal_json', (req, res) => {
  req.session.counter = req.session.counter || 0;
  const {value} = req.body;
  if (value) {
    req.session.counter += value;
  }
  res.send({
    count: req.session.counter
  });
});

app.get('/today', (req, res) => {
  res.render('today', { today: new Date().toLocaleDateString() });
});

app.get('/dbcounter', async (req, res) => {
  try {
    await dbRun(
      `INSERT INTO visitors (ts, agent) VALUES  (?, ?)`, 
      [Date.now() / 1000, req.headers['user-agent'] || 'Unknown']
    );
    const row = await dbGet(`SELECT COUNT(*) AS count FROM visitors`) as {count: number};
    res.send({ status: 'ok', count: row.count });
  } catch(err) {
    res.status(404);
    res.send({ status: 'error', err });
  }
});