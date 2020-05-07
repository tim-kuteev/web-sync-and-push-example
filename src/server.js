const path = require('path');
const express = require('express');
const webPush = require('web-push');

const PORT = 80;
const WEB_DIR = path.join(__dirname, 'web');

const vapidKeys = webPush.generateVAPIDKeys();
webPush.setVapidDetails(
  'mailto:example@domain.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use('/favicon.ico', (req, res, next) => res.sendStatus(204));

app.use(express.static(WEB_DIR));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/api/vapid-key', (req, res, next) => {
  res.send(vapidKeys.publicKey);
});

app.post('/api/request-notification', (req, res, next) => {
  setTimeout(() => {
    webPush
      .sendNotification(req.body.subscription, req.body.payload)
      .catch(console.error);
  }, req.body.delay);
  res.sendStatus(200);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.sendStatus(err.statusCode || 500);
});

app.listen(PORT, () => {
  console.log('Listening', PORT);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception', err);
  process.exit(1);
});
