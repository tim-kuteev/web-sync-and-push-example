const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const webPush = require('web-push');

const PORT = 8888;

const vapidKeys = webPush.generateVAPIDKeys();
webPush.setVapidDetails(
  'mailto:example@domain.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

const app = express();

app.use(cors({origin: true, credentials: true}));
app.use(bodyParser.json());
app.use('/favicon.ico', (req, res, next) => res.sendStatus(204));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/vapid-key', (req, res, next) => {
  res.send(vapidKeys.publicKey);
});

app.post('/request-notification', (req, res, next) => {
  setTimeout(() => {
    webPush
      .sendNotification(req.body.subscription, req.body.payload)
      .catch(console.log);
  }, req.body.delay);
  res.sendStatus(200);
});

app.use((err, req, res, next) => {
  console.log(err);
  res.sendStatus(500);
});

app.listen(PORT, () => {
  console.log('Listening %s', PORT);
});

process.on('uncaughtException', (err) => {
  console.log(err);
});
