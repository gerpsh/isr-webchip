var webchipControllers = angular.module('webchipControllers', []);

webchipControllers.controller("default", ['$scope', '$http', 
	function($scope, $http) {
		$http.get('data/acs2005i.json').success(function(data) {
			$scope.varCategories = data["varCats"];
			$scope.title = data["title"];
			$scope.varNames = data["varNames"];
			$scope.data = data["data"];
		});
		$http.get('data/index.json').success(function(data) {
			$scope.availableDatasets = _.pluck(data, 'fileName');
		});

		$scope.omitVar = function(variable, cats) {
			$scope.data = omit($scope.data, variable, cats);
		};

		$scope.combineVar = function(variable, cats, name) {
			$scope.data = combine($scope.data, variable, cats, name);
		};

		$scope.changeDataset = function(dataset) {
			$http.get('data/' + datatset).success(function(data) {
				$scope.varCategories = data["varCats"];
				$scope.title = data["title"];
				$scope.varNames = data["varNames"];
				$scope.data = data["data"];
			});
		};
	}]);


