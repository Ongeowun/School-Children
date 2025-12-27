#!/usr/bin/env node
// migrate_studentsdata.js
// Usage: node migrate_studentsdata.js /path/to/studentsdata.csv
// By default connects to host 'orca.backspace.ug' unless PGHOST env var overrides it.

const fs = require('fs');
const csv = require('csv-parser'); // npm i csv-parser
const { Pool } = require('pg');    // npm i pg
require('dotenv').config();        // optional: use .env for DB creds

const CSV_PATH = process.argv[2];
if (!CSV_PATH) {
  console.error('Usage: node migrate_studentsdata.js /path/to/studentsdata.csv');
  process.exit(1);
}

// SSL handling: set PGSSLMODE to 'disable' (no SSL), 'require' (SSL, no cert verification),
// or 'verify-full' (SSL with certificate verification). Default: no PGSSLMODE -> no ssl option.
let sslOption;
if (process.env.PGSSLMODE === 'require') {
  sslOption = { rejectUnauthorized: false };
} else if (process.env.PGSSLMODE === 'verify-full') {
  sslOption = { rejectUnauthorized: true };
} else {
  sslOption = undefined;
}

// configure pool: default host is orca.backspace.ug unless PGHOST is set
const pool = new Pool({
  host: process.env.PGHOST || 'orca.backspace.ug',
  port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
  user: process.env.PGUSER || 'school_admin',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'school_db',
  max: 10,
  ssl: sslOption,
});

async function processRow(row) {
  const get = key => row[key] !== undefined ? String(row[key]).trim() : null;

  const firstName = get('First Name') || get('FirstName') || get('first_name');
  const lastName = get('Last Name') || get('LastName') || get('last_name');
  const className = get('Class') || get('class') || get('Class Name') || get('class_name');

  const p1First = get('Parents First Name') || get('ParentsFirstName') || get('Parent1 First Name');
  const p1Last = get('Parents Last Name') || get('ParentsLastName');
  const p1Phone = get('Parents Contacts') || get('ParentsPhone');
  const p1Email = get('Parents Emails') || get('ParentsEmail');
  const p1Location = get('Parents Locations') || get('ParentsLocation');

  const p2First = get('Second Parents First Name') || get('SecondParentsFirstName');
  const p2Last = get('Second Parents Last Name') || get('SecondParentsLastName');
  const p2Phone = get('Second Parents Contacts') || get('SecondParentsContacts');
  const p2Email = get('Second Parents Emails') || get('SecondParentsEmails');
  const p2Location = get('Second Parents Locations') || get('SecondParentsLocations');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // If your students table column is named "class", either quote it in SQL or better rename to class_name.
    const insertStudentText = 'INSERT INTO students (first_name, last_name, class_name) VALUES ($1, $2, $3) RETURNING id';
    const studentRes = await client.query(insertStudentText, [firstName, lastName, className]);
    const studentId = studentRes.rows[0].id;

    const insertParentText =
      'INSERT INTO parents (student_id, first_name, last_name, phone, email, location) VALUES ($1, $2, $3, $4, $5, $6)';

    if (p1First || p1Last || p1Phone || p1Email) {
      await client.query(insertParentText, [studentId, p1First, p1Last, p1Phone, p1Email, p1Location]);
    }

    if (p2First || p2Last || p2Phone || p2Email) {
      await client.query(insertParentText, [studentId, p2First, p2Last, p2Phone, p2Email, p2Location]);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    console.error('Error processing row for', firstName, lastName, ':', err.message || err);
  } finally {
    client.release();
  }
}

(async () => {
  const stream = fs.createReadStream(CSV_PATH).pipe(csv());
  let active = 0;
  let ended = false;
  let hadError = false;

  const tryExit = () => {
    if (ended && active === 0) {
      pool.end().then(() => {
        process.exit(hadError ? 1 : 0);
      });
    }
  };

  stream.on('data', async row => {
    stream.pause();
    active++;
    try {
      await processRow(row);
    } catch (err) {
      hadError = true;
      console.error('Row processing failed:', err);
    } finally {
      active--;
      stream.resume();
      tryExit();
    }
  });

  stream.on('error', err => {
    console.error('CSV stream error:', err);
    hadError = true;
  });

  stream.on('end', () => {
    console.log('CSV read finished — waiting for pending operations...');
    ended = true;
    tryExit();
  });
})();