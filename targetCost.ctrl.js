angular.module('App.quoteComparisionCtrl')
	.controller('targetCostCtrl', function ($scope, Upload, $window, $log, $state, NgTableParams, cmm) {
		$scope.data = {};
		$scope.data.dynamicCnt = 1;
		$scope.data.countForR = 1;
		$scope.data.countForTM = 1;
		$scope.data.countForCDs = 1;
		
		$scope.cmm = cmm;
		$scope.baslineNumArr = [];
		$scope.PartNOs = [];

		$scope.cmm.label = 'A';
		$scope.baseLineD = {};
		$scope.baseLineLead = {
			ch: []
		};
		$scope.binit = function (d) {

			$scope.baseLineLead = {
				ch: []
			};
			$.cordys.ajax({
				method: "GetBaselineForProject",
				namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
				dataType: "* json",
				parameters: {
					"projectCode": cmm.projectCode
				},
				success: function success(data) {
					$scope.baseLineLead = {
						ch: []
					};
					$.cordys.json.findObjects(data, "ERFQ_BASELINE_MAIN").forEach(function (d) {
						if (d.BASELINE_STATUS == "Submitted")
							$scope.baseLineLead.ch.push({
								"key": d.BASELINE_NUM,
								value: true,
								status: d.BASELINE_STATUS,
								name: d.BASELINE_NAME
							});
						else
							$scope.baseLineLead.ch.push({
								"key": d.BASELINE_NUM,
								value: false,
								status: d.BASELINE_STATUS,
								name: d.BASELINE_NAME
							});
					});
					if (d != undefined) {
						$(d).modal("show")
					}
				},
				error: function error(jqXHR, textStatus, errorThrown) {}
			});
		}
		$scope.binit();

		/*
		if (cmm.baslineNum) {
		            for (var i = 1; i <= cmm.baslineNum; i++) {

		                $scope.baseLineLead.ch.push({
		                    key: i,
		                    value: false
		                });
		            }
		        }
		        */


		$scope.baselineLeadSave = function () {
			console.log("$scope.baseLineLead=>", $scope.baseLineLead);

			$scope.baseLineLead.ch.filter(function (d) {
				return d.value == true;
			}).forEach(function (d2) {


				$.cordys.ajax({
					method: "erfqQuoteCompare",
					namespace: "http://schemas.cordys.com/default",
					dataType: "* json",
					parameters: {
						"pojCode": cmm.projectCode,
						"baseLine": d2.key,
						"other": d2.name
					},
					success: function success(data) {

						$scope.data.erfq_toolmaker_master = $.cordys.json.findObjects(data, "ERFQ_TOOLMAKER_MASTER");
					},
					error: function error(jqXHR, textStatus, errorThrown) {}
				});

			})

		}
		$scope.baselineSave = function () {
			console.log("baseline save", $scope.baseLineD);
			console.log("cmm", cmm);


			var qr = {
				"new": {
					"ERFQ_BASELINE_MAIN": {
						//"BASELINE_SEQ":"",
						"PROJECT_CODE": cmm.projectCode,
						"BASELINE_NUM": Number(cmm.baslineNum + 1),
						"BASELINE_NAME": $scope.baseLineD.name,
						"BASELINE_REMARK": $scope.baseLineD.remark,
						"PREFERENCE": "LandedCost"
					}
				}

			};

			$.cordys.ajax({
				method: "UpdateErfqBaselineMain",
				namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
				dataType: "* json",
				parameters: {
					"tuple": qr
				},
				success: function success(data) {

					$scope.data.erfq_toolmaker_master = $.cordys.json.findObjects(data, "ERFQ_TOOLMAKER_MASTER");
				},
				error: function error(jqXHR, textStatus, errorThrown) {}
			});

		}
		$scope._init2 = function () {
			$.cordys.ajax({
				method: "GetAllToolmakerDetails",
				namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
				dataType: "* json",
				parameters: {},
				success: function success(data) {

					$scope.data.erfq_toolmaker_master = $.cordys.json.findObjects(data, "ERFQ_TOOLMAKER_MASTER");
					$scope.allTMs = $.cordys.json.findObjects(data, "ERFQ_TOOLMAKER_MASTER");

					$scope.TMoptions = $scope.allTMs.map(function (d) {
						return '<option value="' + d.TOOLMAKER_ID + '">' + d.TOOLMAKER_NAME + '</option>'
					});
					//$scope.TMoptions = $scope.TMep.toString();
				},
				error: function error(jqXHR, textStatus, errorThrown) {}
			});
		}
		$scope.changePrj = function (projectCode, panelGroup, bNum) {
			$.cordys.ajax({
				method: "GetToolMakersforCompair",
				namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
				dataType: "* json",
				parameters: {
					"projectCode": projectCode,
					"panelGroup": panelGroup
				},
				success: function (data) {

					$scope.dropdownArr = $.cordys.json.findObjects(data, "ERFQ_TOOLMAKER_MASTER");
					// call table data
					$.cordys.ajax({
						method: "GetERFQComparisonData",
						namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
						dataType: "* json",
						parameters: {
							"comparisonType": "Preference",
							"panelGroup": panelGroup,
							"projectCode": projectCode,
							"baselineNum": 0,
							"budgeted": "",
							"partNum": "",
							"decimalPlace": "5",
							"preferences": "",
							"ComparePref": "LandedCost",
							"toolmakersRequired": '',
							"panelGrouping": ''
						},
						success: function (data) {
							$scope._init();
							var temp = $.cordys.json.findObjects(data, "COMPARISON");
							$scope.gridOptions.data = _.map(temp, function (d) {
								var ll = _.keys(d.LANDEDCOST);
								// var tt = "";
								// for (var k = 0; k < d.TOOLMAKER.length; k++) {
								//     tt += "<option value='" + d.TOOLMAKER[k].ID + "'>" + d.TOOLMAKER[k].NAME + "</option>";
								// }
								// d.dropdown = "<select>" + tt + "</select>";
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
							var yy = $scope.dropdownArr.map(function (d) {
								return '<option value="' + d.TOOLMAKER_ID + '">' + d.TOOLMAKER_NAME + '</option>'
							});
							$scope.dropdown = '<select style="width:100%;height:100%;border:none;" ng-model="row.entity.ToolmakerPref[\'{XXX}\']">' + yy + '</select>';

							var yy = $scope.dropdownArr.map(function (d) {
								return '<option value="' + d.TOOLMAKER_ID + '">' + d.TOOLMAKER_NAME + '</option>'
							});

							var _ToolmakerPref = _.keys($scope.gridOptions.data[0].ToolmakerPref);
							for (var i = 0; i < _ToolmakerPref.length; i++) {
								$scope.add('<select style="width:100%;height:100%;border:none;" ng-model="row.entity.ToolmakerPref[\'' + _ToolmakerPref[i] + '\'].TOOLMAKER">' + yy + '</select>');
							}

							$scope.colAdd($scope.gridOptions.data);
							$scope.countColB4 = $scope.gridOptions.columnDefs.length;
							$scope.countColAF = $scope.countColB4;
							
							$scope.addProRefs($scope.gridOptions.data);
							$scope.countColAF = $scope.gridOptions.columnDefs.length;
							$scope.countColTM = $scope.countColAF;
							
							$scope.addTMs($scope.gridOptions.data);
							$scope.countColTM = $scope.gridOptions.columnDefs.length;
							$scope.countColCDs= $scope.countColTM;
							
							$scope.addCDs($scope.gridOptions.data);
							$scope.countColCDs= $scope.gridOptions.columnDefs.length;
							
							$scope.gridOptions.columnDefs.push({
								field: "targetCost",
								enableCellEdit: true,
								displayName: "TARGET COST",
								cellClass: cellClass,
								width: 150,
								cellTemplate: ''
							});
							console.log("data=>", $scope.gridOptions.data)
							$scope.$apply();

						},
						error: function (jqXHR, textStatus, errorThrown) {

						}
					});
					//end table data

				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(
						"jqXHR=>", jqXHR,
						"textStatus=>", textStatus,
						"errorThrown=>", errorThrown
					);
				}
			});


		}
		$scope._init2();


		$scope.xl = function () {
			console.log($scope.gridOptions);
			var arrXl = [];
			arrXl.push(_.map($scope.gridOptions.columnDefs, 'displayName'));


		}


		$scope.xlSave = function () {
			console.log("data = save = ", $scope.gridOptions.data);


			var qr = _.flatten(
				$scope.gridOptions.data.map(function (d) {
					return Object.keys(d).filter(function (d2) {
						return d2.match(/L[0-9]/i);
					}).map(function (d3) {
						var temp = {
							"new": {
								ERFQ_COMPARISON_PREFERENCE: {
									// "PREFERENCE_SEQ":"",
									"PROJECT_CODE": $scope.cmm.projectCode,
									"PART_NUMBER": d.PART_NUMBER,
									"BASELINE_NUM": "0",
									// "LEVEL_PREFERNCE": d[d3].BASICCOST.TOOLMAKER,
									"LEVEL_PREFERNCE": d.ToolmakerPref[d3.replace("L", "P")].TOOLMAKER,
									"TOOLMAKER_PREFERNCE": d.ToolmakerPref[d3.replace("L", "P")],
									"PREFERENCE_NUM": d3.replace("L", "P"),
									"JUSTIFICATION": ""

								}

							}
						};
						if (d.ToolmakerPref[d3.replace("L", "P")].PREFERENCESEQ) {
							temp.old = {
								ERFQ_COMPARISON_PREFERENCE: {
									PREFERENCE_SEQ: d.ToolmakerPref[d3.replace("L", "P")].PREFERENCESEQ
								}

							}
						};
						return temp;

					})

				}), Infinity);

			console.log("param=>", qr);
			$.cordys.ajax({
				method: "UpdateErfqComparisonPreference",
				namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
				dataType: "* json",
				parameters: {
					"tuple": qr
				},
				success: function (data) {

					console.log("success");
				},
				error: function error(jqXHR, textStatus, errorThrown) {
					console.log("error");
				}
			});

			console.log("qr=>", qr);
			console.log("ctrl=>", $scope.cmm);
			console.log("service=>", cmm);

			for (i = 0; i < $scope.gridOptions.data.length; i++) {
				$.cordys.ajax({
					method: "UpdateErfqProjectReferences",
					namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
					dataType: "* json",
					parameters: {
						"tuple": {
							"new": {
								"ERFQ_PROJECT_REFERENCES": {
									"PROJECT_CODE": '',
									"ERFQ_NUMBER_COMPAIR": '',
									"PART_NUMBER": '',
									"PR_PROJECT_CODE": '',
									"PR_PARTNUMBER": '',
									"PR_NOMENCLATURE": '',
									"PR_TOOLMAKERID": '',
									"PR_BASICCOST": '',
									"PR_LANDEDCOST": '',
									"PR_NOOFDIES": '',
									"PR_DIEWEIGHT": '',
									"PR_COSTPERTON": '',
									"BASELINE_NUM": '',
									"PREFERENCE_PARAM": ''
								}
							}
						}
					},
					success: function (data) {

						console.log("success" + i);
					},
					error: function error(jqXHR, textStatus, errorThrown) {
						console.log("error");
					}
				});
			}
		}
		$scope.$watchCollection('cmm', function (newValue, oldValue) {
			$scope.data.dynamicCnt = 1;
			if ((newValue.projectCode != oldValue.projectCode) || (newValue.label != oldValue.label))
				$scope.changePrj(newValue.projectCode, newValue.label, cmm.baslineNum);
		}, true);

		function cellClass(grid, row, col, rowRenderIndex, colRenderIndex) {
			if (row.entity.NO_OF_DIES_BLANKINGDIE == "Included") {
				var key = _.keys(row.entity).filter(function (d) {
					return d.match(/TOOLMAKER[0-9]/i)
				});
				for (var i = 0; i < key.length; i++) {
					if (Number(row.entity[key[i]].IN_NODIES) < Number(row.entity.IN_DIES_BUDGETED)) {
						return 'dicostRed';
					}
				}
			}
			if (row.entity.NO_OF_DIES_BLANKINGDIE == "Excluded") {
				var key = _.keys(row.entity).filter(function (d) {
					return d.match(/TOOLMAKER[0-9]/i)
				});
				for (var i = 0; i < key.length; i++) {
					if (Number(row.entity[key[i]].EX_NODIES) < Number(row.entity.IN_DIES_BUDGETED)) {
						return 'dicostRed';
					}
				}
			}
		}
		$scope._init = function () {
			$scope.gridOptions = {
				showExpandAllButton: false
			};

			$scope.gridOptions.columnDefs = [{
					field: 'COMPARISON_SEQ',
					enableCellEdit: false,
					displayName: "S.No",
					pinnedLeft: true,
					cellClass: cellClass,
					cellTemplate: '<div class="ui-grid-cell-contents">{{grid.renderContainers.body.visibleRowCache.indexOf(row) + 1}}</div>',
					enablePinning: true
				},
				{
					field: 'PART_NUMBER',
					enableCellEdit: false,
					pinnedLeft: true,
					cellClass: cellClass,
					width: 150,
					//displayName: "Part Number"
					headerCellTemplate: '<div>Part Number <i ng-click="grid.appScope.addProRefs(row)" class="fa fa-plus-circle float-right text-danger mt-2" aria-hidden="true"></i></div>'
				}
			];
		}

		$scope.addProRefs = function (row) {

			$scope.gridOptions.columnDefs.splice($scope.countColAF+0, 0,{
				field: "r" + $scope.data.countForR + ".PROJECTCODE",
				enableCellEdit: false,
				displayName: "R" + $scope.data.countForR + " PROJECTCODE",
				cellClass: cellClass,
				width: 150,
				cellTemplate: '<input style="width:100%;height:100%;border:none;" ng-model="row.entity.r' + $scope.data.countForR + '.PROJECTCODE" ng-change="grid.appScope.getParts(row.entity.r' + $scope.data.countForR + '.PROJECTCODE)"></input>'
			});
			$scope.gridOptions.columnDefs.splice($scope.countColAF+1, 0,{
				field: "r" + $scope.data.countForR + ".PARTNUMBER",
				enableCellEdit: false,
				displayName: "R" + $scope.data.countForR + " PARTNUMBER",
				cellClass: cellClass,
				width: 150,
				cellTemplate: '<select style="width:100%;height:100%;border:none;" ng-model= "row.entity.r' + $scope.data.countForR + '.PARTNUMBER">\'' + $scope.PartNOs + '\'</select>'
			});
			$scope.gridOptions.columnDefs.splice($scope.countColAF+2, 0,{
				field: "r" + $scope.data.countForR + ".NOMENCLATURE",
				enableCellEdit: false,
				displayName: "R" + $scope.data.countForR + " NOMENCLATURE",
				cellClass: cellClass,
				width: 150,
				cellTemplate: ''
			});
			$scope.gridOptions.columnDefs.splice($scope.countColAF+3, 0,{
				field: "r" + $scope.data.countForR + ".TOOLMAKER",
				enableCellEdit: false,
				displayName: "R" + $scope.data.countForR + " TOOLMAKER",
				cellClass: cellClass,
				width: 150,
				cellTemplate: '<select style="width:100%;height:100%;border:none;" ng-model="row.entity.r' + $scope.data.countForR + '.TOOLMAKER">\'' + $scope.TMoptions + '\'</select>'
			});
			$scope.gridOptions.columnDefs.splice($scope.countColAF+4, 0,{
				field: "r" + $scope.data.countForR + ".BASICCOST",
				enableCellEdit: true,
				displayName: "R" + $scope.data.countForR + " BASICCOST",
				cellClass: cellClass,
				width: 150,
				cellTemplate: ''
			});
			$scope.gridOptions.columnDefs.splice($scope.countColAF+5, 0,{
				field: "r" + $scope.data.countForR + ".LANDEDCOST",
				enableCellEdit: true,
				displayName: "R" + $scope.data.countForR + " LANDEDCOST",
				cellClass: cellClass,
				width: 150,
				cellTemplate: ''
			});
			$scope.gridOptions.columnDefs.splice($scope.countColAF+6, 0,{
				field: "r" + $scope.data.countForR + ".NOOFDIES",
				enableCellEdit: true,
				displayName: "R" + $scope.data.countForR + " NOOFDIES",
				cellClass: cellClass,
				width: 150,
				cellTemplate: ''
			});
			$scope.gridOptions.columnDefs.splice($scope.countColAF+7, 0,{
				field: "r" + $scope.data.countForR + ".DIEWEIGHT",
				enableCellEdit: true,
				displayName: "R" + $scope.data.countForR + " DIEWEIGHT",
				cellClass: cellClass,
				width: 150,
				cellTemplate: ''
			});
			$scope.gridOptions.columnDefs.splice($scope.countColAF+8, 0,{
				field: "r" + $scope.data.countForR + ".COSTPERTON",
				enableCellEdit: true,
				displayName: "R" + $scope.data.countForR + " COSTPERTON",
				cellClass: cellClass,
				width: 150,
				cellTemplate: ''
			});
			$scope.data.countForR += 1;
			$scope.countColAF += 9;

		}
		
		$scope.addTMs = function (row) {
			$scope.gridOptions.columnDefs.splice($scope.countColTM+1, 0,{
				field: "t" + $scope.data.countForTM + ".TOOLMAKER",
				enableCellEdit: true,
				displayName: "TOOLMAKER T" + $scope.data.countForTM,
				cellClass: cellClass,
				width: 150,
				cellTemplate: '<select style="width:100%;height:100%;border:none;" ng-model="row.entity.t' + $scope.data.countForTM + '.TOOLMAKER">\'' + $scope.TMoptions + '\'</select>'
			});
			$scope.data.countForTM += 1;
			$scope.countColTM += 1;
		}
		
		$scope.addCDs = function (row) {
			$scope.gridOptions.columnDefs.splice($scope.countColCDs+1, 0,{
				field: "c" + $scope.data.countForCDs + ".CD",
				enableCellEdit: true,
				displayName: "COMMERCIAL_DISCUSSION C" + $scope.data.countForCDs,
				cellClass: cellClass,
				width: 300,
				cellTemplate: '<select style="width:100%;height:100%;border:none;" ng-model="row.entity.c' + $scope.data.countForCDs + '.CD">\'' + $scope.TMoptions + '\'</select>'
			});
			$scope.data.countForCDs += 1;
			$scope.countColCDs += 1;
		}		

		$scope.dropDiff = function (grid, row) {
			return row.entity.dropdown;
			// return row.entity.TOOLMAKER.map(function (d) {
			//     return "<option value='"+d.ID+"'>" + d.NAME + "</option>";
			// });
		}
		$scope.add = function (select) {

			if (select == undefined) {
				var tt = ("P" + $scope.data.dynamicCnt);
				select = $scope.dropdown.replace('{XXX}', tt);
			}
			$scope.gridOptions.columnDefs.splice($scope.data.dynamicCnt + 2, 0, {
				field: 'p',
				displayName: "p" + $scope.data.dynamicCnt,
				enableCellEdit: false,
				//cellTemplate: "<div><select style='width:100%;height:100%;border: none;' ng-model='row.entity.ToolmakerPref.P"+$scope.data.dynamicCnt + "> {{grid.appScope.dropDiff(grid,row)}} </select></div>",
				//cellTemplate:'<div ng-bind-html="row.entity.dropdown"></div>',
				//cellTemplate: '<div><select style="width:100%;height:100%;border:none;"><option>o1</option><option>o1</option></select></div>',
				cellTemplate: select,
				width: 150
			});
			$scope.data.dynamicCnt += 1;

		};
		$scope._init();
		$scope.openFilterBox = function () {

			document.getElementById("filterBtn").style.backgroundColor = "#24c0c0";
			document.getElementById("ruPBtn").style.backgroundColor = "#dfdede";
			document.getElementById("preFBtn").style.backgroundColor = "#dfdede";
		}
		if (($scope.cmm.projectCode == undefined))
			toastr.warning("Select ProjectCode");
		else
			$scope.changePrj($scope.cmm.projectCode, $scope.cmm.label, cmm.baslineNum);
		$scope.setLab = function (d) {
			$scope.cmm.label = d;
		}
		$scope.downloadFileOut = function (grid, row, num, col) {
			return row.entity[num][col].VALUE;
		}
		$scope.colAdd = function (data) {
			var ll = _.keys(data[0]).filter(function (d) {
				return d.match(/L[0-9]/)
			})
			for (var i = 1; i <= ll.length; i++) {
				var aa = ["BASICCOST", "COSTPERTON", "DIEWEIGHT", "LANDEDCOST", "NOOFDIES"];
				for (var j = 0; j < aa.length; j++) {
					$scope.gridOptions.columnDefs.push({
						field: 'L',
						enableCellEdit: false,
						displayName: "L" + i + " " + aa[j],
						cellClass: cellClass,
						width: 150,
						cellTemplate: "<div>{{grid.appScope.downloadFileOut(grid,row,\"L" + i + "\",\"" + aa[j] + "\")}}</div>"
					});
				}
			}
		}

		// get Project Codes
		$.cordys.ajax({
			method: "GetERFQProjectCodes",
			namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
			dataType: "* json",
			parameters: {

			},
			success: function (data) {

				$scope.PrjMembers = $.cordys.json.findObjects(data, "AFS_PROJ_MEMBERS");
				// $scope.material= "ABC";
			},
			error: function (jqXHR, textStatus, errorThrown) {
				toastr.error("Unable to load data. Please try refreshing the page.");
			}
		});

		// Get Part Numbers based on ProjectCodes
		$scope.getParts = function (partNo) {
			//console.log("check data: ", $scope.gridOptions.data);
			//console.log("B4: ",$scope.countColB4); console.log("AF: ",$scope.countColAF);
			var c=0;
			setTimeout(function(){
				$.cordys.ajax({
					method: "GetPartsByProjectCode",
					namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
					dataType: "* json",
					parameters: {
						"ProjectCode": partNo
					},
					success: function (data) {
					
						if(data.tuple != undefined) {
							$scope.caughtPNo = $.cordys.json.findObjects(data, "Part_MASTER_ERFQ_TABLE");
							
							$scope.PartNOs = $scope.caughtPNo.map(function (d) {
								return '<option value="' + d.PART_NUMBER + '">' + d.PART_NUMBER + '</option>'
							});
							$scope.$apply();
						}
						else {
							c += 1;
						}
					},
					error: function (jqXHR, textStatus, errorThrown) {
						toastr.error("Unable to load data. Please try refreshing the page.");
					}
				});
			}, 5000);
			if(c>0){
				toastr.error("No part number present for this Project Code");
			}
		}
		//	preferences scripts
		$scope.openpreFBox = function (valU) {
			document.getElementById("filterBtn").style.backgroundColor = "#202121";
			document.getElementById("preFBtn").style.backgroundColor = "#dc3545";

			$scope.proref = ['R1', 'R2', 'R3', 'R4', 'R5'];
			$scope.preflevel = ['L1', 'L2', 'L3', 'L4', 'L5'];
			$scope.preferTM = ['P1', 'P2', 'P3', 'P4', 'P5'];
			$scope.preferences = ['Basic Cost', 'Landed Cost', 'No of Dies', 'Die Weight', 'Cost per Ton'];

			$scope.dataPF = function (preferences) {
				$scope.tableParams = new NgTableParams({}, {
					filterDelay: 0,
					dataset: preferences
				});
			}
			$scope.dataPTM = function (preferTM) {
				$scope.tableParams = new NgTableParams({}, {
					filterDelay: 0,
					dataset: preferTM
				});
			}
			$scope.dataPL = function (preflevel) {
				$scope.tableParams = new NgTableParams({}, {
					filterDelay: 0,
					dataset: preflevel
				});
			}
			$scope.dataPRF = function (proref) {
				$scope.tableParams = new NgTableParams({}, {
					filterDelay: 0,
					dataset: proref
				});
			}

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
				$scope.dataPF($scope.preferences);
				$scope.dataPTM($scope.preferTM);
				$scope.dataPL($scope.preflevel);
				$scope.dataPRF($scope.proref);
			} else if (valU == '1') {
				var preFStr = '';
				for (var i = 0; i < temp.length; i++) {
					preFStr = preFStr + ',' + temp[i].FACTOR_NAME;
				}
				$scope.pf = preFStr.slice(1);
				console.log(preFStr + " || " + $scope.pf);
			}

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
			console.log($scope.pf + " [] " + temp);
		}

		$scope.applypreF = function () {
			$scope.changePrj($scope.cmm.projectCode, $scope.cmm.label, $scope.cmm.baslineNum, $scope.pf);
		}
		//preferences end 

	})
	.filter('mapGender', function () {
		var genderHash = {
			'Included': 'Included',
			'Excluded': 'Excluded'
		};
		return function (input) {
			if (!input) {
				return '';
			} else {
				return genderHash[input];
			}
		};
	})
	