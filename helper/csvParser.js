const csv = require('csvtojson');
const path = require('path');

// const csvPath = __dirname + '/../messages/contact';
// const csvPath = path.resolve(__dirname + '../uploads');

function converter(csvPath) {
  return new Promise((resolve, reject) => {
    const data = [];
    csv()
      .fromFile(csvPath)
      .on('json', jsonObj => {
        data.push(jsonObj);
      })
      .on('done', error => {
        if (error) {
          return reject(error);
        }
        return resolve(data);
      });
  });
}

module.exports = converter;
