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
$.ajaxSetup({async:false});
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
		console.log(nSum(this.data));
		console.log(JSON.stringify(marginals(this)));


	});
}

//get dependent variable (count) sum from data collection, gotta love underscore
function nSum(data) {
	return _.reduce(_.pluck(data, "Dep"), function(sum, el) { return sum + parseInt(el); }, 0);
}



/*
compute marginals, returns object like:
	[
		{"name": "VariableName1",
		 "margs": [
		 	{"category": "categoryName1",
		 	 "pct": percent1},
		 	{"category": "categoryName2",
		 	 "pct": percent2},
		 	...
		 ]
		}
		...
	]
*/
function marginals(dataset) {
	var data = dataset.data;
	var totalSum = nSum(data);
	var vars = dataset.varNames;
	var cats = dataset.varLabels;
	var margs = [];
	//counter to keep track of category names within variables
	var i = 0;
	_.each(vars, function(v) {
		var rcd = {"name": String(v), "margs": []}
		_.each(cats[i], function(cat) {
			var searchObj = {};
			searchObj[v] = cat;
			var matches = _.where(data, searchObj);
			var localSum = nSum(matches);
			var pct = localSum/totalSum;
			var margObj = {"category": String(cat), "pct": parseFloat((parseFloat(pct) * 100).toFixed(2))};
			rcd["margs"].push(margObj);
		});
		margs.push(rcd);
		i++;
	});
	return margs;
}


/*
  Compute frequency table numbers
  Returns an object collection, e.g. [{"row":"25-44", "col":"male", "total": 3645}, ...]
  Object will be ordered by row then column, allowing for easier output
  "row total" cells will be interspersed throughout the dictionary, at regular intervals,
  and "column total" cells will be the final elements of the collections
*/
function frequency(dataset, row, col) {
	var data = dataset.data;
	var vars = dataset.varNames;
	var cats = dataset.varLabels
	var rowIndex = vars.indexOf(row);
	var colIndex = vars.indexOf(col);
	var rowCats = cats[rowIndex];
	var colCats = cats[colIndex];
	var freqs = [];
	_.each(rowCats, function(rc) {
		_.each(colCats, function(cc) {
			var searchObj = {}
			searchObj[row] = rc;
			searchObj[col] = cc;
			var matches = _.where(data, searchObj);
			var total = nSum(matches);
			var returnObj = {"row": rc, "col": cc, "total": parseInt(total)}
			freqs.push(returnObj);
		});
		var searchObj = {};
		searchObj[row] = rc;
		var matches = _.where(data, searchObj);
		var rowTotal = nSum(matches);
		var returnObj = {"row": rc, "col": "all", "total": rowTotal};
		freqs.push(returnObj);
	});
	_.each(colCats, function(cc) {
		var searchObj = {}
		searchObj[col] = cc;
		var matches = _.where(data, searchObj);
		var returnObj = {"row": "all", "col": c, "total": total};
		freqs.push(returnObj);
	});
	return freqs;
}

/*
	Returns object collection similar to frequency return value, except with percents and not counts
*/
function pctAcross(dataset, row, col) {
	var data = dataset.data;
	var grandTotal = nSum(data);
	var vars = dataset.varNames;
	var cats = dataset.varLabels
	var rowIndex = vars.indexOf(row);
	var colIndex = vars.indexOf(col);
	var rowCats = cats[rowIndex];
	var colCats = cats[colIndex];
	var pcts = [];
	_.each(rowCats, function(rc) {
		var rowSearch = {};
		rowSearch[row] = rc;
		var rowMatches = _.where(data, rowSearch);
		rowTotal = nSum(rowMatches);
		_.each(colCats, function(cc) {
			var colSearch = {};
			colSearch[col] = cc;
			var colMatches = _.where(rowMatches, colSearch);
			var colTotal = nSum(colMatches);
			var cellPct = parseFloat((parseFloat(colTotal/rowTotal) * 100).toFixed(1));
			var cellObj = {"row": rc, "col": cc, "pct": cellPct}
			pcts.push(cellObj);
		});
		pcts.push({"row": rc, "col": "all", "pct": 100.0});
	});
	_.each(colCats, function(cc) {
		var searchObj = {};
		searchObj[col] = cc;
		var matches = _where(data, searchObj);
		var colTotal = parseFloat((parseFloat(nSum(matches)/grandTotal) * 100).toFixed(1));
		pcts.push({"row": "all", "col": cc, "pct": colTotal});
	});
	return pcts;
}

/*
	Same as pct across, same return object	
*/

function pctDown(dataset, row, col) {
	var data = dataset.data;
	var grandTotal = nSum(data);
	var vars = dataset.varNames;
	var cats = dataset.varLabels
	var rowIndex = vars.indexOf(row);
	var colIndex = vars.indexOf(col);
	var rowCats = cats[rowIndex];
	var colCats = cats[colIndex];
	var pcts = [];
	_.each(rowCats, function(rc) {
		_.each(colCat, function(cc) {
			var totalObj = {};
			totalObj[col] = cc;
			var totalSum = nSum(_.where(data, totalObj));
			var cellObj = {};
			cellObj[row] = rc;
			cellObj[col] = cc;
			var cellSum = nSum(_.where(data, cellObj));
			var cellPct = parseFloat((parseFloat(cellTotal/totalSum) * 100).toFixed(1));
			pcts.push("row": rc, "col": cc, "pct": cellPct);
		});
		var rowObj = {};
		rowObj[row] = rc;
		var rowSum = nSum(_where(data, totalObj));
		var rowTotalPct = parseFloat((parseFloat(rowSum/grandTotal) * 100).toFixed(1));
		pcts.push({"row": rc, "col": "all", "pct": rowTotalPct});
	});
	_.each(colCats, function(cc) {
		pcts.push({"row": "all", "col": cc, "pct": 100.0});
	});
}

function singleBarChart(dataset, variable, targetW, targetH) {
	var data = marginals(dataset.data);
	var match = _.where(data, {"name": variable});
	//to finish later

	
}