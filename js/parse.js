/*
	This file will serve as the main data-munging library		
*/

/*
	DATASET

	constructor arguments:
		path = url/path of raw CHIP file

	attributes:
		title = string, title of dataset
		varNames = array, names of variables
		numVars = int, number of variables
		varNums = array, number of categories per variable
		varLabels = array of arrays, names of categories for each variable
		data = array, collection of objects representing records

*/

var Dataset = function(path) {
	$.get(path, function(data) {
		var lines = data.split('\r\n')
		this.title = lines[0];
		//independent variable names
		this.varNames = lines[2].split(',');
		//number of categories per variable
		this.varNums = lines[3].split(',');
		//parse varNums into ints
		this.varNums = _.map(this.varNums, function(num) {
			return parseInt(num);
		});
		//number of variables
		this.numVars = this.varNames.length;

		//push variable labels into array, push those arrays in single array
		this.varLabels = [];
		for(var i=4; i<(4+this.numVars); i++) {
			this.varLabels.push(lines[i].split(',')); //list of lists
		}

		//dataset info
		this.info = {"title": this.title, 
					 "vars": this.varNames, 
					 "categoryNums": this.varNums};



		//grab lines of data (non-metadata)
		var firstDataLineIndex = 4 + this.varNames.length;
		var dataPoints = 1;
		var sideVars = _.initial(this.varNums);
		for(var i in sideVars) {
			dataPoints *= sideVars[i];
		}
		var lastDataLineIndex = firstDataLineIndex + dataPoints;
		var dataLines = lines.slice(firstDataLineIndex, lastDataLineIndex);

		/*
		  Loop through object array, give each object a new attribute and a value for it
		  returns new array with new attributes
		  l = object array
		  varName = name of the attribute you're setting
		  labels = labels for that attribute
		  reset = how many times to apply the same label until changing it
		*/

		//increment through categories when applying label, reset if at end of array
		function increment(max, cur) {
			if(cur == max-1) {
				return 0;
			} else {
				return(cur + 1);
			}
		}

		function applyLabel(l, varName, labels, reset) {
			var m = l;

			var i = 0;
			var j = 0;
			var labelLen = labels.length;
			currentLabel = labels[0];
			for(var k in m) {
				m[k][varName] = currentLabel;
				i++;
				if(i == reset) {
					j = increment(labelLen, j);
					currentLabel = labels[j];
					i = 0;
				} else {
					continue;
				}
			}
			return m;
		}

		//this works backwards to build objects, so reverse each array
		var varNamesReversed = this.varNames;
		varNamesReversed.reverse()
		var varLabelsReversed = this.varLabels;
		varLabelsReversed.reverse();
		var varNumBuffer = this.varNums;
		varNumBuffer.reverse()

		//build array of numbers to use as "reset" arguments in applyLabel
		var branchers = _.initial(varNumBuffer);
		var multiplier = 1;
		var multipliers = [1];
		for(var i in branchers) {
			multiplier *= branchers[i];
			multipliers.push(multiplier);		
		}
		
		//create objects out of each dependent variable value, name = "Dep"
		objects = [];
		for(var line in dataLines) {
			line = dataLines[line];
			var vals = line.split(",")
			vals = _.initial(vals)
			_.each(vals, function(val) {
				objects.push({"Dep": val})
			})
		}

		//add each variable with its value to the object array
		for(var i in multipliers) {
			objects = applyLabel(objects, varNamesReversed[i], varLabelsReversed[i], multipliers[i]);
		}

		this.data = objects;


	});
}

function marginals(dataset) {
	var data = dataset.data;
	var dsize = data.length;
	var vars = dataset.varNames;
	var cats = dataset.varLabels;
	var margs = [];
	var i = 0;
	_.each(vars, function(v) {
		var rcd = {"name": String(v), "margs": []}
		_.each(cats[i], function(cat) {
			var matches = _.where(data, {String(v): String(cat)});
			var pct = dsize/matches.length;
			var margObj = {"category": String(cat), "pct": float(pct)};
			rcd["margs"].push(margObj);
		});
		marg.push(rcd);
		i++;
	});
	return margs;
}