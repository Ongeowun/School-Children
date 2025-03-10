const twilio = require('twilio');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const http = require('http');


const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://127.0.0.1:5500'
}));

const accountSid = 'AC9b144a2ec2e7e0e9e34f819491e8aacc';
const authTokenId = 'a0f081366acb5159746f98c24a5a84c2';
const client = twilio(accountSid, authTokenId);

app.post('/send-text', (req, res) => {
  const { body, from, to } = req.body;

  client.messages.create({
    body: body,
    from: from,
    to: to
  })
  .then(message => {
    //save the details
    const messageDetails = {
      sid: message.sid,
      body: body,
      from: from,
      to: to,
      timestamp: new Date().toISOString() //Built in Date Objective.
    }
    fs.appendFileSync('messageDetails.json', JSON.stringify(messageDetails) + '\n', err => {
      if (err) {
        console.log( `Error writing to file: ${err}`);
    } ;
  });
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://127.0.0.1:5500',
    });
    res.end(JSON.stringify({ sid: message.sid }));
  })
  .catch(err => {
    res.writeHead(500, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://127.0.0.1:5500',
    });
    res.end(JSON.stringify({ error: err.message }));
  });
});

app.listen(5500, () => {
  console.log('Listening on port 5500');
}) 


/*const server = http.createServer((req, res) => {
  if(req.method === 'POST') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': 'http://127.0.0.1:5500',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, ',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': 86400
    })
    res.end()
    return
 }
 if (req.url === '/send-text' && req.method === 'POST') {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const { body, from, to } = JSON.parse(body);
    client.messages
      .create({ body, from, to })
      .then(message => {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://127.0.0.1:5500',
        });
        res.end(JSON.stringify({ sid: message.sid }));
      })
      .catch(err => {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://127.0.0.1:5500',
        });
        res.end(JSON.stringify({ error: err.message }));
      });
  });
} else {
  res.writeHead(404, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://127.0.0.1:5500',
  })
  res.end(JSON.stringify({ error: 'Resource not found' }))
}

server.listen(5500, () => {
  console.log('Listening on port 5500');
})

})

app.post('/send-text', (req, res) => {
  const { body, from, to } = req.body;

  client.messages
    .create({ body, from, to })
    .then(message => res.json({ sid: message.sid }))
    .catch(err => res.status(5500).json({ error: err.message }));
});

app.listen(5500, () => console.log('Listening on port 5500'));*/