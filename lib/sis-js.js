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

    var request = null;
    var wrapCallback = null;

    var wrapError = function(err) {
        return { "error" : err };
    }

    var SisApiEndpoint = function(apiBase, endpointOptions) {

        var idField = endpointOptions['idField'];

        this.list = function(query, callback) {
            var opts = { 'url' : apiBase,
                         'method' : 'GET',
                         'headers' : {'Content-Type' : 'application/json'},
                         'json' : true
                       };
            if (typeof query == 'function') {
                callback = query;
            } else {
                opts['qs'] = query;
            }
            request(opts, wrapCallback(callback));
        }

        this.get = function(id, callback) {
            if (!id || typeof id === 'function') {
                return callback("id is invalid", null);
            }
            var endpoint = apiBase + '/' + id;
            var opts = { 'url' : endpoint,
                         'method' : 'GET',
                         'headers' : {'Content-Type' : 'application/json'},
                         'json' : true
                       };
            request(opts, wrapCallback(callback));
        }

        this.create = function(obj, callback) {
            if (!obj) {
                return callback(wrapError("Object is invalid"), null);
            }
            var opts = { 'url' : apiBase,
                         'method' : 'POST',
                         'json' : obj }
            request(opts, wrapCallback(callback));
        }

        this.update = function(obj, callback) {
            if (!obj) {
                return callback(wrapError("Object is invalid"), null);
            }// after(function(done) {
            //     client.schemas.delete(data['requiredSchema'], done);
            // });
            if (!(idField in obj)) {
                return callback(wrapError("Object is missing required field " + idField), null);
            }
            var endpoint = apiBase + '/' + obj[idField];
            var opts = { 'url' : endpoint,
                         'method' : 'PUT',
                         'json' : obj
                       };
            request(opts, wrapCallback(callback));
        }

        this.delete = function(obj, callback) {
            if (!obj) {
                return callback(wrapError("id is invalid"), null);
            }
            var id = obj;
            if (typeof obj === 'object') {
                if (!(idField in obj)) {
                    callback(wrapError('Object is missing required field ' + idField), null);
                } else {
                    id = obj[idField];
                }
            }
            var endpoint = apiBase + '/' + id;
            var opts = { 'url' : endpoint,
                         'method' : 'DELETE',
                         'headers' : {'Content-Type' : 'application/json'},
                         'json' : true
                       };
            request(opts, wrapCallback(callback));
        }

    }

    var SisClient = function(options) {

        var baseUrl = options['url'];
        var entityEndpoints = { };

        var getApiEndpoint = function(endpoint) {
            if (baseUrl[baseUrl.length - 1] == '/') {
                endpoint = endpoint.substring(1);
            }
            return baseUrl + endpoint;
        }

        this.hooks = new SisApiEndpoint(getApiEndpoint('/api/v1/hooks'), { 'idField' : 'name' });
        this.schemas = new SisApiEndpoint(getApiEndpoint('/api/v1/schemas'), { 'idField' : 'name'});
        this.hiera = new SisApiEndpoint(getApiEndpoint('/api/v1/hiera'), { 'idField' : 'name'});

        this.entities = function(name) {
            if (!(name in entityEndpoints)) {
                entityEndpoints[name] = new SisApiEndpoint(getApiEndpoint('/api/v1/entities/' + name), { 'idField' : '_id'});
            }
            return entityEndpoints[name];
        }

        var init = function() {
            // at least the base url is required
            if (!options || !options['url']) {
                throw new TypeError("Options are invalid.  Base URL is required.");
            }
            var url = options['url'];
            if (url.indexOf('http:') != 0 &&
                url.indexOf('https:' != 0)) {
                throw new TypeError("Base URL has an invalid protocol: " + parsed.protocol);
            }
        }
    };

    // determine env
    if (typeof module !== 'undefined' && module.exports) {
        // in Node
        request = require('request');

        wrapCallback = function(callback) {
            return function(err, response, body) {
                if (err) {
                    // console.log("0" + err)
                    return callback(err, null);
                }
                if (response.statusCode >= 200 && response.statusCode < 300){
                    callback(err, body);
                } else {
                    callback(body || wrapError("The request could not be completed"), null);
                }
            }
        }

        module.exports.client = function(options) {
            return new SisClient(options);
        }
    } else {
        // assume we're in a browser
        if (!JSON || !JSON.stringify || !JSON.parse) {
            throw new TypeError("JSON library not detected.");
        }

        var sis = {};
        sis.client = function(options) {
            return new SisClient(options);
        }

        wrapCallback = function(callback) {
            // direct return since we control the XMLHttpRequest
            return callback;
        }

        // use xmlhttpreq
        // callback is returned by wrapCallback, which takes err, body
        request = function(opts, callback) {
            var xhr = new XMLHttpRequest();
            if ('withCredentials' in xhr) {
                var url = opts['url'];
                if ('qs' in opts) {
                    var queries = [];
                    for (var k in opts['qs']) {
                        queries.push(k + '=' + encodeURIComponent(JSON.stringify(opts['qs'][k])));
                    }
                    url = url + '?' + queries.join('&');
                }
                xhr.open(opts['method'], opts['url'], true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            var res = JSON.parse(xhr.responseText);
                            callback(null, res);
                        } else {
                            if (xhr.responseText) {
                                callback(JSON.parse(xhr.responseText), null);
                            } else {
                                callback(wrapError("Error receiving response from server."), null)
                            }
                        }
                    }
                };
                if (opts['method'] == 'PUT' || opts['method'] == 'POST') {
                    xhr.send(JSON.stringify(opts['json']));
                } else {
                    xhr.send();
                }
            } else {
                return callback(wrapError("CORS not supported in this environment."), null);
            }
        }

        window.SIS = sis;
    }

})();

