webchipApp.factory('uiService', [
  function() {

    var getRowVar = function() {
      return $('#crosstab-row').val();
    };

    var getColVar = function() {
      return $('#crosstab-col').val();
    };

    var getControlVar = function() {
    	var controlVars = [];
    	$('input[name="controlVars[]"]:checked').each(function(){
    		controlVars.push($(this).val());
    	});
    	return controlVars;
    };

    var datasetSelected = function() {
    	return condition = $('#dataset-list').val() != '';
    };

    return {
      "getRowVar": getRowVar,
      "getColVar": getColVar,
      "getControlVar": getControlVar
    };
  }
]);
