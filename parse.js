function split(arr, n) {
  if(n <= 1) return [arr];
  var partLength = Math.ceil(arr.length/n),
      part1 = arr.slice(0, partLength),
      result = split(arr.slice(partLength), n - 1);
  result.unshift(part1);
  return result;
}

function splitTree(arr, m) {
  if(m.length < 1) return arr;
  var result = split(arr, m[0]);
  //console.log(result);
  return result.map(function(sublist) {
    return splitTree(sublist, m.slice(1));
  });
}

var Dataset = function(path) {
	$.get(path, function(data) {
		var lines = data.split('\r\n')
		this.title = lines[0];
		this.varNames = lines[2].split(',');
		this.varNums = lines[3].split(','); //num of categories per var
		this.numVars = this.varNames.length;
		var firstDataLineIndex = 4 + this.varNames.length;
		var dataPoints = 1;

		var firstThree = _.initial(this.varNums);
		for(var i in firstThree) {
			dataPoints *= firstThree[i];
		}

		var varLabels = [];
		for(var i=4; i<(4+this.numVars); i++) {
			varLabels.push(lines[i].split(',')); //list of lists
		}

		var lastDataLineIndex = firstDataLineIndex + dataPoints;
		var dataLines = lines.slice(firstDataLineIndex, lastDataLineIndex);

	});
}