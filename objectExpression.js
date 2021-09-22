function superFunc (f, func) {
	return function SuperClass (...argv) {
		this.evaluate = function(...argvUnknowns) {
			let result = [];
			for (const a in argv) {
				result[a] = (argv[a]).evaluate(...argvUnknowns);
			}
			return f(...result);
		};
		this.toString = function() { 
			let string = ''
			for (const a of argv) {
				string += (a.toString() + ' ')
			}
			string += (func)
			return string
		};
		this.prefix = function() {
			let string = ('(' + func)
			for (const a of argv) {
				string += (' ' + a.prefix())
			}
			string += ')'
			return string
		};
	}
}

function med (...argv) {			
	let result = 0;
	let length = argv.length;
	for (let i = 0; i < length; i++) {
		for (let j = i+1; j < length; j++) {
			if (argv[i] > argv[j]) {
				let buffer
				buffer = argv[i];
				argv[i] = argv[j];
				argv[j] = buffer; 
			}
		}
	}
	return argv[(argv.length-1)/2];
}

function arm (...argv) {			
	let result = 0;
	let length = argv.length;
    for (let i = 0; i < length; i++) {
    	result += argv[i];
    }
	return (result/length);
}

function gem (...argv) {			
	let result = 1;
	let length = argv.length;
    for (let i = 0; i < length; i++) {
    	result *= argv[i];
    }
	return Math.pow(Math.abs(result), 1/length);
}

function ham (...argv) {			
	let result = 0;
	let length = argv.length;
    for (let i = 0; i < length; i++) {
    	result += (1/argv[i]);
    }
	return ((length) / result);
}

let Add 		= superFunc(((a, b) => a + b), "+");
let Subtract 	= superFunc(((a, b) => a - b), "-");
let Multiply 	= superFunc(((a, b) => a * b), "*");
let Divide 		= superFunc(((a, b) => a / b), "/");
let Negate 		= superFunc(((a) => -a), "negate");

let Avg5 		= superFunc (arm, "avg5");
let Med3 		= superFunc (med, "med3");
let ArithMean  	= superFunc (arm, "arith-mean");
let GeomMean   	= superFunc (gem, "geom-mean");
let HarmMean   	= superFunc (ham, "harm-mean");

function Const (a) {
	this.evaluate = function(...argvUnknowns) {return a};
	this.toString = function()  {return (a + "");};
	this.prefix   = function()  {return (a + "");};
} 

function unknownToNumber (string) {
	if   	(string === 'x') {return 0;}
	else if (string === 'y') {return 1;}
	else if (string === 'z') {return 2;}
	else {return -1;}
}

function Variable (a) {
	this.evaluate = function(...argvUnknowns) {
		return argvUnknowns[unknownToNumber(a)];
	};
	this.toString = function()  {return a};
	this.prefix   = function()  {return a};
}

//the function controls spaces in the expression, 
// results in a view where all elements are separated by spaces
function preprocessing (string) {
	let result = '';

	//removing spaces from the beginning and from the end
	let start = 0;
	while (string[start] === ' ') {
		start += 1;
	}
	let end = (string.length - 1)
	while (string[end] === ' ') {
		end--;
	}



	//so there is a constant or variable left
	if (start === end) {
		return string[start];
	}
	//we bring it to the form in the technical specification, 
	// where 1 spaces are placed between each other
	let y = 0
	result += string[start];

	for (let i = start + 1; i < end; i++) {
		if (string[i] !== ' '){

			result += string[i];
			y++;

		} else if (string[i] === ' ' && string[i+1] != ')' && result[y] !== ' ' && result[y] !== '(') {
			while(string[i] === ' ') {
				i++;
			}	
			if(string[i] !== ')') {
				result += ' ';
				y++;
			} 
			i--;
		}
		if (string[i+1] === '(' && result[y] !== ' ') {
			result += ' '; 
			y++;
		} else if (string[i] === ')' && string[i+1] !== ')') {
			result += ' '; 
			y++;
		} 
	}

	result += string[end];
	return result;
}

//The function correctly checks whether the string is a valid number
//isNaN(parseInt(string)) does not guarantee the correctness of the number, 
// provided that the digits are found before the text in "string"
function isNumber (string) {

	let i = 0;
	if (string[0] === '-') {
		i++;
	}
	//however, isNaN(parseInt(string)) guarantees incorrectness if the value positive
	if (isNaN(parseInt(string))) {
		return false;
	}
	//we check each character for correctness
	for (; i < string.length; i++) {
		if(isNaN(parseInt(string[i]))) {
			//throw "Error number 9: incorrect number.";
			return false;
		}
	}

	return true;
}

//the function checks the expression for the correct bracket sequence
function correctBracketSequence(string, length) { //correct bracket sequence

	let br = 0;

	for (let i = 0; i < length; i++) {
		if (string[i] === '(') {
			br++;
		}
		if (string[i] === ')') {
			br--;
		}
	}

	if (br != 0) {
		throw "Error in " + string.length + " character out of " + string.length + ": incorrect bracket sequence.";
	}
}

//the function recognizes and correctly processes expressions with spaces between arguments
function parsePrefix(string) {
	//empty string passed
	if (string.length === 0) {
		throw "Error in " + 0 + " character out of " + string.length + ": empty string passed."; // 6
	}
	if (string === '()') {
		throw "Error in " + 0 + " character out of " + string.length + ": empty passed expression."; //7
	}

	string = preprocessing(string) //we place the spaces correctly

	let len = string.length;
	correctBracketSequence(string, len);

	//if the input string is not a full expression
	if (string[0] !== '(' || string[len-1] !== ')') { 
		if (isNumber(string)) {
			return new Const(parseInt(string));
		} else {
			if (unknownToNumber(string) === -1) {
				throw "Error in " + 0 + " character out of " + string.length + ": unknown variable.";
			}
			return new Variable(string);
		}
	}
		
	let param = [] //this is where the parameters will be stored

	let j = 1; //iterator by line "string"
	let op = '';

	//select the operation
	for (; string[j] !== ' ' && string[j+1] !== ')'; j++) {
		op += string[j];
	}

	j++;
	//finding arguments
	for (let i = 0; j < len-1; i++) {
		let buffer = ''
		param[i] = ''

		if (string[j] === '(') {
			buffer += '('

			for (let b = 1; b!=0;) {
				j++;
				buffer += string[j];
				if(string[j] === '(') {
					b += 1;
				} else if (string[j] === ')') {
					b -= 1;
				}
			}

			param[i] = parsePrefix(buffer);
			j++;
		} else {

			for (; string[j] !== ' ' && string[j] !== ')'; j++) {
				buffer += string[j];
			}

			if (isNumber(buffer)) {
				param[i] = new Const(parseInt(buffer));
			} else {
				if (unknownToNumber(buffer) === -1) {
					throw "Error in " + j + " character out of " + string.length + ": unknown variable.";
				}
				param[i] = new Variable(buffer);
			}
		}
		j++;
	}

	let n = -1;
	let result;

	/*const map = new Map();
	map.set('+', "Add");*/

	if (op == '+') {
		n = 2;
		result = new Add(...param);
	} else if (op === '-') {
		n = 2;
		result = new Subtract(...param);
	} else if (op === '*') {
		n = 2;
		result = new Multiply(...param);
	} else if (op === '/') {
		n = 2;
		result = new Divide(...param);
	} else if (op === 'negate') {
		n = 1;
		result = new Negate(...param);
	} else if (op === 'avg5') {
		n = 5;
		result = new Avg5(...param);
	} else if (op === 'med3') {
		n = 3;
		result = new Med3(...param);
	} else if (op === 'arith-mean') {
		n = param.length;
		result = new ArithMean(...param);
	} else if (op === 'geom-mean') {
		n = param.length;
		result = new GeomMean(...param);
	} else if (op === 'harm-mean') {
		n = param.length;
		result = new HarmMean(...param);
	} else {
		throw "Error in " + string.length + " character out of " + string.length + ": invalid operation.";
	}

	if(n != param.length) {
		throw "Error in " + string.length + " character out of " + string.length + ": invalid number of arguments for the function";
	}

	return result;
}