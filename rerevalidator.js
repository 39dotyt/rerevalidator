/**
 * @license Apache-2.0
 * @author 0@39.yt (Yurij Mikhalevich)
 */
var Validator = {};


/**
 * Revalidator's validate function (window.validate in browser,
 * and revalidator.validate in node.js)
 */
Validator._validate = undefined;


if (typeof(module) === 'object' && typeof(require) === 'function') {
  Validator._validate = require('revalidator').validate;
} else {
  Validator._validate = window.validate;
}


/**
 * Created filters
 * @type {{}}
 */
Validator.filters = {};


/**
 * @param {string|Object} entity
 * @param {Object} entry
 * @return {Object}
 */
Validator.validate = function(entity, entry) {
  var legend;
  if (typeof entity === 'string') {
    legend = Validator.filters[entity];
  } else {
    legend = entity;
  }
  if (!legend) {
    return {
      valid: false,
      errors: [{message: 'invalid entity type'}]
    };
  }
  Validator.cleanObject(entry, legend);
  return Validator._validate(entry, legend);
};


/**
 * @type {{add: Function, handleRequiredAndConform: Function}}
 */
Validator.types = {
  /**
   * Adds type with name and description to types
   * If type with name already exists overrides them
   * @param {string} name Type name
   * @param {Object|Function} description Type description
   */
  add: function(name, description) {
    if (typeof name !== 'string' || ['add', 'handleRequiredAndConform']
        .indexOf(name) !== -1) {
      throw new Error('name must be string and shouldn\'t be "add" or' +
          ' "handleRequiredAndConform"');
    } else if (['function', 'object'].indexOf(typeof description) === -1) {
      throw new Error('description should be function or object');
    } else if (typeof description === 'function') {
      Validator.types[name] = description;
    } else { // if (typeof description === 'object')
      /**
       * @param {boolean=} opt_required
       * @param {Function=} opt_conform
       */
      Validator.types[name] = function(opt_required, opt_conform) {
        var newDescription = {};
        for (var property in description) {
          if (description.hasOwnProperty(property)) {
            newDescription[property] = description[property];
          }
        }
        return Validator.types.handleRequiredAndConform(
            newDescription, opt_required, opt_conform);
      };
    }
  },
  /**
   * @param {Object} description
   * @param {boolean=} opt_required
   * @param {Function=} opt_conform
   * @return {Object}
   */
  handleRequiredAndConform: function(description, opt_required, opt_conform) {
    if (opt_required instanceof Function) {
      description.conform = opt_required;
    } else {
      if (opt_required) {
        description.required = true;
      }
      if (opt_conform instanceof Function) {
        description.conform = opt_conform;
      }
    }
    return description;
  }
};


/**
 * @param {Object} entry
 * @param {Object} legend
 */
Validator.cleanObject = function(entry, legend) {
  var propertyLegend;
  if (legend.properties) {
    var property;
    for (property in entry) {
      if (!entry.hasOwnProperty(property)) {
        continue;
      }
      propertyLegend = legend.properties[property];
      if (propertyLegend == undefined) {
        delete entry[property];
      } else {
        if (propertyLegend.type instanceof Array) {
          // instructions inside that block are very dirty, implemented only
          // for SerialFilter type
          // FIXME: refactor that method to be universal
          if ((propertyLegend.type.indexOf('null') === -1 ||
              entry[property] !== null)) {
            if (propertyLegend.type.indexOf('integer') !== -1 &&
                entry[property] == +entry[property]) {
              entry[property] = +entry[property];
            } else if (propertyLegend.type.indexOf('array') !== -1 &&
                propertyLegend.items && entry[property] instanceof Array) {
              if (propertyLegend.items.type === 'object') {
                for (var k = 0; k < entry[property].length; ++k) {
                  Validator.cleanObject(entry[property][k],
                      propertyLegend.items);
                }
              } else if (propertyLegend.items.type === 'integer' ||
                  propertyLegend.items.type === 'number') {
                for (var l = 0; l < entry[property].length; ++l) {
                  if (entry[property][l] == +entry[property][l]) {
                    entry[property][l] = +entry[property][l];
                  }
                }
              }
            }
          }
        } else if ((propertyLegend.type === 'integer' ||
            propertyLegend.type === 'number') &&
            entry[property] == +entry[property]) {
          entry[property] = +entry[property];
        } else if (propertyLegend.type === 'boolean') {
          if (entry[property] === '1' || entry[property] === 1 ||
              entry[property] === 'true') {
            entry[property] = true;
          } else if (entry[property] === '0' || entry[property] === 0 ||
              entry[property] === 'false') {
            entry[property] = false;
          }
        } else if (propertyLegend.type === 'object') {
          Validator.cleanObject(entry[property], propertyLegend);
        } else if (propertyLegend.type === 'array' && propertyLegend.items &&
            entry[property] instanceof Array) {
          if (propertyLegend.items.type === 'object') {
            for (var i = 0; i < entry[property].length; ++i) {
              Validator.cleanObject(entry[property][i], propertyLegend.items);
            }
          } else if (propertyLegend.items.type === 'integer' ||
              propertyLegend.items.type === 'number') {
            for (var j = 0; j < entry[property].length; ++j) {
              if (entry[property][j] == +entry[property][j]) {
                entry[property][j] = +entry[property][j];
              }
            }
          }
        }
      }
    }
    for (property in legend.properties) {
      if (!legend.properties.hasOwnProperty(property)) {
        continue;
      }
      if (entry[property] === undefined &&
          legend.properties[property].default !== undefined) {
        entry[property] = legend.properties[property].default;
      }
    }
  }
};


/**
 * @param {number|undefined} minimum
 * @param {number|undefined} maximum
 * @param {boolean=} opt_required
 * @param {Function=} opt_conform
 */
Validator.types.add('Integer', function (minimum, maximum, opt_required,
                                         opt_conform) {
  var integer = {type: 'integer'};
  if (typeof minimum === 'number') {
    integer.minimum = minimum;
  }
  if (typeof maximum === 'number') {
    integer.maximum = maximum;
  }
  return Validator.types.handleRequiredAndConform(integer, opt_required,
      opt_conform);
});


/**
 * @param {number|undefined} minimum
 * @param {number|undefined} maximum
 * @param {boolean=} opt_required
 * @param {Function=} opt_conform
 */
Validator.types.add('Number', function (minimum, maximum, opt_required,
                                        opt_conform) {
  var number = {type: 'number'};
  if (typeof minimum === 'number') {
    number.minimum = minimum;
  }
  if (typeof maximum === 'number') {
    number.maximum = maximum;
  }
  return Validator.types.handleRequiredAndConform(number, opt_required,
      opt_conform);
});


/**
 * @param {number|undefined} length
 * @param {boolean=} required
 * @param {Function=} conform
 */
Validator.types.add('String', function (length, opt_required, opt_conform) {
  var string = {type: 'string'};
  if (typeof length === 'number') {
    string.maxLength = length;
  }
  return Validator.types.handleRequiredAndConform(string, opt_required,
      opt_conform);
});


/**
 * @param {Array} values
 * @param {boolean=} required
 * @param {Function=} conform
 */
Validator.types.add('Enum', function (values, opt_required, opt_conform) {
  if (!(values instanceof Array)) {
    throw new Error('Values should be array');
  }
  var enu = {type: 'string', enum: values};
  return Validator.types.handleRequiredAndConform(enu, opt_required,
      opt_conform);
});


Validator.types.add('Timestamp', {type: 'string', format: 'date-time'});
Validator.types.add('Text', {type: 'string'});
Validator.types.add('Boolean', {type: 'boolean'});
Validator.types.add('Email', {type: 'string', format: 'email', maxLength: 255});
Validator.types.add('PhoneNumber',
    {type: 'string', pattern: /^\+[0-9]{10,14}$/});
Validator.types.add('ObjectId', {type: 'string', pattern: /^[0-9A-z]{24}$/});
Validator.types.add('DBRef', {
  type: 'object',
  properties: {
    namespace: new Validator.types.String(50), // collection name
    oid: new Validator.types.ObjectId(true) // object id
  }
});
Validator.types.add('Lat', {type: 'number', minimum: -90, maximum: 90});
Validator.types.add('Lon',
    {type: 'number', minimum: -540, exclusiveMaximum: 540});
Validator.types.add('Point', {
  type: 'object',
  properties: {
    lat: new Validator.types.Lat(true),
    lon: new Validator.types.Lon(true)
  }
});
Validator.types.add('GeoPointCoordinate', {
  type: 'array',
  minItems: 2,
  maxItems: 2,
  items: new Validator.types.Lon(),
  conform: function (value) {
    return !(value[1] < -90 || value[1] > 90 ||
        value[0] < -540 || value[0] >= 540);
  }
});
Validator.types.add('GeoPoint', {
  type: 'object',
  properties: {
    type: new Validator.types.Enum(['Point'], true),
    coordinates: new Validator.types.GeoPointCoordinate(true)
  }
});

if (typeof(module) === 'object' && typeof(require) === 'function') {
  module.exports = Validator;
}
