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

function canGenerateChart() {
	var condition = (crossTabsSelected() || singleVarSelected());
	return condition;
}

function canGenerateTable() {
	return crossTabsSelected();
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
});




