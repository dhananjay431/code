"use strict";

function success(e) {
  console.log(e);
  var filename = "GDMS Report" + ".xlsx";
  var element = document.createElement('a');
  element.setAttribute('href', 'data:application/octet-stream;charset=utf-16le;base64,' + encodeURIComponent(e.tuple.old.GenerateGDMSExcelReport.GenerateGDMSExcelReport));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}