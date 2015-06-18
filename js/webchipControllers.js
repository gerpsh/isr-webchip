var webchipApp = angular.module('webchipApp', []);

webchipApp.controller("default", ['$scope', '$http', 
	function($scope, $http) {
		$http.get('data/acs2005i/educim05.json').success(function(d) {
			$scope.varCategories = d["varCats"];
			$scope.title = d["title"];
			$scope.varNames = d["varNames"];
			$scope.data = d["data"];
			$("#dataset-list").val('data/acs2005i/educim05.json');
		});
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
			var dataset = getCurrentDataset()
			$http.get(dataset).success(function(d) {
				$scope.varCategories = d["varCats"];
				$scope.title = d["title"];
				$scope.varNames = d["varNames"];
				$scope.data = d["data"];
			});
		};
	}]);


