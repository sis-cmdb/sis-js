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

module.exports = {
    // The type of entity
    "entityType" : "schema1",
    // The id field of the entity
    "idField" : "_id",
    // Schema definition
    "requiredSchema" : {
        "name" : "schema1",
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
