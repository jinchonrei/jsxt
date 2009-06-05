//
// JScript add-on
//
// @require	Ajax.js
//
// @copyright	Copyright (c) 2009 by Ildar Shaimordanov
//

/*

 JS Beautifier
---------------


  Written by Einar Lielmanis, <einars@gmail.com>
      http://jsbeautifier.org/

  Originally converted to javascript by Vital, <vital76@gmail.com>

  You are free to use this in any way you want, in case you find this useful or working for you.

  Usage:
    js_beautify(js_source_text);
    js_beautify(js_source_text, options);

  The options are:
    indent_size (default 4) — indentation size,
    indent_char (default space) — character to indent with,
    preserve_newlines (default true) — whether existing line breaks should be preserved,
    indent_level (default 0)  — initial indentation level, you probably won't need this ever,

    e.g

    js_beautify(js_source_text, {indent_size: 1, indent_char: '\t'});


*/


/*

Updates:

2009/04/29	s/js_beautify/jsbeautify/g

*/

eval.beautify = function(js_source_text, options)
{

    var input, output, token_text, last_type, last_text, last_word, current_mode, modes, indent_string;
    var whitespace, wordchar, punct, parser_pos, line_starters, in_case;
    var prefix, token_type, do_block_just_closed, var_line, var_line_tainted, if_line_flag;
    var indent_level;


    var options               = options || {};
    var opt_indent_size       = options['indent_size'] || 4;
    var opt_indent_char       = options['indent_char'] || ' ';
    var opt_preserve_newlines =
        typeof options['preserve_newlines'] === 'undefined' ? true : options['preserve_newlines'];
    var opt_indent_level      = options['indent_level'] || 0; // starting indentation


    function trim_output()
    {
        while (output.length && (output[output.length - 1] === ' ' || output[output.length - 1] === indent_string)) {
            output.pop();
        }
    };

    function print_newline(ignore_repeated)
    {

        ignore_repeated = typeof ignore_repeated === 'undefined' ? true: ignore_repeated;

        if_line_flag = false;
        trim_output();

        if (!output.length) {
            return; // no newline on start of file
        }

        if (output[output.length - 1] !== "\n" || !ignore_repeated) {
            output.push("\n");
        }
        for (var i = 0; i < indent_level; i++) {
            output.push(indent_string);
        }
    };



    function print_space()
    {
        var last_output = ' ';
        if (output.length) {
            last_output = output[output.length - 1]
        }
        if (last_output !== ' ' && last_output !== '\n' && last_output !== indent_string) { // prevent occassional duplicate space
            output.push(' ');
        }
    };


    function print_token()
    {
        output.push(token_text);
    };

    function indent()
    {
        indent_level++;
    };


    function unindent()
    {
        if (indent_level) {
            indent_level--;
        }
    };


    function remove_indent()
    {
        if (output.length && output[output.length - 1] === indent_string) {
            output.pop();
        }
    };


    function set_mode(mode)
    {
        modes.push(current_mode);
        current_mode = mode;
    };


    function restore_mode()
    {
        do_block_just_closed = current_mode === 'DO_BLOCK';
        current_mode = modes.pop();
    };


    function in_array(what, arr)
    {
        for (var i = 0; i < arr.length; i++)
        {
            if (arr[i] === what) {
                return true;
            }
        }
        return false;
    };



    function get_next_token()
    {
        var n_newlines = 0;

        if (parser_pos >= input.length) {
            return ['', 'TK_EOF'];
        }

        var c = input.charAt(parser_pos);
        parser_pos += 1;

        while (in_array(c, whitespace)) {
            if (parser_pos >= input.length) {
                return ['', 'TK_EOF'];
            }

            if (c === "\n") {
                n_newlines += 1;
            }

            c = input.charAt(parser_pos);
            parser_pos += 1;

        }

        var wanted_newline = false;

        if (opt_preserve_newlines) {
            if (n_newlines > 1) {
                for (var i = 0; i < 2; i++) {
                    print_newline(i === 0);
                }
            }
            wanted_newline = (n_newlines === 1);
        }


        if (in_array(c, wordchar)) {
            if (parser_pos < input.length) {
                while (in_array(input.charAt(parser_pos), wordchar)) {
                    c += input.charAt(parser_pos);
                    parser_pos += 1;
                    if (parser_pos === input.length) {
                        break;
                    }
                }
            }

            // small and surprisingly unugly hack for 1E-10 representation
            if (parser_pos !== input.length && c.match(/^[0-9]+[Ee]$/) && (input.charAt(parser_pos) === '-' || input.charAt(parser_pos) === '+')) {

                var sign = input.charAt(parser_pos);
                parser_pos += 1;

                var t = get_next_token(parser_pos);
                c += sign + t[0];
                return [c, 'TK_WORD'];
            }

            if (c === 'in') { // hack for 'in' operator
                return [c, 'TK_OPERATOR'];
            }
            if (wanted_newline && last_type !== 'TK_OPERATOR' && !if_line_flag) {
                print_newline();
            }
            return [c, 'TK_WORD'];
        }

        if (c === '(' || c === '[') {
            return [c, 'TK_START_EXPR'];
        }

        if (c === ')' || c === ']') {
            return [c, 'TK_END_EXPR'];
        }

        if (c === '{') {
            return [c, 'TK_START_BLOCK'];
        }

        if (c === '}') {
            return [c, 'TK_END_BLOCK'];
        }

        if (c === ';') {
            return [c, 'TK_SEMICOLON'];
        }

        if (c === '/') {
            var comment = '';
            // peek for comment /* ... */
            if (input.charAt(parser_pos) === '*') {
                parser_pos += 1;
                if (parser_pos < input.length) {
                    while (! (input.charAt(parser_pos) === '*' && input.charAt(parser_pos + 1) && input.charAt(parser_pos + 1) === '/') && parser_pos < input.length) {
                        comment += input.charAt(parser_pos);
                        parser_pos += 1;
                        if (parser_pos >= input.length) {
                            break;
                        }
                    }
                }
                parser_pos += 2;
                return ['/*' + comment + '*/', 'TK_BLOCK_COMMENT'];
            }
            // peek for comment // ...
            if (input.charAt(parser_pos) === '/') {
                comment = c;
                while (input.charAt(parser_pos) !== "\x0d" && input.charAt(parser_pos) !== "\x0a") {
                    comment += input.charAt(parser_pos);
                    parser_pos += 1;
                    if (parser_pos >= input.length) {
                        break;
                    }
                }
                parser_pos += 1;
                if (wanted_newline) {
                    print_newline();
                }
                return [comment, 'TK_COMMENT'];
            }

        }

        if (c === "'" || // string
        c === '"' || // string
        (c === '/' &&
        ((last_type === 'TK_WORD' && last_text === 'return') || (last_type === 'TK_START_EXPR' || last_type === 'TK_END_BLOCK' || last_type === 'TK_OPERATOR' || last_type === 'TK_EOF' || last_type === 'TK_SEMICOLON')))) { // regexp
            var sep = c;
            var esc = false;
            var resulting_string = '';

            if (parser_pos < input.length) {

                while (esc || input.charAt(parser_pos) !== sep) {
                    resulting_string += input.charAt(parser_pos);
                    if (!esc) {
                        esc = input.charAt(parser_pos) === '\\';
                    } else {
                        esc = false;
                    }
                    parser_pos += 1;
                    if (parser_pos >= input.length) {
                        break;
                    }
                }

            }

            parser_pos += 1;

            resulting_string = sep + resulting_string + sep;

            if (sep == '/') {
                // regexps may have modifiers /regexp/MOD , so fetch those, too
                while (parser_pos < input.length && in_array(input.charAt(parser_pos), wordchar)) {
                    resulting_string += input.charAt(parser_pos);
                    parser_pos += 1;
                }
            }
            return [resulting_string, 'TK_STRING'];
        }

        if (in_array(c, punct)) {
            while (parser_pos < input.length && in_array(c + input.charAt(parser_pos), punct)) {
                c += input.charAt(parser_pos);
                parser_pos += 1;
                if (parser_pos >= input.length) {
                    break;
                }
            }
            return [c, 'TK_OPERATOR'];
        }

        return [c, 'TK_UNKNOWN'];
    };


    //----------------------------------

    indent_string = '';
    while (opt_indent_size--) {
        indent_string += opt_indent_char;
    }

    indent_level = opt_indent_level;

    input = js_source_text;

    last_word = ''; // last 'TK_WORD' passed
    last_type = 'TK_START_EXPR'; // last token type
    last_text = ''; // last token text
    output = [];

    do_block_just_closed = false;
    var_line = false;         // currently drawing var .... ;
    var_line_tainted = false; // false: var a = 5; true: var a = 5, b = 6

    whitespace = "\n\r\t ".split('');
    wordchar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$'.split('');
    punct = '+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! !! , : ? ^ ^= |= ::'.split(' ');

    // words which should always start on new line.
    line_starters = 'continue,try,throw,return,var,if,switch,case,default,for,while,break,function'.split(',');

    // states showing if we are currently in expression (i.e. "if" case) - 'EXPRESSION', or in usual block (like, procedure), 'BLOCK'.
    // some formatting depends on that.
    current_mode = 'BLOCK';
    modes = [current_mode];

    parser_pos = 0;
    in_case = false; // flag for parser that case/default has been processed, and next colon needs special attention
    while (true) {
        var t = get_next_token(parser_pos);
        token_text = t[0];
        token_type = t[1];
        if (token_type === 'TK_EOF') {
            break;
        }

        switch (token_type) {

        case 'TK_START_EXPR':
            var_line = false;
            set_mode('EXPRESSION');
            if (last_text === ';') {
                print_newline();
            } else if (last_type === 'TK_END_EXPR' || last_type === 'TK_START_EXPR') {
                // do nothing on (( and )( and ][ and ]( ..
            } else if (last_type !== 'TK_WORD' && last_type !== 'TK_OPERATOR') {
                print_space();
            } else if (in_array(last_word, line_starters) && last_word !== 'function') {
                print_space();
            }
            print_token();
            break;

        case 'TK_END_EXPR':
            print_token();
            restore_mode();
            break;

        case 'TK_START_BLOCK':

            if (last_word === 'do') {
                set_mode('DO_BLOCK');
            } else {
                set_mode('BLOCK');
            }
            if (last_type !== 'TK_OPERATOR' && last_type !== 'TK_START_EXPR') {
                if (last_type === 'TK_START_BLOCK') {
                    print_newline();
                } else {
                    print_space();
                }
            }
            print_token();
            indent();
            break;

        case 'TK_END_BLOCK':
            if (last_type === 'TK_START_BLOCK') {
                // nothing
                trim_output();
                unindent();
            } else {
                unindent();
                print_newline();
            }
            print_token();
            restore_mode();
            break;

        case 'TK_WORD':

            if (do_block_just_closed) {
                print_space();
                print_token();
                print_space();
                break;
            }

            if (token_text === 'case' || token_text === 'default') {
                if (last_text === ':') {
                    // switch cases following one another
                    remove_indent();
                } else {
                    // case statement starts in the same line where switch
                    unindent();
                    print_newline();
                    indent();
                }
                print_token();
                in_case = true;
                break;
            }

            prefix = 'NONE';
            if (last_type === 'TK_END_BLOCK') {
                if (!in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
                    prefix = 'NEWLINE';
                } else {
                    prefix = 'SPACE';
                    print_space();
                }
            } else if (last_type === 'TK_SEMICOLON' && (current_mode === 'BLOCK' || current_mode === 'DO_BLOCK')) {
                prefix = 'NEWLINE';
            } else if (last_type === 'TK_SEMICOLON' && current_mode === 'EXPRESSION') {
                prefix = 'SPACE';
            } else if (last_type === 'TK_STRING') {
                prefix = 'NEWLINE';
            } else if (last_type === 'TK_WORD') {
                prefix = 'SPACE';
            } else if (last_type === 'TK_START_BLOCK') {
                prefix = 'NEWLINE';
            } else if (last_type === 'TK_END_EXPR') {
                print_space();
                prefix = 'NEWLINE';
            }

            if (last_type !== 'TK_END_BLOCK' && in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
                print_newline();
            } else if (in_array(token_text, line_starters) || prefix === 'NEWLINE') {
                if (last_text === 'else') {
                    // no need to force newline on else break
                    print_space();
                } else if ((last_type === 'TK_START_EXPR' || last_text === '=') && token_text === 'function') {
                    // no need to force newline on 'function': (function
                    // DONOTHING
                } else if (last_type === 'TK_WORD' && (last_text === 'return' || last_text === 'throw')) {
                    // no newline between 'return nnn'
                    print_space();
                } else if (last_type !== 'TK_END_EXPR') {
                    if ((last_type !== 'TK_START_EXPR' || token_text !== 'var') && last_text !== ':') {
                        // no need to force newline on 'var': for (var x = 0...)
                        if (token_text === 'if' && last_type === 'TK_WORD' && last_word === 'else') {
                            // no newline for } else if {
                            print_space();
                        } else {
                            print_newline();
                        }
                    }
                } else {
                    if (in_array(token_text, line_starters) && last_text !== ')') {
                        print_newline();
                    }
                }
            } else if (prefix === 'SPACE') {
                print_space();
            }
            print_token();
            last_word = token_text;

            if (token_text === 'var') {
                var_line = true;
                var_line_tainted = false;
            }

            if (token_text === 'if' || token_text === 'else') {
                if_line_flag = true;
            }

            break;

        case 'TK_SEMICOLON':

            print_token();
            var_line = false;
            break;

        case 'TK_STRING':

            if (last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK' || last_type == 'TK_SEMICOLON') {
                print_newline();
            } else if (last_type === 'TK_WORD') {
                print_space();
            }
            print_token();
            break;

        case 'TK_OPERATOR':

            var start_delim = true;
            var end_delim = true;
            if (var_line && token_text !== ',') {
                var_line_tainted = true;
                if (token_text === ':') {
                    var_line = false;
                }
            }
            if (var_line && token_text === ',' && current_mode === 'EXPRESSION') {
                // do not break on comma, for(var a = 1, b = 2)
                var_line_tainted = false;
            }

            if (token_text === ':' && in_case) {
                print_token(); // colon really asks for separate treatment
                print_newline();
                break;
            }

            if (token_text === '::') {
                // no spaces around exotic namespacing syntax operator
                print_token();
                break;
            }

            in_case = false;

            if (token_text === ',') {
                if (var_line) {
                    if (var_line_tainted) {
                        print_token();
                        print_newline();
                        var_line_tainted = false;
                    } else {
                        print_token();
                        print_space();
                    }
                } else if (last_type === 'TK_END_BLOCK') {
                    print_token();
                    print_newline();
                } else {
                    if (current_mode === 'BLOCK') {
                        print_token();
                        print_newline();
                    } else {
                        // EXPR od DO_BLOCK
                        print_token();
                        print_space();
                    }
                }
                break;
            } else if (token_text === '--' || token_text === '++') { // unary operators special case
                if (last_text === ';') {
                    // space for (;; ++i)
                    start_delim = true;
                    end_delim = false;
                } else {
                    start_delim = false;
                    end_delim = false;
                }
            } else if (token_text === '!' && last_type === 'TK_START_EXPR') {
                // special case handling: if (!a)
                start_delim = false;
                end_delim = false;
            } else if (last_type === 'TK_OPERATOR') {
                start_delim = false;
                end_delim = false;
            } else if (last_type === 'TK_END_EXPR') {
                start_delim = true;
                end_delim = true;
            } else if (token_text === '.') {
                // decimal digits or object.property
                start_delim = false;
                end_delim = false;

            } else if (token_text === ':') {
                // zz: xx
                // can't differentiate ternary op, so for now it's a ? b: c; without space before colon
                if (last_text.match(/^\d+$/)) {
                    // a little help for ternary a ? 1 : 0;
                    start_delim = true;
                } else {
                    start_delim = false;
                }
            }
            if (start_delim) {
                print_space();
            }

            print_token();

            if (end_delim) {
                print_space();
            }
            break;

        case 'TK_BLOCK_COMMENT':

            print_newline();
            print_token();
            print_newline();
            break;

        case 'TK_COMMENT':

            // print_newline();
            print_space();
            print_token();
            print_newline();
            break;

        case 'TK_UNKNOWN':
            print_token();
            break;
        }

        last_type = token_type;
        last_text = token_text;
    }

    return output.join('');

};

/* jsmin.js - 2006-08-31
Author: Franck Marcia
This work is an adaptation of jsminc.c published by Douglas Crockford.
Permission is hereby granted to use the Javascript version under the same
conditions as the jsmin.c on which it is based.

jsmin.c
2006-05-04

Copyright (c) 2002 Douglas Crockford  (www.crockford.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

The Software shall be used for Good, not Evil.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Update:
	add level:
		1: minimal, keep linefeeds if single
		2: normal, the standard algorithm
		3: agressive, remove any linefeed and doesn't take care of potential
		   missing semicolons (can be regressive)
	store stats
		jsmin.oldSize
		jsmin.newSize
*/

/*

Updates:

2009/02/26	String.prototype.has was removed
2009/02/28	The order of arguments was modified
2009/04/03	Levels are changed to start from 0 (instead of 1)

*/


//String.prototype.has = function(c) {
//	return this.indexOf(c) > -1;
//};


eval.minify = function(input, level, comment)
{

	level = Number(level) || 0;

//	if (level === undefined || level < 1 || level > 3) {
//		level = 2;
//	}

	if ( ! comment ) {
		comment = '';
	}
	if ( comment.constructor == Array ) {
		comment = comment.join('\n// ');
	}
	if ( comment.length > 0 ) {
		comment = '// ' + comment + '\n';
	}

//	if (input === undefined) {
//		input = comment;
//		comment = '';
//		level = 2;
//	} else if (level === undefined || level < 1 || level > 3) {
//		level = 2;
//	}
//
//	if (comment.length > 0) {
//		comment += '\n';
//	}

	var a = '',
		b = '',
		EOF = -1,
		LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
		DIGITS = '0123456789',
		ALNUM = LETTERS + DIGITS + '_$\\',
		theLookahead = EOF;


	/* isAlphanum -- return true if the character is a letter, digit, underscore,
			dollar sign, or non-ASCII character.
	*/

	function isAlphanum(c) {
		return c != EOF && (ALNUM.indexOf(c) > -1 || c.charCodeAt(0) > 126);
//		return c != EOF && (ALNUM.has(c) || c.charCodeAt(0) > 126);
	};


	/* get -- return the next character. Watch out for lookahead. If the
			character is a control character, translate it to a space or
			linefeed.
	*/

	function get() {

		var c = theLookahead;
		if (get.i == get.l) {
			return EOF;
		}
		theLookahead = EOF;
		if (c == EOF) {
			c = input.charAt(get.i);
			++get.i;
		}
		if (c >= ' ' || c == '\n') {
			return c;
		}
		if (c == '\r') {
			return '\n';
		}
		return ' ';
	};

	get.i = 0;
	get.l = input.length;


	/* peek -- get the next character without getting it.
	*/

	function peek() {
		theLookahead = get();
		return theLookahead;
	};


	/* next -- get the next character, excluding comments. peek() is used to see
			if a '/' is followed by a '/' or '*'.
	*/

	function next() {

		var c = get();
		if (c == '/') {
			switch (peek()) {
			case '/':
				for (;;) {
					c = get();
					if (c <= '\n') {
						return c;
					}
				}
				break;
			case '*':
				get();
				for (;;) {
					switch (get()) {
					case '*':
						if (peek() == '/') {
							get();
							return ' ';
						}
						break;
					case EOF:
						throw 'Error: Unterminated comment.';
					}
				}
				break;
			default:
				return c;
			}
		}
		return c;
	};


	/* action -- do something! What you do is determined by the argument:
			1   Output A. Copy B to A. Get the next B.
			2   Copy B to A. Get the next B. (Delete A).
			3   Get the next B. (Delete B).
	   action treats a string as a single character. Wow!
	   action recognizes a regular expression if it is preceded by ( or , or =.
	*/

	function action(d) {

		var r = [];

		if (d == 1) {
			r.push(a);
		}

		if (d < 3) {
			a = b;
			if (a == '\'' || a == '"') {
				for (;;) {
					r.push(a);
					a = get();
					if (a == b) {
						break;
					}
					if (a <= '\n') {
						throw 'Error: unterminated string literal: ' + a;
					}
					if (a == '\\') {
						r.push(a);
						a = get();
					}
				}
			}
		}

		b = next();

		if (b == '/' && '(,=:[!&|'.indexOf(a) > -1) {
//		if (b == '/' && '(,=:[!&|'.has(a)) {
			r.push(a);
			r.push(b);
			for (;;) {
				a = get();
				if (a == '/') {
					break;
				} else if (a =='\\') {
					r.push(a);
					a = get();
				} else if (a <= '\n') {
					throw 'Error: unterminated Regular Expression literal';
				}
				r.push(a);
			}
			b = next();
		}

		return r.join('');
	};


	/* m -- Copy the input to the output, deleting the characters which are
			insignificant to JavaScript. Comments will be removed. Tabs will be
			replaced with spaces. Carriage returns will be replaced with
			linefeeds.
			Most spaces and linefeeds will be removed.
	*/

	function m() {

		var r = [];
		a = '\n';

		r.push(action(3));

		while (a != EOF) {
			switch (a) {
			case ' ':
				if (isAlphanum(b)) {
					r.push(action(1));
				} else {
					r.push(action(2));
				}
				break;
			case '\n':
				switch (b) {
				case '{':
				case '[':
				case '(':
				case '+':
				case '-':
					r.push(action(1));
					break;
				case ' ':
					r.push(action(3));
					break;
				default:
					if (isAlphanum(b)) {
						r.push(action(1));
					} else {
						if (level == 0 && b != '\n') {
//						if (level == 1 && b != '\n') {
							r.push(action(1));
						} else {
							r.push(action(2));
						}
					}
				}
				break;
			default:
				switch (b) {
				case ' ':
					if (isAlphanum(a)) {
						r.push(action(1));
						break;
					}
					r.push(action(3));
					break;
				case '\n':
					if (level == 0 && a != '\n') {
//					if (level == 1 && a != '\n') {
						r.push(action(1));
					} else {
						switch (a) {
						case '}':
						case ']':
						case ')':
						case '+':
						case '-':
						case '"':
						case '\'':
							if (level >= 2) {
//							if (level == 3) {
								r.push(action(3));
							} else {
								r.push(action(1));
							}
							break;
						default:
							if (isAlphanum(a)) {
								r.push(action(1));
							} else {
								r.push(action(3));
							}
						}
					}
					break;
				default:
					r.push(action(1));
					break;
				}
			}
		}

		return r.join('');
	};

	arguments.callee.oldSize = input.length;
	ret = m(input);
	arguments.callee.newSize = ret.length;

	return comment + ret;

};

/**
 * Wrapper over eval and Ajax.queryFile to simplify usage from CLI.
 * Shortly, this is equvalent of 'include' or 'export' within other languages.
 *
 * @param	String	Filename
 * @param	Object	Ajax options
 * @result	String
 *
 * @access	public
 */
eval.file = function(filename, ajaxOptions)
{
	var input = Ajax.queryFile(filename, ajaxOptions);

	return eval(input);
};

/**
 * Wrapper over jsbeautify and Ajax.queryFile to simplify usage from CLI
 *
 * @param	String
 * @param	Object
 * @param	Object	Ajax options
 * @result	String
 *
 * @access	public
 */
eval.beautify.file = function(filename, options, ajaxOptions)
{
	var input = Ajax.queryFile(filename, ajaxOptions);

	return eval.beautify(input, options);
};

/**
 * Wrapper over jsmin and Ajax.queryFile to simplify usage from CLI
 *
 * @param	String
 * @param	Integer
 * @param	String
 * @param	Object	Ajax options
 * @result	String
 *
 * @access	public
 */
eval.minify.file = function(filename, level, comment, ajaxOptions)
{
	var input = Ajax.queryFile(filename, ajaxOptions);

	return eval.minify(input, level, comment);
};
