'use strict';

const express = require('express');

module.exports = (app) => {
  let zipCodeData = require('./readFileController');

  app.get('/api/check/', (req, res) => {
    console.log("Hello? Is that you John Wayne, is this me?")
    res.send({ express: "Hello! Something lives here." });
  });

  app.route('/api/getPopulationData/')
    .get(zipCodeData.readFileData);


}
