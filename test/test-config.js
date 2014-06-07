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

    // client opts
    var config = {
        url : "http://localhost:3000/",
        user : "sistest",
        pass : "sistest"
    }

    // test env
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = config;
    } else {
        // attach to global SIS object - must include sis-js.js in browser first
        if (window && window.SIS) {
            window.SIS.testConfig = config;
        }
    }

})();

