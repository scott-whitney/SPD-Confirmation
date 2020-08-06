// import xlsxFile from 'read-excel-file'
const csv = require('csv-parser');
const fs = require('fs');

fs.createReadStream('UPS_CONFIRMATIONS.csv')
  .pipe(csv())
  .on('data', (row) => {
    console.log(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });