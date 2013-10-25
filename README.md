# sis-js

A javascript client to talk to SIS.  Designed to work within node or modern browsers (native JSON api and XMLHttpRequest with CORS support).

Currently only the v1 API is supported.

# Usage

## Node

```javascript

var SIS = require('sis-js');
var SISClient = SIS({'url' : 'http://sis.host'});

```

The code is designed to be an npm module, but it is not a public module to install.

## Browser

```html
<script src='/path/to/sis-js.js'></script>
```

```javascript
var SISClient = SIS({'url' : 'http://sis.host'});
```

## Working with a SIS Client

```javascript

// Get the first page of hooks
SISClient.hooks.list(function(err, result) {
    // result is an array of hook objects
});

// Get a single schema
SISClient.schemas.list({'limit' : 1}, function(err, result) {
    // result is an array of schemas of length 1
});

// Create a hiera entry
SISClient.hiera.create({ 'name' : 'entry', 'hieradata' : { 'key1' : 'value1' }}, function(err, result) {
    // result is the created hiera entry
});

// Delete the entity of type 'entity_name' with id 'foo'
SISClient.entities('entity_name').delete('foo', function(err, result) {
    // result is a boolean indicating success
});

```

All callbacks receive an `err` as the first parameter and the result of the API call as the second.

The object returned by SISClient.hooks, SISClient.schemas, SISClient.hiera, and SISClient.entities(entity_name) all interact with the appropriate endpoints and expose the following interface:

#### list(queryOpts, callback)

This maps to a GET `/` request against the appropriate v1 endpoint.

* queryOpts is an optional JSON object that constructs the query string.  Fields in the object include:
  * q : a json object specifying the filter
  * limit : the number of items to return
  * offset : offset into the number of objects to return

Consult the SIS documentation for further information.

An array of objects is returned to the callback on success.

#### get(id, callback)

This maps to a GET `/id` request against the approprivate v1 endpoint.

* id : a string representing the ID of the object to receive.  For schemas, hooks, and hiera, this is the `name`.  For entities, it is the `_id`.

A single object is returned to the callback on success.

#### create(obj, callback)

This maps to a POST `/` request against the appropriate v1 endpoint.

* obj : a valid JSON object conforming to the endpoint specification

The created object is returned to the callback on success.

#### update(obj, callback)

This maps to a PUT '/' request against the appropriate v1 endpoint.

* obj : a valid JSON object conforming to the endpoint specification.  Typically retrieved from `list` or `get`.

The updated object is returned to the callback on success.

#### delete(obj, callback)

This maps to a DELETE '/id' request against the appropriate v1 endpoint.

* obj : either a string id or an object retrieved from `list` or `get`

`true` is returned to the callback on success.

## Testing

All tests require a test server to hit.  Ensure that it is running and that test/test-config.js points to it.

### Node

One time setup: `npm install -g mocha`

```
mocha
```

### Browser

Run `make webroot` to produce the `webroot` folder.  Then open webroot/index.html in your favorite browser.

