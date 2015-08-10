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
	var condition = (getControlVar().length > 0);
	return condition;
}

//Uncomment when single variable is implemented
/*function canGenerateChart() {
	var condition = (crossTabsSelected() || singleVarSelected());
	return condition;
}*/

function canGenerateTable() {
	return crossTabsSelected();
}

function canControl() {
	var condition = (singleVarSelected() || crossTabsSelected());
	return condition;
}

function controlVarStatus() {
	if (canControl()) {
		$('[name="controlVars[]"]').prop('disabled', false);
	} else {
		$('[name="controlVars[]"]').prop('checked', false);
		$('[name="controlVars[]"]').prop('disabled', true);
	}
}

function enableCharting() {
	$(".btn-chart").prop("disabled", false);
}

function disableCharting() {
	$(".btn-chart").prop("disabled", true);
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
	var controlVars = [];
	$('input[name="controlVars[]"]:checked').each(function(){
		controlVars.push($(this).val());
	});
	return controlVars;
}

function scrollWorkbook() {
	$("#workbook").animate({scrollTop:$("#workbook")[0].scrollHeight}, 1000);
}

function adjustWorkbookHeight() {
	var controlPanelHeight = $('#control-panel').height();
	var controlPanelHeightString = controlPanelHeight + 2 + 'px';
	$('#workbook').css('height', controlPanelHeightString);
}

$('#dataset-list').on('change', function() {
	disableCharting();
	if (canMarginal()) {
		$('#btn-marginals').prop('disabled', false);
	} else {
		$('#btn-marginals').prop('disabled', true);
	}
	adjustWorkbookHeight();
});

$('#crosstab-row').on('change', function() {
	disableCharting();
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

	/*if (canGenerateChart()) {
		$('.btn-chart').prop('disabled', false);
	} else {
		$('.btn-chart').prop('disabled', true);
	}*/

	controlVarStatus();
});

$('#crosstab-col').on('change', function() {
	disableCharting();
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

	/*if (canGenerateChart()) {
		$('.btn-chart').prop('disabled', false);
	} else {
		$('.btn-chart').prop('disabled', true);
	}*/

	controlVarStatus();
});

$('#single-var').on('change', function() {
	if (singleVarSelected()) {
		$('#crosstab-col').prop('disabled', true);
		$('#crosstab-row').prop('disabled', true);
	} else {
		$('#crosstab-col').prop('disabled', false);
		$('#crosstab-row').prop('disabled', false);
	}

	/*if (canGenerateChart()) {
		$('.btn-chart').prop('disabled', false);
	} else {
		$('.btn-chart').prop('disabled', true);
	}*/
	
	controlVarStatus();
});