var Dataset = function(path) {
	$.get(path, function(data) {
		var lines = data.split('\n')
		this.title = lines[0];
		this.varNames = lines[2].split(',');
		this.varNums = lines[3].split(','); //num of categories per var
		this.numVars = varNames.length;
		var varLabels = [];
		for(var i=4; i<(4+this.numVars); i++) {
			varLabels.push(lines[i].split(',')); //list of lists
		}

		/*groups = [];
		for(var i=this.numVars-2; i>0; i--) {

		}*/
	});

}