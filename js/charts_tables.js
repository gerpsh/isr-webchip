//JS has a strange behavior where assigning an existing
//object to a new variable creates a pointer and not a copy
//This creates a copy
function copyObject(obj) {
	return JSON.parse(JSON.stringify(obj));
}

//Gets the sum of the dependent variable from a collection of objects
function nSum(data) {
	return _.reduce(_.pluck(data, "Dep"), function(sum, el) { return sum + parseInt(el); }, 0);
}

//formats int to have commas
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//formats float with a percent symbol
function percentify(x) {
	return x.toString() + '%';
}


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
function marginals(dataset) {
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
	console.log(margs);
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
}

/*
	Returns object collection similar to frequency return value, except with percents and not counts
*/
function pctAcross(dataset, row, col) {
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
}

function pctDown(dataset, row, col) {
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
		html += "<tr><th>" + row + "</th>";
		_.each(splitDatum, function(d) {
			html += "<td>" + transform(d["total"]) + "</td>";
		});
		html += "</tr>";
	});
	var len = html.length;
	html = html.substr(0, len-5);
	html += "</tr></table><br>";
	return html;
}

//returns collection of dataset controlled by variable specified
function controlData(dataset, control) {
	theDataset = copyObject(dataset);
	theData = copyObject(theDataset["theData"]);
	var grouped = {};
	for (var i=0; i<theData.length; i++) {
		var obj = theData[i];
		var controls = "";
		for (var j=0; j<control.length; j++) {
			controls += obj[control[j]];
			controls += "#/#"
		}
		if (!(controls in grouped)) {
			grouped[controls] = [];
			grouped[controls].push(obj);
		}
		else {
			grouped[controls].push(obj);
		}
	}
	var datasets = [];
	_.each(grouped, function(g) {
		newDataset = copyObject(theDataset);
		newDataset["theData"] = g;
		datasets.push(newDataset);
	});
	return datasets;
}

//return data for charts (single variable)
function singleData(dataset, singleVar) {
	var finalData = new Array();
	var catename = new Array();
	var finalDataSB = new Array();
	var finalDataPC = new Array();
	for (var i=0; i<dataset.length; i++) {
		if (dataset[i]["name"] == singleVar) {
			for (var j=0; j<dataset[i]["margs"].length; j++) {
				catename.push(dataset[i]["margs"][j]["category"]);
				finalData.push(dataset[i]["margs"][j]["pct"]);
				var tempSB = [];
				tempSB.push(dataset[i]["margs"][j]["category"]);
				tempSB.push(dataset[i]["margs"][j]["pct"]);
				finalDataSB.push(tempSB);
				var tempPC = [];
				tempPC.push(dataset[i]["margs"][j]["category"]);
				tempPC.push(dataset[i]["margs"][j]["count"]);
				finalDataPC.push(tempPC);
			}
			finalData.unshift(singleVar);
		}
	}
	return [catename, finalData, finalDataSB, finalDataPC];
}

//return data for charts (crosstab)
function crosstabData(dataset) {
	var finalDataBefore = new Object();
	var finalDataAfter = new Array();
	var finalDataPie = new Object();
	var rowCats = new Array();
	var colCats = new Array();
	if (~$('#chart-method')[0].innerHTML.indexOf('Across')) {
		//PctAcross
		for (var i=0; i<dataset.length; i++) {
			var rowCat = dataset[i]["row"];
			var colCat = dataset[i]["col"];
			var varValue = dataset[i]["total"];
			if (rowCat != 'Total' && colCat != 'Total') {
				if (rowCats.indexOf(rowCat) == -1) {
					rowCats.push(rowCat);
				}
				if (colCats.indexOf(colCat) == -1) {
					colCats.push(colCat);
				}

				if (colCat in finalDataBefore) {
					finalDataBefore[colCat].push(varValue);
				}
				else {
					finalDataBefore[colCat] = [];
					finalDataBefore[colCat].push(varValue);
				}
				//for pie charts
				if (rowCat in finalDataPie) {
					var temp = [colCat, varValue];
					finalDataPie[rowCat].push(temp);
				}
				else {
					finalDataPie[rowCat] = [];
					var temp = [colCat, varValue];
					finalDataPie[rowCat].push(temp);
				}
			}
			else {
				continue;
			}
		}
	}
	else {
		//PctDown
		for (var i=0; i<dataset.length; i++) {
			var rowCat = dataset[i]["row"];
			var colCat = dataset[i]["col"];
			var varValue = dataset[i]["total"];
			if (rowCat != 'Total' && colCat != 'Total') {
				if (rowCats.indexOf(colCat) == -1) {
					rowCats.push(colCat);
				}
				if (colCats.indexOf(rowCat) == -1) {
					colCats.push(rowCat);
				}

				if (rowCat in finalDataBefore) {
					finalDataBefore[rowCat].push(varValue);
				}
				else {
					finalDataBefore[rowCat] = [];
					finalDataBefore[rowCat].push(varValue);
				}
				//for pie charts
				if (colCat in finalDataPie) {
					var temp = [rowCat, varValue];
					finalDataPie[colCat].push(temp);
				}
				else {
					finalDataPie[colCat] = [];
					var temp = [rowCat, varValue];
					finalDataPie[colCat].push(temp);
				}
			}
			else {
				continue;
			}
		}
	}
	for (var item in finalDataBefore) {
		var temp = finalDataBefore[item].slice();
		temp.unshift(item);
		finalDataAfter.push(temp);
	}
	return [finalDataAfter, rowCats, colCats, finalDataPie];
}

function generateBarCharts(dataset, numOfVar) {
	if (numOfVar == 'single') {
		var catename = dataset[0];
		var finalData = dataset[1];
		var chart = c3.generate({
			size: {
				height: 390
			},
			data: {
				columns: [finalData],
				type: 'bar'
			},
			bar: {
				width: {
					ratio:0.5
				}
			},
			tooltip: {
				format:{
					value:function(x){
						return x+'%';
					}
				}
			},
			axis: {
				x: {
					type: 'category',
					categories: catename
				},
				y: {
					label: {
						text: 'Percentage',
						position: 'outer-middle'
					}
				}
			}
		});
	}
	else {
		var finalData = dataset[0];
		var catename = dataset[1];
		var chart = c3.generate({
			size: {
				height: 390
			},
			data: {
				columns: finalData,
				type: 'bar'
			},
			tooltip: {
				format:{
					value:function(x){
						return x+'%';
					}
				}
			},
			bar: {
				width: {
					ratio:0.5
				}
			},
			axis: {
				x: {
					type: 'category',
					categories: catename
				},
				y: {
					label: {
						text: 'Percentage',
						position: 'outer-middle'
					}
				}
			}
		});
	}
	$(chart.element).appendTo("#workbook");
	$('#workbook').append("<br>");
}

function generatePieCharts(dataset, numOfVar) {
	if (numOfVar == 'single') {
		var finalData = dataset[3];
		var chart = c3.generate({
			size: {
				height: 390
			},
			data: {
				columns: finalData,
				type: 'pie',
				order: null
			}
		});
		$(chart.element).appendTo("#workbook");
	}
	else {
		var finalData = dataset[3];
		for (var title in finalData) {
			var chart = c3.generate({
				size: {
					height: 390
				},
				data: {
					columns: finalData[title],
					type: 'pie',
					order: null
				}
			});
			$("#workbook").append("<p>"+ title + "</p>");
			$(chart.element).appendTo("#workbook");
			$('#workbook').append("<br>");
		}
	}
}

function generateLineCharts(dataset, numOfVar) {
	if (numOfVar == 'single') {
		var catename = dataset[0];
		var finalData = dataset[1];
		var chart = c3.generate({
			size: {
				height: 390
			},
			data: {
				columns: [finalData],
			},
			tooltip: {
				format:{
					value:function(x){
						return x+'%';
					}
				}
			},
			axis: {
				x: {
					type: 'category',
					categories: catename
				},
				y: {
					label: {
						text: 'Percentage',
						position: 'outer-middle'
					}
				}
			}
		});
	}
	else {
		var finalData = dataset[0];
		var catename = dataset[1];
		var chart = c3.generate({
			size: {
				height: 390
			},
			data: {
				columns: finalData,
			},
			tooltip: {
				format:{
					value:function(x){
						return x+'%';
					}
				}
			},
			axis: {
				x: {
					type: 'category',
					categories: catename
				},
				y: {
					label: {
						text: 'Percentage',
						position: 'outer-middle'
					}
				}
			}
		});
	}
	$(chart.element).appendTo("#workbook");
	$('#workbook').append("<br>");
}

function generateStackedBars(dataset, numOfVar, singleVar) {
	if (numOfVar == 'single') {
		var catename = dataset[0];
		var finalData = dataset[2];
		var xVar = singleVar;
		var chart = c3.generate({
			size: {
				height: 390
			},
			data: {
				columns: finalData,
				type: 'bar',
				groups: [
					catename
				],
				order: null
			},
			tooltip: {
				format:{
					value:function(x){
						return x+'%';
					}
				}
			},
			bar: {
				width: {
					rato:0.5
				}
			},
			axis: {
				x: {
					type: 'category',
					categories: [xVar]
				},
				y: {
					label: {
						text: 'Percentage',
						position: 'outer-middle'
					}
				}
			}
		});
	}
	else {
		var finalData = dataset[0];
		var catename = dataset[1];
		var dataname = dataset[2];
		var chart = c3.generate({
			size: {
				height: 390
			},
			data: {
				columns: finalData,
				type: 'bar',
				groups: [
					dataname
				],
				order: null
			},
			tooltip: {
				format:{
					value:function(x){
						return x+'%';
					}
				}
			},
			bar: {
				width: {
					rato:0.5
				}
			},
			axis: {
				x: {
					type: 'category',
					categories: catename
				},
				y: {
					label: {
						text: 'Percentage',
						position: 'outer-middle'
					}
				}
			}
		});
	}
	$(chart.element).appendTo("#workbook");
	$('#workbook').append("<br>");
}

//plot charts for singleVar
function singleVarProcess(chartType, fulldataset) {
	var singleVar = getSingleVar();
	$("#workbook").append("<p class='object-header'>"+ chartType +": "+  singleVar + " (Single Variable)</p>");
	var margs = marginals(fulldataset);
	var singleDataset = singleData(margs, singleVar);
	//can use a container to make it more extendible
	if (chartType == 'Bar Chart') {
		generateBarCharts(singleDataset,'single');
	}
	else if (chartType == 'Pie Chart') {
		generatePieCharts(singleDataset,'single');
	}
	else if (chartType == 'Line Chart') {
		generateLineCharts(singleDataset,'single');
	}
	else if (chartType == 'Stacked Bar') {
		generateStackedBars(singleDataset,'single', singleVar);
	}
	$("#command-history-body").append("<p>Generate "+ chartType +" (single variable)</p>");
	scrollWorkbook();
}

//plot charts for crosstab
function crosstabProcess(chartType, fulldataset, chartMethod) {
	var rowVar = getRowVar();
	var colVar = getColVar();
	var conVar = getControlVar();
	if (chartType !== 'Pie Chart') {
		if (chartMethod == 'Across') {
			//on PctAcross way
			$("#workbook").append("<p class='object-header'>"+ chartType +": " + rowVar + "/" + colVar + " (Percent Across)</p>");
			if(controlSet()) {
				var theDataset = copyObject(fulldataset);
				var splitArray = controlData(theDataset, conVar);
				_.each(splitArray, function(d) {
					var cat = "";
					for(var i=0; i<conVar.length; i++) {
						cat += conVar[i];
						cat += "=";
						cat += d["theData"][0][conVar[i]];
						if(i != conVar.length-1) {
							cat += ", ";
						}
						else {
							cat += ".";
						}
					}
					$("#workbook").append("<p class='control-header'>Control: " + cat + "</p>");
					var pctAcrosses = pctAcross(d, rowVar, colVar);
					var crosstabDataset = crosstabData(pctAcrosses);
					if (chartType == 'Bar Chart') {
						generateBarCharts(crosstabDataset,'crosstab');
					}
					else if (chartType == 'Line Chart') {
						generateLineCharts(crosstabDataset,'crosstab');
					}
					else if (chartType == 'Stacked Bar') {
						generateStackedBars(crosstabDataset,'crosstab');
					}
				});
			}
			else {
				var pctAcrosses = pctAcross(fulldataset, rowVar, colVar);
				var crosstabDataset = crosstabData(pctAcrosses);
				if (chartType == 'Bar Chart') {
					generateBarCharts(crosstabDataset,'crosstab');
				}
				else if (chartType == 'Line Chart') {
					generateLineCharts(crosstabDataset,'crosstab');
				}
				else if (chartType == 'Stacked Bar') {
					generateStackedBars(crosstabDataset,'crosstab');
				}
			}
		}
		else {
			//on PctDown way
			$("#workbook").append("<p class='object-header'>"+ chartType +": " + rowVar + "/" + colVar + " (Percent Down)</p>");
			if(controlSet()) {
				var theDataset = copyObject(fulldataset);
				var splitArray = controlData(theDataset, conVar);
				_.each(splitArray, function(d) {
					var cat = "";
					for(var i=0; i<conVar.length; i++) {
						cat += conVar[i];
						cat += "=";
						cat += d["theData"][0][conVar[i]];
						if(i != conVar.length-1) {
							cat += ", ";
						}
						else {
							cat += ".";
						}
					}
					$("#workbook").append("<p class='control-header'>Control: " + cat + "</p>");
					var pctDowns = pctDown(d, rowVar, colVar);
					var crosstabDataset = crosstabData(pctDowns);
					if (chartType == 'Bar Chart') {
						generateBarCharts(crosstabDataset,'crosstab');
					}
					else if (chartType == 'Line Chart') {
						generateLineCharts(crosstabDataset,'crosstab');
					}
					else if (chartType == 'Stacked Bar') {
						generateStackedBars(crosstabDataset,'crosstab');
					}
				});
			}
			else {
				var pctDowns = pctDown(fulldataset, rowVar, colVar);
				var crosstabDataset = crosstabData(pctDowns);
				if (chartType == 'Bar Chart') {
					generateBarCharts(crosstabDataset,'crosstab');
				}
				else if (chartType == 'Line Chart') {
					generateLineCharts(crosstabDataset,'crosstab');
				}
				else if (chartType == 'Stacked Bar') {
					generateStackedBars(crosstabDataset,'crosstab');
				}
			}
		}
	}
	else {
		//generate title
		if (chartMethod == 'Across') {
			$("#workbook").append("<p class='object-header'>"+ chartType +": " + rowVar + "/" + colVar + " (Percent Across)</p>");
		}
		else {
			$("#workbook").append("<p class='object-header'>"+ chartType +": " + rowVar + "/" + colVar + " (Percent Down)</p>");
		}

		if(controlSet()) {
			var theDataset = copyObject(fulldataset);
			var splitArray = controlData(theDataset, conVar);
			_.each(splitArray, function(d) {
				var cat = "";
				for(var i=0; i<conVar.length; i++) {
					cat += conVar[i];
					cat += "=";
					cat += d["theData"][0][conVar[i]];
					if(i != conVar.length-1) {
						cat += ", ";
					}
					else {
						cat += ".";
					}
				}
				$("#workbook").append("<p class='control-header'>Control: " + cat + "</p>");
				var freqs = frequency(d, rowVar, colVar);
				var crosstabDataset = crosstabData(freqs);
				generatePieCharts(crosstabDataset,'crosstab');
			});
		}
		else {
			var freqs = frequency(fulldataset, rowVar, colVar);
			var crosstabDataset = crosstabData(freqs);
			generatePieCharts(crosstabDataset,'crosstab');
		}
	}
	$("#command-history-body").append("<p>Generate "+ chartType +" (crosstab)</p>");
	scrollWorkbook();
}
