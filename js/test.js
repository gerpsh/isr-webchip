/*
compute marginals, returns object like:
	[
		{"name": "VariableName1",
		 "margs": [
		 	{"category": "categoryName1",
		 	 "pct": percent1,
		 	 "count": count1},
		 	{"category": "categoryName2",
		 	 "pct": percent2,
		 	 "count": count2},
		 ]
		},
		...
	]
*/
function nSum(data) {
	return _.reduce(_.pluck(data, "Dep"), function(sum, el) { return sum + parseInt(el); }, 0);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function percentify(x) {
	return x.toString() + '%'
}

function marginals(dataset) {
	var data = dataset["data"];
	var totalSum = nSum(data);
	var vars = dataset["varNames"];
	var cats = _.pluck(dataset["varCats"], "cats");
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
			var margObj = {"category": String(cat), "pct": parseFloat((parseFloat(pct) * 100).toFixed(2)), "count": localSum};
			rcd["margs"].push(margObj);
		});
		margs.push(rcd);
		i++;
	});
	return margs;
}

//generates a marginals table for one variable, this gets repeated in next function
function generateMarginalTable(marginalsData) {
	var varName = marginalsData["name"];
	var categories = _.pluck(marginalsData["margs"], "category");
	var pcts = _.pluck(marginalsData["margs"], "pct");
	var counts = _.pluck(marginalsData["margs"], "count");
	var html = "<p><u>" + varName + "</u></p><table><tr>";
	_.each(categories, function(c) {
		html += "<th>" + c + "</th>";
	});
	html += "</tr><tr>"
	_.each(pcts, function(p) {
		html += "<td>" + p + "%</td>";
	});
	html += "</tr><tr>"
	_.each(counts, function(c) {
		html += "<td>" + numberWithCommas(c) + "</td>";
	});
	html += "</tr></table><br>"
	return html;
}

//generates all tables for marginals
function generateMarginalTables(marginalsData) {
	var html = ""
	_.each(marginalsData, function(m) {
		html += generateMarginalTable(m);
	});
	return html;
}

/*
  Compute frequency table numbers
  Returns an object collection, e.g. [{"row":"25-44", "col":"male", "total": 3645}, ...]
  Object will be ordered by row then column, allowing for easier output
  "row total" cells will be interspersed throughout the dictionary, at regular intervals,
  and "column total" cells will be the final elements of the collections
*/
function frequency(dataset, row, col) {
	var data = dataset["data"];
	var vars = dataset["varNames"];
	var cats = _.pluck(dataset["varCats"], "cats");
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
		var returnObj = {"row": rc, "col": "Total", "total": rowTotal};
		freqs.push(returnObj);
	});
	_.each(colCats, function(cc) {
		var searchObj = {}
		searchObj[col] = cc;
		var matches = _.where(data, searchObj);
		var total = nSum(matches);
		var returnObj = {"row": "Total", "col": cc, "total": total};
		freqs.push(returnObj);
	});
	
	return freqs;
}

/*
	Returns object collection similar to frequency return value, except with percents and not counts
*/
function pctAcross(dataset, row, col) {
	var data = dataset["data"];
	var grandTotal = nSum(data);
	var vars = dataset["varNames"];
	var cats = _.pluck(dataset["varCats"], "cats");
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
			var cellObj = {"row": rc, "col": cc, "total": cellPct}
			pcts.push(cellObj);
		});
		pcts.push({"row": rc, "col": "Total", "total": 100.0});
	});
	_.each(colCats, function(cc) {
		var searchObj = {};
		searchObj[col] = cc;
		var matches = _.where(data, searchObj);
		var colTotal = parseFloat((parseFloat(nSum(matches)/grandTotal) * 100).toFixed(1));
		pcts.push({"row": "Total", "col": cc, "total": colTotal});
	});
	return pcts;
}

function pctDown(dataset, row, col) {
	var data = dataset["data"];
	var grandTotal = nSum(data);
	var vars = dataset["varNames"];
	var cats = _.pluck(dataset["varCats"], "cats");
	var rowIndex = vars.indexOf(row);
	var colIndex = vars.indexOf(col);
	var rowCats = cats[rowIndex];
	var colCats = cats[colIndex];
	var pcts = [];
	_.each(rowCats, function(rc) {
		_.each(colCats, function(cc) {
			var totalObj = {};
			totalObj[col] = cc;
			var totalSum = nSum(_.where(data, totalObj));
			var cellObj = {};
			cellObj[row] = rc;
			cellObj[col] = cc;
			var cellSum = nSum(_.where(data, cellObj));
			var cellPct = parseFloat((parseFloat(cellSum/totalSum) * 100).toFixed(1));
			pcts.push({"row": rc, "col": cc, "total": cellPct});
		});
		var rowObj = {};
		rowObj[row] = rc;
		var rowSum = nSum(_.where(data, rowObj));
		var rowTotalPct = parseFloat((parseFloat(rowSum/grandTotal) * 100).toFixed(1));
		pcts.push({"row": rc, "col": "Total", "total": rowTotalPct});
	});
	_.each(colCats, function(cc) {
		pcts.push({"row": "Total", "col": cc, "total": 100.0});
	});
	return pcts;
}


//generates table for frequencies and pct across/down
function generateGeneralTable(tableData, type) {
	var transform;
	if (type == 'count') {
		transform = numberWithCommas;
	} else if (type == 'pct') {
		transform = percentify;
	}

	var rows = _.uniq(_.pluck(tableData, "row"));
	var cols = _.uniq(_.pluck(tableData, "col"));
	var splitData = []
	_.each(rows, function(rc) {
		matches = _.where(tableData, {"row": rc})
		splitData.push(matches);
	});
	var html = "<table><tr><th></th>";
	_.each(cols, function(c) {
		html += "<th>" + c + "</th>";
	});
	html += "</tr>"
	_.each(splitData, function(splitDatum) {
		var row = splitDatum[0]["row"];
		html += "<tr><td><b>" + row + "</b></td>";
		_.each(splitDatum, function(d) {
			html += "<td>" + transform(d["total"]) + "</td>";
		});
		html += "</tr>"
	});
	html += "</table>";
	
	return html;
}
