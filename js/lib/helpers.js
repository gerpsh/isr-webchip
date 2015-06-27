function printElement(div) {
	var divContents = $(div).html();
	var printWindow = window.open('', '', 'height=400,width=800');
	printWindow.document.write('<html><head><title>DIV Contents</title>');
	printWindow.document.write('<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css" rel="stylesheet" type="text/css" />');
    printWindow.document.write('<link rel="stylesheet" type="text/css" href="css/c3.min.css" />');
    printWindow.document.write('<link href="css/webchip.css" rel="stylesheet" type="text/css" />');
    printWindow.document.write('</head><body>');
    printWindow.document.write(divContents);
    printWindow.document.write('</body></html>');
    setTimeout(function(){printWindow.print()}, 1000);
}