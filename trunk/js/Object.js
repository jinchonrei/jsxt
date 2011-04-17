//
// JavaScript unit
// Add-on for the object manipulation
//
// Copyright (c) 2009, 2010, 2011 by Ildar Shaimordanov
//

if ( ! Object.isa ) {

/**
 * Evaluates the value is defined and has constructor
 *
 * @param	mixed	value
 * @param	mixed	constructor
 * @return	boolean
 * @access	static
 */
Object.isa = function(value, constructor)
{
	return value !== (void 0) && value !== null && value.constructor == constructor;
};

}

if ( ! Object.isArray ) {

/**
 * Evaluates the value as Array
 *
 * @param	mixed	value
 * @return	boolean
 * @access	static
 */
Object.isArray = function(value)
{
	return Object.isa(value, Array);
//	return value !== undefined && value !== null && value.constructor == Array;
};

}

if ( ! Object.isBoolean ) {

/**
 * Evaluates the value as Boolean
 *
 * @param	mixed	value
 * @return	boolean
 * @access	static
 */
Object.isBoolean = function(value)
{
	return Object.isa(value, Boolean);
//	return value !== undefined && value !== null && value.constructor == Boolean;
};

}

if ( ! Object.isEmpty ) {

/**
 * Evaluates the value as Empty
 * The empty value is as follow:
 * - Undefined
 * - Null
 * - Boolean == false
 * - String == ''
 * - Number == +0, -0 or NaN
 *
 * @param	mixed	value
 * @return	boolean
 * @access	static
 */
Object.isEmpty = function(value)
{
	return ! Boolean(value);
};

}

if ( ! Object.isFunction ) {

/**
 * Evaluates the value as Function
 *
 * @param	mixed	value
 * @return	boolean
 * @access	static
 */
Object.isFunction = function(value)
{
	return Object.isa(value, Function);
//	return value !== undefined && value !== null && value.constructor == Function;
};

}

if ( ! Object.isIndefinite ) {

/**
 * Evaluates the value as Undefined or Null
 *
 * @param	mixed	value
 * @return	boolean
 * @access	static
 */
Object.isIndefinite = function(value)
{
	return Object.isUndefined(value) || Object.isNull(value);
//	return value === undefined || value === null;
};

}

if ( ! Object.isNull ) {

/**
 * Evaluates the value as Null
 *
 * @param	mixed	value
 * @return	boolean
 * @access	static
 */
Object.isNull = function(value)
{
	return value === null;
};

}

if ( ! Object.isNumber ) {

/**
 * Evaluates the value as Number
 *
 * @param	mixed	value
 * @return	boolean
 * @access	static
 */
Object.isNumber = function(value)
{
	return Object.isa(value, Number);
//	return value !== undefined && value !== null && value.constructor == Number;
};

}

if ( ! Object.isObject ) {

/**
 * Evaluates the value as Object
 *
 * @param	mixed	value
 * @return	boolean
 * @access	static
 */
Object.isObject = function(value)
{
	return Object.isa(value, Object);
//	return value !== undefined && value !== null && value.constructor == Object;
};

}

if ( ! Object.isRegExp ) {

/**
 * Evaluates the value as RegExp
 *
 * @param	mixed	value
 * @return	boolean
 * @access	static
 */
Object.isRegExp = function(value)
{
	return Object.isa(value, RegExp);
//	return value !== undefined && value !== null && value.constructor == RegExp;
};

}

if ( ! Object.isString ) {

/**
 * Evaluates the value as String
 *
 * @param	mixed	value
 * @return	boolean
 * @access	static
 */
Object.isString = function(value)
{
	return Object.isa(value, String);
//	return value !== undefined && value !== null && value.constructor == String;
};

}

if ( ! Object.isUndefined ) {

/**
 * Evaluates the value as Undefined
 *
 * @param	mixed	value
 * @return	boolean
 * @access	static
 */
Object.isUndefined = function(value)
{
	return value === void 0;
};

}

/**
 * Executes a provided function once per object element.
 *
 * @Description
 * forItems executes the provided function (callback) once for each element 
 * present in the object. 
 * 
 * callback is invoked with three arguments: 
 * - the value of the elemeent, 
 * - the key of the element, 
 * - and the Object being traversed.
 * 
 * If a thisObject parameter is provided to forItems, it will be used as the 
 * this for each invocation of the callback. If it is not provided, or is 
 * null, the global object associated with callback is used instead. 
 * 
 * forItems does not mutate the object on which it is called. 
 *
 * This method is the same as forEach for Array but for Object. 
 * 
 * skipFunction=true tells to exclude methods from the result.
 * By default, all properties are iterated (including methods too). 
 *
 * @param	Callback
 * @param	Boolean
 * @return	void
 * @access	public
 * @see		http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:forEach
 */
Object.forItems = function(object, fun, skipFunction, thisp)
{
	if ( typeof fun != "function" ) {
		throw new TypeError();
	}

	for (var p in object) {
		if ( ! object.hasOwnProperty(p) ) {
			continue;
		}
		if ( skipFunction && 'function' == typeof object[p] ) {
			continue;
		}
		fun.call(thisp, object[p], p, object);
	}
};

/**
 * Populates and returns array of the object's keys
 * skipFunction=true tells to exclude methods from the result.
 * By default, all properties are iterated (including methods too). 
 *
 * @param	Boolean
 * @return	Array
 * @access	public
 */
Object.keys = function(object, skipFunction)
{
	var result = [];

	for (var p in object) {
		if ( ! object.hasOwnProperty(p) ) {
			continue;
		}
		if ( skipFunction && 'function' == typeof object[p] ) {
			continue;
		}
		result.push(p);
	}

	return result;
};

/**
 * Populates and returns array of the object's values.
 * skipFunction=true tells to exclude methods from the result.
 * By default, all properties are iterated (including methods too). 
 *
 * @param	Boolean
 * @return	Array
 * @access	public
 */
Object.values = function(object, skipFunction)
{
	var result = [];

	for (var p in object) {
		if ( ! object.hasOwnProperty(p) ) {
			continue;
		}
		if ( skipFunction && 'function' == typeof object[p] ) {
			continue;
		}
		result.push(object[p]);
	}

	return result;
};

/**
 * Converts an object to an array.
 *
 * @Description
 * toArray executes the provided function (callback) once for each element 
 * present in the object. callback is invoked for each element of the array 
 * and return new item to be inserted into the array. 
 * 
 * callback is invoked with three arguments: 
 * - the value of the element, 
 * - the key of the element, 
 * - and the Object object being traversed.
 * 
 * skipFunction=true tells to exclude methods from the result.
 * By default, all properties are iterated (including methods too). 
 *
 * If a thisObject parameter is provided to toArray, it will be used as the 
 * this for each invocation of the callback. If it is not provided, or is 
 * null, the global object associated with callback is used instead. 
 * 
 * If a thisObject parameter is provided to toArray, it will be used as the 
 * this for each invocation of the callback. If it is not provided, or is 
 * null, the global object associated with callback is used instead. 
 * 
 * @param	Callback
 * @param	Boolean
 * @return	void
 * @access	public
 */
Object.toArray = function(object, fun, skipFunction, thisp)
{
	if ( typeof fun != "function" ) {
		throw new TypeError();
	}

	var result = [];

	for (var p in object) {
		if ( ! object.hasOwnProperty(p) ) {
			continue;
		}
		if ( skipFunction && 'function' == typeof object[p] ) {
			continue;
		}
		result.push(fun.call(thisp, object[p], p, object));
	}

	return result;
};

/**
 * Creating a copy of an object with fully replicated properties. 
 * Each property of an object will be copied recursively
 *
 * @param	Mixed
 * @result	Mixed
 *
 * @author	Ildar Shaimordanov (the common idea of 'clonning')
 */
Object.clone = function(object)
{
	if ( ! object || typeof(object) != "object" ) {
		return object;
	}
	var newObject = new object.constructor();
	for (var p in object) {
		newObject[p] = arguments.callee(object[p]);
	}
	return newObject;
};

/**
 * Object.dump(object)
 *
 * @Description
 * Creates a dump of any object. 
 * The second arguments provides options affecting on the result. 
 * Options are:
 * -- nesting - defines the deep of nesting (default is 3)
 * -- padding - defines initial value of padding
 * -- walkFunction - (0 - do not show function, 1 - show [Function] string, 2 - show a details)
 * -- walkPrototype - (0 - do not show properties from prototype, 1 - show then) 
 *
 * @param	Mixed
 * @param	Mixed
 * @return	String
 * @access	Static
 */
Object.dump = function(object, options)
{
	options = options || {};
	options.padding = options.padding || '';
	if ( isNaN(options.nesting) || options.nesting <= 0 ) {
		options.nesting = 5;
	}

	switch ( typeof object ) {
	case 'object':
		if ( object === null ) {
			return String(object);
		}

		if ( ! options.nesting ) {
			return '*** TOO MANY NESTIONS ***\n';
		}

		var pred;
		var post;

		if ( object.constructor == Array ) {
			pred = 'Array(' + object.length + ') [\n';
			post = options.padding + ']';
		} else {
			pred = 'Object {\n';
			post = options.padding + '}';
		}

		var padding = options.padding + '    ';
		var opts = {
			nesting: options.nesting - 1, 
			padding: padding, 
			walkFunction: options.walkFunction, 
			walkPrototype: options.walkPrototype
		};

		var result = [];
		for (var value in object) {
			if ( ! object.hasOwnProperty(value) && ! options.walkPrototype ) {
				continue;
			}
			var s = arguments.callee(object[value], opts);
			if ( s === '' ) {
				// Sure that any property will return non-empty string
				// Only functions can return an empty string with walkFunction == 0
				continue;
			}
			result.push(padding + value + ': ' + s + '\n');
		}
		return pred + result.join('') + post;

	case 'string':
		return '[' + object.length + ']: \"' + object
//			.replace(/&/g, '&amp;')
//			.replace(/["<>\r\n\t\x00-\x1F]/g, function($0)
//			{
//				return Object.dump.entities[$0] || ('\\' + $0.charCodeAt(0).toString(8));
//			})
			+ '\"';

	case 'function':
		if ( options.walkFunction == 1 ) {
			return '[Function]';
		}
		if ( options.walkFunction > 1 ) {
			return object.toString();
		}
		return '';

	default:
		return String(object);
	}
};

Object.dump.entities = {
	'"': '&quot;', 
	'<': '&lt;', 
	'>': '&gt;', 
	'\\': '\\\\', 
	'\r': '\\r', 
	'\n': '\\n', 
	'\t': '\\t'
};

