'use strict';

exports.readFileData = function (req, res) {
  const fs = require('fs'),              // for local data --
    request = require('request'),   // this is an alternative for getting HTTP requests, but I wanted to keep it localized to my machine and the heroku instance for security and bandwith purposes.
    //cbsa = './zip_to_cbsa.csv',
    cbsa = 'https://s3.amazonaws.com/peerstreet-static/engineering/zip_to_msa/zip_to_cbsa.csv',
    //msa = './cbsa_to_msa.csv',
    msa = 'https://s3.amazonaws.com/peerstreet-static/engineering/zip_to_msa/cbsa_to_msa.csv',
    MetStatString = 'Metropolitan Statistical Area';

  let zipCode = req.query.zipCode;
  let cbsaArray = [];

  /*var fileStream = (path, callback) => {    // instant return
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        res.send(err);
      }
      callback(data);
    });
  }*/

  // I included the original 'testing' framework above for local to make sure functionality works. This, however, has some latency as it is pinging off the amazon server.
  var fileStream = (path, callback) => {
    request(path, (err, res, data) => {
      if (err) {
        res.send(err);
      }

      //  console.log(path);
      callback(data);
    });
  }

  fileStream(cbsa, (data) => {


    var zipLines = data.split('\r'),
      zipColumnHash = {},
      zipCols;

    for (let i = 1; i != zipLines.length; i++) {
      zipCols = zipLines[i].split(',');
      zipColumnHash[zipCols[0]] = zipCols[1];
    }

    let CBSAHash = {};
    CBSAHash['Zip'] = zipCode;
    CBSAHash['CBSA'] = zipColumnHash[zipCode];

    cbsaArray.push(CBSAHash);

    getMetStatData(cbsaArray);


  });

  /*
  // getMetStatData
  // Compares data from the cbsa file to the msa file to get // metropolitian statistical data.
  // Params @ string[] cbsaArray;
  */
  var getMetStatData = cbsaArray => {

    fileStream(msa, (data) => {
      let msaFileData = data.split('\n'),
        msaColumnsArray = [],
        msaColums,
        mdivDict = {}


      for (let i = 0; i < msaFileData.length; i++) {

        let msaColumns = msaFileData[i].split(',');
        msaColumnsArray.push([msaColumns[0], msaColumns[1], msaColumns[3] + ', ' + msaColumns[4], msaColumns[5], msaColumns[12], msaColumns[13]]);


        if (msaColumnsArray !== '') {
          if (mdivDict.hasOwnProperty(msaColumnsArray[1])) {
            mdivDict[msaColumns[1]].push(msaColumnsArray);
          } else {
            mdivDict[msaColumns[1]] = [msaColumnsArray];
          }
        }
      }
      findMetStatData(cbsaArray, msaColumnsArray, mdivDict);
    });
  }

  var findMetStatData = (cbsaArray, msaColumnsArray, mdivDict) => {
    let derivedCBSAInfo,
      cbsaDetails = [],
      selectedMetStatDetails = [];

    // if (cbsaArray.length === 0) {
    //   res.json({ "message": "Nothing found!" });
    //   return;
    // }

    for (let i = 0; i < cbsaArray.length; i++) {
      let cbsaFirst = cbsaArray[i].CBSA,
        zipVal = cbsaArray[i].Zip,
        output = {};    // this is to create a hash map to match keys to values and pass them to the machine

      output['Zip'] = zipVal;


      if (mdivDict[cbsaFirst] !== undefined) {
        cbsaDetails = mdivDict[cbsaFirst];
        for (let j = 0; j < cbsaDetails.length; j++) {
          if (cbsaDetails[j][3] === MetStatString) {
            output['CBSA'] = cbsaDetails[j][0];
            output['MSA'] = cbsaDetails[j][2];
            output['Pop2014'] = cbsaDetails[j][4];
            output['Pop2015'] = cbsaDetails[j][5];

            break;
          }
        }
      } else {
        for (let j = 0; j < msaColumnsArray.length; j++) {

          derivedCBSAInfo = cbsaFirst;
          output['CBSA'] = cbsaFirst;
          if (msaColumnsArray[j][0] !== '' && cbsaFirst === msaColumnsArray[j][0] && msaColumnsArray[j][3] === MetStatString) {
            output['MSA'] = msaColumnsArray[j][2];
            output['Pop2014'] = msaColumnsArray[j][4];
            output['Pop2015'] = msaColumnsArray[j][5];
            break;
          }
        }
      }
      selectedMetStatDetails.push(output);
    }
    // console.log("SMSD:", selectedMetStatDetails); --- debugging to check what is the output

    res.json(selectedMetStatDetails);
  }
};
