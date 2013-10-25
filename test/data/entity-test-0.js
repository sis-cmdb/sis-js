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
    var test = {
        // The type of entity
        "entityType" : "entity_test",
        // The id field of the entity
        "idField" : "_id",
        // Schema definition
        "requiredSchema" : {
            "name" : "entity_test",
            "owner" : "schema_owner",
            "definition" : {
                "name" : { "type" : "String", "required" : true, "unique" : true },
                "number" : { "type" : "Number", "unique" : true, "required" : true },
            }
        },
        // valid items
        "validItems" : [
            {
                "name" : "entity1",
                "number" : 0,
            },
            {
                "name" : "entity2",
                "number" : 1,
            },
            {
                "name" : "entity3",
                "number" : 2,
            }
        ],
        "invalidItems" : [
            {
                "foo" : "bar"
            },
            {
                "name" : "entity1",
                "number" : 4
            },
            {
                "name" : "non_unique_num",
                "number" : 0
            }
        ]
    }

    // test env
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = test;
    } else {
        // attach to global SIS object - must include sis-js.js in browser first
        if (window && window.SIS && window.SIS.testData) {
            window.SIS.testData.push([test, 'entity-test-0']);
        }
    }

})();
