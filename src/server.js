import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import LC from 'leanengine';

import api_route from './api.js';
import { startBoltApp } from './slack.js';

if (process.env.ENABLE_SLACK_BOT) {
  console.log('Starting slack bot ...');
  await startBoltApp();
}

LC.init({
  appId: process.env.LEANCLOUD_APP_ID,
  appKey: process.env.LEANCLOUD_APP_KEY,
  masterKey: process.env.LEANCLOUD_APP_MASTER_KEY
});

var app = express();
app.use(LC.express());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/1.0', api_route);
app.listen(process.env.LEANCLOUD_APP_PORT);
