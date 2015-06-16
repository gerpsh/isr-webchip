var webchipControllers = angular.module('webchipControllers', []);

webchipControllers.controller("default", ['$scope', '$http', 
	function($scope, $http) {
		$http.get('data/acs2005i.json').success(function(data) {
			$scope.varCategories = data["varCats"];
			$scope.title = data["title"];
			$scope.varNames = data["varNames"];
			$scope.data = data["data"];
		});

		$scope.omitVar = function(variable, cats) {
			$scope.data = omit($scope.data, variable, cats);
		};

		$scope.combineVar = function(variable, cats, name) {
			$scope.data = combine($scope.data, variable, cats, name);
		};


	}]);

webchipControllers.controller("selection", ['$scope', '$http', '$routeParams'
	function($scope, $http, $routeParams) {
		var datasetName = 'data/' + $routeParams.dataset + '.json';
		$http.get(datasetName).success(function(data) {
			$scope.varCategories = data["varCats"];
			$scope.title = data["title"];
			$scope.varNames = data["varNames"];
			$scope.data = data["data"];
		});
	}]);

