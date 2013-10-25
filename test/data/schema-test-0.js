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
        "type" : "schemas",
        // The id field of the entity
        "idField" : "name",
        // valid items
        "validItems" : [
            {
                "name" : "schema1",
                "owner" : "schema_owner",
                "definition" : {
                    "requiredField" : { "type" : "String", "required" : true },
                    "uniqueNumberField" : { "type" : "Number", "unique" : true },
                    "stringField":    "String",
                    "numberField" : "Number",
                    "nestedDocument" : {
                        "nestedString" : "String",
                        "nestedBoolean" : "Boolean"
                    },
                    "anythingField" : { "type" : "Mixed" }
                }
            },
            {
                "name" : "schema2",
                "owner" : "schema_owner",
                "definition" : {
                    "stringField":    { "type" : "String", "required" : true },
                    "numberField" : "Number",
                }
            }
        ],
        "invalidItems" : [
            {
                "name" : "schema1",
                "owner" : "schema_owner",
                "definition" : {
                    "requiredField" : { "type" : "String", "required" : true },
                    "uniqueNumberField" : { "type" : "Number", "unique" : true },
                    "stringField":    "String",
                    "numberField" : "Number",
                    "nestedDocument" : {
                        "nestedString" : "String",
                        "nestedBoolean" : "Boolean"
                    },
                    "anythingField" : { "type" : "Mixed" }
                }
            },
            {
                "name" : "no_owner_schema",
                "definition" : {
                    "requiredField" : { "type" : "String", "required" : true },
                    "uniqueNumberField" : { "type" : "Number", "unique" : true },
                    "stringField":    "String",
                    "numberField" : "Number",
                    "nestedDocument" : {
                        "nestedString" : "String",
                        "nestedBoolean" : "Boolean"
                    },
                    "anythingField" : { "type" : "Mixed" }
                }
            },
            {
                "owner" : "no_name_schema",
                "definition" : {
                    "requiredField" : { "type" : "String", "required" : true },
                    "uniqueNumberField" : { "type" : "Number", "unique" : true },
                    "stringField":    "String",
                    "numberField" : "Number",
                    "nestedDocument" : {
                        "nestedString" : "String",
                        "nestedBoolean" : "Boolean"
                    },
                    "anythingField" : { "type" : "Mixed" }
                }
            },
            {
                "name" : "bad_definition_schema",
                "owner" : "owner",
                "definition" : {
                    "whats_up" : "bad_type"
                }
            }
        ]
    }

    // test env
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = test;
    } else {
        // attach to global SIS object - must include sis-js.js in browser first
        if (window && window.SIS && window.SIS.testData) {
            window.SIS.testData.push([test, 'schema-test-0'])
        }
    }

})();

