var webchipApp = angular.module('webchipApp', []);

//controller serves entire index.html page
webchipApp.controller("default", ['$scope', '$http',
	function($scope, $http) {
		//fetch index file and store data
		$http.get('data/index.json').success(function(d) {
			$scope.availableDatasets = d;
		});

		//when dataset selected initialize scope variables
		$scope.changeDataset = function() {
			var dataset = getCurrentDataset();
			$http.get(dataset).success(function(d) {
				$scope.completeDataset = d;
				$scope.varCategories = d["varCats"];
				$scope.title = d["title"];
				$scope.varNames = d["varNames"];
				$scope.theData = d["theData"];
				$scope.numberCategories = [];
				//Displays chart method
				$scope.chartMethod = 'N/A';
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

		//omit function, not yet implemented
		$scope.omitVar = function(variable, cats) {
			$scope.theData = omit($scope.theData, variable, cats);
		};

		//combine function, not yet implemented
		$scope.combineVar = function(variable, cats, name) {
			$scope.theData = combine($scope.theData, variable, cats, name);
		};

		//append marginal table to workbook, uses charts_tables.js functions
		$scope.generateMarginals = function() {
			$("#workbook").append("<span class='object-header'>Marginals</span>");
			var margs = marginals($scope.completeDataset);
			var marginalsTables = generateMarginalTables(margs);
			$("#workbook").append(marginalsTables);
			$("#command-history-body").append("<p>Compute Marginals</p>")
			scrollWorkbook();
		};

		//append frequenct table to workbook, uses charts_tables.js functions
		$scope.generateFrequency = function() {
			$("#workbook").append("<span class='object-header'>Frequency: " + getRowVar() + "/" + getColVar() + "</span>");
			if(controlSet()) {
				var rowVar = getRowVar();
				var colVar = getColVar();
				var conVar = getControlVar();
				var theDataset = copyObject($scope.completeDataset);
				var splitArray = controlData(theDataset, conVar);
				_.each(splitArray, function(d) {
					var cat = "";
					for(var i=0; i<conVar.length; i++) {
						cat += conVar[i];
						cat += "="
						cat += d["theData"][0][conVar[i]];
						if(i != conVar.length-1) {
							cat += ", "
						}
						else {
							cat += "."
						}
					}
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
			scrollWorkbook();
		};

		//append percent across table to workbook, uses charts_tables.js functions
		$scope.generatePctAcross = function() {
			$("#workbook").append("<span class='object-header'>Percent Across: " + getRowVar() + "/" + getColVar() + "</span>");
			if(controlSet()) {
				var rowVar = getRowVar();
				var colVar = getColVar();
				var conVar = getControlVar();
				var theDataset = copyObject($scope.completeDataset);
				var splitArray = controlData(theDataset, conVar);
				_.each(splitArray, function(d) {
					var cat = "";
					for(var i=0; i<conVar.length; i++) {
						cat += conVar[i];
						cat += "="
						cat += d["theData"][0][conVar[i]];
						if(i != conVar.length-1) {
							cat += ", "
						}
						else {
							cat += "."
						}
					}
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
			$scope.chartMethod = 'Across';
			enableCharting();
			scrollWorkbook();
		};

		//append percent down table to workbook, uses charts_tables.js functions
		$scope.generatePctDown = function() {
			$("#workbook").append("<span class='object-header'>Percent Down: " + getRowVar() + "/" + getColVar() + "</span>");
			var rowVar = getRowVar();
			var colVar = getColVar();
			var conVar = getControlVar();
			if(controlSet()) {
				var theDataset = copyObject($scope.completeDataset);
				var splitArray = controlData(theDataset, conVar);
				_.each(splitArray, function(d) {
					var cat = "";
					for(var i=0; i<conVar.length; i++) {
						cat += conVar[i];
						cat += "="
						cat += d["theData"][0][conVar[i]];
						if(i != conVar.length-1) {
							cat += ", "
						}
						else {
							cat += "."
						}
					}
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
			$scope.chartMethod = 'Down';
			enableCharting();
			scrollWorkbook();
		};

		//append bar chart to workbook, uses charts_tables.js functions
		$scope.generateBarChart = function() {
			if(singleVarSelected()) {
				singleVarProcess('Bar Chart', $scope.completeDataset);
			}
			else {
				//Crosstab
				crosstabProcess('Bar Chart', $scope.completeDataset, $scope.chartMethod);
			}
		};

		//append pie chart to workbook, uses charts_tables.js functions
		$scope.generatePieChart = function() {
			if(singleVarSelected()) {
				singleVarProcess('Pie Chart', $scope.completeDataset);
			}
			else {
				//Crosstab
				crosstabProcess('Pie Chart', $scope.completeDataset, $scope.chartMethod);
			}
		};

		//append line chart to workbook, uses charts_tables.js functions
		$scope.generateLineChart = function() {
			if(singleVarSelected()) {
				singleVarProcess('Line Chart', $scope.completeDataset);
			}
			else {
				//Crosstab
				crosstabProcess('Line Chart', $scope.completeDataset, $scope.chartMethod);
			}
		};

		//append stacked bar chart to workbook, uses charts_tables.js functions
		$scope.generateStackedBar = function() {
			if(singleVarSelected()) {
				singleVarProcess('Stacked Bar', $scope.completeDataset);
			}
			else {
				//Crosstab				
				crosstabProcess('Stacked Bar', $scope.completeDataset, $scope.chartMethod);
			}
		};

	}]);
