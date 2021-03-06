(function() {
    'use strict';

    var expect = null;

    function generateTest(test, client) {
        var data = test[0];
        var name = test[1];
        describe("Test " + name, function() {

            var endpoint = null;
            if (data.entityType) {
                endpoint = client.entities(data.entityType);
            } else {
                endpoint = client[data.type];
            }

            var idField = data.idField;

            // items
            var validItems = data.validItems || [];
            var updateItems = data.updateItems || [];
            var invalidItems = data.invalidItems || [];
            var bulkArrayUpdate = data.bulkArrayUpdate || [];
            var bulkQueryUpdates = data.bulkQueryUpdate || [];
            var addedItems = [];

            if (data.requiredSchema) {
                before(function(done) {
                    // nuke the schema and then delete
                    client.schemas.delete(data.requiredSchema.name, function(err, res) {
                        client.schemas.create(data.requiredSchema, done);
                    });
                });
                after(function(done) {
                    client.schemas.delete(data.requiredSchema, done);
                });
            } else {
                // sis objects.. nuke them all
                before(function(done) {
                    var ids = validItems.map(function(i) {
                        return i[idField];
                    });
                    var query = {}; query[idField] = { $in : ids };
                    endpoint.bulkDelete({ q : query }, done);
                });
            }


            validItems.forEach(function(validItem, i) {
                it("should create valid item " + i, function(done) {
                    endpoint.create(validItem, function(err, result) {
                        expect(err).to.be(null);
                        expect(result).to.be.ok();
                        expect(result[idField]).to.be.ok();
                        addedItems.push(result);
                        done(err, result);
                    });
                });
            });

            // ensure invalid items don't get created

            invalidItems.forEach(function(item, i) {
                it("should fail to create invalid item " + i, function(done) {
                    var invalidItem = invalidItems[i];
                    endpoint.create(invalidItem, function(err, result) {
                        expect(err).to.be.ok();
                        expect(err.error).to.be.ok();
                        done();
                    });
                });
            });

            // ensure list retrieves non empty array
            if (validItems.length) {
                it("should retrieve a non empty array", function(done) {
                    endpoint.list(function(err, result) {
                        expect(err).to.be(null);
                        expect(result).to.be.ok();
                        expect(result.results).to.be.an(Array);
                        expect(result.total_count).to.be.above(0);
                        var totalCount = result.total_count;
                        result = result.results;
                        expect(result.length).to.be.above(0);
                        expect(totalCount).to.not.be.below(validItems.length - 1);
                        done(err, result);
                    });
                });

                it("should retrieve a single item array", function(done) {
                    endpoint.list({'limit' : 1}, function(err, result) {
                        expect(err).to.be(null);
                        expect(result).to.be.ok();
                        expect(result.results).to.be.an(Array);
                        expect(result.results.length).to.eql(1);
                        done(err, result);
                    });
                });

                it("should retrieve a single item array by id", function(done) {
                    var q = {};
                    q[idField] = addedItems[0][idField];
                    endpoint.list({'q' : q }, function(err, result) {
                        expect(err).to.be(null);
                        expect(result).to.be.ok();
                        expect(result.results).to.be.an(Array);
                        expect(result.results.length).to.eql(1);
                        done(err, result);
                    });
                });

                it("should retrieve a single item array by id via JSON string", function(done) {
                    var q = {};
                    q[idField] = addedItems[0][idField];
                    endpoint.list({'q' : JSON.stringify(q) }, function(err, result) {
                        expect(err).to.be(null);
                        expect(result).to.be.ok();
                        expect(result.results).to.be.an(Array);
                        expect(result.results.length).to.eql(1);
                        done(err, result);
                    });
                });
            }

            // ensure valid items can be retrieved by their id
            validItems.forEach(function(item, i) {
                it("should retrieve item " + i + " by id", function(done) {
                    var id = addedItems[i][idField];
                    endpoint.get(id, function(err, result) {
                        expect(err).to.be(null);
                        expect(result).to.be.ok();
                        if (data.get_eqlfun) {
                            data.get_eqlfun(result, addedItems[i], expect);
                        } else {
                            expect(result).to.eql(addedItems[i]);
                        }
                        done(err, result);
                    });
                });
            });

            updateItems.forEach(function(item, i) {
                it("should update item " + i, function(done) {
                    var payload = JSON.parse(JSON.stringify(item));
                    payload[idField] = addedItems[i][idField];
                    endpoint.update(payload, function(err, result) {
                        expect(err).to.be(null);
                        expect(result).to.be.ok();
                        done(err, result);
                    });
                });
            });

            // ensure bulk update ops if available
            if (bulkArrayUpdate.length) {
                it("should bulk update with an array", function(done) {
                    var payload = JSON.parse(JSON.stringify(bulkArrayUpdate));
                    for (var i = 0; i < payload.length; ++i) {
                        payload[i][idField] = addedItems[i][idField];
                    }
                    endpoint.bulkUpdate(payload, function(err, result) {
                        expect(err).to.be(null);
                        expect(result).to.be.ok();
                        expect(result.errors).to.be.an(Array);
                        expect(result.success).to.be.an(Array);
                        expect(result.success.length).to.eql(payload.length);
                        done();
                    });
                });
            }

            bulkQueryUpdates.forEach(function(update, idx) {
                it("should bulk update with query " + idx, function(done) {
                    var query = update.query;
                    var payload = update.payload;
                    endpoint.bulkUpdate(payload, query, function(err, result) {
                        expect(err).to.be(null);
                        expect(result).to.be.ok();
                        expect(result.errors).to.be.an(Array);
                        expect(result.success).to.be.an(Array);
                        expect(result.success.length).to.eql(addedItems.length);
                        done();
                    });
                });
            });

            // ensure delete works
            validItems.forEach(function(item, i) {
                it("should delete item " + i, function(done) {
                    var item = addedItems[i];
                    endpoint.delete(item[idField], function(err, result) {
                        expect(err).to.be(null);
                        expect(result).to.be.ok();
                        done(err, result);
                    });
                });
            });

            // ensure bulk add/delete
            if (validItems.length) {
                // add them all
                it("Should bulk add/delete", function(done) {
                    endpoint.create(validItems, { all_or_none : true },
                                    function(err, res) {
                        expect(err).to.be(null);
                        expect(res.success).to.be.an(Array);
                        expect(res.errors).to.be.an(Array);
                        expect(res.success.length).to.eql(validItems.length);
                        // bulk delete
                        var ids = res.success.map(function(added) {
                            return added[idField];
                        });
                        var query = {}; query[idField] = {
                            $in : ids
                        };
                        endpoint.bulkDelete({ q : query }, function(err, res) {
                            expect(err).to.be(null);
                            expect(res.success).to.be.an(Array);
                            expect(res.errors).to.be.an(Array);
                            expect(res.success.length).to.eql(validItems.length);
                            done();
                        });
                    });
                });
            }

            var createErrorCallback = function(done) {
                return function(err, result) {
                    expect(err).to.be.ok();
                    expect(err.error).to.be.ok();
                    expect(result).to.be(null);
                    done();
                };
            };

            // test errors
            it("Should error getting without an id", function(done) {
                endpoint.get(createErrorCallback(done));
            });
            it("Should error getting null id", function(done) {
                endpoint.get(null, createErrorCallback(done));
            });
            it("Should raise getting no args", function() {
                expect(function() {
                    endpoint.get();
                }).to.throwError();
            });
            it("Should error creating null", function(done) {
                endpoint.create(null, createErrorCallback(done));
            });
            it("Should error deleting null", function(done) {
                endpoint.delete(null, createErrorCallback(done));
            });
            it("Should error deleting an object without the id field", function(done) {
                endpoint.delete({"no" : "idfield"}, createErrorCallback(done));
            });
            it("Should error updating null", function(done) {
                endpoint.update(null, createErrorCallback(done));
            });
            it("Should error updating an object without the id field", function(done) {
                endpoint.update({"no" : "idfield"}, createErrorCallback(done));
            });
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
