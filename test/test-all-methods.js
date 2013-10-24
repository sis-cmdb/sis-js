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
var should = require('should');
var config = require('./test-config');
var fs = require('fs');

// top level test
describe("Test API via data folder", function() {

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

function generateTest(test, client) {
    var data = test[0];
    var name = test[1];
    describe("Test " + name, function() {
        if (data['requiredSchema']) {
            before(function(done) {
                client.schemas.create(data['requiredSchema'], done);
            });
            after(function(done) {
                client.schemas.delete(data['requiredSchema'], done);
            });
        }

        var endpoint = null;
        if (data['entity_type']) {
            endpoint = client.entities(data['entity_type']);
        } else {
            endpoint = client[data['type']];
        }

        var idField = data['idField'];

        // add valid items
        var validItems = data['validItems'] || [];
        var addedItems = [];
        for (var i = 0; i < validItems.length; ++i) {
            (function gen(i) {
                it("should create valid item " + i, function(done) {
                    var validItem = validItems[i];
                    endpoint.create(validItem, function(err, result) {
                        should.not.exist(err);
                        should.exist(result);
                        should.exist(result[idField]);
                        addedItems.push(result);
                        done(err, result);
                    });
                });
            })(i);
        }

        // ensure invalid items don't get created
        var invalidItems = data['invalidItems'] || [];
        for (var i = 0; i < invalidItems.length; ++i) {
            (function gen(i) {
                it("should fail to create invalid item " + i, function(done) {
                    var invalidItem = invalidItems[i];
                    endpoint.create(invalidItem, function(err, result) {
                        should.exist(err);
                        should.exist(err.error);
                        done();
                    });
                });
            })(i);
        }

        // ensure list retrieves non empty array
        if (validItems.length) {
            it("should retrieve a non empty array", function(done) {
                endpoint.list(function(err, result) {
                    should.not.exist(err);
                    should.exist(result);
                    result.length.should.be.above(0);
                    done(err, result);
                });
            });
        }

        // ensure valid items can be retrieved by their id
        for (var i = 0; i < validItems.length; ++i) {
            (function gen(i) {
                it("should retrieve item " + i + " by id", function(done) {
                    var item = addedItems[i];
                    var id = item[idField];
                    endpoint.get(id, function(err, result) {
                        should.not.exist(err);
                        should.exist(result);
                        if (data['get_eqlfun']) {
                            data['get_eqlfun'](result, item);
                        } else {
                            result.should.eql(item);
                        }
                        done(err, result);
                    });
                });
            })(i);
        }

        // TODO: ensure update works


        // ensure delete works
        for (var i = 0; i < validItems.length; ++i) {
            (function gen(i) {
                it("should delete item " + i, function(done) {
                    var item = addedItems[i];
                    endpoint.delete(item[idField], function(err, result) {
                        should.not.exist(err);
                        should.exist(result);
                        result.should.be.true;
                        done(err, result);
                    });
                });
            })(i);
        }
    });
}
