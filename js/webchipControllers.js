var webchipApp = angular.module('webchipApp', []);

webchipApp.controller("default", ['$scope', '$http', 
	function($scope, $http) {
		$http.get('data/index.json').success(function(d) {
			$scope.availableDatasets = d;
		});

		$scope.omitVar = function(variable, cats) {
			$scope.data = omit($scope.data, variable, cats);
		};

		$scope.combineVar = function(variable, cats, name) {
			$scope.data = combine($scope.data, variable, cats, name);
		};

		$scope.changeDataset = function() {
			var dataset = getCurrentDataset();
			$http.get(dataset).success(function(d) {
				$scope.completeDataset = d;
				$scope.varCategories = d["varCats"];
				$scope.title = d["title"];
				$scope.varNames = d["varNames"];
				$scope.data = d["data"];
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

		$scope.generateMarginals = function() {
			$("#workbook").append("<h4>Marginals</h4>");
			var margs = marginals($scope.completeDataset);
			var marginalsTables = generateMarginalTables(margs);
			$("#workbook").append(marginalsTables);
			$("#command-history-body").append("<p>Compute Marginals</p>")
		};

		$scope.generateFrequency = function() {
			var rowVar = getRowVar();
			var colVar = getColVar();
			$("#workbook").append("<h4>Frequency: " + getRowVar() + "/" + getColVar() + "</h4>");
			var freqs = frequency($scope.completeDataset, rowVar, colVar);
			var freqTable = generateGeneralTable(freqs, 'count');
			$("#workbook").append(freqTable);
			$("#command-history-body").append("<p>Compute Frequency</p>");
		};

		$scope.generatePctAcross = function() {
			var rowVar = getRowVar();
			var colVar = getColVar();
			$("#workbook").append("<h4>Percent Across: " + getRowVar() + "/" + getColVar() + "</h4>");
			var pctAcrosses = pctAcross($scope.completeDataset, rowVar, colVar);
			var pctAcrossTable = generateGeneralTable(pctAcrosses, 'pct');
			$("#workbook").append(pctAcrossTable);
			$("#command-history-body").append("<p>Compute Percent Across</p>");
		};

		$scope.generatePctDown = function() {
			var rowVar = getRowVar();
			var colVar = getColVar();
			$("#workbook").append("<h4>Percent Down: " + getRowVar() + "/" + getColVar() + "</h4>");
			var pctDowns = pctDown($scope.completeDataset, rowVar, colVar);
			var pctDownTable = generateGeneralTable(pctDowns, 'pct');
			$("#workbook").append(pctDownTable);
			$("#command-history-body").append("<p>Compute Percent Down</p>");
		};


	}]);


