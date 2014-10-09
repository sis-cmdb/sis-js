(function() {
    'use strict';
    var test = {
        // The type of entity
        "type" : "hooks",
        // The id field of the entity
        "idField" : "name",
        // valid items
        "validItems" : [
            {
                "name" : "hook1",
                "entity_type" : "some_entity",
                "owner" : "hook_owner",
                "target" : {
                    "action" : "POST",
                    "url" : "http://my.hook.endpoint/endpoint"
                },
                "events" : ["update", "insert"]
            },
            {
                "name" : "hook2",
                "entity_type" : "some_other_entity",
                "owner" : "hook_owner",
                "target" : {
                    "action" : "PUT",
                    "url" : "http://my.hook.endpoint/endpoint"
                },
                "events" : ["insert"]
            }
        ],
        "invalidItems" : [
            {
                "name" : "hook3",
                "entity_type" : "random",
                "events" : ["update"]
            },
            {
                "name" : "hook2",
                "entity_type" : "some_other_entity",
                "owner" : "hook_owner",
                "target" : {
                    "action" : "PUT",
                    "url" : "http://my.hook.endpoint/endpoint"
                },
                "events" : ["insert"]
            }
        ]
    };

    // test env
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = test;
    } else {
        // attach to global SIS object - must include sis-js.js in browser first
        if (window && window.SIS && window.SIS.testData) {
            window.SIS.testData.push([test, 'hook-test-0']);
        }
    }

})();
