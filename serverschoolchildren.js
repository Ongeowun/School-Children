const twilio = require('twilio');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const http = require('http');
//const {parse} = require('json2csv'); //Converts JSON to CSV


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


// Backend code to save the click buttons
//Route to save clicked buttons
app.post('/save-data', (req, res) => {
  const { name, checked, timestamp } = req.body;

//validate the data and request
  if (!name || typeof checked === 'undefined' || !timestamp) {
    return res.status(400).json({ error: 'Invalid data' });
  }

//save the data
const data = { name, checked, timestamp };

//append the data to the file
const cvsfile = `${data.name}, ${data.checked}, ${data.timestamp}\n`;
try {
 fs.appendFileSync('data.csv', cvsfile);
  res.status(200).json({ message: 'Data saved successfully' });
} catch (err) {
  console.error('Error saving data:', err);
  res.status(500).json({ error: 'Error saving data' });
}

})

//Download the data as a CSV file
app.get('/download-csv', (req, res) => {
  const filePath = 'data.csv';
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'data.csv', (err) => {
      if (err) {
        console.log(`Error downloading file: ${err}`);
        return res.status(500).json({ error: 'Error downloading file' });
      }
    });
  }else {
    res.status(404).json({ error: 'File not found' });
  }
});

/*fs.appendFileSync('data.json', JSON.stringify(data) + '\n', err => {
  if (err) {
    console.log( `Error writing to file: ${err}`);
    return res.status(500).json({ error: 'Error saving data' });
  }
  res.status(200).json({ message: 'Data saved successfully' });
})

app.listen(5500, () => {
  console.log('Listening on port 5500');
})*/

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