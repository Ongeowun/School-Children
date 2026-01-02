0
 const pool = require('./db');
// const twilio = require('twilio');
 const express = require('express');
 const cors = require('cors');
 const bodyParser = require('body-parser');
 const fs = require('fs');
 const https = require('https');
 const path = require('path');
 //const {parse} = require('json2csv'); //Converts JSON to CSV
 const pool = require('./db'); // path to db.js
 const bcrypt = require('bcrypt');
 const config = require ('./config');

 const UBER_API_KEY = config.uber.apiKey;
 const UBER_BASE_URL = 'https://api.uber.com/v1.2';

 const app = express();
 app.use(express.json());

 app.use(cors({
  origin: 'https://orca.backspace.ug'
 }));

// Safe Twilio init (optional)
let twilioClient = null;
if (config.twilio && config.twilio.accountSid && config.twilio.authToken) {
  try {
    const twilioLib = require('twilio'); // install with: npm install twilio
    twilioClient = twilioLib(config.twilio.accountSid, config.twilio.authToken);
    console.log('Twilio client initialized');
  } catch (err) {
    console.warn('Twilio library not available or failed to init:', err.message);
    twilioClient = null;
  }
} else {
  console.log('Twilio credentials not provided; Twilio disabled');
}


// const USERS_FILE = 'users.json';
 
// Helper functions for user management
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading users:', err);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing users:', err);
    return false;
  }
}

//Registration endpoint

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required' 
      });
    }

    const users = readUsers();
    
    // Check if username already exists
    if (users.find(u => u.username === username)) {
      return res.status(409).json({ 
        message: 'Username already exists' 
      });
    }

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({
      username,
      password: hashedPassword
    });

    if (!writeUsers(users)) {
      return res.status(500).json({ 
        message: 'Error saving user' 
      });
    }

     res.status(201).json({ 
      message: 'User registered successfully' 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
});

  //login endpoint
app.post('/login', async (req, res) => {
  try {
    console.log('--- /login request ---');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    const { username, password } = req.body || {};
    if (!username || !password) {
      console.log('Login failed: missing username or password');
      return res.status(400).json({ message: 'Username and password required.' });
    }

    const users = readUsers();
    const user = users.find(u => u.username === username);
    console.log('Found user:', !!user, 'username:', username);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.password);
    console.log('Password match:', match);

    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    console.log('Login successful for user:', username);
    return res.json({ message: 'Login successful.' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Error logging in.' });
  }
});



 //const accountSid = 'AC9b144a2ec2e7e0e9e34f819491e8aacc';
 //const authTokenId = 'a0f081366acb5159746f98c24a5a84c2';

function findStudentByName(fullName, lastName) {
  try {
    const STUDENTS_FILE = 'studentsdata.csv';
    if (!fs.existsSync(STUDENTS_FILE)) return null;

    const data = fs.readFileSync(STUDENTS_FILE, 'utf8').trim();
    if (!data) return null;

    const lines = data.split('\n').filter(Boolean).slice(1); 
    for (const line of lines) {
      const cols = parseCsvLine(line);
      if ( cols[0]?.trim().toLowerCase() === firstNameName.toLowerCase() && 
            cols[1]?.trim().toLowerCase() === lastName.toLowerCase()) {
        return {
           firstName: cols[0]?.trim(),
            lastName: cols[1]?.trim(),
            class: cols[2]?.trim(),
            parentsContacts: cols[6]?.trim() //Parents contacts.
             }
            }
         }
         return null;
  } catch (err) {
    console.error('Error finding student:', err);
    return null;
  }
} 

 app.post('/send-text', async (req, res) => {
  if(!twilioClient) {
    return res.status(501).json({ error: 'Twilio is not configured' });
  }
   const { firstName, lastName, message } = req.body || {};
   if (!firstName || !lastName || !message) {
    return res.status(400).json({ error: 'First name, last name, and message are required' });
   }
     
   const parentsNumber =  student?.parentsContacts;
   const fromNumber = config.twilio.phoneNumber;

   if (!fromNumber) {
    return res.status(500).json({ error: 'Twilio from phone number is not configured' });
   }

   try {
    const msg = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: parentsNumber
    });
     const messageDetails = {
      sid: msg.sid,
      to: parentsNumber,
      from: fromNumber,
      body: message,
      student: `${firstName} ${lastName}`,
      timestamp: new Date().toISOString()
     };

     fs.appendFileSync('messageDetails.json', JSON.stringify(messageDetails) + '\n', 'utf8');
      
     return res.json({
      message: 'Text message sent successfully',
      sid: msg.sid,
      sentTo: parentsNumber
     });
   } catch (err) {
    console.error('Error sending text message:', err);
    return res.status(500).json({ error: 'Failed to send text message' });
   }
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
 
//Uber API endpoint and requesting for rides.
app.post('/request-Uber-ride', async (req, res) => {
    try {
      const { schoolLocation, parentsLocations, parentsContacts, studentName } = req.body;
      if (!schoolLocation || !parentsLocations || !parentsContacts || !studentName) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Make request to Uber API to estimate ride

      const estimateResponse = await fetch(`${UBER_BASE_URL}/estimates/price`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${UBER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          start_latitude: schoolLocation.latitude,
          start_longitude: schoolLocation.longitude,
          end_latitude: parentsLocations.latitude,
          end_longitude: parentsLocations.longitude
        })
       });
       //Ride prices
      const priceData = await estimateResponse.json();
      
      const ridePrice = priceData.prices && priceData.prices.length > 0 ? priceData.prices[0].estimate : null;

      //Ride duration and details
      const durationResponse = await fetch(`${UBER_BASE_URL}/estimates/time`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${UBER_API_KEY}`,
          'Content-Type': 'application/json'
        },
      });

      const durationData = await durationResponse.json();
      const duration = durationData.times && durationData.times.length > 0 ? durationData.times[0].estimate : null;

      const rideDetails = {
        studentName,
        pickup: schoolLocation,
        dropoff: parentsLocations,
        contact: parentsContacts,
        price: ridePrice,
        duration: duration,
        timestamp: new Date().toISOString()
      };

      fs.appendFileSync('uberRideDetails.json'), 
        JSON.stringify(rideDetails) + '\n', 
        'utf8';
       
      return res.json({
        success: true,
        rideDetails,
        message: 'Uber ride requested successfully for ${firstName} ${lastName}'
      });
   } catch (err) {
    console.error('Error requesting Uber ride:', err);
    return res.status(500).json({ error: 'Failed to request Uber ride' });
  }
});


// Start server with proper error handling
const PORT = (config.server && config.server.port) || 5500;
const server = app.listen(PORT, () => {
  console.log(`Server listening on https://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop other process or set PORT env var.`);
    process.exit(1);
  } else {
    throw err;
  }
});

