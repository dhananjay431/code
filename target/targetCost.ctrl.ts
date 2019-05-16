declare var angular:any,DropDownTemplate:any,$:any,_:any,toastr:any;
angular.module('App.quoteComparisionCtrl')
	.controller('targetCostCtrl', function ($scope:any, Upload:any, $window:any, $log:any, $state:any, NgTableParams:any, cmm:any) {
		$scope.cmm = cmm;
		$scope.cmm.label = 'A'; 
		$scope.gridOptions = {
      
            columnDefs:[
                {
                    headerName: "PART_NUMBER",
                    field: "PART_NUMBER"
                }
            ],
            components:{
                moodEditor: DropDownTemplate
            },
            rowData: null
		};
		
		function xmltojson(data:any,key:any){
			return $.cordys.json.findObjects(data,key);
		}
		function post(method :any ,qr :any ,success :any ,cb:any){
			$.cordys.ajax({
				method:method,
				namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
				dataType: "* json",
				parameters: qr,
				success,cb
			});

		}
		function initPro(temp:any){
			return _.map(temp, function (d:any) {
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
		function gridopInit(){
			return [
					{
						headerName: "PART_NUMBER",
						field: "PART_NUMBER"
					}
				];
		}
		function changePrjQr(projectCode :any, panelGroup :any, bNum :any,_cmm:any){
			return {
				"comparisonType": "Preference",
				"panelGroup": panelGroup,
				"projectCode": projectCode,
				"baselineNum": _cmm.baslineNum,
				"budgeted": "",
				"partNum": "",
				"decimalPlace": "5",
				"preferences": "",
				"ComparePref": "LandedCost",
				"toolmakersRequired": '',
				"panelGrouping": ''
			};
		}
		function changePrjSuccess(data:any){
				var temp = xmltojson(data, "COMPARISON");
				temp = initPro(temp);
				console.log("grid-data=>",temp);
				
				$scope.$apply();
				$scope.gridOptions.api.setColumnDefs($scope.gridOptions.columnDefs);
				$scope.gridOptions.api.setRowData(temp);
		}
		function addTm(temp:any){
            let TOOLMAKER:any=[];
         
            Object.keys(temp[0].ToolmakerPref).forEach(function(d){
                var z = {
                    headerName: d,
                    field: "ToolmakerPref."+d,
                    editable: true,
                    cellEditorSelector:function (params:any){
						debugger;
                           return {
                               component: 'moodEditor',
                               params: {values:  _.map(params.data.TOOLMAKER,'ID') }
                           };
                       }
                }
                TOOLMAKER.push(z);
               
            })
           return { 
                headerName: 'Toolmaker Preference',
                children:TOOLMAKER
            };
		}
		function addL(temp:any){
			let tmp:any = [];
			 _.filter(_.keys(temp[0]),function(d:any){
				 return d.match(/L[0-9]/);
			 }).forEach(function(d:any){
				 var arr=[];
				 arr.push(
					 {
						 headerName: "Base Cost",
						 field: d+".BASICCOST.VALUE",
						 // use font awesome for first col, with numbers for sort
						 icons: {
							 menu: '<i class="fas fa-file-download"/>',
							 filter: '<i class="fas fa-file-download"/>',
							 columns: '<i class="fas fa-file-download"/>',
							 sortAscending: '<i class="fas fa-file-download"/>',
							 sortDescending: '<i class="fas fa-file-download"/>'
						 },
					 }
				 );
				 arr.push( { headerName: "Landed Cost", field: d+".LANDEDCOST.VALUE" } );
				 arr.push( { headerName: "No Of Dies", field: d+".NOOFDIES.VALUE" } );
				 arr.push( { headerName: "Die Weight", field: d+".DIEWEIGHT.VALUE" } );
				 arr.push( { headerName: "Cost Per Ton", field: d+".COSTPERTON.VALUE" } );
				 tmp.push( { headerName:d, children:arr } );
			 });
			 return tmp;
		 }
		
		

		$scope.changePrj = function (projectCode:any, panelGroup:any, bNum:any) {
			post('GetERFQComparisonData',
			changePrjQr(projectCode, panelGroup, bNum,cmm),function(data:any){
				var temp = xmltojson(data, "COMPARISON");
				temp = initPro(temp);
				console.log("grid-data=>",temp);
				$scope.gridOptions.api.setRowData(temp);
				$scope.gridOptions.columnDefs = gridopInit();
				$scope.gridOptions.columnDefs.push(addTm(temp));
				$scope.gridOptions.columnDefs = _.concat($scope.gridOptions.columnDefs,addL(temp));
				$scope.gridOptions.api.setColumnDefs($scope.gridOptions.columnDefs);
		}
			,function(e1:any,e2:any,e3:any){}
			)

		}
		
		$scope.$watchCollection('cmm', function (newValue:any, oldValue:any) {

			if ((newValue.projectCode != oldValue.projectCode) || (newValue.label != oldValue.label))
				$scope.changePrj(newValue.projectCode, newValue.label, cmm.baslineNum);
		}, true);
		if (($scope.cmm.projectCode == undefined))
			toastr.warning("Select ProjectCode");
		else
			$scope.changePrj($scope.cmm.projectCode, $scope.cmm.label, cmm.baslineNum);
		


	
	})
	