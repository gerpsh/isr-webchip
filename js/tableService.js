webchipApp.factory('tableService', ['uiService'
  function(uiService) {
    /*When assigning an existing object to a variable,
      the variable name is a reference to a pointer to the existing object,
      and doesn't make a copy. This creates a copy*/
    var copyObject = function(obj) {
    	return JSON.parse(JSON.stringify(obj));
    };

    //Gets the sum of the dependent variable from a collection of objects
    var nSum = function(data) {
    	return _.reduce(_.pluck(data, "Dep"), function(sum, el) { return sum + parseInt(el); }, 0);
    };

    //formats int to have commas
    var numberWithCommas = function(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    //formats float with a percent symbol
    var percentify = function(x) {
    	return x.toString() + '%';
    }

    var marginals = function(dataset) {
      var data = dataset["theData"];
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
    };

    generateMarginalTable = function(variable) {
      var marginalsData = variable;
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
    };

    var generateMarginalTables = function(fulldataset) {
      var marginalsData = marginals(fulldataset);
    	var html = ""
    	_.each(marginalsData, function(m) {
    		html += generateMarginalTable(m);
    	});
      $("#workbook").append(html);
			$("#command-history-body").append("<p>Compute Marginals</p>")
    };

    

    /*
      Compute frequency table numbers
      Returns an object collection, e.g. [{"row":"25-44", "col":"male", "total": 3645}, ...]
      Object will be ordered by row then column, allowing for easier output
      "row total" cells will be interspersed throughout the dictionary, at regular intervals,
      and "column total" cells will be the final elements of the collections
    */
    var frequency = function(dataset, row, col) {
      var data = dataset["theData"];
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
    	freqs.push({"row": "Total", "col": "Total", "total": nSum(data)});
    	return freqs;
    };

    var generateFrequency = function() {

    };



    /*
    	Returns object collection similar to frequency return value, except with percents and not counts
    */
    var pctAcross = function(dataset, row, col) {
    	var data = dataset["theData"];
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
    	pcts.push({"row": "Total", "col": "Total", "total": "100"});
    	return pcts;
    };

    var pctDown = function(dataset, row, col) {
    	var data = dataset["theData"];
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
    	console.log(pcts);
    	pcts.push({"row": "Total", "col": "Total", "total": "100"});
    	return pcts;
    };



    return {
      "generateMarginalTables": generateMarginalTables
    }
  }
]);
