//load json file
/*function load(filename, func) {
	$.getJSON(filename, function(data) {
		if (func == "marginals") {
			marginals(data);
		}
		else if (func == "crosstab") {
			crosstabReadVar(data);
		}
		else if (func == "linechartPA") {
			lineChart(data,"crosstabPerAcross");
		}
		else if (func == "linechartPD") {
			lineChart(data,"crosstabPerDown");
		}
		else if (func == "barchartPA") {
			barChart(data,"crosstabPerAcross");
		}
		else if (func == "barchartPD") {
			barChart(data,"crosstabPerDown");
		}
		else if (func == "stackedbarPA") {
			stackedBar(data,"crosstabPerAcross");
		}
		else if (func == "stackedbarPD") {
			stackedBar(data,"crosstabPerDown");
		}
		else if (func == "piechartPA") {
			pieChart(data,"crosstabPerAcross");
		}
		else if (func == "piechartPD") {
			pieChart(data,"crosstabPerDown");
		}
		else if (func == "singleLC") {
			singleLineChart(data);
		}
		else if (func == "singleBC") {
			singleBarChart(data);
		}
		else if (func == "singleSB") {
			singleStackedBar(data);
		}
		else if (func == "singlePC") {
			singlePieChart(data);
		}
	});
}*/

//find names of variables in data
function discoverVar(data) {
	var variables = new Array();
	for (var name in data[0]) {
		if (name != "Dep") {
			variables.push(name);
		}
	}
	return variables;
}

//prepare data for Marginals and charts for single variable
function marginalsData(data) {
	var variables = discoverVar(data);
	var tdata = new Object();
	var total = new Object();
	for (var i=0; i<variables.length; i++) {
		var variable = variables[i];
		tdata[variable] = {};
		total[variable] = 0; 
		//"total" will be the same for every variable. Using an object is for preparing for omit/combine.
		for (var j=0; j<data.length; j++) {
			var value = Number(data[j].Dep);
			var valOfVar = data[j][variable];
			if (tdata[variable].hasOwnProperty(valOfVar)) {
				tdata[variable][valOfVar] += value;
				total[variable] += value;
			}
			else {
				tdata[variable][valOfVar] = value;
				total[variable] += value;
			}
		}
	}
	return [tdata,total];
}

//Marginals function 
function marginals(data) {
	var processedData = marginalsData(data);
	var tdata = processedData[0];
	var total = processedData[1];
	var html = "";
	for (var variable in tdata) {
		html += "<br/>";
		html += variable;
		html += "<br/><table><tr>";
		//print names of the variable 
		for (var name in tdata[variable]) {
			html += "<td>";
			html += name;
			html += "</td>"
		}
		html += "</tr><tr>"
		//print percentages
		for (var name in tdata[variable]) {
			html += "<td>";
			html += ((tdata[variable][name]/total[variable])*100).toFixed(1);
			html += "%</td>";
		}
		html += "</tr><tr>"
		//print numbers
		for (var name in tdata[variable]) {
			html += "<td>";
			html += tdata[variable][name].toLocaleString();
			html += "</td>";
		}
		html += "</tr></table>";
	}
	$(html).appendTo( "#workbook" );
}

//previous Marginals function
/*function marginals1(data) {
	var variables = discoverVar(data);
	var html = "";
	for (var i=0; i<variables.length; i++) {
		var variable = variables[i];
		var total = 0;
		var tdata = new Object();
		html += "<br/>";
		html += variable;
		html += "<br/><table><tr>";
		for (var j=0; j<data.length; j++) {
			var value = Number(data[j].Dep);
			var valOfVar = data[j][variable];
			if (tdata.hasOwnProperty(valOfVar)) {
				tdata[valOfVar] += value;
				total += value;
			}
			else {
				tdata[valOfVar] = value;
				total += value;
			}
		}
		//print names of the variable 
		for (var name in tdata) {
			html += "<td>";
			html += name;
			html += "</td>"
		}
		html += "</tr><tr>"
		//print percentages
		for (var name in tdata) {
			html += "<td>";
			html += ((tdata[name]/total)*100).toFixed(1);
			html += "%</td>";
		}
		html += "</tr><tr>"
		//print numbers
		for (var name in tdata) {
			html += "<td>";
			html += tdata[name].toLocaleString();
			html += "</td>";
		}
		html += "</tr></table>";
	}
	$(html).appendTo( "#table1" );
}*/

//read row name and column name of Crosstab
function crosstabReadVar(data) {
	var rowname = "RaceEth";
	var colname = "Earn2";
	crosstab(data, rowname,colname)
}

//Crosstab function
function crosstab(data,rowname,colname) {
	var html = "<br/>Crosstab: "+rowname+"/"+colname+"<br/><table><tr><td></td>";
	var tdata = new Object();
	var total = 0;
	//sum of every attribute in row 
	var rowSummary = new Object();
	//sum of every attribute in column 
	var colSummary = new Object();
	for (var i=0; i<data.length; i++) {
		var rowvar = data[i][rowname];
		var colvar = data[i][colname];
		var value = Number(data[i].Dep);
		if (tdata.hasOwnProperty(rowvar)) {
			if (tdata[rowvar].hasOwnProperty(colvar)) {
				tdata[rowvar][colvar] += value;
				total += value;
				rowSummary[rowvar] += value;
				colSummary[colvar] += value;
			}
			else {
				tdata[rowvar][colvar] = value;
				total += value;
				rowSummary[rowvar] += value;
				if (colSummary.hasOwnProperty(colvar)) {
					colSummary[colvar] += value;
				}
				else {
					colSummary[colvar] = value;
				}
			}
		}
		else {
			tdata[rowvar] = {};
			tdata[rowvar][colvar] = value;
			total += value;
			rowSummary[rowvar] = value;
			if (colSummary.hasOwnProperty(colvar)) {
				colSummary[colvar] += value;
			}
			else {
				colSummary[colvar] = value;
			}
		}
	}
	//will change
	corssway = "crosstabPerDown";
	//crosstabFreq
	if (corssway == "crosstabFreq") {
		for (var nameCol in colSummary) {
			html += "<td>";
			html += nameCol;
			html += "</td>";
		}
		html += "<td>TOTAL</td></tr>";
		for (var nameRow in tdata) {
			html += "<tr><td>";
			html += nameRow;
			html += "</td>";
			for (var nameCol in colSummary) {
				html += "<td>";
				html += tdata[nameRow][nameCol].toLocaleString();
				html += "</td>";
			}
			html += "<td>";
			html += rowSummary[nameRow].toLocaleString();
			html += "</td>";
			html += "</tr>";
		}
		html += "<tr><td>TOTAL</td>";
		for (var nameCol in colSummary) {
			html += "<td>";
			html += colSummary[nameCol].toLocaleString();
			html += "</td>";
		}
		html += "</tr></table>";
	}
	//crosstabPerAcross
	else if (corssway == "crosstabPerAcross") {
		for (var nameCol in colSummary) {
			html += "<td>";
			html += nameCol;
			html += "</td>";
		}
		html += "<td>TOTAL</td></tr>";
		for (var nameRow in tdata) {
			html += "<tr><td>";
			html += nameRow;
			html += "</td>";
			for (var nameCol in colSummary) {
				html += "<td>";
				html += (tdata[nameRow][nameCol]/rowSummary[nameRow]*100).toFixed(1);
				html += "%</td>";
			}
			html += "<td>100%</td>";
			html += "</tr>";
		}
		html += "<tr><td>TOTAL</td>";
		for (var nameCol in colSummary) {
			html += "<td>";
			html += (colSummary[nameCol]/total*100).toFixed(1);
			html += "%</td>";
		}
		html += "</tr></table>";
	}
	//crosstabPerDown
	else if (corssway == "crosstabPerDown") {
		//the first row
		for (var nameCol in colSummary) {
			html += "<td>";
			html += nameCol;
			html += "</td>";
		}
		html += "<td>TOTAL</td></tr>";
		//other rows(excluding the first row and the last row)
		for (var nameRow in tdata) {
			html += "<tr><td>";
			html += nameRow;
			html += "</td>";
			for (var nameCol in colSummary) {
				html += "<td>";
				html += (tdata[nameRow][nameCol]/colSummary[nameCol]*100).toFixed(1);
				html += "%</td>";
			}
			html += "<td>";
			html += (rowSummary[nameRow]/total*100).toFixed(1);
			html += "%</td>";
			html += "</tr>";
		}
		//the last row
		html += "<tr><td>TOTAL</td>";
		for (var nameCol in colSummary) {
			html += "<td>100%</td>";
		}
		html += "</tr></table>";
	}
	$(html).appendTo( "#table1" ); 
}

//function crosstabFreq
 
//process data for charts of two variables
function chartData(data,rowname,colname) {
	var tdata = new Object();
	//var total = 0;
	//sum of every attribute in row 
	var rowSummary = new Object();
	//sum of every attribute in column 
	var colSummary = new Object();
	for (var i=0; i<data.length; i++) {
		var rowvar = data[i][rowname];
		var colvar = data[i][colname];
		var value = Number(data[i].Dep);
		if (tdata.hasOwnProperty(rowvar)) {
			if (tdata[rowvar].hasOwnProperty(colvar)) {
				tdata[rowvar][colvar] += value;
				//total += value;
				rowSummary[rowvar] += value;
				colSummary[colvar] += value;
			}
			else {
				tdata[rowvar][colvar] = value;
				//total += value;
				rowSummary[rowvar] += value;
				if (colSummary.hasOwnProperty(colvar)) {
					colSummary[colvar] += value;
				}
				else {
					colSummary[colvar] = value;
				}
			}
		}
		else {
			tdata[rowvar] = {};
			tdata[rowvar][colvar] = value;
			//total += value;
			rowSummary[rowvar] = value;
			if (colSummary.hasOwnProperty(colvar)) {
				colSummary[colvar] += value;
			}
			else {
				colSummary[colvar] = value;
			}
		}
	}
	return [tdata,rowSummary,colSummary];
}

function lineChart(data, corssway) {
	var rowname = "RaceEth";
	var colname = "Earn2";
	var processedData = chartData(data,rowname,colname);
 	var finalData = new Array();
	var catename = new Array();
	var html = '';
	//crosstabPerAcross
	if (corssway == "crosstabPerAcross") {
		html = '<h2>'+rowname+' by '+colname+'</h2>';		
		var chartdata1 = dataPerAcross(processedData);
		finalData = chartdata1[0];
		catename = chartdata1[1];
	}
	//crosstabPerDown
	else if (corssway == "crosstabPerDown") {
		html = '<h2>'+colname+' by '+rowname+'</h2>';
		var chartdata1 = dataPerDown(processedData);
		finalData = chartdata1[0];
		catename = chartdata1[1];
	}
	var chart = c3.generate({
		//bindto: '#chart1',
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
	$(html).appendTo( "#chart1" ); 
	$(chart.element).appendTo("#chart1");
}

function barChart(data, corssway) {
	var rowname = "RaceEth";
	var colname = "Earn2";
	var processedData = chartData(data,rowname,colname);
 	var finalData = new Array();
	var catename = new Array();
	var html = '';
	//crosstabPerAcross
	if (corssway == "crosstabPerAcross") {
		html = '<h2>'+rowname+' by '+colname+'</h2>';		
		var chartdata1 = dataPerAcross(processedData);
		finalData = chartdata1[0];
		catename = chartdata1[1];
	}
	//crosstabPerDown
	else if (corssway == "crosstabPerDown") {
		html = '<h2>'+colname+' by '+rowname+'</h2>';
		var chartdata1 = dataPerDown(processedData);
		finalData = chartdata1[0];
		catename = chartdata1[1];
	}
	var chart = c3.generate({
		//bindto: '#chart1',
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
	$(html).appendTo( "#chart1" );	
	$(chart.element).appendTo("#chart1");
}

function stackedBar(data, corssway) {
	var rowname = "RaceEth";
	var colname = "Earn2";
	var processedData = chartData(data,rowname,colname);
 	var finalData = new Array();
	var catename = new Array();
	var dataname = new Array();
	var html = '';
	//crosstabPerAcross
	if (corssway == "crosstabPerAcross") {
		html = '<h2>'+rowname+' by '+colname+'</h2>';		
		var chartdata1 = dataPerAcross(processedData);
		finalData = chartdata1[0];
		catename = chartdata1[1];
		dataname = chartdata1[2];
	}
	//crosstabPerDown
	else if (corssway == "crosstabPerDown") {
		html = '<h2>'+colname+' by '+rowname+'</h2>';
		var chartdata1 = dataPerDown(processedData);
		finalData = chartdata1[0];
		catename = chartdata1[1];
		dataname = chartdata1[2];
	}
	var chart = c3.generate({
		//bindto: '#chart1',
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
	$(html).appendTo( "#chart1" ); 
	$(chart.element).appendTo("#chart1");
}

function pieChart(data, corssway) {
	var rowname = "RaceEth";
	var colname = "Earn2";
	var processedData = chartData(data,rowname,colname);
 	var finalData = new Array();
	var html = '';
	//crosstabPerAcross
	if (corssway == "crosstabPerAcross") {		
		var chartdata1 = dataPerDown(processedData);
		finalData = chartdata1[3];
	}
	//crosstabPerDown
	else if (corssway == "crosstabPerDown") {
		var chartdata1 = dataPerAcross(processedData);
		finalData = chartdata1[3];
	}
	for (var title in finalData) {
		html = '<h2>';
		html += title;
		html += '</h2>';
		var chart = c3.generate({
			size: {
				height: 390
			},
			data: {
				columns: finalData[title],
				type: 'pie',
				order: null
			}
			/* pie: {
				label: {
					threshold: 0.001
				}
			}, */
/* 			tooltip: {
				format:{
					value:function(x){
						return x.toLocaleString();
					}
				}
			} */
		});
		$(html).appendTo("#chart1");
		$(chart.element).appendTo("#chart1");
	}
}

function dataPerAcross(data) {
	var tdata = data[0];
	var rowSummary = data[1];
	var colSummary = data[2];
	var finalData = new Array();
	var finalDataPie = new Object();
	var catename = new Array();
	var dataname = new Array();
	var i = 0;
	for (var nameCol in colSummary) {
		finalDataPie[nameCol] = [];
		dataname.push(nameCol);
		finalData.push([]);
		finalData[i].push(nameCol);
		for (var nameRow in tdata) {
			var temp = [];
			temp.push(nameRow);
			temp.push(tdata[nameRow][nameCol]);
			finalDataPie[nameCol].push(temp);
			finalData[i].push((tdata[nameRow][nameCol]/rowSummary[nameRow]*100).toFixed(3));
		}
		i++;
		}
	for (var nameRow in rowSummary) {
		catename.push(nameRow);
	}
	return [finalData,catename,dataname,finalDataPie];
}

function dataPerDown(data) {
	var tdata = data[0];
	var rowSummary = data[1];
	var colSummary = data[2];
	var finalData = new Array();
	var finalDataPie = new Object();
	var catename = new Array();
	var dataname = new Array();
	var i = 0;
	for (var nameRow in rowSummary) {
		finalDataPie[nameRow] = [];
		dataname.push(nameRow);
		finalData.push([]);
		finalData[i].push(nameRow);
		for (var nameCol in tdata[nameRow]) {
			var temp = [];
			temp.push(nameCol);
			temp.push(tdata[nameRow][nameCol]);
			finalDataPie[nameRow].push(temp);
			finalData[i].push((tdata[nameRow][nameCol]/colSummary[nameCol]*100).toFixed(3));
		}
		i++;
	}
	for (var nameCol in colSummary) {
		catename.push(nameCol);
	}
	return [finalData,catename,dataname,finalDataPie]; 
}

/* functions for charts of single variable */
//can be combined with crosstabReadVar (run this function when any value is "".)
//this function will be changed after having UI
function singleVarChartReader(variable) {
	return variable;
}

function singleVarChartData(data,variable) {
	var processedData = marginalsData(data);
	var variable = variable;
	var tdata = processedData[0];
	var total = processedData[1];
	var finalData = new Array();
	var catename = new Array();
	var finalDataSB = new Array();
	var finalDataPC = new Array();
	for (var name in tdata[variable]) {
		catename.push(name);
		var value = tdata[variable][name];
		var valuePer = (tdata[variable][name]/total[variable]*100).toFixed(3);
		finalData.push(valuePer);
		var tempSB = [];
		tempSB.push(name);
		tempSB.push(valuePer);
		finalDataSB.push(tempSB);
		var tempPC = [];
		tempPC.push(name);
		tempPC.push(value);
		finalDataPC.push(tempPC);
	}
	finalData.unshift(variable);
	return [finalData,catename,finalDataSB,finalDataPC];
}

//line chart of single variable
function singleLineChart(data) {
	var variable = "AgePro";
	var processedData = singleVarChartData(data,variable);
	var finalData = processedData[0];
	var catename = processedData[1];
	var html = '<h2>'+variable+'</h2>';
	var chart = c3.generate({
		//bindto: '#chart1',
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
	$(html).appendTo( "#chart1" ); 
	$(chart.element).appendTo("#chart1");
}

//bar chart of single variable
function singleBarChart(data) {
	var variable = "AgePro";
	var processedData = singleVarChartData(data,variable);
	var finalData = processedData[0];
	var catename = processedData[1];
	var html = '<h2>'+variable+'</h2>';
	var chart = c3.generate({
		//bindto: '#chart1',
		size: {
			height: 390
		},
		data: {
			columns: [finalData],
			type: 'bar'
		},
		bar: {
			width: {
				rato:0.5
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
	$(html).appendTo( "#chart1" );
	$(chart.element).appendTo("#chart1");
}

function singleStackedBar(data) {
	var variable = "AgePro";
	var processedData = singleVarChartData(data,variable);
	var finalData = processedData[2];
	var catename = processedData[1];
	var html = '<h2>'+variable+'</h2>';
	var chart = c3.generate({
		//bindto: '#chart1',
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
				categories: [variable]
			},
			y: {
				label: {
					text: 'Percentage',
					position: 'outer-middle'
				}
			}
		}
	});
	$(html).appendTo( "#chart1" ); 
	$(chart.element).appendTo("#chart1");	
}

function singlePieChart(data) {
	var variable = "AgePro";
	var processedData = singleVarChartData(data,variable);
	var finalData = processedData[3];
	var html = '<h2>'+variable+'</h2>';
	var chart = c3.generate({
		//bindto: '#chart1',
		size: {
			height: 390
		},
		data: {
			columns: finalData,
			type: 'pie',
			order: null
		}
		/* pie: {
			label: {
				threshold: 0.001
			}
		}, */
	/* 	tooltip: {
			format:{
				value:function(x){
					return x.toLocaleString();
				}
			}
		} */
	});
	$(html).appendTo("#chart1");
	$(chart.element).appendTo("#chart1");
}