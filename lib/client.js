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

    var url = require('url');
    var request = require('request');

    var wrapCallback = function(callback) {
        return function(err, response, body) {
            callback(err, body);
        }
    }

    var SisApiEndpoint = function(apiBase, endpointOptions) {

        var idField = endpointOptions['idField'];

        this.list = function(query, callback) {
            var opts = { 'url' : apiBase,
                         'method' : 'GET',
                         'json' : true };
            if (typeof query == 'function') {
                callback = query;
            } else {
                opts['qs'] = query;
            }
            request(opts, wrapCallback(callback));
        }

        this.create = function(obj, callback) {
            if (!obj) {
                return callback("Object is invalid", null);
            }
            var opts = { 'url' : apiBase,
                         'method' : 'POST',
                         'json' : obj }
            request(opts, wrapCallback(callback));
        }

        this.update = function(obj, callback) {
            if (!obj) {
                return callback("Object is invalid", null);
            }
            if (!(idField in obj)) {
                return callback("Object is missing required field " + idField, null);
            }
            var endpoint = apiBase + '/' + obj['idField'];
            var opts = { 'url' : endpoint,
                         'method' : 'PUT',
                         'json' : obj
                       };
            request(opts, wrapCallback(callback));
        }

        this.delete = function(obj, callback) {
            if (!obj) {
                return callback("id is invalid", null);
            }
            var id = obj;
            if (typeof obj === 'object') {
                if (!(idField in obj)) {
                    callback('Object is missing required field ' + idField, null);
                } else {
                    id = obj[idField];
                }
            }
            var endpoint = apiBase + '/' + obj['idField'];
            var opts = { 'url' : endpoint,
                         'method' : 'DELETE',
                         'json' : obj};
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
    };

    module.exports.create = function(options) {
        // at least the base url is required
        if (!options || !options['url']) {
            throw new TypeError("Options are invalid.  Base URL is required.");
        }
        var parsed = url.parse(options['url']);
        if (parsed.protocol != "http:" && parsed.protocol != "https:") {
            throw new TypeError("Base URL has an invalid protocol: " + parsed.protocol);
        }
        return new SisClient(options);
    }

})();

