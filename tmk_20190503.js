angular.module('App.quoteComparisionCtrl')
	.controller('prefTmkCompCtrl', function ($scope, Upload, $window, $log, $state, NgTableParams, cmm, $sce) {
		$scope.data = {};
		$scope.data.dynamicCnt = 1;
		$scope.cmm = cmm;
		$scope.baslineNumArr = [];

		$scope.alltabData = [];

		// function tabData() {
		// 	var p = [];
		// 	[
		// 	"PanelGroup",
		// 	"NoOfDies",
		// 	"DieWeight",
		// 	"BasicCost",
		// 	"LandedCost",
		// 	"CostperTon",
		// 	"BestQuoted",
		// 	"Preference"
		// 	].forEach(function (d) {
		// 		var qr = {
		// 			"comparisonType": d,
		// 			"panelGroup": cmm.label,
		// 			"projectCode": cmm.projectCode,
		// 			"budgeted": '',
		// 			"partNum": '',
		// 			"baselineNum": cmm.baslineNum,
		// 			"decimalPlace": '',
		// 			"preferences": '',
		// 			"ComparePref": '',
		// 			"toolmakersRequired": '',
		// 			"panelGrouping": '',
		// 			"materialGrade": ''
		// 		};
		// 		console.log("p qr=>",qr);
		// 		p.push(
		// 			new Promise(function (rev, rej) {
		// 				$.cordys.ajax({
		// 					method: "GetERFQComparisonData",
		// 					namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
		// 					dataType: "* json",
		// 					parameters: qr,
		// 					success: function (data) {
		// 							// console.log("d=>", d, "data=>", $.cordys.json.findObjects(data, "COMPARISON"));
		// 							// $scope.alltabData.push($.cordys.json.findObjects(data, "COMPARISON"));
		// 							console.log($.cordys.json.findObjects(data, "COMPARISON"));
		// 							rev($.cordys.json.findObjects(data, "COMPARISON"));

		// 						},
		// 						error: function (jqXHR, textStatus, errorThrown) {

		// 						}
		// 					});
		// 			})
		// 			);


		// 	});
		// 	return Promise.all(p);
		// }
		//start code
		// tabData().then(resp => {
		// 	console.log("All data =>",resp);
		// 	var print = _.flattenDeep(resp).map(function(d){
		// 		return (function(t){
		// 			// if(d.COMPARISON_SEQ)
		// 			// 	t.COMPARISON_SEQ = d.COMPARISON_SEQ;
		// 			if(d.PROJECT_CODE)
		// 				t.PROJECT_CODE= d.PROJECT_CODE;
		// 			if(d.PART_NUMBER)
		// 				t.PART_NUMBER = d.PART_NUMBER;
		// 			if(d.NO_OF_DIES_BLANKINGDIE)
		// 				t.NO_OF_DIES_BLANKINGDIE = d.NO_OF_DIES_BLANKINGDIE;
		// 			if(d.DIE_WEIGHT_BLANKINGDIE)
		// 				t.DIE_WEIGHT_BLANKINGDIE = d.DIE_WEIGHT_BLANKINGDIE;
		// 			if(d.BASIC_COST_BLANKINGDIE)
		// 				t.BASIC_COST_BLANKINGDIE = d.BASIC_COST_BLANKINGDIE;
		// 			if(d.LANDED_COST_BLANKINGDIE)
		// 				t.LANDED_COST_BLANKINGDIE = d.LANDED_COST_BLANKINGDIE;
		// 			if(d.COST_PER_TON_BLANKINGDIE)
		// 				t.COST_PER_TON_BLANKINGDIE = d.COST_PER_TON_BLANKINGDIE;
		// 			if(d.BASELINE_NUM)
		// 				t.BASELINE_NUM = d.BASELINE_NUM;
		// 			if(d.PART_GROUP)
		// 				t.PART_GROUP = d.PART_GROUP;
		// 			if(d.PART_GROUP)
		// 				t.PART_GROUP = d.PART_GROUP;
		// 			var bsgrp = Object.keys(d).filter(function(dd){ return dd.match(/^BASEGROUP[0-9]/i)});
		// 			if(bsgrp.length > 0 )
		// 			{
		// 			bsgrp.forEach(function(d3){
		// 				t["NEW_PART_GROUP"+d3.replace("BASEGROUP","")] =d[d3]; 
		// 			})	
		// 			}

		// 			return {ERFQ_QUOTE_COMPARISON:t};

		// 		})({});
		// 	});
		// 	console.log("print=>",print);
		// });						
		//end code
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
					$scope.data.erfq_toolmaker_master = $.cordys.json.findObjects(data, "ERFQ_BASELINE_MAIN");
					console.log("$scope.data.erfq_toolmaker_master=>", $scope.data.erfq_toolmaker_master);
					$.cordys.ajax({
						method: "GetQuoteComparisionbyProject",
						namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
						dataType: "* json",
						parameters: {
							ProjectCode: cmm.projectCode,
							//baselinenum:cmm.baslineNum,
							baselinenum: cmm.baslineNum,
							GROUP: ""
						},
						success: function (data) {
							var saveQrData = $.cordys.json.findObjects(data, "ERFQ_QUOTE_COMPARISON");
							if (saveQrData.length > 0) {
								var _t = [];
								saveQrData.forEach(function (_sd) {
									var tt = _sd;
									if (_sd.COMPARISON_SEQ)
										delete tt.COMPARISON_SEQ;
									if (_sd.BASELINE_NUM)
										tt.BASELINE_NUM = Number(cmm.baslineNum + 1);
									if (_sd.BASIC_COST_BLANKINGDIE == undefined)
										tt.BASIC_COST_BLANKINGDIE = "Included";

									_t.push({
										"ERFQ_QUOTE_COMPARISON": tt
									});
								})
								console.log("SNU=>", _t);


								$.cordys.ajax({
									method: "UpdateErfqQuoteComparison",
									namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
									dataType: "* json",
									parameters: {
										"tuple": _t
									},
									success: function (data) {
										console.log("success=>");
										$scope.xlSave();
									},
									error: function () {}
								});


							}
						},
						error: function (jqXHR, textStatus, errorThrown) {}
					});


				},
				error: function error(jqXHR, textStatus, errorThrown) {}
			});

		}
		$scope._init2 = function () {
			$.cordys.ajax({
				method: "GetAllToolmakerDetails",
				namespace: "",
				dataType: "* json",
				parameters: {},
				success: function success(data) {

					$scope.data.erfq_toolmaker_master = $.cordys.json.findObjects(data, "ERFQ_TOOLMAKER_MASTER");
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
								return '<option value="' + d.TOOLMAKER_ID + '"">' + d.TOOLMAKER_NAME + '</option>'
							});
							$scope.dropdown = '<select style="width:100%;height:100%;border:none;" ng-model="row.entity.ToolmakerPref[\'{XXX}\']">' + yy + '</select>';

							var yy = $scope.dropdownArr.map(function (d) {
								return '<option value="' + d.TOOLMAKER_ID + '"">' + d.TOOLMAKER_NAME + '</option>'
							});

							var _ToolmakerPref = _.keys($scope.gridOptions.data[0].ToolmakerPref);
							for (var i = 0; i < _ToolmakerPref.length; i++) {
								$scope.add('<select style="width:100%;height:100%;border:none;" ng-model="row.entity.ToolmakerPref[\'' + _ToolmakerPref[i] + '\'].TOOLMAKER">' + yy + '</select>');
							}


							$scope.colAdd($scope.gridOptions.data);
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
									//                            "PREFERENCE_SEQ":"",
									"PROJECT_CODE": $scope.cmm.projectCode,
									"PART_NUMBER": d.PART_NUMBER,
									"BASELINE_NUM": Number(cmm.baslineNum) + 1,
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

			// console.log($scope.gridOptions);
			// (function(_data) {
			//     console.log(_data);
			//     $.cordys.ajax({
			//         method: "UpdateErfqQuoteComparison",
			//         namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
			//         dataType: "* json",
			//         parameters: {
			//             'tuple': _data
			//         },
			//         success: function success(data) {
			//             console.log("success");

			//         },
			//         error: function error(jqXHR, textStatus, errorThrown) {
			//             console.log(
			//                 "jqXHR=>", jqXHR,
			//                 "textStatus=>", textStatus,
			//                 "errorThrown=>", errorThrown
			//             );
			//         }
			//     });
			// })(
			//     _.map($scope.gridOptions.data, function(d) {
			//         if (d.COMPARISON_SEQ) {
			//             return {
			//                 "old": {
			//                     'ERFQ_QUOTE_COMPARISON': {
			//                         'COMPARISON_SEQ': d.COMPARISON_SEQ
			//                     }
			//                 },
			//                 "new": {
			//                     'ERFQ_QUOTE_COMPARISON': {
			//                         'COMPARISON_SEQ': d.COMPARISON_SEQ,
			//                         'NO_OF_DIES_BLANKINGDIE': d.NO_OF_DIES_BLANKINGDIE
			//                     }
			//                 }
			//             };
			//         } else {
			//             return {
			//                 "new": {
			//                     'ERFQ_QUOTE_COMPARISON': {
			//                         'NO_OF_DIES_BLANKINGDIE': d.NO_OF_DIES_BLANKINGDIE
			//                     }
			//                 }
			//             };
			//         }
			//     })
			// )
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
					headerCellTemplate: '<div>Part Number <i ng-click="grid.appScope.add(row)" class="fa fa-plus-circle float-right text-danger mt-2" aria-hidden="true"></i></div>'
				},
				{
					field: 'JUSTIFICATION',
					enableCellEdit: false,
					displayName: "Justification",
					pinnedLeft: true,
					cellClass: cellClass,
					width: 150
				}
			];
		}
		// $scope.add = function () {
		//     var htmlSelect = $scope.data.erfq_toolmaker_master.map(function (d) {
		//         return "<option>" + d.TOOLMAKER_ID + "</option>"
		//     });
		//     var htmlSelect2 = "<div><select style='width:100%;height:100%;border: none;' ng-model='row.entity.ToolmakerPref.P"+$scope.data.dynamicCnt + "' ng-change='grid.appScope.addredCol(row)'>" + htmlSelect + "</select></div>";
		//     $scope.gridOptions.columnDefs.splice($scope.data.dynamicCnt + 2, 0, {
		//         field: 'p',
		//         displayName: "p" + $scope.data.dynamicCnt,
		//         enableCellEdit: false,
		//         cellTemplate: htmlSelect2,
		//         width: 150
		//     });
		//     $scope.data.dynamicCnt += 1;

		// };    
		$scope.addredCol = function (row) {
			console.log("addredCol=>", row);
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
	});
