// import xlsxFile from 'read-excel-file'
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const express = require('express')
const inquirer = require('inquirer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var project_folder;
const csvWriter = createCsvWriter({
  path: path.join(__dirname, '/RESULTS.csv'),
  header: [
{id: 'TRACKINGNUMBER', title: 'TRACKINGNUMBER'},
{id: 'ORDERNUMBER', title: 'ORDERNUMBER'},
{id: 'DATE', title: 'DATE'},
{id: 'RECEIVER', title: 'RECEIVER'},
{id: 'COST', title: 'COST'},
{id: 'WEIGHT', title: 'WEIGHT'},
{id: 'RECEIVERORDERNUMBER', title: 'RECEIVERORDERNUMBER'}
  ]
}); 
const masterPath = path.join(__dirname, '/UPS_CONFIRMATIONS.csv');
const backupPath = path.join(__dirname, '/UPS_DATA_BACKUP.csv');
const backupFolderPath = express.static(path.join(__dirname, '/UPS_DATA_ORGANIZED'));
var results = []
var currentSearch = []
var newSubFolder = []
var updateResults = []


// check if master file exists/ can be found and is named properly - if its not named properly console log what the name should be and where it needs to be put then exit program

// ask if the user is a shipper or a user
// if theyre a shipper have program look for the main shipping csv
// if the program finds it - ask them if they'd like to update the backup csv
// if they say yes have it copy the master csv and rewrite the backup csv master file on the network and on the shipping computer before continuing
// sometimes the network is down - if the network is down relay that the network file can't be found "the network is currently down"

// if they are a user have the program check the csv master backup file on their computer and search for todays date - if todays date isn't found 
// find the most recent date and say "the latest shipping information in this file is from 00/00/00 todays date is 00/00/00 is this okay?"
// if they say no say the message "have the program on the shipping computer update the master csv file to the network"

// mainMenu()
beginProcess()
function beginProcess() {
  if(process.pkg){
    project_folder = path.dirname(process.execPath)
    console.log('exe')
    startUp()
  } else {
    project_folder = __dirname
    console.log(project_folder)
    console.log('node')
    startUp()
  }
}

function startUp() {
  try {
    if (fs.existsSync(masterPath)){
      process.cwd
      console.log('Master CSV successfully located')
      setupCheck()
    } else {
      console.log(masterPath)
      console.log("Master CSV is missing - please put the UPS_CONFIRMATIONS.csv file into the same directory as this executable.")
      
    }
  } catch(err) {
    console.log(err)
  }
}
function setupCheck() {
  try {
    if (fs.existsSync(backupPath)) {
      console.log('Backup CSV successfully located')
      mainMenu()
    } else {
      console.log("Backup CSV doesn't exist yet switching to initial setup menu")
      initialSetupMenu()
    }
  } catch(err) {
    console.log(err)
  }
}

function initialSetupMenu() {
  inquirer.prompt([
    {
      type: "rawlist",
      name: "initialSetup",
      message: "select an option with the arrow keys and hit enter",
      choices: ['create initial backup files', "backup files exist but isn't in folder"]
    }
  ]).then(answers => {
    console.log(answers);
    if(answers.initialSetup == "create initial backup files"){
      console.log("calling backup generator function")
      backupGeneration()

    } else if (answers.initialSetup == "backup files exist but isn't in folder"){
      console.log("program will shut down - please place backup file in executables directory before restarting")
    } else {
      console.log('oops you selected something not in the menu somehow? program will terminate itself to prevent corruption of data')
    }
  })
}

function backupGeneration() {
  console.log("begining backup generation using master CSV - this should be almost instant")
  fs.copyFile(masterPath, backupPath, (err) => {
    if (err) throw err;
    console.log('backup file created')
    console.log('double checking firing off initial setup checks')
    startUp();
  })
}

function backupFoldersCheck() {
  try {
    if (fs.existsSync(backupFolderPath)) {
      console.log('Backup folder successfully located')
      console.log("reading backup - setting up array");
      mainMenu()

    } else {
      console.log("Backup folder doesn't exist yet switching to folder setup")
      backupFolderGenerator()
    }
  } catch(err) {
    console.log(err)
  }
}
function backupFolderGenerator() {
  fs.mkdir("./UPS_DATA_ORGANIZED", function(err) {
    if (err) {
      console.log(err)
    } else {
      console.log("Backup directory created")
      startUp();
    }
  })
}
function readBackup() {
  fs.createReadStream(backupPath)
.pipe(csv())
.on('data', (row) => {
  // console.log(row);
  data.push(row)
})
.on('end', () => {
  console.log('CSV file successfully processed');

});


 

}



function mainMenu() {
  inquirer.prompt([
    {
      type: "rawlist",
      name: "currentProcess",
      message: "What would you like to do?",
      choices: ['search main backup', 'update backup', 'do confirmations', 'create new sub folder']
    }
  ]).then(answers => {
    console.log(answers);
    if(answers.currentProcess == 'search main backup'){
      searchBackup()

    } else if(answers.currentProcess == 'update backup') {
      updateBackup();

    } else if (answers.currentProcess == 'do confirmations') {

    } else if (answers.currentProcess == 'create new sub folder') {
      createNewSubFolder();
    } 

  })
}

function searchBackup() {
  fs.createReadStream(backupPath)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log('Data Ready hit arrow key');
  });
  console.log('summoning the search menu for main backup')
  inquirer.prompt([
    {
      type: "rawlist",
      name: 'search',
      message: "What would you like to search the main backup csv for? Your results will be written to a RESULTS.csv",
      choices: ['order number', 'tracking number', 'receiver', 'go back']
    }
  ]).then(answers => {
    console.log(answers);
    try {
      if(answers.search == 'order number'){
        searchOrderNumber()
     } else if (answers.search == 'tracking number'){
       searchTrackingNumber()
     } else if (answers.search == 'receiver'){
       searchRecepientsName()
     } else if (answers.search == 'weight'){
 
     } else if (answers.search == 'cost - input a range'){
 
     } else if (answers.search == 'go back'){
       mainMenu()
     }
      
    } catch(e){
      console.log(e)
    }
    

  })

}
function searchResults() {
  console.log('writing your results to the RESULTS.csv')
  fs.writeFile('RESULTS.csv', JSON.stringify(currentSearch), function(err){
    if(err) {
      return console.log(err);
    }
    console.log('Results Succesfully recorded in RESULTS.csv')
    searchBackup()
  })
}
function searchResultsTest() {
  csvWriter.fileWriter.path = `./RESULTS.csv`
    console.log('attempting to use csv-writer')
    csvWriter.writeRecords(currentSearch)
    .then(() => {
      console.log('Results Saved')
      searchBackup()
    })


    // searchBackup()


}

function searchOrderNumber() {
  inquirer.prompt([
    {
      type: "input",
      name: 'orderNumber',
      message: 'input an order number'
    }
  ]).then(async answers => {
    try {
      console.log("Searching for " + answers.orderNumber)
      // let orderDetails = results.find(o => o.ORDERNUMBER == answers.orderNumber)
      // console.log(orderDetails)
      let orderMultiple = results.filter(results => results.ORDERNUMBER == answers.orderNumber)
      console.log(orderMultiple)
      currentSearch = orderMultiple;
      console.log(currentSearch)
 
      searchResultsTest()

    } catch(e){
      console.log(e)
    }
  })
}
function searchTrackingNumber() {
  inquirer.prompt([
    {
      type: "input",
      name: 'trackingNumber',
      message: 'input a tracking number'
    }
  ]).then(async answers => {
    try {
      console.log("Searching for " + answers.trackingNumber)
      // let orderDetails = results.find(o => o.ORDERNUMBER == answers.orderNumber)
      // console.log(orderDetails)
      let orderMultiple = results.filter(results => results.TRACKINGNUMBER == answers.trackingNumber.toUpperCase())
      console.log(orderMultiple)
      currentSearch = orderMultiple
      searchResultsTest()

    } catch(e){
      console.log(e)
    }
  })
}
function searchRecepientsName(){
  inquirer.prompt([
    {
      type: "input",
      name: 'recepientsName',
      message: "input a receiver's name"
    }
  ]).then(async answers => {
    try {
      console.log("Searching for " + answers.recepientsName)
      // let orderDetails = results.find(o => o.ORDERNUMBER == answers.orderNumber)
      // console.log(orderDetails)
      let orderMultiple = results.filter(results => results.RECEIVER.toUpperCase() == answers.recepientsName.toUpperCase())
      console.log(orderMultiple)
      currentSearch = orderMultiple
      searchResultsTest()

    } catch(e){
      console.log(e)
    }
  })
}

// ----------------
function updateBackup() {
  fs.createReadStream(masterPath)
  .pipe(csv())
  .on('data', (data) => updateResults.push(data))
  .on('end', () => {
    console.log(updateResults)
  });

  csvWriter.fileWriter.path = backupPath
  console.log('attempting to use csv-writer')
  csvWriter.writeRecords(updateResults)
  .then(() => {
    console.log('Results Saved')
    mainMenu()
  })




  // console.log("updating backup CSV with current master CSV");
  // fs.copyFile(masterPath, backupPath, (err) => {
  //   if (err) throw err;
  //   console.log('backup file updated')
  //   mainMenu();
  // })
}
// ----------------

function createNewSubFolder() {
  fs.createReadStream(backupPath)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
  });
  console.log('creating a new sub folder')
  inquirer.prompt([
    {
      type: 'input',
      name: 'folderName',
      message: "what will this folder be called?"
    },
    {
      type: 'checkbox',
      name: 'information',
      message: "What information do you want stored in this folder?",
      choices: ['TRACKINGNUMBER', 'ORDERNUMBER', 'DATE', 'RECEIVER', 'COST', 'WEIGHT', 'RECEIVERORDERNUMBER']
    }
  ]).then(answers => {
    console.log(answers)
for( i = 0; i < results.length; i++) {
  let objectShipping = {
    TRACKINGNUMBER: '',
    ORDERNUMBER: '',
    DATE: '',
    RECEIVER: '',
    COST: '',
    WEIGHT: '',
    RECEIVERORDERNUMBER: ''
  }
  for( a = 0; a < answers.information.length; a++){

    let search = answers.information[a]
    objectShipping[search] = results[i][search]
  }
  newSubFolder.push(objectShipping)


}
console.log(newSubFolder)
newSubFolderGenerator(answers.folderName)

  })

}
function newSubFolderGenerator(name) {
  
  csvWriter.fileWriter.path = `./${name}.csv`
  console.log('attempting to use csv-writer')
  csvWriter.writeRecords(newSubFolder)
  .then(() => {
    console.log('Results Saved')
    mainMenu()
  })
}












function test() {
  console.log('wee')
}





  function readBackup() {
    fs.createReadStream(backupPath)
  .pipe(csv())
  .on('data', (row) => {
    // console.log(row);
    data.push(row)
  })
  .on('end', () => {
    console.log('CSV file successfully processed');

  });


   

  }





  function dataCheck() {
    console.log(data)

  }



