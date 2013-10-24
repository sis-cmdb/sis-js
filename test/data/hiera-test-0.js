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
    "type" : "hiera",
    // The id field of the entity
    "idField" : "name",
    // valid items
    "validItems" : [
        {
            "name" : "hiera1",
            "hieradata" : {
                "key1" : "data1",
                "key2" : "data2"
            }
        },
        {
            "name" : "hiera2",
            "hieradata" : {
                "key3" : "data1",
                "key4" : "data2"
            }
        }
    ],
    "invalidItems" : [
        {
            "name" : "hiera1",
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
    "get_eqlfun" : function(result, full_item) {
        result.should.eql(full_item['hieradata']);
    }
}
