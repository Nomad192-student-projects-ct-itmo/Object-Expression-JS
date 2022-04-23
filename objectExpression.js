function superFunc (f, func) {
	return function SuperClass (...argv) {
		this.evaluate = function(...argvUnknowns) {
			let result = [];
			for (let i = 0; i < argv.length; i++) {
				result[i] = (argv[i]).evaluate(...argvUnknowns);
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

let Add 		= superFunc(((a, b) => a + b), "+");
let Subtract 	= superFunc(((a, b) => a - b), "-");
let Multiply 	= superFunc(((a, b) => a * b), "*");
let Divide 		= superFunc(((a, b) => a / b), "/");
let Negate 		= superFunc(((a) => -a), "negate");
let Min3 		= superFunc(((...argv) => Math.min(... argv)), "min3");
let Max5 		= superFunc(((...argv) => Math.max(... argv)), "max5");
let Sinh 		= superFunc(((a) => Math.sinh(a)), "sinh");
let Cosh  		= superFunc(((a) => Math.cosh(a)), "cosh");


function Const (a) {
	this.evaluate = function() {return a};
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
	this.evaluate 	= function(...argvUnknowns) {return argvUnknowns[unknownToNumber(a)];};
	this.toString 	= function()  {return (a + "");};
	this.prefix 	= function()  {return (a + "");};
}

function multi_pop(stack, n)
{
	let result = [];
	for (let i = 0; i < n; i++)
		result.push(stack.pop());
	return result.reverse();
}

function parse(input) {
	let split = input.trim().split(/\s+/);
	//console.log(split);

	let stack = [];

	for (let i = 0; i < split.length; i++)
	{
		//console.log(split[i]);
		switch(split[i])
		{
			case "+": 		stack.push(new Add		(... multi_pop(stack, 2))); break;
			case "-": 		stack.push(new Subtract	(... multi_pop(stack, 2))); break;
			case "/": 		stack.push(new Divide	(... multi_pop(stack, 2))); break;
			case "*": 		stack.push(new Multiply	(... multi_pop(stack, 2))); break;
			case "min3": 	stack.push(new Min3		(... multi_pop(stack, 3))); break;
			case "max5": 	stack.push(new Max5		(... multi_pop(stack, 5))); break;

			case "sinh": 	stack.push(new Sinh		(stack.pop())); break;	
			case "cosh": 	stack.push(new Sinh		(stack.pop())); break;	
			case "negate": 	stack.push(new Negate	(stack.pop())); break;			
			default:
			{
				let p = split[i];
				if(p === "x" || p === "y" || p === "z")
					stack.push(new Variable(p));
				else
					stack.push(new Const(parseInt(p)));
				break;
			}
		}
		//console.log(stack);		
	}
	return stack.pop();
}


function multi_apply(argv, n)
{
	let result = [];
	for (let i = 0; i < n; i++)
		result.push(parsePrefix(argv[i]));
	return result;
}

Array.prototype.check_na = function(correct_length) {
	if(this.length !== correct_length) throw Error("Incorrect number of arguments.");
}

function parsePrefix(input) {
	//console.log(input)
	let split = input.trim();
	if(split.length === 0) throw Error("Empty string.");

	if (split[0] === "(" && split[split.length - 1] === ")")
	{
		//split = split.slice(1, split.length-1).trim().replace(/\s+/g, " ");
		let op = "";
		let i = 1;
		for(; split[i] === " " && i < split.length - 1; i++);
		for(; split[i] !== " " && split[i] !== "(" && i < split.length - 1; i++)
			op += split[i];
		let argv = [];
		let buffer = "";
		while(i < split.length - 1)
		{
			if(split[i] === "(")
			{
				let bs = 1;
				buffer += split[i++];
				for(; bs !== 0 && i < split.length - 1; i++)
				{
					if(split[i] === "(")
						bs++;
					if(split[i] === ")")
						bs--;
					buffer += split[i];
				}
				if(bs !== 0)
					throw Error("Incorrect bracket sequence.");
				argv.push(buffer);
				buffer = "";
			}
			else if(split[i] !== " ")
			{
				for(; split[i] !== " " && split[i] !== "(" && i < split.length - 1; i++)
					buffer += split[i];
				argv.push(buffer);
				buffer = "";
			}
			else
				i++;
		}
		//console.log(argv);
		switch(op)
		{
			case "+": 		argv.check_na(2); 	return new Add		(... multi_apply(argv, 2)); 
			case "-": 		argv.check_na(2); 	return new Subtract	(... multi_apply(argv, 2)); 
			case "/": 		argv.check_na(2);	return new Divide	(... multi_apply(argv, 2)); 
			case "*": 		argv.check_na(2); 	return new Multiply	(... multi_apply(argv, 2)); 
			case "min3": 	argv.check_na(3);	return new Min3		(... multi_apply(argv, 3)); 
			case "max5": 	argv.check_na(5);	return new Max5		(... multi_apply(argv, 5)); 
			case "sinh": 	argv.check_na(1);	return new Sinh		(... multi_apply(argv, 1)); 		
			case "cosh": 	argv.check_na(1);	return new Cosh		(... multi_apply(argv, 1)); 
			case "negate": 	argv.check_na(1);	return new Negate	(... multi_apply(argv, 1)); 

			default:
			{
				throw Error("Incorrect operation.");
			}
		}
	}
	else
	{
		//console.log("two");
		if(split === "x" || split === "y" || split === "z")
			return new Variable(split);
		else
		{
			let number = +split;
			if (isNaN(number))
				throw Error("Incorrect Const.");
			return new Const(number);
		}
	}
}//*/


/*
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

	//const map = new Map();
	//map.set('+', "Add");

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
}//*/