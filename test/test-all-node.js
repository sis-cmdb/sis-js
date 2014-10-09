
var SIS = require('../');
var config = require('./test-config');
var fs = require('fs');

// top level test
describe("Test API via data folder", function() {
    'use strict';
    var generateTest = require('./test-util').generateTest;
    var client = SIS.client(config);

    if (config.user) {
        before(function(done) {
            client.authenticate(config.user, config.pass, done);
        });
    }

    // pull in data files
    var testData = [];
    fs.readdirSync(__dirname + '/data').forEach(function(file) {
        testData.push([require('./data/' + file), file]);
    });

    testData.map(function(test) {
        generateTest(test, client);
    });

});

describe("Test invalid client opts", function() {
    var expect = require('expect.js');

    it("Should fail without options", function() {
        expect(function() {
            SIS.client(null);
        }).to.throwError();
    });
    it("Should fail without a url", function() {
        expect(function() {
            SIS.client({});
        }).to.throwError();
    });
    it("Should fail with a non http URL", function() {
        expect(function() {
            SIS.client({'url' : 'ftp://foo.com'});
        }).to.throwError();
    });
});
