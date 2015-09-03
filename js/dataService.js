webchipApp.factory('dataService', ['$http',
  function($http) {
    var getIndex = function() {
      return $http.get('data/index.json').then(function(d) {
        return d.data;
      }, function() {
        return null;
      });
    };

    var getSelectedDataset = function() {
      return $('#dataset-list').val();
    }
    //get dataset and prepare scope vars
    var getDataset = function() {
      var path = getSelectedDataset();
      return $http.get(path).then(function(d) {
        var completeDataset = d.data;
        var title = d.data.title;
        var variableCategories = d.data.varCats;
        var variableNames = d.data.varNames;
        var theData = d.data.theData;
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
          "variableNames": variableNames,
          "theData": theData,
          "numberCategories": numberCategories
        }
      }, function() {
        return null;
      });
    };

    return {
      "getIndex": getIndex,
      "getSelectedDataset": getSelectedDataset,
      "getDataset": getDataset
    };
}]);
