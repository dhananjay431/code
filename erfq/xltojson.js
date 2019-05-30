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
    let workbook = XLSX.read(data, {type: 'binary' });
    let first_sheet_name = workbook.SheetNames[0];
    let worksheet = workbook.Sheets[first_sheet_name];
    cb(XLSX.utils.sheet_to_json(worksheet,{raw:true}));
    };
     reader.readAsBinaryString(target.files[0]); 
  }
}
window.xlsx = xlsx;