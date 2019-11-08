const express = require('express');
const StaticServer = require('node-static').Server;
const webPush = require('web-push');

const PORT = 8888;

const vapidKeys = webPush.generateVAPIDKeys();
webPush.setVapidDetails(
  'mailto:example@domain.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

const fileServer = new StaticServer(__dirname + '/web');

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

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
      .catch(console.error);
  }, req.body.delay);
  res.sendStatus(200);
});

app.use((req, res, next) => {
  fileServer.serve(req, res).on('error', (err) => res.sendStatus(404));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.sendStatus(500);
});

app.listen(PORT, () => {
  console.log('Listening %s', PORT);
});

process.on('uncaughtException', (err) => {
  console.error(err);
});
