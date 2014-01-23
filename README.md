# rerevalidator

Handy wrapper around [revalidator](https://github.com/flatiron/revalidator) and
simple validation schemas serve method (more not needed to put revalidator and
validation schemas in ./public).

It also performs data types conversions (for example, if you specified some
field as 'integer' in your schema and pass object with string '123' in it, after
validation passed object will contain number '123' instead of string in that
field). It works with arrays too.

You can install rerevalidator through npm:
```sh
npm install rerevalidator
```

**You should feel free to improve that documentation (so for sources) and suggest
me a pull request.**

## wrapper

You can access wrapper through:
```javascript
require('rerevalidator').validator;
```

This object has fields:
* filters - is an object, which stores entity filters in format:
{entityName{string}: revalidatorSchema{object}};
* validate(entity, entry) - function, which performs validation of entry object
with specified schema (entity may be schema name, early specified in filters or
schema object), returns result of standard revalidator's validate() call;
* types – object, which stores types constructors in format:
{typeName{string}: typeConstructor{function}};
* types.add(name, description) - method, which adds new types, name should be
string, description may be object (in revalidator format) or function (type
constructor); if you pass an object to this function, new construct will accept
only two optional arguments: opt_required{boolean} and opt_conform{Function}.

### default types

```javascript
/**
 * @param {number|undefined} minimum
 * @param {number|undefined} maximum
 * @param {boolean=} opt_required
 * @param {Function=} opt_conform
 */
types.Integer(minimum, maximum, opt_required, opt_conform);

/**
 * @param {number|undefined} minimum
 * @param {number|undefined} maximum
 * @param {boolean=} opt_required
 * @param {Function=} opt_conform
 */
types.Number(minimum, maximum, opt_required, opt_conform);

/**
 * @param {number|undefined} length
 * @param {boolean=} required
 * @param {Function=} conform
 */
types.String(length, opt_required, opt_conform);

/**
 * @param {Array} values
 * @param {boolean=} required
 * @param {Function=} conform
 */
types.Enum(values, opt_required, opt_conform);

types.Timestamp(opt_required, opt_conform);
types.Text(opt_required, opt_conform);
types.Boolean(opt_required, opt_conform);
types.Email(opt_required, opt_conform);
types.PhoneNumber(opt_required, opt_conform);
types.ObjectId(opt_required, opt_conform);
types.DBRef(opt_required, opt_conform);
types.Lat(opt_required, opt_conform);
types.Lon(opt_required, opt_conform);
types.Point(opt_required, opt_conform);
types.GeoPointCoordinate(opt_required, opt_conform);
types.GeoPoint(opt_required, opt_conform);
```

## server

If you needed to use same rerevalidator schemes on client you may simply
serve rerevalidator and schemes to client by calling:
```javascript
require('rerevalidator').serve(pathToSchemesScript, server);
```

You should manually implement check, where you schemes script is executed (in
browser or by node), you may do this by calling typeof(window) – look in
revalidator or rerevalidator sources for example.

In browser you can access rerevalidator as Validator object.

Server is any node.js http server.

After you should manually call server.listen to start it.

For more detailed documentation use sources.
