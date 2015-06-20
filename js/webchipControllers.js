var webchipApp = angular.module('webchipApp', []);

webchipApp.controller("default", ['$scope', '$http', 
	function($scope, $http) {
		$http.get('data/index.json').success(function(d) {
			$scope.availableDatasets = d;
		});

		$scope.changeDataset = function() {
			var dataset = getCurrentDataset();
			$http.get(dataset).success(function(d) {
				$scope.completeDataset = d;
				$scope.varCategories = d["varCats"];
				$scope.title = d["title"];
				$scope.varNames = d["varNames"];
				$scope.theData = d["theData"];
				$scope.numberCategories = [];
				_.each($scope.varCategories, function(c) {
					var theName = c["name"];
					var theCatsLen = c["cats"].length;
					entry = {"var": theName, "cats": theCatsLen};
					$scope.numberCategories.push(entry);
				});
				var shortDataName = getCurrentDataset().split("/").slice(1, 3).join("/");
				$("#command-history-body").append("<p>Change dataset to " + shortDataName + "</p>");
			});
		};

		$scope.omitVar = function(variable, cats) {
			$scope.theData = omit($scope.theData, variable, cats);
		};

		$scope.combineVar = function(variable, cats, name) {
			$scope.theData = combine($scope.theData, variable, cats, name);
		};

		$scope.generateMarginals = function() {
			$("#workbook").append("<h4>Marginals</h4>");
			var margs = marginals($scope.completeDataset);
			var marginalsTables = generateMarginalTables(margs);
			$("#workbook").append(marginalsTables);
			$("#command-history-body").append("<p>Compute Marginals</p>")
		};

		$scope.generateFrequency = function() {
			$("#workbook").append("<h4>Frequency: " + getRowVar() + "/" + getColVar() + "</h4>");
			if(controlSet()) {
				var rowVar = getRowVar();
				var colVar = getColVar();
				var conVar = getControlVar();
				var theDataset = copyObject($scope.completeDataset);
				var splitArray = controlData(theDataset, conVar);
				_.each(splitArray, function(d) {
					var cat = d["theData"][0][conVar];
					var freqs = frequency(d, rowVar, colVar);
					var freqTable = generateGeneralTable(freqs, 'count');
					$("#workbook").append("<p>Control: " + cat + "</p>");
					$("#workbook").append(freqTable + "<br>");
				});
			} else {
				var rowVar = getRowVar();
				var colVar = getColVar();
				var freqs = frequency($scope.completeDataset, rowVar, colVar);
				var freqTable = generateGeneralTable(freqs, 'count');
				$("#workbook").append(freqTable);	
			}
			$("#command-history-body").append("<p>Compute Frequency</p>");
		};

		$scope.generatePctAcross = function() {
			$("#workbook").append("<h4>Percent Across: " + getRowVar() + "/" + getColVar() + "</h4>");
			if(controlSet()) {
				var rowVar = getRowVar();
				var colVar = getColVar();
				var conVar = getControlVar();
				var theDataset = copyObject($scope.completeDataset);
				var splitArray = controlData(theDataset, conVar);
				_.each(splitArray, function(d) {
					var cat = d["theData"][0][conVar];
					var pctAcrosses = pctAcross(d, rowVar, colVar);
					var pctAcrossTable = generateGeneralTable(pctAcrosses, 'pct');
					$("#workbook").append("<p>Control: " + cat + "</p>");
					$("#workbook").append(pctAcrossTable + "<br>");
				});
			} else {
				var rowVar = getRowVar();
				var colVar = getColVar();
				var pctAcrosses = pctAcross($scope.completeDataset, rowVar, colVar);
				var pctAcrossTable = generateGeneralTable(pctAcrosses, 'pct');
				$("#workbook").append(pctAcrossTable);
			}
			$("#command-history-body").append("<p>Compute Percent Across</p>");
		};

		$scope.generatePctDown = function() {
			$("#workbook").append("<h4>Percent Down: " + getRowVar() + "/" + getColVar() + "</h4>");
			var rowVar = getRowVar();
			var colVar = getColVar();
			var conVar = getControlVar();
			if(controlSet()) {
				var theDataset = copyObject($scope.completeDataset);
				var splitArray = controlData(theDataset, conVar);
				_.each(splitArray, function(d) {
					var cat = d["theData"][0][conVar];
					var pctDowns = pctDown(d, rowVar, colVar);
					var pctDownTable = generateGeneralTable(pctDowns, 'pct');
					$("#workbook").append("<p>Control: " + cat + "</p>");
					$("#workbook").append(pctDownTable + "<br>");
				});
			} else {
				var pctDowns = pctDown($scope.completeDataset, rowVar, colVar);
				var pctDownTable = generateGeneralTable(pctDowns, 'pct');
				$("#workbook").append(pctDownTable + "<br>");
			}
			$("#command-history-body").append("<p>Compute Percent Down</p>");
		};
		
		$scope.generateBarChart = function() {
			if(singleVarSelected()) {
				var singleVar = getSingleVar();
				$("#workbook").append("<h4>Bar Chart: " +  singleVar + " (Single Variable)</h4>");
				var margs = marginals($scope.completeDataset);
				var singleDataset = singleData(margs, singleVar);
				generateBarCharts(singleDataset,'single');
				$("#command-history-body").append("<p>Generate Bar Chart (single variable)</p>");			
			}
			else {
				//Crosstab
				var rowVar = getRowVar();
				var colVar = getColVar();
				var conVar = getControlVar();
				if (nextPctAcross()) {
					//on PctAcross way
					$("#workbook").append("<h4>Bar Chart: " + rowVar + "/" + colVar + " (Percent Across)</h4>");
					if(controlSet()) {
						var theDataset = copyObject($scope.completeDataset);
						var splitArray = controlData(theDataset, conVar);
						_.each(splitArray, function(d) {
							var cat = d["theData"][0][conVar];
							$("#workbook").append("<p>Control: " + cat + "</p>");
							var pctAcrosses = pctAcross(d, rowVar, colVar);
							var crosstabDataset = crosstabData(pctAcrosses);
							generateBarCharts(crosstabDataset,'crosstab');
						});
					}
					else {
						var pctAcrosses = pctAcross($scope.completeDataset, rowVar, colVar);
						var crosstabDataset = crosstabData(pctAcrosses);
						generateBarCharts(crosstabDataset,'crosstab');
					}
				}
				else {
					//on PctDown way
					$("#workbook").append("<h4>Bar Chart: " + rowVar + "/" + colVar + " (Percent Down)</h4>");
					if(controlSet()) {
						var theDataset = copyObject($scope.completeDataset);
						var splitArray = controlData(theDataset, conVar);
						_.each(splitArray, function(d) {
							var cat = d["theData"][0][conVar];
							$("#workbook").append("<p>Control: " + cat + "</p>");
							var pctDowns = pctDown(d, rowVar, colVar);
							var crosstabDataset = crosstabData(pctDowns);
							generateBarCharts(crosstabDataset,'crosstab');
						});
					}
					else {
						var pctDowns = pctDown($scope.completeDataset, rowVar, colVar);
						var crosstabDataset = crosstabData(pctDowns);
						generateBarCharts(crosstabDataset,'crosstab');
					}
				}
				$("#command-history-body").append("<p>Generate Bar Chart (crosstab)</p>");
			}
		};
		
		$scope.generatePieChart = function() {
			if(singleVarSelected()) {
				var singleVar = getSingleVar();
				$("#workbook").append("<h4>Pie Chart: " +  singleVar + " (Single Variable)</h4>");
				var margs = marginals($scope.completeDataset);
				var singleDataset = singleData(margs, singleVar);
				generatePieCharts(singleDataset,'single');
				$("#command-history-body").append("<p>Generate Pie Chart (single variable)</p>");
			}
			else {
				//Crosstab
				var rowVar = getRowVar();
				var colVar = getColVar();
				var conVar = getControlVar();
								
				//generate title
				if (nextPctAcross()) {
					$("#workbook").append("<h4>Pie Chart: " + rowVar + "/" + colVar + " (Percent Across)</h4>");
				}
				else {
					$("#workbook").append("<h4>Pie Chart: " + rowVar + "/" + colVar + " (Percent Down)</h4>");
				}	
		
				if(controlSet()) {
					var theDataset = copyObject($scope.completeDataset);
					var splitArray = controlData(theDataset, conVar);
					_.each(splitArray, function(d) {
						var cat = d["theData"][0][conVar];
						$("#workbook").append("<p>Control: " + cat + "</p>");
						var freqs = frequency(d, rowVar, colVar);
						var crosstabDataset = crosstabData(freqs);
						generatePieCharts(crosstabDataset,'crosstab');
					});
				}
				else {
					var freqs = frequency($scope.completeDataset, rowVar, colVar);
					var crosstabDataset = crosstabData(freqs);
					generatePieCharts(crosstabDataset,'crosstab');
				}
				$("#command-history-body").append("<p>Generate Pie Chart (crosstab)</p>");
			}
		};
		
		$scope.generateLineChart = function() {
			if(singleVarSelected()) {
				var singleVar = getSingleVar();
				$("#workbook").append("<h4>Line Chart: " +  singleVar + " (Single Variable)</h4>");
				var margs = marginals($scope.completeDataset);
				var singleDataset = singleData(margs, singleVar);
				generateLineCharts(singleDataset,'single');
				$("#command-history-body").append("<p>Generate Line Chart (single variable)</p>");
			}
			else {
				//Crosstab
				var rowVar = getRowVar();
				var colVar = getColVar();
				var conVar = getControlVar();
				if (nextPctAcross()) {
					//on PctAcross way
					$("#workbook").append("<h4>Line Chart: " + rowVar + "/" + colVar + " (Percent Across)</h4>");
					if(controlSet()) {
						var theDataset = copyObject($scope.completeDataset);
						var splitArray = controlData(theDataset, conVar);
						_.each(splitArray, function(d) {
							var cat = d["theData"][0][conVar];
							$("#workbook").append("<p>Control: " + cat + "</p>");
							var pctAcrosses = pctAcross(d, rowVar, colVar);
							var crosstabDataset = crosstabData(pctAcrosses);
							generateLineCharts(crosstabDataset,'crosstab');
						});
					}
					else {
						var pctAcrosses = pctAcross($scope.completeDataset, rowVar, colVar);
						var crosstabDataset = crosstabData(pctAcrosses);
						generateLineCharts(crosstabDataset,'crosstab');
					}
				}
				else {
					//on PctDown way
					$("#workbook").append("<h4>Line Chart: " + rowVar + "/" + colVar + " (Percent Down)</h4>");
					if(controlSet()) {
						var theDataset = copyObject($scope.completeDataset);
						var splitArray = controlData(theDataset, conVar);
						_.each(splitArray, function(d) {
							var cat = d["theData"][0][conVar];
							$("#workbook").append("<p>Control: " + cat + "</p>");
							var pctDowns = pctDown(d, rowVar, colVar);
							var crosstabDataset = crosstabData(pctDowns);
							generateLineCharts(crosstabDataset,'crosstab');
						});
					}
					else {
						var pctDowns = pctDown($scope.completeDataset, rowVar, colVar);
						var crosstabDataset = crosstabData(pctDowns);
						generateLineCharts(crosstabDataset,'crosstab');
					}
				}
				$("#command-history-body").append("<p>Generate Line Chart (crosstab)</p>");
			}
		};
		
		$scope.generateStackedBar = function() {
			if(singleVarSelected()) {
				var singleVar = getSingleVar();
				$("#workbook").append("<h4>Stacked Bar: " +  singleVar + " (Single Variable)</h4>");
				var margs = marginals($scope.completeDataset);
				var singleDataset = singleData(margs, singleVar);
				generateStackedBars(singleDataset,'single', singleVar);
				$("#command-history-body").append("<p>Generate Stacked Bar (single variable)</p>");
			}
			else {
				//Crosstab
				var rowVar = getRowVar();
				var colVar = getColVar();
				var conVar = getControlVar();
				if (nextPctAcross()) {
					//on PctAcross way
					$("#workbook").append("<h4>Stacked Bar: " + rowVar + "/" + colVar + " (Percent Across)</h4>");
					if(controlSet()) {
						var theDataset = copyObject($scope.completeDataset);
						var splitArray = controlData(theDataset, conVar);
						_.each(splitArray, function(d) {
							var cat = d["theData"][0][conVar];
							$("#workbook").append("<p>Control: " + cat + "</p>");
							var pctAcrosses = pctAcross(d, rowVar, colVar);
							var crosstabDataset = crosstabData(pctAcrosses);
							generateStackedBars(crosstabDataset,'crosstab');
						});
					}
					else {
						var pctAcrosses = pctAcross($scope.completeDataset, rowVar, colVar);
						var crosstabDataset = crosstabData(pctAcrosses);
						generateStackedBars(crosstabDataset,'crosstab');
					}
				}
				else {
					//on PctDown way
					$("#workbook").append("<h4>Stacked Bar: " + rowVar + "/" + colVar + " (Percent Down)</h4>");
					if(controlSet()) {
						var theDataset = copyObject($scope.completeDataset);
						var splitArray = controlData(theDataset, conVar);
						_.each(splitArray, function(d) {
							var cat = d["theData"][0][conVar];
							$("#workbook").append("<p>Control: " + cat + "</p>");
							var pctDowns = pctDown(d, rowVar, colVar);
							var crosstabDataset = crosstabData(pctDowns);
							generateStackedBars(crosstabDataset,'crosstab');
						});
					}
					else {
						var pctDowns = pctDown($scope.completeDataset, rowVar, colVar);
						var crosstabDataset = crosstabData(pctDowns);
						generateStackedBars(crosstabDataset,'crosstab');
					}
				}
				$("#command-history-body").append("<p>Generate Stacked Bar (crosstab)</p>");
			}
		};
		
	}]);


