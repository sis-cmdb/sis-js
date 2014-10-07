# sis-js

A javascript client to talk to SIS.  Designed to work within node or modern browsers (native JSON api and XMLHttpRequest with CORS support).

# Usage

## Node

```javascript

var SIS = require('sis-js');
var SISClient = SIS.client({'url' : 'http://sis.host'});

```

The code is designed to be an npm module, but it is not a public module to install.

## Browser

```html
<script src='/path/to/sis-js.js'></script>
```

```javascript
var SISClient = SIS.client({'url' : 'http://sis.host'});
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

### Authentication / Token Support

SIS Clients must use authentication tokens for most operations.  The token can be provided in a number of ways.

* Add a `token` field to the object passed to the `SIS` function. I.E. `var client = SIS.client({'url' : 'http://sis.host', 'token' : '<token goes here>'});`
* Call `authenticate` on the `client` to authenticate via username/password and use the returned temporary token.  The following example shows the use of authenticate:

```
var SISClient = SIS.client({'url' : 'http://sis.host'});
SISClient.authenticate('user', 'password', function(err, authenticated) {
    if (err || !authenticated) {
        // authentication failed
    } else {
        // authentication succeeded and the client
        // token has been set
    }
});
```

The object returned by SISClient.hooks, SISClient.schemas, SISClient.hiera, and SISClient.entities(entity_name) all interact with the appropriate endpoints and expose the following interface:

#### list(queryOpts, callback)

This maps to a GET `/` request against the endpoint.

* queryOpts is an optional JSON object that constructs the query string.  Fields in the object include:
  * q : a json object specifying the filter
  * limit : the number of items to return
  * offset : offset into the number of objects to return

Consult the SIS documentation for further information.

An array of objects is returned to the callback on success.

#### get(id, callback)

This maps to a GET `/id` request against the endpoint.

* id : a string representing the ID of the object to receive.  For schemas, hooks, and hiera, this is the `name`.  For entities, it is the `_id`.

A single object is returned to the callback on success.

#### create(obj, callback)

This maps to a POST `/` request against the endpoint.

* obj : a valid JSON object conforming to the endpoint specification.  An array of objects implies a bulk insert operation.

The created object is returned to the callback on success.  In the case of a bulk insert, an object that looks like the following is returned:

```javascript
{
    // list of objects that look like { err : error_object, value : object_that_failed_to_insert }
    errors : [],
    // list of objects that were successfully inserted
    success : []
}

```

#### update(obj, callback)

This maps to a PUT '/:obj_id' request against the  endpoint.  The _id is used for entities, and 'name' is used for others.

* obj : a valid JSON object conforming to the endpoint specification.  Typically retrieved from `list` or `get`.

The updated object is returned to the callback on success.

#### updateById(id, obj, query, callback)

This maps to a PUT '/:id' request against the endpoint.

* id : the ID of the object.  In non entities, the name.  In entities where the schema has an `id_field`, the id or `_id`.
* obj : the payload to send
* query : update modifiers.  This would be to specify CAS operations or upserts.

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
