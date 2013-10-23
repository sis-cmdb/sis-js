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

var sis = require('../');
var should = require('should');
var config = require('./test-config');

describe("Getters", function() {
    var client = sis(config);

    // should return at least [] for hooks, schemas, and hiera
    var apis = ['hooks', 'schemas', 'hiera'];
    apis.map(function(api) {
        it("should GET " + apis, function(done) {
            client[api].list(function(err, res) {
                res.should.be.an.instanceof(Array);
                should.not.exist(err);
                done(err, res);
            });
        });
    });

});

