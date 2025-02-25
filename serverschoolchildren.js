const twilio = require('twilio');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(express.json());

const accountSid = 'AC9b144a2ec2e7e0e9e34f819491e8aacc';
const authTokenId = 'a0f081366acb5159746f98c24a5a84c2';
const client = twilio(accountSid, authTokenId);

app.post('/send-text', (req, res) => {
  const { body, from, to } = req.body;

  client.messages
    .create({ body, from, to })
    .then(message => res.json({ sid: message.sid }))
    .catch(err => res.status(5500).json({ error: err.message }));
});

app.listen(5500, () => console.log('Listening on port 5500'));