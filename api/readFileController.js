'use strict';

exports.readFileData = function (req, res) {
  const fs = require('fs');
  const cbsa = './zip_to_cbsa.csv';
  const msa = './cbsa_to_msa.csv';
  const MetStatString = 'Metropolitan Statistical Area';

  let count = 0;
  let zipCode = req.query.zipCode;
  let cbsaArray = [];

  function fileStream(path, callback) {
    fs.readFile(path, 'utf8', function (err, data) { // remember, if you have call backs, you can't do shorthand...
      if (err) {
        res.send(err);
      }
      callback(data);
    });
  }

  fileStream(cbsa, function (data) {


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
  function getMetStatData(cbsaArray) {

    fileStream(msa, (data) => {
      let msaFileData = data.split('\n'),
        msaColumnsArray = [],
        msaColums,
        mdivDict = {},
        phArray = [];


      for (let i = 5; i < msaFileData.length; i++) {

        let msaColumns = msaFileData[i].split(',');
        phArray = [msaColumns[0], msaColumns[1], msaColumns[3] + ', ' + msaColumns[4], msaColumns[5], msaColumns[12], msaColumns[13]];
        msaColumnsArray.push(phArray);


        if (msaColumnsArray !== '') {
          if (mdivDict.hasOwnProperty(msaColumns[1])) {
            mdivDict[msaColumns[1]].push(phArray);
          } else {
            mdivDict[msaColumns[1]] = [phArray];
          }
        }
      }
      findMetStatData(cbsaArray, msaColumnsArray, mdivDict);
    });
  }

  function findMetStatData(cbsaArray, msaColumnsArray, mdivDict) {
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
        output = {};

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
    console.log("SMSD:", selectedMetStatDetails);

    res.json(selectedMetStatDetails);
  }
};
