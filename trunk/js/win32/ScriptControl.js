
//
// ScriptControl.js
// Extension for ScriptControl
//
// Copyright (c) 2011,2014 by Ildar Shaimordanov
//

/**
 * The ScriptControl class provides an OOP interface over 
 * the standard COM object MSScriptControl.ScriptControl. 
 * It duplicates functionality of some methods of the original 
 * COM object but gives benefits in usage. 
 *
 * @example
 * function alert(msg)
 * {
 *     WScript.Echo(msg);
 * };
 * 
 * var sc = new ScriptControl('VBScript', function(e)
 * {
 *     alert(e.Source + ': ' + e.Description);
 * });
 * 
 * sc.addWScript();
 * sc.addObject('alert', alert);
 * 
 * sc.addCode([
 *     'greeting = "Hello, world!"', 
 *     'alert greeting', 
 *     'x = 1 / 0', 
 * ].join('\n'));
 *
 * @param	string	Optional, a language of a executed script. 
 * 			The default value is 'VBScript'
 * @param	function	Optional, a function used to catch run-time errors
 * 			while executing a code. 
 * @return	object
 * @see	http://msdn.microsoft.com/en-us/library/aa227430%28v=VS.60%29.aspx
 * @see	http://msdn.microsoft.com/en-us/library/aa227637%28v=VS.60%29.aspx
 */
function ScriptControl(language, catcher)
{
	this.sc = new ActiveXObject('MSScriptControl.ScriptControl');
	this.sc.Language = language || ScriptControl.defaultLanguage || 'VBScript';
	this.catcher = typeof catcher == 'function' ? catcher : null;
};

/**
 * The default language that will be used
 */
ScriptControl.defaultLanguage = 'VBScript';

(function(proto)
{
	var that = this;

	/**
	 * Makes an object available for the script programs
	 *
	 * @param	string	A name of an object
	 * @param	mixed	an object
	 * @param	boolean	A boolean flag defining how to add an object 
	 * @return	void
	 */
	proto.addObject = function(name)
	{
		var sc = this.sc;

		if ( typeof name == 'string' ) {
			sc.addObject(name, arguments[1], arguments[2] || false);
			return;
		}

		for (var i = 0; i < name.length; i++) {
			var p = name[i];
			if ( p in that ) {
				sc.AddObject(p, that[p], arguments[1] || false);
			}
		}
	};

	/**
	 * Makes the WScript object available for the script programs
	 *
	 * @param	boolean	A boolean flag defining how to add the object 
	 * @return	void
	 */
	proto.addWScript = function(addMembers)
	{
		this.addObject('WScript', WScript, addMembers);
	};

	/**
	 * Reinitializes the scripting engine
	 *
	 * @param	void
	 * @return	void
	 */
	proto.reset = function()
	{
		this.sc.reset();
	};

	/**
	 * ScriptControl.run(code[, args[, catcher]])
	 * Executes a subroutine.
	 * You can use this method to call Subroutines, in which case the 
	 * Result returned is empty and you can use the alternate calling 
	 * convention to ignore the return result. 
	 *
	 * The last argument is function that will be launched to 
	 * catch an exception and handle it. 
	 *
	 * @param	string	A name of a subroutine
	 * @param	array	A list of arguments for a subroutine
	 * @param	function	An error handler
	 * @return	void
	 */
	proto.run = function(name, args, catcher)
	{
		catcher = catcher || this.catcher;

		var sc = this.sc;

		if ( typeof catcher != 'function' ) {
			return sc.Run(name, args);
		}

		var e;
		try {
			return sc.Run(name, args);
		} catch (e) {
			catcher(sc.Error);
		}
	};

	var methods = {
		'AddCode': 'addCode', 
		'Eval': 'eval', 
		'ExecuteStatement': 'exec'
	};

	/**
	 * ScriptControl.addCode(code[, catcher])
	 * Adds a block of code of code to the ScriptControl. During this 
	 * process, the syntax of the code is checked, and the first error 
	 * found will trigger the Error event.
	 *
	 * ScriptControl.eval(expression[, catcher])
	 * Evaluates an expression. You can use this method to call both 
	 * intrinsic script functions, as well as user functions. 
	 *
	 * ScriptControl.exec(statement[, catcher])
	 * Executes a single statement. This method allows you to call any 
	 * intrinsic statement or Sub routine. You can also use it to call 
	 * functions, but the return result is dropped. 
	 *
	 * The last argument is function that will be launched to 
	 * catch an exception and handle it. 
	 *
	 * @param	string	A subroutine, expression or statement
	 * @param	function	An error handler
	 * @return	mixed
	 */
	for (var p in methods) {
		if ( ! methods.hasOwnProperty(p) ) {
			continue;
		}

		var m = methods[p];

		proto[m] = (function(p)
		{
			return function(code, catcher)
			{
				catcher = catcher || this.catcher;

				var sc = this.sc;

				if ( typeof catcher != 'function' ) {
					return sc[p](code);
				}

				var e;
				try {
					return sc[p](code);
				} catch (e) {
					catcher(sc.Error);
				}
			};
		})(p);
	}

})(ScriptControl.prototype);

