angular.module('App.quoteComparisionCtrl')
	.controller('landedCostCtrl', function ($scope, Upload, $window, $log, $state, NgTableParams, cmm) {
		$scope.data = {};
		$scope.gridOptions = {};
		$scope.cmm = cmm;
		$scope.cmm.label = 'A';
		$scope.decimals = parseInt("2");
		$scope.budgetedParam = '';
		$scope.partNum = '';
		$scope.toolmakerDropdown = [];
		$scope.PanelGrpDrpdwn = [];
		$scope.budgetedToolmk = [];
		$scope.MaterialGrades = [];
		$scope.setArr = [];
		$scope.funcRun = 0;

		$scope.setLab = function (d) {
			$scope.cmm.label = d;
		}
		/**Export to excel start here*/
		$scope.xl =function(){
            var params ={"skipHeader":false,"columnGroups":true,"skipFooters":false,"skipGroups":false,"skipPinnedTop":false,"skipPinnedBottom":false,"allColumns":false,"onlySelected":false,"suppressQuotes":false,"fileName":"","columnSeparator":""};
            $scope.gridOptions2.api.exportDataAsCsv(params);   
        }
		/**Export to excel End here*/

		$scope.gridOptions2 = {
			enableColResize: true,
			autoHeight: true,
			headerHeight: 40,
			rowHeight: 40,   
			pagination: true,
			paginationPageSize: 10,
			   defaultColDef: {
			   sortable: true
			   },
			components: {
				moodEditor: DropDownTemplate,
				customHeaderGroupComponent: CustomHeaderGroup,
				htmlText: htmlText,
				genderCellRenderer: CellRender,
			  cellSelect: CellSelect
			},
			columnDefs: [{
					headerName: "S.No",
					width: 80,
					cellRenderer: function (params) {
						return (parseInt(params.node.id) + 1);
					}
				},
				{
					headerName: "Part Number",
					field: "PART_NUMBER"      
				},
				{
					headerName: "Nomenclature",
					field: "PART_NAME"
				},
				{
					headerName: "Budgated Toolmaker",
					field: "BUDGETED_TOOLMAKER"
				},
				{
					headerName: "Blanking Die",
					field: "LANDEDCOST_BLANKINGDIE",
					singleClickEdit: true,
					editable: true,
					cellRenderer: 'genderCellRenderer',
					cellRendererParams: function cellRendererParams(params) {
						var _t = _.map([{
							key: "Select",
							value: "Select"
						}, {
							key: "Included",
							value: "Included"
						}, {
							key: "Excluded",
							value: "Excluded"
						}], function (d) {
							return {
								value: d.value,
								key: d.key
							};
						});

						return {
						  params2: _t
						};
					},
					cellEditorSelector: function cellEditorSelector(params) {
						var _t = _.map([{
							key: "Select",
							value: "Select"
						}, {
							key: "Included",
							value: "Included"
						}, {
							key: "Excluded",
							value: "Excluded"
						}], function (d) {
							return {
								text: d.value,
								value: d.key
							};
						});

						return {
							component: 'cellSelect',
							params: {
								values: _t
							}
						};
					}
				},
				{

					headerName: "Budgeted Landed Cost(In Lakhs)",
					field: "BUDGETED_LANDED_COST",
					valueGetter: 'data.LANDEDCOST_BLANKINGDIE',
					cellRenderer: function cellRenderer(params) {
						if (params.data.LANDEDCOST_BLANKINGDIE == "Excluded") return (params.data.EX_BUDGETED_LANDED_COST);
						else return (params.data.IN_BUDGETED_LANDED_COST);
					}
				},
				{
					headerName: "Budgeted Blanking Landed Cost(In Lakhs)",
					field: "BUDGETED_BLANKING_LANDED",
					valueGetter: 'data.LANDEDCOST_BLANKINGDIE',
					cellRenderer: function cellRenderer(params) {
						if (params.data.LANDEDCOST_BLANKINGDIE == "Excluded") return (params.data.EX_BUDGETED_BLANKING_LANDED);
						else return (params.data.IN_BUDGETED_BLANKING_LANDED);
					}
				}
			],

		};

		$scope.changePrj = function (projectCode, panelGroup, baseNum, prefered) {
			$scope.panelGroup = panelGroup
			$.cordys.ajax({
				method: "GetERFQComparisonData",
				namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
				dataType: "* json",
				parameters: {
					"comparisonType": "LandedCost",
					"panelGroup": panelGroup,
					"projectCode": projectCode,
					"budgeted": (cmm.filtObj != undefined && cmm.filtObj.filterBT != undefined) ? cmm.filtObj.filterBT : '',
                    // "partNum": $scope.partNum,
                    "partNum": (cmm.selectedPartNumber!=undefined &&  cmm.selectedPartNumber.length > 0 )?cmm.selectedPartNumber[0]:"",

                    // "baselineNum": baseNum,
                    "baselineNum": $scope.cmm.baslineNum,

					"decimalPlace": $scope.decimals,
					"preferences": prefered,
					"ComparePref": '',
					"toolmakersRequired": (cmm.filtObj != undefined && cmm.filtObj.filtReq != undefined) ? cmm.filtObj.filtReq : '',
					"panelGrouping": (cmm.filtObj != undefined && cmm.filtObj.filterPG != undefined) ? cmm.filtObj.filterPG : '',
					"materialGrade": (cmm.filtObj != undefined && cmm.filtObj.filterMG != undefined) ? cmm.filtObj.filterMG : ''
				},
				success: function success(data) {
					$scope.gridOptions.data = $.cordys.json.findObjects(data, "COMPARISON");
                    console.log("Lcost:",$scope.gridOptions.data);
					$scope.gridOptions2.api.setRowData($scope.gridOptions.data);

					if ($scope.funcRun == 0) {
						$scope.colAdd($scope.gridOptions.data);
					}
					$.cordys.ajax({
						method: "GetToolMakersforCompair",
						namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
						dataType: "* json",
						parameters: {
							"projectCode": $scope.cmm.projectCode,
							"panelGroup": $scope.panelGroup

						},
						success: function (data) {
							$scope.tmkdrp = $.cordys.json.findObjects(data, "ERFQ_TOOLMAKER_MASTER");
							$scope.toolmakerDropdown = [];
							for (var t = 0; t < $scope.tmkdrp.length; t++) {
								$scope.toolmakerDropdown.push($scope.tmkdrp[t]);
							}
							if (cmm.filtObj != null || cmm.filtObj != undefined) {
								$scope.filtObj = cmm.filtObj;

							}
							if ($scope.filtObj != undefined && $scope.filtObj != "" && $scope.filtObj != null) {

								$scope.fillValue1($scope.filtObj.filterMG);
								$scope.fillValue2($scope.filtObj.filterBT);
								$scope.fillValue3($scope.filtObj.filterPG);

								if ($scope.toolmakerDropdown.length != 0) {
									var tk = cmm.filtObj.filtertmk;
									// tk =tk.filtertmk;
									for (var t = 0; t < tk.length; t++) {

										var a = tk[t];
										$scope.toolmakerDropdown[a].selected1 = true;

									}
									//$scope.filterPG = $scope.filtObj.filterPG;
								}
							}

						},
						error: function (jqXHR, textStatus, errorThrown) {

							toastr.error("Unable to load data. Please try refreshing the page.");
						}
					});
					
                    $scope.makeHeader();
                    $scope.settleData();

					console.log("Landed Cost: ",$scope.gridOptions2.columnDefs);
					$scope.$apply();

				},
				error: function error(jqXHR, textStatus, errorThrown) {

				}
			});
		}

		$scope.$watchCollection('cmm', function (newValue, oldValue) {
			if ((newValue.projectCode != oldValue.projectCode) || (newValue.label != oldValue.label))
				$scope.openruPBox('1', newValue.projectCode, newValue.label, cmm.baslineNum);
			//$scope.changePrj(newValue.projectCode, newValue.label);

			if (document.getElementById("filterBtn") != undefined && document.getElementById("ruPBtn") != undefined && document.getElementById("preFBtn") != undefined) {
				document.getElementById("filterBtn").style.backgroundColor = "#202121";
				document.getElementById("ruPBtn").style.backgroundColor = "#dfdede";
				document.getElementById("preFBtn").style.backgroundColor = "#dfdede";
			}
		}, true);

		$scope.colAdd = function (data) {
			var key = _.keys(data[0]).filter(function (d) {
				return d.match(/TOOLMAKER[0-9]/i)
			});
			for (var i = 0; i < key.length; i++) {
				$scope.gridOptions2.columnDefs.push({

					headerName: data[0][key[i]].TOOLMAKERNAME,
					children: [{
						headerName: "Landed Cost(Original Currency)",
						field: key[i] + ".LANDED_COST"
					}, {
						headerName: "Landed Cost(In Lakhs)",
						field: key[i] + ".LANDED_COST_LKH"
					}, {
						headerName: "Blanking Die Cost(rupees)",
						field: key[i] + ".BLANKING_DIE"
					}],
					valueGetter: 'data.LANDEDCOST_BLANKINGDIE',
					cellRenderer: function cellRenderer(params) {
						var obj = _.keys(params.data).filter(function (dd) {
							return dd.match(/^TOOLMAKER/i);
							}).map(function (dd) {
								return params.data[dd];
							}).filter(function (dd) {
								return dd.TOOLMAKERNAME == params.colDef.headerName;
							});
						if (params.data.LANDEDCOST_BLANKINGDIE == "Excluded") return obj[0].EX_LANDED_COST;else return obj[0].IN_LANDED_COST;
						if (params.data.LANDEDCOST_BLANKINGDIE == "Excluded") return obj[1].EX_LANDED_COST_LKH;else return obj[1].IN_LANDED_COST_LKH;
						if (params.data.LANDEDCOST_BLANKINGDIE == "Excluded") return obj[2].EX_BLANKING_DIE;else return obj[2].IN_BLANKING_DIE;
					}
				})

			}
			$scope.gridOptions2.api.setColumnDefs($scope.gridOptions2.columnDefs);
			$scope.funcRun += 1;
		}

		// rupee symbol scripts 
		$scope.openruPBox = function (valv, pc, pg, bln) {
			document.getElementById("filterBtn").style.backgroundColor = "#202121";
			document.getElementById("ruPBtn").style.backgroundColor = "#dc3545";
			document.getElementById("preFBtn").style.backgroundColor = "#dfdede";

			$scope.cell = [];
			$scope.factors = [];
			$scope.currencies = [];
			$scope.landings = [];
			$scope.showLF = false;
			$scope.showCF = false;

			$scope.dataCF = function (currencies) {
				$scope.tableParams = new NgTableParams({}, {
					filterDelay: 0,
					dataset: currencies
				});
			}

			$scope.dataLF = function (landings) {
				$scope.tableParams = new NgTableParams({}, {
					filterDelay: 0,
					dataset: landings
				});
			}

			$.cordys.ajax({
				method: "GetFactorsbyProject",
				namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
				parameters: {
					projectCode: $scope.cmm.projectCode,
					factor: 'Landed'
				},
				dataType: "* json",
				async: false,
				success: function (a1) {
					var temp = $.cordys.json.findObjects(a1, "RootTag");
					//console.log(temp);
					if(temp[0].ERFQFACTOR.length>0) {
						for (var i = 0; i < temp[0].ERFQFACTOR.length; i++) {
							if(temp[0].ERFQFACTOR[i].FACTOR_VALUE == "") {
								temp[0].ERFQFACTOR[i].SAVE = "Insert";
							}
							else {
								temp[0].ERFQFACTOR[i].FACTOR_VALUE = parseInt(temp[0].ERFQFACTOR[i].FACTOR_VALUE);
								temp[0].ERFQFACTOR[i].SAVE = "Update";
							}
							$scope.factors.push(temp[0].ERFQFACTOR[i]);
						}
						$scope.landings = temp[0].ERFQFACTOR;
					}
					else {
						if(temp[0].ERFQFACTOR.FACTOR_VALUE == "") {
								temp[0].ERFQFACTOR.SAVE = "Insert";
							}
							else {
								temp[0].ERFQFACTOR.FACTOR_VALUE = parseInt(temp[0].ERFQFACTOR.FACTOR_VALUE);
								temp[0].ERFQFACTOR.SAVE = "Update";
							}
							$scope.factors.push(temp[0].ERFQFACTOR);
						$scope.landings.push(temp[0].ERFQFACTOR);	
					}
						$scope.dataLF($scope.landings);
					
					if (temp[0].COMPARISONFACT == "true") {
						$scope.showLF = true;
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					//debugger;
					toastr.error("Error in loading data");
				}
			});

			$.cordys.ajax({
				method: "GetFactorsbyProject",
				namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
				parameters: {
					projectCode: $scope.cmm.projectCode,
					factor: 'Currency'
				},
				dataType: "* json",
				async: false,
				success: function (a2) {
					var temp = $.cordys.json.findObjects(a2, "RootTag");
					//console.log(temp);
					if(temp[0].ERFQFACTOR.length>0) {
						for (var i = 0; i < temp[0].ERFQFACTOR.length; i++) {
							if(temp[0].ERFQFACTOR[i].FACTOR_VALUE == "") {
								temp[0].ERFQFACTOR[i].SAVE = "Insert";
							}
							else {
								temp[0].ERFQFACTOR[i].FACTOR_VALUE = parseInt(temp[0].ERFQFACTOR[i].FACTOR_VALUE);
								temp[0].ERFQFACTOR[i].SAVE = "Update";
							}
							$scope.factors.push(temp[0].ERFQFACTOR[i]);
						}
						$scope.currencies = temp[0].ERFQFACTOR;	
					}
					else {
						if(temp[0].ERFQFACTOR.FACTOR_VALUE == "") {
								temp[0].ERFQFACTOR.SAVE = "Insert";
							}
							else {
								temp[0].ERFQFACTOR.FACTOR_VALUE = parseInt(temp[0].ERFQFACTOR.FACTOR_VALUE);
								temp[0].ERFQFACTOR.SAVE = "Update";
							}
							$scope.factors.push(temp[0].ERFQFACTOR);
						$scope.currencies.push(temp[0].ERFQFACTOR);	
					}
					$scope.dataCF($scope.currencies);

					if (temp[0].COMPARISONFACT == "true") {
						$scope.showCF = true;
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					//debugger;
					toastr.error("Error in loading data");
				}
			});

			if ($scope.showCF == true && $scope.showLF == true && valv == '1') {
				//console.log("loading table...");
				$scope.openpreFBox(valv);
				$scope.changePrj(pc, pg, bln, $scope.pf);
			} else {
				if (valv == '0') {
					console.log("opening popup!!!");
				} else {
					toastr.error("Factor value missing or not set.");
				}

			}

		}

		$scope.saveLCFactors = function (l, c) {
			debugger;
			//console.log("landings: "+l);
			//console.log("currencies: "+c);
			for (var i = 0; i < l.length; i++) {
				if(l[i].SAVE == "Insert") {
					$.cordys.ajax({
						method: "UpdateErfqQuoteFactor",
						namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
						dataType: "* json",
						parameters: {
							"tuple": {
								"new": {
									"ERFQ_QUOTE_FACTOR": {
										FACTOR_NAME:l[i].FACTOR_NAME,
										FACTOR_VALUE: l[i].FACTOR_VALUE,
										FACTOR: l[i].FACTOR,
										PROJECT_CODE: $scope.cmm.projectCode
									}
								}
							}
						},
						success: function (response) {
							console.log("new landing Inserted");
						},
						error: function (jqXHR, textStatus, errorThrown) {
							toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
						}
					});
				}
				else if(l[i].SAVE == "Update") {
					$.cordys.ajax({
						method: "UpdateErfqQuoteFactor",
						namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
						dataType: "* json",
						parameters: {
							"tuple": {
								"old": {
									"ERFQ_QUOTE_FACTOR": {
										QUOTE_FACTOR_SRNO: l[i].FACTOR_SRNO
									}
								},
								"new": {
									"ERFQ_QUOTE_FACTOR": {
										FACTOR_VALUE: l[i].FACTOR_VALUE
									}
								}
							}
						},
						success: function (response) {
							console.log("landing updated");
						},
						error: function (jqXHR, textStatus, errorThrown) {
							toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
						}
					});
				}
			}
			for (var i = 0; i < c.length; i++) {
				if (c[i].SAVE == "Insert") {
					$.cordys.ajax({
						method: "UpdateErfqQuoteFactor",
						namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
						dataType: "* json",
						parameters: {
							"tuple": {
								"new": {
									"ERFQ_QUOTE_FACTOR": {
										FACTOR_NAME: c[i].FACTOR_NAME,
										FACTOR_VALUE: c[i].FACTOR_VALUE,
										FACTOR: c[i].FACTOR,
										PROJECT_CODE: $scope.cmm.projectCode
									}
								}
							}
						},
						success: function (response) {
							console.log("new currency inserted");
						},
						error: function (jqXHR, textStatus, errorThrown) {
							toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
						}
					});
				}
				else if(c[i].SAVE == "Update") {
					$.cordys.ajax({
						method: "UpdateErfqQuoteFactor",
						namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
						dataType: "* json",
						parameters: {
							"tuple": {
								"old": {
									"ERFQ_QUOTE_FACTOR": {
										QUOTE_FACTOR_SRNO: c[i].FACTOR_SRNO
									}
								},
								"new": {
									"ERFQ_QUOTE_FACTOR": {
										FACTOR_VALUE: c[i].FACTOR_VALUE
									}
								}
							}
						},
						success: function (response) {
							console.log("currency updated");
						},
						error: function (jqXHR, textStatus, errorThrown) {
							toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
						}
					});
				}
			}
			$scope.triggerRequest();
		}


		//	preferences scripts
		$scope.openpreFBox = function (valU) {
			document.getElementById("filterBtn").style.backgroundColor = "#202121";
			document.getElementById("ruPBtn").style.backgroundColor = "#dfdede";
			document.getElementById("preFBtn").style.backgroundColor = "#dc3545";
			$scope.preferences = [];

			$scope.dataPF = function (preferences) {
				$scope.tableParams = new NgTableParams({}, {
					filterDelay: 0,
					dataset: preferences
				});
			}

			$.cordys.ajax({
				method: "GetERFQFactors",
				namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
				parameters: {
					factor: 'Currency'
				},
				dataType: "* json",
				async: false,
				success: function (a0) {
					var temp = $.cordys.json.findObjects(a0, "ERFQ_FACTOR_MASTER");

					if (valU == '0') {

						if ($scope.pf != undefined) {
							arr = $scope.pf.split(',');
							for (i = 0; i < temp.length; i++) {
								for (j = 0; j < arr.length; j++) {
									if (temp[i].FACTOR_NAME == arr[j]) {
										//document.getElementById("customCB"+i).checked = "true";
										temp[i].check = true;
									}
								}
							}
						}
						$scope.preferences = temp;
						//console.log(temp);
						$scope.dataPF($scope.preferences);
					} else if (valU == '1') {
						var preFStr = '';
						for (var i = 0; i < temp.length; i++) {
							preFStr = preFStr + ',' + temp[i].FACTOR_NAME;
						}
						$scope.pf = preFStr.slice(1);
						//console.log(preFStr + " || " + $scope.pf);
					}

				},
				error: function (jqXHR, textStatus, errorThrown) {
					//debugger;
					toastr.error("Error in loading data");
				}
			});

		}

		$scope.formpreFStr = function (pf, no) {

			$scope.count = 0;
			temp = $scope.pf.split(',');
			$scope.preferences[no].check = !$scope.preferences[no].check;
			for (var i = 0; i < temp.length; i++) {
				if (pf == temp[i]) {
					$scope.count++;
					temp.splice(i, 1);
				}
			}
			if ($scope.count == 0) {
				temp = temp.toString();
				temp = temp.concat(',', pf);
			}
			$scope.pf = temp.toString();
			if ($scope.pf[0] == ',') {
				$scope.pf = $scope.pf.slice(1);
			}
			//console.log($scope.pf + " [] " + temp);
		}

		$scope.applypreF = function () {
			$scope.changePrj($scope.cmm.projectCode, $scope.cmm.label, $scope.cmm.baslineNum, $scope.pf);
		}

		// main filter box scripts
		$scope.fillValue1 = function (v1) {
			$scope.filterMG = v1;

		}
		$scope.fillValue2 = function (v1) {
			$scope.filterBT = v1;

		}
		$scope.fillValue3 = function (v1) {
			$scope.filterPG = v1;

		}
		$scope.makeHeader = function () {
			$.cordys.ajax({
				method: "GetERFQComparisonData",
				namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
				dataType: "* json",
				parameters: {
					//cursor
					"comparisonType": "LandedCost",
					"panelGroup": $scope.panelGroup,
					"projectCode": $scope.cmm.projectCode,
					"budgeted": '',
                    "partNum": (cmm.selectedPartNumber!=undefined &&  cmm.selectedPartNumber.length > 0 )?cmm.selectedPartNumber[0]:"",
					"baselineNum": $scope.cmm.baslineNum,
					"decimalPlace": "",
					"preferences": "",
					"ComparePref": "",
					"toolmakersRequired": '',
					"panelGrouping": '',
					"materialGrade": ''


				},
				success: function (data) {
					$scope.gridOptions.data1 = $.cordys.json.findObjects(data, "COMPARISON");
					for (var i = 0; i < $scope.gridOptions.data1.length; i++) {

						$scope.callFunction1($scope.gridOptions.data1[i])
					}
					/*data = $scope.tableArray;
					$scope.dataCallFunction(data);*/


				},
				error: function (jqXHR, textStatus, errorThrown) {

					toastr.error("Unable to load data. Please try refreshing the page.");
				}
			});


		}
		$scope.settleData = function () {

			if (cmm.filtObj != null || cmm.filtObj != undefined) {
				$scope.filtObj = cmm.filtObj;

			}
			if ($scope.filtObj != undefined && $scope.filtObj != "" && $scope.filtObj != null) {

				$scope.fillValue1($scope.filtObj.filterMG);
				$scope.fillValue2($scope.filtObj.filterBT);
				$scope.fillValue3($scope.filtObj.filterPG);

				if ($scope.toolmakerDropdown.length != 0) {
					var tk = cmm.filtObj.filtertmk

					for (var t = 0; t < tk.length; t++) {

						var a = tk[t];
						$scope.toolmakerDropdown[a].selected1 = true;
					}
					//$scope.filterPG = $scope.filtObj.filterPG;
				}

				$scope.tmkReq = $scope.filtObj.tmkReq;
				$scope.setArr = $scope.filtObj.setArr;
			}
		}


		$scope.adddrp = function (value1) {
			//const { length } = $scope.budgetedToolmk;
			if ($scope.budgetedToolmk.length != 0) {
				for (var t = 0; t < $scope.budgetedToolmk.length; t++) {
					if ($scope.budgetedToolmk[t].value === value1.value) {
						return 1;
					}

				}
			} else {
				$scope.budgetedToolmk.push($scope.value);
				return 1;
			}
		}

		//addMaterial
		$scope.addMaterial = function (value2) {

			if ($scope.MaterialGrades.length != 0) {
				for (var t = 0; t < $scope.MaterialGrades.length; t++) {

					if ($scope.MaterialGrades[t].grp === value2.grp) {
						return 1;
					}
				}
			} else {
				$scope.MaterialGrades.push(value2);
				return 1;
			}
		}
		//for distinct Panel group push
		$scope.addPaneldrp = function (value2) {

			if ($scope.PanelGrpDrpdwn.length != 0) {
				for (var t = 0; t < $scope.PanelGrpDrpdwn.length; t++) {

					if ($scope.PanelGrpDrpdwn[t].grp === value2.grp) {
						return 1;
					}
				}
			} else {
				$scope.PanelGrpDrpdwn.push(value2);
				return 1;
			}
		}
		$scope.callFunction1 = function (obj) {
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {

					if (key.startsWith("BUDGETED_TOOLMAKER")) {


						$scope.value = {
							value: obj[key]
						}

						var ret = 0;
						ret = $scope.adddrp($scope.value);
						if (ret == undefined || ret == 0) {
							$scope.budgetedToolmk.push($scope.value)
						}

					}
					//--------------------	
					if (key.startsWith("PART_GROUP")) {
						$scope.value1 = {
							grp: obj[key]
						}

						var ret1 = 0;
						ret1 = $scope.addPaneldrp($scope.value1);
						if (ret1 == undefined || ret1 == 0) {
							$scope.PanelGrpDrpdwn.push($scope.value1)
						}

					}

					if (key.startsWith("MATERIAL")) {
						$scope.value2 = {
							grp: obj[key]
						}

						var ret1 = 0;
						ret1 = $scope.addMaterial($scope.value2);
						if (ret1 == undefined || ret1 == 0) {
							$scope.MaterialGrades.push($scope.value2)
						}

					}

					//uptill
				}
			}
		}
		$scope.tmkReq = [];
		$scope.makeTmkArray = function (a) {
			debugger;
			//console.log(a.TOOLMAKER_ID);
			if (a.selected1 == true) {
				$scope.tmkReq.push(a.TOOLMAKER_ID)
				var set = $scope.toolmakerDropdown.indexOf(a);
				$scope.setArr.push(set);
			}
			if (a.selected1 == false) {
				var indxOfObj = $scope.tmkReq.indexOf(a.TOOLMAKER_ID);
				//var ind = $scope.toolArray.indexOf(a);
				$scope.tmkReq.splice(indxOfObj, 1);

				var set = $scope.toolmakerDropdown.indexOf(a);
				var s = $scope.setArr.indexOf(set)
				$scope.setArr.splice(s, 1);

			}


		}
		$scope.filter = function () {

document.getElementById("myDropdown").classList.toggle("show");
			array = $scope.tmkReq;
			var flags = [],
				output = [],
				l = array.length,
				i;

			for (i = 0; i < l; i++) {

				if (flags[array[i]])
					continue;

				flags[array[i]] = true;

				output.push(array[i]);

			}
			$scope.tmkReq = output;
			if ($scope.tmkReq.length > 0) {
				$scope.tmkarg = ""
				for (var i = 0; i < $scope.tmkReq.length; i++) {
					if ($scope.tmkarg != "") {
						$scope.tmkarg += ","
					}
					$scope.tmkarg = $scope.tmkarg + "'" + $scope.tmkReq[i] + "'"
				}
			} else {
				$scope.tmkarg = ''
			}
			if ($scope.filterMG == undefined) {
				$scope.filterMG = ''
			}
			if ($scope.filterBT == undefined) {
				$scope.filterBT = ''
			}
			if ($scope.filterPG == undefined) {
				$scope.filterPG = ''
			}

			$scope.filtObj = {
				"filterMG": $scope.filterMG,
				"filterBT": $scope.filterBT,
				"filtertmk": $scope.setArr,
				"filterPG": $scope.filterPG,
				"filtReq": $scope.tmkarg,
				"tmkReq": $scope.tmkReq,
				"setArr": $scope.setArr
			};
			cmm.filtObj = $scope.filtObj;

			$scope.triggerRequest();

		}

		$scope.triggerRequest = function () {
			$.cordys.ajax({
				method: "GetERFQComparisonData",
				namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
				dataType: "* json",
				parameters: {
					//cursor
					"comparisonType": "LandedCost",
					"panelGroup": $scope.panelGroup,
					"projectCode": $scope.cmm.projectCode,
					"budgeted": (cmm.filtObj != undefined && cmm.filtObj.filterBT != undefined) ? cmm.filtObj.filterBT : '',
                    "partNum": (cmm.selectedPartNumber!=undefined &&  cmm.selectedPartNumber.length > 0 )?cmm.selectedPartNumber[0]:"",
					"baselineNum": $scope.cmm.baslineNum,
					"decimalPlace": $scope.decimals,
					"preferences": $scope.pf,
					"ComparePref": "",
					"toolmakersRequired": (cmm.filtObj != undefined && cmm.filtObj.filtReq != undefined) ? cmm.filtObj.filtReq : '',
					"panelGrouping": (cmm.filtObj != undefined && cmm.filtObj.filterPG != undefined) ? cmm.filtObj.filterPG : '',
					"materialGrade": (cmm.filtObj != undefined && cmm.filtObj.filterMG != undefined) ? cmm.filtObj.filterMG : ''

				},
				success: function (data) {
					$scope.gridOptions.data = $.cordys.json.findObjects(data, "COMPARISON");
					console.log("filtered: ", $scope.gridOptions.data);
					$scope.gridOptions2.api.setRowData($scope.gridOptions.data);
					$scope.gridOptions2.columnDefs.splice(7);

					$scope.colAdd($scope.gridOptions.data);
					$scope.settleData();
					console.log("Filtered Landed Cost: ",$scope.gridOptions2.columnDefs);
					$scope.$apply();

				},
				error: function (jqXHR, textStatus, errorThrown) {

					toastr.error("Unable to load data. Please try refreshing the page.");
				}
			});
		}

$scope.openDD =function() {
document.getElementById("myDropdown").classList.toggle("show");
}
		$scope.clearAllField = function () {
			$scope.filterMG = "";
			$scope.filterBT = ""
			$scope.setArr = [];
			$scope.filterPG = "";
			$scope.tmkarg = "";
			$scope.tmkReq = [];
document.getElementById("myDropdown").classList.toggle("show");

			for (i = 0; i < $scope.toolmakerDropdown.length; i++) {
				if ($scope.toolmakerDropdown[i].selected1 != undefined && $scope.toolmakerDropdown[i].selected1 == true) {
					$scope.toolmakerDropdown[i].selected1 = false;
				}
			}
			$scope.filtObj = {
				"filterMG": $scope.filterMG,
				"filterBT": $scope.filterBT,
				"filtertmk": $scope.setArr,
				"filterPG": $scope.filterPG,
				"filtReq": $scope.tmkarg,
				"tmkReq": $scope.tmkReq,
				"setArr": $scope.setArr
			};
			cmm.filtObj = $scope.filtObj;
			$scope.changePrj($scope.cmm.projectCode, $scope.panelGroup, $scope.cmm.baslineNum, $scope.pf);
		}

		if (($scope.cmm.projectCode == undefined)) {
			toastr.warning("Select ProjectCode");
		} else {
			$scope.openruPBox('1', $scope.cmm.projectCode, $scope.cmm.label, $scope.cmm.baslineNum);
		}

	/*this function is for save tab data*/
	  $scope.xlSave = function () {
		console.log("no of dies save Data:",$scope.gridOptions.data);

		(function (_data) {
		  console.log(_data);
		  $.cordys.ajax({
			method: "UpdateErfqQuoteComparison",
			namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
			dataType: "* json",
			parameters: {
			  'tuple': _data
			},
			success: function success(data) {
			  console.log("success");
			  document.getElementById("revtab1").style.display = "";
			  document.getElementById("tab1").style.display = "";
			  document.getElementById("dietab1").style.display = "";
			  document.getElementById("basictab1").style.display = "";
			  document.getElementById("landedtab1").style.display = "";
			  document.getElementById("costtab1").style.display = "";
			  document.getElementById("besttab1").style.display = "";
			  document.getElementById("preftab1").style.display = "";
			  document.getElementById("targettab1").style.display = "";
			  document.getElementById("subtab1").style.display = "";
			  cmm.SaveTab = false;
			  window.scrollTo(0, 0);
			  toastr.success("Updated successfully!");
			},
			error: function error(jqXHR, textStatus, errorThrown) {
			  console.log("jqXHR=>", jqXHR, "textStatus=>", textStatus, "errorThrown=>", errorThrown);
			}
		  });
		})(_.map($scope.gridOptions2.data, function (d) {
		  if (d.COMPARISON_SEQ == "") {
			return {
			  "new": {
				'ERFQ_QUOTE_COMPARISON': {
				  'PROJECT_CODE': cmm.projectCode,
				  'PART_NUMBER': d.PART_NUMBER,
				  'NO_OF_DIES_BLANKINGDIE': d.NO_OF_DIES_BLANKINGDIE,
				  'DIE_WEIGHT_BLANKINGDIE': "Included",
				  'BASICCOST_BLANKINGDIE': "Included",
				  'LANDEDCOST_BLANKINGDIE': "Included",
				  'COSTPERTON_BLANKINGDIE': "Included",
				  'PART_GROUP': $scope.cmm.label,
				  'BASELINE_NUM': cmm.baslineNum
				}
			  }
			};
		  } else {
			return {
			  "old": {
				'ERFQ_QUOTE_COMPARISON': {
				  'COMPARISON_SEQ': d.COMPARISON_SEQ
				}
			  },
			  "new": {
				'ERFQ_QUOTE_COMPARISON': {
				  'COMPARISON_SEQ': d.COMPARISON_SEQ,
				  'LANDEDCOST_BLANKINGDIE': d.LANDEDCOST_BLANKINGDIE
				}
			  }
			};
		  }
		}));
	  };

	$scope.$watchCollection('cmm.SaveTab', function(newValue, oldValue) {   
        if(cmm.SaveTab==true)
			$scope.xlSave();
        }, true);
		
	});