webchipApp.factory('dataService', ['$http',
  function($http) {
    var getIndex = function() {
      $http.get('data/index.json').then(function(d) {
  		  return d;
      }, function(d) {
        return null;
      });
    };

    var getSelectedDataset = function() {
      return $('#dataset-list').val();
    }
    //get dataset and prepare scope vars
    var getDataset = function() {
      var path = getSelectedDataset();
      $http.get(path).then(function(d) {
        var completeDataset = d;
        var title = d.title;
        var variableCategories = d.varCats;
        var variableNames = d.varNames;
        var theData = d.theData;
        var numberCategories = [];
        _.each(variableCategories, function(variable) {
          var variableName = variable.name;
          var numCategoriesInVariable = variable.cats.length;
          numberCategories.push({"var": variableName, "cats": numCategoriesInVariable});
        });
        var shortDataName = path.split("/").slice(1, 3).join("/");
        $("#command-history-body").append("<p>Change dataset to " + shortDataName + "</p>");
        return {
          "completeDataset": completeDataset,
          "title": title,
          "variableCategories": variableCategories,
          "variableName": variableNames,
          "theData": theData,
          "numberCategories": numberCategories
        }
      }, function(d) {
        return null;
      });
    };

    return {
      "getIndex": getIndex,
      "getCurrentDataset": getCurrentDataset,
      "getDataset": getDataset
    };
}]);
