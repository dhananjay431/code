class xlsx{
  write(data,fileName,sheetName){
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), sheetName,{compression:true});
    XLSX.writeFile(wb, fileName); 
  }
  read(target,cb){
    let reader = new FileReader();
    reader.onload = function(e) {
    let data = e.target.result; 
    var result = {};
    let workbook = XLSX.read(data, {type: 'binary' });
    workbook.SheetNames.forEach(function(sheetName) {
      var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {raw:true});
      if(roa.length) result[sheetName] = roa;
    });
    cb(result);
    };
     reader.readAsBinaryString(target.files[0]); 
  }
}
window.xlsx = new xlsx();