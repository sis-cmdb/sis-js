(function() {
    'use strict';
    // client opts
    var config = {
        url : "http://localhost:3000/",
        user : "sistest",
        pass : "sistest"
    };

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
