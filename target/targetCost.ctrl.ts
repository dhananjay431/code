declare var _:any,$:any;
  
class targetCost{
 constructor(){
	 console.log("targetCost");
 }
 initDataProcess(temp:any){
	return _.map(temp,(d:any)=>{
		var ll = _.keys(d.LANDEDCOST);

		for (var i = 1; i <= ll.length; i++) {
			d['L' + i] = {
				LANDEDCOST: d.LANDEDCOST['L' + i],
				NOOFDIES: d.NOOFDIES['L' + i],
				DIEWEIGHT: d.DIEWEIGHT['L' + i],
				
				BASICCOST: d.BASICCOST['L' + i],
				COSTPERTON: d.BASICCOST['L' + i],
			}
		};
		return d;
	});
 }
 xmltoJson(data:any,key:any){
	return $.cordys.json.findObjects(data,key);
 }
}