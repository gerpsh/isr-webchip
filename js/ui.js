function datasetSelected() {
	var condition = $('#dataset-list').val() != '';
	return condition;
}

function canMarginal() {
	return datasetSelected();
}

function crossTabsSelected() {
	var condition = $('#crosstab-row').val() != '' && $('#crosstab-col').val() != '';
	return condition;
}

function canSingleVar() {
	var condition = $('#crosstab-row').val() == '' && $('#crosstab-col').val() == '';
	return condition;
}

function singleVarSelected() {
	var condition = ($('#single-var').val() != '');
	return condition;
}

function controlSet() {
	var condition = ($("#control-var").val() != '');
	return condition;
}

function canGenerateChart() {
	var condition = (crossTabsSelected() || singleVarSelected());
	return condition;
}

function canGenerateTable() {
	return crossTabsSelected();
}

function canControl() {
	var condition = (singleVarSelected() || crossTabsSelected());
	return condition;
}

function onPctAcross() {
	$('#btn-pctAcross').prop('value', 'yes');
	$('#btn-pctDown').prop('value', 'no');
}

function onPctDown() {
	$('#btn-pctDown').prop('value', 'yes');
	$('#btn-pctAcross').prop('value', 'no');
}

function nextPctAcross() {
	var condition = ($('#btn-pctAcross').val() == "yes");
	return condition;
}

function getCurrentDataset() {
	return $('#dataset-list').val();
}

function getRowVar() {
	return $('#crosstab-row').val();
}

function getColVar() {
	return $('#crosstab-col').val();
}

function getSingleVar() {
	return $('#single-var').val();
}

function getControlVar() {
	return $('#control-var').val();
}

function scrollWorkbook() {
	$("#workbook").animate({scrollTop:$("#workbook")[0].scrollHeight}, 1000);
}

$('#dataset-list').on('change', function() {
	if (canMarginal()) {
		$('#btn-marginals').prop('disabled', false);
	} else {
		$('#btn-marginals').prop('disabled', true);
	}
});


$('#crosstab-row').on('change', function() {
	if (canSingleVar()) {
		$('#single-var').prop('disabled', false);
	} else {
		$('#single-var').prop('disabled', true);
	}

	if (canGenerateTable()) {
		$('.btn-table').prop('disabled', false);
	} else {
		$('.btn-table').prop('disabled', true);
	}

	if (canGenerateChart()) {
		$('.btn-chart').prop('disabled', false);
	} else {
		$('.btn-chart').prop('disabled', true);
	}

	if (canControl()) {
		$('#control-var').prop('disabled', false);
	} else {
		$('#control-var').val('');
		$('#control-var').prop('disabled', true);
	}
});

$('#crosstab-col').on('change', function() {
	if (canSingleVar()) {
		$('#single-var').prop('disabled', false);
	} else {
		$('#single-var').prop('disabled', true);
	}

	if (canGenerateTable()) {
		$('.btn-table').prop('disabled', false);
	} else {
		$('.btn-table').prop('disabled', true);
	}

	if (canGenerateChart()) {
		$('.btn-chart').prop('disabled', false);
	} else {
		$('.btn-chart').prop('disabled', true);
	}

	if (canControl()) {
		$('#control-var').prop('disabled', false);
	} else {
		$('#control-var').val('');
		$('#control-var').prop('disabled', true);
	}

});

$('#single-var').on('change', function() {
	if (singleVarSelected()) {
		$('#crosstab-col').prop('disabled', true);
		$('#crosstab-row').prop('disabled', true);
	} else {
		$('#crosstab-col').prop('disabled', false);
		$('#crosstab-row').prop('disabled', false);
	}

	if (canGenerateChart()) {
		$('.btn-chart').prop('disabled', false);
	} else {
		$('.btn-chart').prop('disabled', true);
	}

	if (canControl()) {
		$('#control-var').prop('disabled', false);
	} else {
		$('#control-var').val('');
		$('#control-var').prop('disabled', true);

	}
});