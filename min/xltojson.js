"use strict";var xlsx=function(){function xlsx(){}var _proto=xlsx.prototype;_proto.write=function write(data,fileName,sheetName){var wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(data),"sheetName",{compression:true});XLSX.writeFile(wb,fileName)};_proto.read=function read(target,cb){var reader=new FileReader;reader.onload=function(e){var data=e.target.result;var workbook=XLSX.read(data,{type:"binary"});var first_sheet_name=workbook.SheetNames[0];var worksheet=workbook.Sheets[first_sheet_name];cb(XLSX.utils.sheet_to_json(worksheet,{raw:true}))};reader.readAsBinaryString(target.files[0])};return xlsx}();window.xlsx=xlsx;