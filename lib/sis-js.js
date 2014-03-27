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

(function() {
    "use strict";

    var request = null;
    var wrapCallback = null;

    var wrapError = function(err) {
        return { "error" : err };
    };

    var SisApiEndpoint = function(apiBase, endpointOptions, client) {

        var idField = endpointOptions.idField;

        var getHeaders = function(addContentType) {
            var headers = {"Accept" : "application/json"};
            if (addContentType) {
                headers['Content-Type'] = 'application/json';
            }
            if (client.authToken) {
                headers['x-auth-token'] = client.authToken;
            }
            return headers;
        };

        this.listAll = function(query, callback) {
            var opts = { 'url' : apiBase,
                         'method' : 'GET',
                         'json' : true,
                         'headers' : getHeaders(false)
                       };
            if (typeof query == 'function') {
                callback = query;
                query = null;
            }
            query = query || {};
            var result = [];
            query.limit = 200;
            query.offset = 0;

            var self = this;

            var listCallback = function(err, res) {
                if (err) {
                    return callback(err, null);
                }
                if (!res.results.length) {
                    return callback(null, result);
                }
                // append
                result = result.concat(res.results);
                query.offset = result.length;
                self.list(query, listCallback);
            };

            this.list(query, listCallback);
        };

        this.list = function(query, callback) {
            var opts = { 'url' : apiBase,
                         'method' : 'GET',
                         'json' : true,
                         'headers' : getHeaders(false)
                       };
            if (typeof query == 'function') {
                callback = query;
            } else {
                opts.qs = query;
            }
            request(opts, wrapCallback(callback));
        };

        this.get = function(id, callback) {
            if (!id || typeof id === 'function') {
                if (typeof id === 'function') {
                    return id(wrapError("id is invalid"), null);
                } else {
                    if (callback) {
                        return callback(wrapError("id is invalid"), null);
                    } else {
                        throw "id is invalid";
                    }
                }
            }
            var endpoint = apiBase + '/' + id;
            var opts = { 'url' : endpoint,
                         'method' : 'GET',
                         'json' : true,
                         'headers' : getHeaders(false)
                       };
            request(opts, wrapCallback(callback));
        };

        this.create = function(obj, callback) {
            if (!obj) {
                return callback(wrapError("Object is invalid"), null);
            }
            var opts = { 'url' : apiBase,
                         'method' : 'POST',
                         'headers' : getHeaders(true),
                         'json' : obj };
            request(opts, wrapCallback(callback));
        };

        this.update = function(obj, callback) {
            if (!obj) {
                return callback(wrapError("Object is invalid"), null);
            }
            if (!(idField in obj)) {
                return callback(wrapError("Object is missing required field " + idField), null);
            }
            var endpoint = apiBase + '/' + obj[idField];
            var opts = { 'url' : endpoint,
                         'method' : 'PUT',
                         'headers' : getHeaders(true),
                         'json' : obj
                       };
            request(opts, wrapCallback(callback));
        };

        this.delete = function(obj, callback) {
            if (!obj) {
                return callback(wrapError("id is invalid"), null);
            }
            var id = obj;
            if (typeof obj === 'object') {
                if (!(idField in obj)) {
                    return callback(wrapError('Object is missing required field ' + idField), null);
                } else {
                    id = obj[idField];
                }
            }
            var endpoint = apiBase + '/' + id;
            var opts = { 'url' : endpoint,
                         'method' : 'DELETE',
                         'json' : true,
                         'headers' : getHeaders(false)
                       };
            request(opts, wrapCallback(callback));
        };

    };

    var SisClient = function(options) {

        // at least the base url is required
        if (!options || !options.url) {
            throw new TypeError("Options are invalid.  Base URL is required.");
        }
        var url = options.url;
        if (url.indexOf('http:') !== 0 &&
            url.indexOf('https:' !== 0)) {
            throw new TypeError("Base URL has an invalid protocol ");
        }

        var baseUrl = options.url;
        var entityEndpoints = { };

        var getApiEndpoint = function(endpoint) {
            if (baseUrl[baseUrl.length - 1] == '/') {
                endpoint = endpoint.substring(1);
            }
            return baseUrl + endpoint;
        };

        this.hooks = new SisApiEndpoint(getApiEndpoint('/api/v1/hooks'), { 'idField' : 'name' }, this);
        this.schemas = new SisApiEndpoint(getApiEndpoint('/api/v1/schemas'), { 'idField' : 'name'}, this);
        this.hiera = new SisApiEndpoint(getApiEndpoint('/api/v1/hiera'), { 'idField' : 'name'}, this);
        this.users = new SisApiEndpoint(getApiEndpoint('/api/v1/users'), { 'idField' : 'name'}, this);

        this.entities = function(name) {
            if (!(name in entityEndpoints)) {
                entityEndpoints[name] = new SisApiEndpoint(getApiEndpoint('/api/v1/entities/' + name), { 'idField' : '_id'}, this);
            }
            return entityEndpoints[name];
        };

        this.tokens = function(username) {
            return new SisApiEndpoint(getApiEndpoint('/api/v1/users/' + username + '/tokens'), { 'idField' : 'name'}, this);
        };


        this.authToken = options.token;

        this.authenticate = function(username, password, callback) {
            var authUrl = getApiEndpoint("/api/v1/users/auth_token");
            var opts = { 'url' : authUrl,
                         'method' : 'POST',
                         'json' : true,
                         'auth' : {
                            'user' : username,
                            'pass' : password
                         },
                         'headers' : {
                            "Accept" : "application/json",
                         }
                       };
            var self = this;
            this.authToken = null;
            request(opts, wrapCallback(function(err, token) {
                if (err) {
                    callback(err, null);
                } else {
                    self.authToken = token.name;
                    callback(null, token);
                }
            }));
        };
    };

    // determine env

    var TOTAL_COUNT_HEADER = "x-total-count";

    if (typeof module !== 'undefined' && module.exports) {
        // in Node
        request = require('request');

        wrapCallback = function(callback) {
            return function(err, response, body) {
                if (err) {
                    return callback(err, null);
                }
                if (response.statusCode >= 200 && response.statusCode < 300){
                    if (TOTAL_COUNT_HEADER in response.headers) {
                        body = {
                            results : body,
                            total_count : parseInt(response.headers[TOTAL_COUNT_HEADER], 10)
                        };
                    }
                    callback(err, body);
                } else {
                    callback(body || wrapError("The request could not be completed"), null);
                }
            };
        };

        module.exports.client = function(options) {
            return new SisClient(options);
        };
    } else {
        // assume we're in a browser
        if (!JSON || !JSON.stringify || !JSON.parse) {
            throw new TypeError("JSON library not detected.");
        }

        var sis = {};
        sis.client = function(options) {
            return new SisClient(options);
        };

        wrapCallback = function(callback) {
            // direct return since we control the XMLHttpRequest
            return callback;
        };

        // use xmlhttpreq
        // callback is returned by wrapCallback, which takes err, body
        request = function(opts, callback) {
            var xhr = new XMLHttpRequest();
            if ('withCredentials' in xhr) {
                var url = opts.url;
                if ('qs' in opts) {
                    var queries = [];
                    for (var k in opts.qs) {
                        var opt = opts.qs[k];
                        if (typeof opt !== 'string') {
                            opt = JSON.stringify(opt);
                        }
                        queries.push(k + '=' + encodeURIComponent(opt));
                    }
                    url = url + '?' + queries.join('&');
                }
                xhr.open(opts.method, url, true);
                var headers = opts.headers;
                if (headers) {
                    for (var h in headers) {
                        xhr.setRequestHeader(h, headers[h]);
                    }
                }
                if (opts.auth) {
                    var auth = opts.auth;
                    var authHeader = "Basic " + btoa(auth.user + ":" + auth.pass);
                    xhr.setRequestHeader("Authorization", authHeader);
                }
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            var res = JSON.parse(xhr.responseText);
                            if (xhr.getResponseHeader(TOTAL_COUNT_HEADER)) {
                                res = {
                                    results : res,
                                    total_count : parseInt(xhr.getResponseHeader(TOTAL_COUNT_HEADER), 10)
                                };
                            }
                            callback(null, res);
                        } else {
                            if (xhr.responseText) {
                                var err = null;
                                try {
                                    err = JSON.parse(xhr.responseText);
                                } catch (ex) {
                                    err = wrapError(xhr.responseText);
                                }
                                callback(err, null);
                            } else {
                                callback(wrapError("Error receiving response from server."), null);
                            }
                        }
                    }
                };
                if (opts.method == 'PUT' || opts.method == 'POST') {
                    xhr.send(JSON.stringify(opts.json));
                } else {
                    xhr.send();
                }
            } else {
                return callback(wrapError("CORS not supported in this environment."), null);
            }
        };

        window.SIS = sis;
    }

})();

