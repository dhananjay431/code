	angular.module('App.quoteComparisionCtrl')
		.controller('targetCostCtrl', function ($scope, Upload, $window, $log, $state, NgTableParams, cmm) {
			$scope.cmm = cmm;
			$scope.cmm.label = 'A'; 
			$scope.gridOptions = {
		
				
				components:{
					moodEditor: DropDownTemplate,
					customHeaderGroupComponent: CustomHeaderGroup
				},
				columnDefs:[
					{
						headerName: "PART_NUMBER",
						field: "PART_NUMBER"
					}
				],
				rowData: null
			};
			
			function xmltojson(data,key){
				return $.cordys.json.findObjects(data,key);
			}
			function post(method,qr,success,cb){
				$.cordys.ajax({
					method:method,
					namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
					dataType: "* json",
					parameters: qr,
					success,cb
				});

			}
			function initPro(temp){
				return _.map(temp, function (d) {
				
					var rArr = _.keys(d).filter(function(d1){
						return d1.match(/^R[0-9]/i);
					})
					if(rArr.length == 0){
						d.R1={
							PROJECTCODE:"",
							PARTNUMBER:"",
							NOMENCLATURE:"",
							TOOLMAKER:"",
							BASICCOST:"",
							LANDEDCOST:"",
							NOOFDIES:"",
							DIEWEIGHT:"",
							COSTPERTON:""
						};
					}

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
			function pushR(gop){
				var newAdd = "";
				var rArr  = 
				_.map(gop.columnDefs.filter(function(d){
					return d.headerName.match(/^R[0-9]/i);
				}),'headerName');
				if(rArr.length > 0)
				{
					newAdd = Number(_.max(rArr).replace(/\D/i,""))+1;
				}
				
				// var _n = _.max(_.keys(temp[0]).filter(function(d2){ return d2.match(/^R[0-9]/)})).replace(/\D/g,""),newR="";
				// if(_n != "" || _n!= undefined ){
				// newR = "R"+(Number(_n)+1);	
				// };
				data.api.forEachLeafNode(function(n,i){
					n.data[newAdd] = {
						PROJECTCODE:"",
						PARTNUMBER:"",
						NOMENCLATURE:"",
						TOOLMAKER:"",
						BASICCOST:"",
						LANDEDCOST:"",
						NOOFDIES:"",
						DIEWEIGHT:"",
						COSTPERTON:""
					};
				})
				if(rArr.length > 0)
				{
					var arr=[];
					arr.push( { editable: true,headerName: "PROJECTCODE", field: newR+".PROJECTCODE" } ); 
					arr.push( { editable: true,headerName: "PARTNUMBER", field: newR+".PARTNUMBER",columnGroupShow: 'open' } ); 
					arr.push( { editable: true,headerName: "NOMENCLATURE", field: newR+".NOMENCLATURE",columnGroupShow: 'open' } ); 
					arr.push( { editable: true,headerName: "TOOLMAKER", field: newR+".TOOLMAKER",columnGroupShow: 'open' } ); 
					arr.push( { editable: true,headerName: "BASICCOST", field: newR+".BASICCOST",columnGroupShow: 'open' } ); 
					arr.push( { editable: true,headerName: "LANDEDCOST", field: newR+".LANDEDCOST",columnGroupShow: 'open' } ); 
					arr.push( { editable: true,headerName: "NOOFDIES", field: newR+".NOOFDIES",columnGroupShow: 'open' } ); 
					arr.push( { editable: true,headerName: "DIEWEIGHT", field: newR+".DIEWEIGHT",columnGroupShow: 'open' } ); 
					arr.push( { editable: true,headerName: "COSTPERTON", field: newR+".COSTPERTON",columnGroupShow: 'open' } );
					tmp.push( { headerName:newR, children:arr,	headerGroupComponent: 'customHeaderGroupComponent' } ); 
					gop.columnDefs.push(arr);
					gop.api.setColumnDefs(gop.columnDefs);
				}
			}
			function addR(temp){
				var tmp = [];
				_.filter(_.keys(temp[0]),function(x1){
					return x1.match(/^R[0-9]/);
				}).forEach(function(d){
					var arr=[];
					arr.push( { editable: true,headerName: "PROJECTCODE", field: d+".PROJECTCODE" } ); 
					arr.push( { editable: true,headerName: "PARTNUMBER", field: d+".PARTNUMBER",columnGroupShow: 'open' } ); 
					arr.push( { editable: true,headerName: "NOMENCLATURE", field: d+".NOMENCLATURE",columnGroupShow: 'open' } ); 
					arr.push( { editable: true,headerName: "TOOLMAKER", field: d+".TOOLMAKER",columnGroupShow: 'open' } ); 
					arr.push( { editable: true,headerName: "BASICCOST", field: d+".BASICCOST",columnGroupShow: 'open' } ); 
					arr.push( { editable: true,headerName: "LANDEDCOST", field: d+".LANDEDCOST",columnGroupShow: 'open' } ); 
					arr.push( { editable: true,headerName: "NOOFDIES", field: d+".NOOFDIES",columnGroupShow: 'open' } ); 
					arr.push( { editable: true,headerName: "DIEWEIGHT", field: d+".DIEWEIGHT",columnGroupShow: 'open' } ); 
					arr.push( { editable: true,headerName: "COSTPERTON", field: d+".COSTPERTON",columnGroupShow: 'open' } );
					tmp.push( { headerName:d, children:arr,	headerGroupComponent: 'customHeaderGroupComponent' } ); 
				});
				return tmp;
			}
			function gridopInit(){
				return [
						{
							headerName: "PART_NUMBER",
							field: "PART_NUMBER"
						}
					];
			}
			function changePrjQr(projectCode, panelGroup, bNum,cmm){
				return {
					"comparisonType": "Preference",
					"panelGroup": panelGroup,
					"projectCode": projectCode,
					"baselineNum": cmm.baslineNum,
					"budgeted": "",
					"partNum": "",
					"decimalPlace": "5",
					"preferences": "",
					"ComparePref": "LandedCost",
					"toolmakersRequired": '',
					"panelGrouping": ''
				};
			}
			function changePrjSuccess(data){
					var temp = xmltojson(data, "COMPARISON");
					temp = initPro(temp);
					console.log("grid-data=>",temp);
					
					$scope.$apply();
					$scope.gridOptions.api.setColumnDefs($scope.gridOptions.columnDefs);
					$scope.gridOptions.api.setRowData(temp);
			}
			function addTm(temp){
				var TOOLMAKER=[];
			
				Object.keys(temp[0].ToolmakerPref).forEach(function(d){
					var z = {
						headerName: d,
						field: "ToolmakerPref."+d,
						cellClass: ['ToolmakerPref'],
						columnGroupShow: 'open',
						editable: true,
						cellEditorSelector:function (params){
							debugger;
							return {
								component: 'moodEditor',
								params: {values:  _.map(params.data.TOOLMAKER,'ID') }
							};
						}
					}
					TOOLMAKER.push(z);
				
				})
				delete TOOLMAKER[0].columnGroupShow;
			return { 
					headerName: 'Toolmaker Preference',
					headerGroupComponent: 'customHeaderGroupComponent',
					children:TOOLMAKER
				};
			}
			function addL(temp){
				var tmp = [];
				_.filter(_.keys(temp[0]),function(d){
					return d.match(/L[0-9]/);
				}).forEach(function(d){
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
					arr.push( { headerName: "Landed Cost", field: d+".LANDEDCOST.VALUE",columnGroupShow: 'open' } );
					arr.push( { headerName: "No Of Dies", field: d+".NOOFDIES.VALUE" ,columnGroupShow: 'open'} );
					arr.push( { headerName: "Die Weight", field: d+".DIEWEIGHT.VALUE" ,columnGroupShow: 'open'} );
					arr.push( { headerName: "Cost Per Ton", field: d+".COSTPERTON.VALUE" ,columnGroupShow: 'open'} );
					tmp.push( { headerName:d, children:arr,	headerGroupComponent: 'customHeaderGroupComponent' } );
				});
				return tmp;
			}
			
			
			$scope.pushRcolDef = function(){
				pushR($scope.gridOptions);
			}
			$scope.changePrj = function (projectCode, panelGroup, bNum) {
				post('GetERFQComparisonData',
				changePrjQr(projectCode, panelGroup, bNum,cmm),function(data){
					var temp = xmltojson(data, "COMPARISON");
					temp = initPro(temp);
					console.log("grid-data=>",temp);
					$scope.gridOptions.api.setRowData(temp);
					$scope.gridOptions.columnDefs = gridopInit();
					$scope.gridOptions.columnDefs.push(addTm(temp));
					$scope.gridOptions.columnDefs = _.concat($scope.gridOptions.columnDefs,addR(temp));
					$scope.gridOptions.columnDefs = _.concat($scope.gridOptions.columnDefs,addL(temp));
					
					$scope.gridOptions.api.setColumnDefs($scope.gridOptions.columnDefs);
			}
				,function(e1,e2,e3){}
				)

			}
			
			$scope.$watchCollection('cmm', function (newValue, oldValue) {

				if ((newValue.projectCode != oldValue.projectCode) || (newValue.label != oldValue.label))
					$scope.changePrj(newValue.projectCode, newValue.label, cmm.baslineNum);
			}, true);
			if (($scope.cmm.projectCode == undefined))
				toastr.warning("Select ProjectCode");
			else
				$scope.changePrj($scope.cmm.projectCode, $scope.cmm.label, cmm.baslineNum);
			


		
		})
		