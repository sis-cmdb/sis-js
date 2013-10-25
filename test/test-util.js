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

(function() {

    var expect = null;

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
            if (data['entityType']) {
                endpoint = client.entities(data['entityType']);
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
                            expect(err).to.be(null);
                            expect(result).to.be.ok();
                            expect(result[idField]).to.be.ok();
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
                            expect(err).to.be.ok();
                            expect(err.error).to.be.ok();
                            done();
                        });
                    });
                })(i);
            }

            // ensure list retrieves non empty array
            if (validItems.length) {
                it("should retrieve a non empty array", function(done) {
                    endpoint.list(function(err, result) {
                        expect(err).to.be(null);
                        expect(result).to.be.ok();
                        expect(result).to.be.an(Array);
                        expect(result.length).to.be.above(0);
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
                            expect(err).to.be(null);
                            expect(result).to.be.ok();
                            if (data['get_eqlfun']) {
                                data['get_eqlfun'](result, item, expect);
                            } else {
                                expect(result).to.eql(item);
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
                            expect(err).to.be(null);
                            expect(result).to.be.ok();
                            done(err, result);
                        });
                    });
                })(i);
            }
        });
    }

    // test env
    if (typeof module !== 'undefined' && module.exports) {
        expect = require('expect.js');
        module.exports.generateTest = exports = generateTest;
    } else {
        // attach to global SIS object - must include sis-js.js in browser first
        if (window && window.SIS) {
            expect = window.expect;
            window.SIS.generateTest = generateTest;
        }
    }
})();
