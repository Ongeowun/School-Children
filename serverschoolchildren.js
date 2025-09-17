 const twilio = require('twilio');
 const express = require('express');
 const cors = require('cors');
 const bodyParser = require('body-parser');
 const fs = require('fs');
 const http = require('http');
 const path = require('path');
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
      timestamp: new Date().toLocaleString() //Built in Date Objective.
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



  // Backend code to save the click buttons
  //Route to save clicked buttons
 app.post('/save-data', (req, res) => {
  const { name, message, checked, timestamp } = req.body;

 //validate the data and request
  if (!name || !message || typeof checked === 'undefined' || !timestamp) {
    return res.status(400).json({ error: 'Invalid data' });
  }

 //save the data
 const data = {name,message,checked,timestamp};
 try {
 const filePath = 'data.csv'
 //checking if the file exist.
 if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
  const header = 'Student Name, Message, Time\n';
  fs.writeFileSync(filePath, header, {flag: 'a'});
 }

  } catch (error) {
  console.error('Error saving data:', error);
  res.status(500).json({ error: 'Error saving data' });
 }
 //append the data to the file
 const csvfile = `${data.name},${data.message},${data.checked},${data.timestamp}\n`;
 try {
 fs.appendFileSync('data.csv', csvfile);
  res.status(200).json({ message: 'Data saved successfully' });
 } catch (err) {
  console.error('Error saving data:', err);
  res.status(500).json({ error: 'Error saving data' });
 }

 })
 app.get('/get-data', (req, res) => {
  const filePath = 'data.csv';
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Data file not found' });
  }
  fs.readFile(filePath, 'utf8', (err, fileData) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading data file' });
    }
    const lines = fileData.trim().split('\n').slice(1); // Skip the header line
    const data = lines.map(line => {
      const [name,  message, checked, timestamp] = line.split(',').map(item => item.trim());
      return { name, message, checked: checked === 'true', timestamp };
    });
    res.status(200).json(data);
  });
 });
 app.post('/submit-student-form', (req, res) => {
  const { 
          firstName,
          lastName, 
          studentsClass,
          parentsFirstName,
          parentsSecondName,
          parentsContacts,
          parentsemails,
          parentsLocations,
          secondParentsFirstName,
          secondParentsLastName,
          secondParentsContacts,
          secondParentsEmails,
          secondParentsLocations
         } = req.body;

         if (!firstName || !lastName || !studentsClass || !parentsFirstName || !parentsSecondName || !parentsContacts || !parentsemails || !parentsLocations) {
            return res.status(400).json({ error: 'All fields are required' });
         }
  const studentData = {
        firstName,
        lastName,
        studentsClass,
        parentsFirstName,
        parentsSecondName,
        parentsContacts,
        parentsemails,
        parentsLocations,
        secondParentsFirstName,
        secondParentsLastName,
        secondParentsContacts,
        secondParentsEmails,
        secondParentsLocations,
        timestamp: new Date().toLocaleString() //Built in Date Objective.
      }
   try {
      const filePath = 'studentsdata.csv';
      // Check if the file exists and is empty
      if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0){
        const header = 'First Name, Last Name, Class, Parents First Name, Parents Second Name, Parents Contacts, Parents Emails, Parents Locations, Second Parents First Name, Second Parents Last Name, Second Parents Contacts, Second Parents Emails, Second Parents Locations, Timestamp\n';
        fs.writeFileSync(filePath, header, { flag: 'a' });
      }
      const csvData = `${studentData.firstName},${studentData.lastName},${studentData.studentsClass},${studentData.parentsFirstName},${studentData.parentsSecondName},${studentData.parentsContacts},${studentData.parentsemails},${studentData.parentsLocations},${studentData.secondParentsFirstName || ''},${studentData.secondParentsLastName || ''},${studentData.secondParentsContacts || ''},${studentData.secondParentsEmails || ''},${studentData.secondParentsLocations || ''},${studentData.timestamp}\n`;
      fs.appendFileSync(filePath, csvData);
      res.status(200).json({ message: 'Student data saved successfully' });
   } catch (error) {
      console.error('Error saving student data:', error);
      res.status(500).json({ error: 'Error saving student data' });
   }

 });
// New endpoint to get student names
app.get('/get-students', (req, res) => {
  const filePath = 'studentsdata.csv';
  
  if (!fs.existsSync(filePath)) {
    return res.status(200).json([]); // Return empty array if file doesn't exist
  }

  try {
    const fileData = fs.readFileSync(filePath, 'utf8');
    const lines = fileData.trim().split('\n').slice(1); // Skip header line
    
    const Newstudent = lines.map(line => {
      const columns = line.split(',').map(item => item.trim());
      if (columns.length >= 2) {
        return {
          firstName: columns[0],
          lastName: columns[1],
          fullName: `${columns[0]} ${columns[1]}`,
          class: columns[2]
        };
      }
      return null;
    }).filter(student => student !== null);

    res.status(200).json(Newstudent);
  } catch (error) {
    console.error('Error reading student data:', error);
    res.status(500).json({ error: 'Error reading student data' });
  }
});
//download button
app.get('/download-csv', (req, res) => {
  const filePath = 'data.csv';
  if(!fs.existsSync(filePath)){
    return res.status(404).json({error: 'CSV file not found'})
  }
  res.download(filePath, 'data.csv', (error) => {
    if (error) {
      console.error('Error downloading CSV file', err);
      res.status(500).json({error: 'Downloading CSV file'})
    }
  })
})

app.listen(5500, () => {
  console.log('Listening on port 5500');
});

