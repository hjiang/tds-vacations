import express from 'express';
import LC from 'leanengine';
import bodyParser from 'body-parser';

import api_route from './api/index.js';

LC.init({
  appId: process.env.LEANCLOUD_APP_ID,
  appKey: process.env.LEANCLOUD_APP_KEY,
  masterKey: process.env.LEANCLOUD_APP_MASTER_KEY
});

var app = express();
app.use(LC.express());
app.use(bodyParser.json());

app.use('/api/1.0', api_route);
app.listen(process.env.LEANCLOUD_APP_PORT);
