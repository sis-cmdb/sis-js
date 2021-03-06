
(function() {
    "use strict";

    var request = null;
    var wrapCallback = null;

    var wrapError = function(err) {
        if (typeof err == 'object') { return err; }
        return { "error" : err, status : 400 };
    };

    var Endpoint = function(apiBase, client) {

        this.getHeaders = function(addContentType) {
            var headers = {"Accept" : "application/json"};
            if (addContentType) {
                headers['Content-Type'] = 'application/json';
            }
            if (this.token) {
                headers['x-auth-token'] = this.token;
                this.token = null;
            } else if (client.authToken) {
                headers['x-auth-token'] = client.authToken;
            }
            return headers;
        };

        this.setOneTimeToken = function(token) {
            this.token = token;
            return this;
        };

        this.listAll = function(query, callback) {
            var opts = { 'url' : apiBase,
                         'method' : 'GET',
                         'json' : true,
                         'headers' : this.getHeaders(false)
                       };
            if (typeof query == 'function') {
                callback = query;
                query = null;
            }
            query = query || {};
            var result = [];
            query.limit = 10000;
            query.offset = 0;

            var self = this;

            var listCallback = function(err, res, status) {
                if (err) {
                    callback(err, null);
                    return;
                }
                // append
                result = result.concat(res.results);
                if (res.results.length < query.limit) {
                    callback(null, result);
                    return;
                }
                query.offset = result.length;
                self.list(query, listCallback);
            };

            this.list(query, listCallback);
        };

        this.list = function(query, callback) {
            var opts = { 'url' : apiBase,
                         'method' : 'GET',
                         'json' : true,
                         'headers' : this.getHeaders(false)
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
                    id(wrapError("id is invalid"), null);
                    return;
                } else {
                    if (callback) {
                        callback(wrapError("id is invalid"), null);
                        return;
                    } else {
                        throw "id is invalid";
                    }
                }
            }
            var endpoint = apiBase + '/' + id;
            var opts = { 'url' : endpoint,
                         'method' : 'GET',
                         'json' : true,
                         'headers' : this.getHeaders(false)
                       };
            request(opts, wrapCallback(callback));
        };
    };

    var CommitsEndpoint = function(itemUrl, client) {

        var commitsBase = itemUrl + '/commits';

        Endpoint.call(this, commitsBase, client);

        this.getRevisionAt = function(date, callback) {
            if (date instanceof Date) {
                date = date.getTime();
            }
            var url = itemUrl + '/revisions/' + date;
            var opts = { 'url' : endpoint,
                         'method' : 'GET',
                         'json' : true,
                         'headers' : this.getHeaders(false)
                       };
            request(opts, wrapCallback(callback));
        };

    };

    var SisApiEndpoint = function(apiBase, endpointOptions, client) {

        var idField = endpointOptions.idField;

        var getHeaders = function(addContentType) {
            return _getHeaders(addContentType, client);
        };

        Endpoint.call(this, apiBase, client);

        this.create = function(obj, query, callback) {
            if (typeof query == 'function') {
                callback = query;
                query = null;
            }
            if (!obj) {
                callback(wrapError("Object is invalid"), null);
                return;
            }
            var opts = { 'url' : apiBase,
                         'method' : 'POST',
                         'headers' : this.getHeaders(true),
                         'json' : obj };
            if (query) {
                opts.qs = query;
            }
            request(opts, wrapCallback(callback));
        };

        this.updateById = function(id, obj, query, callback) {
            if (typeof query == 'function') {
                callback = query;
                query = null;
            }
            if (!obj) {
                callback(wrapError("Object is invalid"), null);
                return;
            }
            var endpoint = apiBase + '/' + id;
            var opts = { 'url' : endpoint,
                         'method' : 'PUT',
                         'headers' : this.getHeaders(true),
                         'json' : obj
                       };
            if (query) {
                opts.qs = query;
            }
            request(opts, wrapCallback(callback));
        };

        this.update = function(obj, query, callback) {
            if (typeof query == 'function') {
                callback = query;
                query = null;
            }
            if (!obj) {
                callback(wrapError("Object is invalid"), null);
                return;
            }
            if (!(idField in obj)) {
                callback(wrapError("Object is missing required field " + idField), null);
                return;
            }
            var endpoint = apiBase + '/' + obj[idField];
            var opts = { 'url' : endpoint,
                         'method' : 'PUT',
                         'headers' : this.getHeaders(true),
                         'json' : obj
                       };
            if (query) {
                opts.qs = query;
            }
            request(opts, wrapCallback(callback));
        };

        this.bulkDelete = function(query, callback) {
            if (!query || typeof query !== 'object' ||
                !Object.keys(query).length) {
                callback(wrapError("Query cannot be empty"), null);
                return;
            }
            var endpoint = apiBase;
            var opts = { 'url' : endpoint,
                         'method' : 'DELETE',
                         'json' : true,
                         'headers' : this.getHeaders(false),
                         'qs' : query
                       };
            request(opts, wrapCallback(callback));
        };

        this.bulkUpdate = function(payload, query, callback) {
            if (Array.isArray(payload)) {
                if (typeof query === 'function') {
                    callback = query;
                    query = null;
                }
            } else if (!query || typeof query !== "object" ||
                       !Object.keys(query).length) {
                callback(wrapError("Invalid query specified"), null);
                return;
            }
            var endpoint = apiBase;
            var opts = {
                url: endpoint,
                method: 'PUT',
                json: payload,
                headers: this.getHeaders(true)
            };
            if (query) {
                opts.qs = query;
            }
            request(opts, wrapCallback(callback));
        };

        this.remove = function(obj, callback) {
            if (!obj) {
                callback(wrapError("id is invalid"), null);
                return;
            }
            var id = obj;
            if (typeof obj === 'object') {
                if (!(idField in obj)) {
                    callback(wrapError('Object is missing required field ' + idField), null);
                    return;
                } else {
                    id = obj[idField];
                }
            }
            var endpoint = apiBase + '/' + id;
            var opts = { 'url' : endpoint,
                         'method' : 'DELETE',
                         'json' : true,
                         'headers' : this.getHeaders(false)
                       };
            request(opts, wrapCallback(callback));
        };

        this['delete'] = this.remove;

        this.commits = function(id) {
            return new CommitsEndpoint(apiBase + '/' + id, client);
        };

    };

    var SisClient = function(options) {

        // at least the base url is required
        if (!options || !options.url) {
            throw new TypeError("Options are invalid.  Base URL is required.");
        }
        var url = options.url;
        if (url.indexOf('http:') !== 0 &&
            url.indexOf('https:') !== 0) {
            throw new TypeError("Base URL has an invalid protocol ");
        }

        var baseUrl = options.url;
        if (baseUrl[baseUrl.length - 1] === '/') {
            // remove trailing slash
            baseUrl = baseUrl.slice(0, -1);
        }
        var version = options.version || 'v1.1';
        var entityEndpoints = { };

        var getApiEndpoint = function(endpoint) {
            // return url/api/version/endpoint
            return [baseUrl, 'api', version, endpoint].join('/');
        };

        this.hooks = new SisApiEndpoint(getApiEndpoint('hooks'), { 'idField' : 'name' }, this);
        this.schemas = new SisApiEndpoint(getApiEndpoint('schemas'), { 'idField' : 'name'}, this);
        this.scripts = new SisApiEndpoint(getApiEndpoint('scripts'), { 'idField' : 'name'}, this);
        this.hiera = new SisApiEndpoint(getApiEndpoint('hiera'), { 'idField' : 'name'}, this);
        this.users = new SisApiEndpoint(getApiEndpoint('users'), { 'idField' : 'name'}, this);

        this.entities = function(name) {
            if (!(name in entityEndpoints)) {
                entityEndpoints[name] = new SisApiEndpoint(getApiEndpoint('entities/' + name), { 'idField' : '_id' }, this);
            }
            return entityEndpoints[name];
        };

        this.tokens = function(username) {
            return new SisApiEndpoint(getApiEndpoint('users/' + username + '/tokens'), { 'idField' : 'name'}, this);
        };


        this.authToken = options.token;

        this.authenticate = function(username, password, callback) {
            var authUrl = getApiEndpoint("users/auth_token");
            var opts = { 'url' : authUrl,
                         'method' : 'POST',
                         'json' : true,
                         'auth' : {
                            'user' : username,
                            'pass' : password
                         },
                         'headers' : {
                            "Accept" : "application/json"
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
        var requestLib = require('request');

        request = function(opts, callback) {
            if (opts.qs) {
                // ensure each object value is converted to a string
                var clone = { };
                var qs = opts.qs;
                for (var k in qs) {
                    if (typeof qs[k] === 'object') {
                        clone[k] = JSON.stringify(qs[k]);
                    } else {
                        clone[k] = qs[k];
                    }
                }
                opts.qs = clone;
            }
            requestLib(opts, callback);
        };

        wrapCallback = function(callback) {
            return function(err, response, body) {
                if (err) {
                    err = wrapError(err);
                    err.status = response ? response.statusCode : 400;
                    callback(err, null);
                    return;
                }
                if (response.statusCode >= 200 && response.statusCode < 300){
                    if (TOTAL_COUNT_HEADER in response.headers) {
                        body = {
                            results : body,
                            total_count : parseInt(response.headers[TOTAL_COUNT_HEADER], 10)
                        };
                    }
                    callback(null, body);
                } else {
                    err = body || wrapError("The request could not be completed");
                    err.status = response.statusCode;
                    callback(err, null);
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
                            var err = null;
                            if (xhr.responseText) {
                                try {
                                    err = JSON.parse(xhr.responseText);
                                } catch (ex) {
                                    err = wrapError(xhr.responseText);
                                }
                                err.status = xhr.status;
                                callback(err, null);
                            } else {
                                err = wrapError("Error receiving response from server.");
                                err.status = xhr.status;
                                callback(err, null);
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
                var err = wrapError("CORS not supported in this environment.");
                callback(err, null);
            }
        };

        window.SIS = sis;
    }

})();
