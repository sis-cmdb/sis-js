/***********************************************************

 The information in this document is proprietary
 to VeriSign and the VeriSign Product Development.
 It may not be used, reproduced or disclosed without
 the written approval of the General Manager of
 VeriSign Product Development.

 PRIVILEGED AND CONFIDENTIAL
 VERISIGN PROPRIETARY INFORMATION
 REGISTRY SENSITIVE INFORMATION

 Copyright (c) 2013 VeriSign, Inc.  All rights reserved.

***********************************************************/
'use strict';

var SIS = require('../');
var config = require('./test-config');
var fs = require('fs');

// top level test
describe("Test API via data folder", function() {

    var generateTest = require('./test-util').generateTest;
    var client = SIS.client(config);

    // pull in data files
    var testData = [];
    fs.readdirSync(__dirname + '/data').forEach(function(file) {
        testData.push([require('./data/' + file), file]);
    });

    testData.map(function(test) {
        generateTest(test, client);
    });

});

