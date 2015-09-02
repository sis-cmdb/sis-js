(function() {
    'use strict';

    var test = {
        // The type of entity
        "type" : "hiera",
        // The id field of the entity
        "idField" : "name",
        // valid items
        "validItems" : [
            {
                "name" : "hiera1",
                _sis : { "owner" : ["sisjs"] },
                "hieradata" : {
                    "key1" : "data1",
                    "key2" : "data2"
                }
            },
            {
                "name" : "hiera2",
                _sis : { "owner" : ["sisjs"] },
                "hieradata" : {
                    "key3" : "data1",
                    "key4" : "data2"
                }
            }
        ],
        "invalidItems" : [
            {
                "name" : "hiera1",
                _sis : { "owner" : ["sisjs"] },
                "hieradata" : {
                    "key3" : "data1",
                    "key4" : "data2"
                }
            },
            {
                "name" : "hiera3",
                "hieradata" : {
                    "key3" : "data1",
                    "key4" : "data2"
                }
            },
            {
                "name" : "hiera_no_data"
            },
            {
                "name" : "hiera_empty_data",
                "hieradata" : { }
            },
            {
                "hieradata" : { "no" : "name" }
            }
        ],
        "get_eqlfun" : function(result, full_item, expect) {
            var item = {};
            item[full_item.name] = full_item.hieradata;
            expect(result).to.eql(item);
        }
    };

    // test env
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = test;
    } else {
        // attach to global SIS object - must include sis-js.js in browser first
        if (window && window.SIS && window.SIS.testData) {
            window.SIS.testData.push([test, 'hiera-test-0']);
        }
    }

})();
