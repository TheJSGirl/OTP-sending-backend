const contact = require('express').Router();
const csvParser = require('../../helper/csvParser');
const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');
const pool = require('../../db');
const _ = require('lodash');
const config = require('../../config');
const twilio = require('../../twilio');

// const csvPath = __dirname + '/../contact.csv';
const multer = require('multer');
const upload = multer({
  dest: path.resolve(__dirname, '../../uploads')
}).single('contacts');

contact.route('/').get(async (req, res) => {
  try {
    const [result] = await pool.query('SELECT * FROM contacts');

    if (!result.length) {
      return res.status(404).json({
        data: [],
        status: 'failed',
        message: 'failed to fetch'
      });
    }
    return res.status(200).json({
      data: result,
      status: 'success',
      message: 'got data successfully'
    });
  } catch (error) {
    return res.status(500).json({
      data: [],
      status: 'Failed',
      message: 'something went wrong'
    });
  }
});

contact.route('/').post(upload, async (req, res) => {
  try {
    /**
     * checking file exist or not
     */
    if (!req.file) {
      return res.status(404).json({
        data: {},
        status: 'failed',
        messgae: 'file is required'
      });
    }

    /**
     * checking if the file is CSV or not
     * delete the file if it is not a csv file
     * using fs.unlink to delete the file
     * file path is given by req.file.path
     */
    if (req.file.mimetype !== 'text/csv') {
      new Promise((resolve, reject) => {
        fs.unlink(req.file.path, err => {
          if (err) {
            return;
          }
        });
      });

      return res.status(400).json({
        data: [],
        status: 'failed',
        message: 'only csv file is allowed'
      });
    }
    const csvPath = req.file.path;

    const result = await csvParser(csvPath);
    if (!result.length) {
      res.status(500).json({
        data: [],
        status: 'failed',
        message: 'something went wrong'
      });
    }

    let values = [];
    for (let i = 0; i < result.length; i++) {
      values.push(`(${result[i].mobile},"${result[i].name}")`);
    }
    let insertQuery = 'INSERT INTO contacts (mobile, name) VALUES';

    if (values.length > 0) {
      console.log('values', values.join());
      insertQuery += values.join();
    }
    console.log('insert query', insertQuery);
    const [dbResult] = await pool.query(insertQuery);

    fs.unlink(req.file.path, err => {
      if (err) {
        return;
      }
    });

    res.status(200).json({
      data: dbResult,
      status: 'success',
      message: 'saved data successfully'
    });
  } catch (err) {
    console.log('error---------', err);
  }
});

contact.route('/:id').get(async (req, res) => {
  //  send sms to a paticular mobile
  // const accountSid = 'ACaae3e2190a35b70c273ac0c23c65e525';
  // const authToken = '4fc110c56644c898b85b8f2730d5c977';
  const { id } = req.params;
  const [clientDetail] = await pool.query(
    `SELECT mobile FROM contacts WHERE id = ${id}`
  );
  // console.log('client', clientDetail[0].mobile);
  const client = require('twilio')(twilio.accountSid, twilio.authToken);
  client.messages
    .create({
      to: `+91${clientDetail[0].mobile}`,
      from: '+919892641971',
      body: Math.floor(100000 + Math.random() * 900000)
    })
    .then(message => {
      console.log(message.sid);
      console.log('njdhdj', message);
      //store sent message or qued messages
    });
});

module.exports = contact;
