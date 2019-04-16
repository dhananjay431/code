'use strict';

angular.module('App.mainApp').controller('panelGroupingCtrl', function ($scope, Upload, $timeout, $window, $uibModal, $log, $document, $state, uiGridConstants, $compile) {
	var vm = this;
	vm.data = {};
	$scope.ssaveFlag = false;
	vm.respArr = [];
	vm.arr2 = {
		"A": ["A 1", "A 2", "A 3", "A 4", "A 5", "A 6", "A 7", "A 8", "A 9", "A 10", "A 11", "A 12", "A 13", "A 14", "A 15"],
		"B": ["B 1", "B 2", "B 3", "B 4", "B 5", "B 6", "B 7", "B 8", "B 9", "B 10", "B 11", "B 12", "B 13", "B 14", "B 15"]
	};
	$scope.fileName = 'report_' + new Date().toISOString();
	$scope.exportData = [];
	$scope.export = function () {
		// $scope.export_format = 'csv';
		//   if ($scope.export_format == 'csv') {
		var myElement = angular.element(document.querySelectorAll(".custom-csv-link-location"));
		$scope.gridApi.exporter.csvExport("ALL", "ALL", myElement);
		// } else 
		// if ($scope.export_format == 'pdf') {
		//   $scope.gridApi.exporter.pdfExport( $scope.export_row_type, $scope.export_column_type );
		// };
	};

	vm.ssave = function () {
		$scope.ssaveFlag = true;
		var temp = _.keys($scope.gridOptions.data[0]).filter(function (d) {
			return d == "A" + Number(vm.selectedItem.label);
		});
		console.log("temp", temp);

		if (temp.length == 0) {
			var qrData = _.filter($scope.gridOptions.data, function (d) {
				return d.PART_ID == null;
			});
			if (qrData.length != _.filter(qrData, 'PART_GROUP').length) {
				toastr.error("Please Select All Panel Group");
				setTimeout(function () {
					$scope.ssaveFlag = false;
					$scope.$apply()
				}, 2000);
				return;
			}
			var resp = qrData.map(function (dd) {
				var t = {
					"new": {
						"ERFQ_PART_GROUP": {
							//"PART_ID":dd.PART_NUMBER,
							"PART_NUMBER": dd.PART_NUMBER,
							"PROJECT_CODE": vm.data.pass.ProjectCode,
							"E_BOM_REVISION": dd.EBOM_REV,
							//"PART_GROUP_NO":(dd.PART_GROUP_NO==undefined)?"A1":`A${Number(dd.PART_GROUP_NO.split("A")[1])+1}`,
							"PART_GROUP_NO": "A" + Number(vm.data.pass.E_BOM_Rev),
							"PART_VALUE": dd.PART_GROUP,
							"STATUS": dd.STATUS == undefined || dd.STATUS == "null" || dd.STATUS == null ? "Panel Grouping" : dd.STATUS
						}
					}
				};
				return t;
			});
		} else {
			var _temp = _.filter($scope.gridOptions.data, function (d) {
				return d.STATUS == 'Panel Grouping' || d.STATUS == null;
			});

			var resp = _temp.map(function (dd) {
				var temp = {
					"old": {
						"ERFQ_PART_GROUP": {
							"PART_ID": dd.PART_ID
						}
					},
					"new": {
						"ERFQ_PART_GROUP": {
							"PART_ID": dd.PART_ID,
							"PART_NUMBER": dd.PART_NUMBER,
							"PROJECT_CODE": vm.data.pass.ProjectCode,
							"E_BOM_REVISION": dd.EBOM_REV,
							//"PART_GROUP_NO":(dd.PART_GROUP_NO==undefined)?"A1":`A${Number(dd.PART_GROUP_NO.split("A")[1])+1}`,
							"PART_GROUP_NO": "A" + Number(vm.data.pass.E_BOM_Rev),
							"PART_VALUE": dd["A" + Number(vm.data.pass.E_BOM_Rev)],
							"STATUS": dd.STATUS == undefined || dd.STATUS == "null" || dd.STATUS == null ? "Panel Grouping" : dd.STATUS
						}
					}
				};
				return temp;
			});
			console.log("else=>", resp);
		}
		$.cordys.ajax({
			method: "UpdateErfqPartGroup",
			namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
			dataType: "* json",
			parameters: {
				"tuple": resp
			},
			success: function success(data) {
				$scope.respArr = $.cordys.json.findObjects(data, "TABLE");
				$scope.gridOptions.columnDefs = [];
				$scope.$apply();
				$scope.changechange({}, {}, vm.selectedItem.value);
				setTimeout(function () {
					$scope.ssaveFlag = false;
					$scope.$apply()
				}, 2000);

				toastr.success("Saved successfully!");
				//    $scope.changechange({},{},vm.selectedItem);  
			},
			error: function error(jqXHR, textStatus, errorThrown) {
				$scope.changechange({}, {}, vm.selectedItem.value);
				setTimeout(function () {
					$scope.ssaveFlag = false;
					$scope.$apply()
				}, 2000);
			}
		});
	};
	if (localStorage.projectCode != undefined) {
		if (localStorage.projectCode && JSON.parse(localStorage.projectCode).dataFlag == 'IE') {
			toastr.warning("Plz Select Other Project Code");
			$state.go('mainApp.ProjectRequirement');
		}
		if (localStorage.projectCode && JSON.parse(localStorage.projectCode).ProjectCode)
			vm.data.pass = JSON.parse(localStorage.projectCode);
		else {

			toastr.warning("Select Project Code");

			$state.go('mainApp.ProjectRequirement');
		}
		$.cordys.ajax({
			method: "GetERFQListofEbomRev",
			namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
			dataType: "* json",
			parameters: {
				ProjectCode: vm.data.pass.ProjectCode
			},
			success: function success(data) {

				//vm.arr = $.cordys.json.findObjects(data, "getERFQListofEbomRev")[0].EBOM_REV;
				vm.arr = $.cordys.json.findObjects(data, "getERFQListofEbomRev")[0].getERFQListofEbomRev;
				console.log("arr=>", vm.arr);
				vm.arr = vm.arr.split(",").map(function (d) {
					return {
						"label": d,
						value: d
					};
				});
				console.log("arr=>", vm.arr);

				vm.selectedItem = _.filter(vm.arr, function (d) {
					return Number(d.value) == _.max(_.map(vm.arr, function (d) {
						return Number(d.value);
					}));
				})[0];
				$scope.changechange({}, {}, vm.selectedItem.value);
			},
			error: function error(jqXHR, textStatus, errorThrown) {}
		});
	}

	// ui grid
	$scope.animationsEnabled = true;
	$scope.contentTypeForImage = function (ext) {
		var arr = ext.split(".");
		ext = arr[arr.length - 1];
		if (ext == 'jpg') return 'image/jpg';
		else if (ext == 'png') return 'image/png';
		else if (ext == 'jpeg') return 'image/jpeg';
		else if (ext == 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
		else if (ext == 'doc') return 'application/msword';
		else if (ext == 'txt') return 'text/plain';
		else if (ext == 'pdf') return 'application/pdf';
		else if (ext == 'xls' || ext == 'xlsx') return 'application/vnd.ms-excel';
		else if (ext == 'xsd' || ext == 'XSD') return 'application/octet-stream';
		else if (ext == 'igs' || ext == 'IGS') return 'application/octet-stream';
		else if (ext == '3DXML' || ext == '3dxml') return 'application/octet-stream';
		else if (ext == 'IGES' || ext == 'iges') return 'application/octet-stream';
		else if (ext == 'xml' || ext == 'XML') return 'text/xml';

		data: application / octet - stream;
		base64
	};

	$scope.downloadFile = function (grid, myRow) {

		$.cordys.ajax({
			method: "DownloadERFQDocs",
			namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
			parameters: {
				fileName: myRow.entity.DOCUMENT_PATH
			},
			dataType: "* json",
			async: false,
			success: function success(e) {

				if (e.tuple.old != undefined) {
					$scope.base64EncodedFileObj = e.tuple.old.downloadERFQDocs;
					$scope.base64EncodedFile = e.tuple.old.downloadERFQDocs.downloadERFQDocs;
					var mimeType = $scope.contentTypeForImage(myRow.entity.DOCUMENT_NAME);
					var dlnk = document.getElementById("dwnldLnk");
					if (mimeType != undefined) {

						dlnk.href = 'data:' + mimeType + ';base64,' + $scope.base64EncodedFile;
						dlnk.download = myRow.entity.DOCUMENT_NAME;
					} else dlnk.href = 'data:application/octet-stream;base64,' + $scope.base64EncodedFile;
					dlnk.click();
				}
			},
			error: function error(jqXHR, textStatus, errorThrown) {

				alert("Error in loading data");
			}
		});

		console.log("download file=>", myRow.entity);
	};
	$scope.uploadGrid = function (grid, myRow) {
		if (myRow.entity.STATUS != 'Submitted') return true;
		else return false;
	};
	$scope.downloadGrid = function (grid, myRow) {
		if (myRow.entity.DOCUMENT_ID) return 1;
		else return 0;
	};
	$scope.cumulative = function (grid, myRow) {

		// $compile($("#myModal"))($scope);
		$scope.selectedRow = myRow.entity;
	};
	$scope.animationsEnabled = true;

	$scope._next = function (size, parentSelector) {};

	function color(grid, row, col, rowRenderIndex, colRenderIndex) {
		if (row.entity.DELETED_DATA == "0" && row.entity.STATUS == "Submitted") return 'green';
		if (row.entity.DELETED_DATA == "0" && row.entity.STATUS == "") return 'white';
		if (row.entity.DELETED_DATA == "1") return 'red';
	}
	$scope.tableCol = {

		"PART_NUMBER": {
			value: 1,
			coldef: {
				srt: 1,
				enableCellEdit: false,
				name: 'Part Number',
				field: 'PART_NUMBER',
				enablePinning: true,
				pinnedLeft: true,
				width: 150,
				cellClass: color,
				visible: true
			}
		},
		"EBOM_REV": {
			value: 2,
			coldef: {
				srt: 2,
				enableCellEdit: false,
				name: 'Revision',
				field: 'EBOM_REV',
				enablePinning: true,
				pinnedLeft: true,
				width: 150,
				hidePinLeft: false,
				hidePinRight: false,
				cellClass: color,
				visible: true
			}
		},
		"PART_NAME": {
			value: 3,
			coldef: {
				srt: 1,
				enableCellEdit: false,
				name: 'Nomenclature',
				field: 'PART_NAME',
				enablePinning: true,
				pinnedLeft: true,
				width: 150,
				cellClass: color,
				visible: true
			}
		},
		"SOURCE": {
			value: 3,
			coldef: {
				srt: 4,
				enableCellEdit: false,
				name: 'Source',
				field: 'SOURCE',
				width: 150,

				cellClass: color,
				visible: true
			}
		},
		"CATEGORY": {
			value: 4,
			coldef: {
				srt: 4,
				enableCellEdit: false,
				name: 'Part Category',
				field: 'CATEGORY',
				width: 150,
				cellClass: color,
				visible: true
			}
		},
		"CAD_THICKNESS": {
			value: 5,
			coldef: {
				srt: 5,
				enableCellEdit: false,
				name: 'CAD Thickness',
				displayName: "CAD Thickness",
				field: "CAD_THICKNESS",
				width: 150,
				cellClass: color,
				visible: true
			}
		},
		"DIE_WEIGHT": {
			value: 5,
			coldef: {
				srt: 5,
				enableCellEdit: false,
				name: 'Die Weight',
				field: "DIE_WEIGHT",
				width: 150,
				cellClass: color,
				visible: true
			}
		},
		"CAD_DATA": {
			value: 6,
			coldef: {
				srt: 98,
				enableCellEdit: false,
				name: 'CAD Data',
				displayName: "CAD Data",
				field: 'DOCUMENT_NAME',
				cellTemplate: '<ins><a class="ml-2" ng-if="grid.appScope.downloadGrid(grid, row)"  ng-click="grid.appScope.downloadFile(grid, row)">{{row.entity.DOCUMENT_NAME}}</a></ins><i ng-if="grid.appScope.uploadGrid(grid, row)" class="ml-2 fas fa-file-upload" data-toggle="modal" data-target="#myModal" ng-click="grid.appScope.cumulative(grid, row)" ></i>',
				width: 300,
				cellClass: color,
				visible: true
			}
		},
		"NO_OF_DIES": {
			value: 8,
			coldef: {
				srt: 7,
				enableCellEdit: false,
				name: 'No. of Dies',
				field: 'NO_OF_DIES',
				width: 150,
				cellClass: color,
				visible: true
			}
		},

		"PART_GROUP": {
			value: 10,
			coldef: {
				srt: 1000,
				// cellClass:color,
				visible: true,
				name: 'Part Group',
				field: 'PART_GROUP',
				width: 200,
				//pinnedRight:true,
				editableCellTemplate: 'ui-grid/dropdownEditor',
				cellFilter: 'mapStatus',
				editDropdownOptionsFunction: function editDropdownOptionsFunction(rowEntity, colDef) {
					// if (rowEntity.PART_ID != null) return [];
					// if (rowEntity.CATEGORY == "B") 
				    return [{
						id: 'B1',
						value: 'B1'
					}, {
						id: 'B2',
						value: 'B2'
					}, {
						id: 'B3',
						value: 'B3'
					}, {
						id: 'B4',
						value: 'B4'
					}, {
						id: 'B5',
						value: 'B5'
					}, {
						id: 'B6',
						value: 'B6'
					}, {
						id: 'B7',
						value: 'B7'
					}, {
						id: 'B8',
						value: 'B8'
					}, {
						id: 'B9',
						value: 'B9'
					}, {
						id: 'B10',
						value: 'B10'
					}, {
						id: 'B11',
						value: 'B11'
					}, {
						id: 'B12',
						value: 'B12'
					}, {
						id: 'B13',
						value: 'B13'
					}, {
						id: 'B14',
						value: 'B14'
					}, {
						id: 'B15',
						value: 'B15'
					}];
					if (rowEntity.CATEGORY == "A") return [{
						id: 'A1',
						value: 'A1'
					}, {
						id: 'A2',
						value: 'A2'
					}, {
						id: 'A3',
						value: 'A3'
					}, {
						id: 'A4',
						value: 'A4'
					}, {
						id: 'A5',
						value: 'A5'
					}, {
						id: 'A6',
						value: 'A6'
					}, {
						id: 'A7',
						value: 'A7'
					}, {
						id: 'A8',
						value: 'A8'
					}, {
						id: 'A9',
						value: 'A9'
					}, {
						id: 'A10',
						value: 'A10'
					}, {
						id: 'A11',
						value: 'A11'
					}, {
						id: 'A12',
						value: 'A12'
					}, {
						id: 'A13',
						value: 'A13'
					}, {
						id: 'A14',
						value: 'A14'
					}, {
						id: 'A15',
						value: 'A15'
					}];
				}
			}
		}
	};

	$scope.temp_gridOptions = {
		// paginationPageSizes: [25, 50, 75],
		// paginationPageSize: 25,
		enableSorting: false,
		useExternalSorting: true,
		columnDefs: [],
		onRegisterApi: function onRegisterApi(gridApi) {
			$scope.gridApi = gridApi;
		}
	};

	// ui grid
	$scope.sh = function (data) {

		if (data.visible != undefined) data.visible = !data.visible;
		else data.visible = true;
		$scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
	};
	$scope.changechange = function (item, model, label) {
		vm.data.pass.E_BOM_Rev = label;
		localStorage.projectCode = JSON.stringify(vm.data.pass);
		$.cordys.ajax({
			method: "GetERFQRevisedEBOM",
			namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
			dataType: "* json",
			parameters: {
				projectCode: vm.data.pass.ProjectCode,
				EBOMRev: label
			},
			success: function success(data) {
				$scope.gridOptions = $scope.temp_gridOptions;

				$scope.gridOptions.data = _.sortBy($.cordys.json.findObjects(data, "TABLE"), "PART_NUMBER");
				$scope.gridOptions.data = _.concat([], _.filter($scope.gridOptions.data, function (d) {
					return d.STATUS == "Submitted" && d.DELETED_DATA == "0";
				}), _.filter($scope.gridOptions.data, function (d) {
					return d.STATUS == "Submitted" && d.DELETED_DATA == "1";
				}), _.filter($scope.gridOptions.data, function (d) {
					return d.STATUS == "Panel Grouping" || d.STATUS == null;
				}));
				$scope.gridOptions.columnDefs = [];
				// $scope.$apply();
				for (var d in $scope.tableCol) {
					$scope.gridOptions.columnDefs.push($scope.tableCol[d].coldef);
				}
				var keys = _.filter(_.keys($scope.gridOptions.data[0]), function (d) {
					return d.match(/^A/i);
				});

				for (var i = 0; i < keys.length; i++) {
					if (keys[i] != "A" + Number(label)) $scope.gridOptions.columnDefs.splice($scope.gridOptions.columnDefs.length - 1, 0, {
						srt: 99 + Number(keys[i].split("A")[1]),
						name: "Part Group Baseline" + Number(keys[i].split("A")[1]),
						field: keys[i],
						width: 150,
						visible: true,
						enableCellEdit: false,
						flagName: keys[i],
						cellClass: color
					});
					if (keys[i] == "A" + Number(label)) {
						$scope.gridOptions.columnDefs.splice($scope.gridOptions.columnDefs.length - 1, 0, {
							srt: 99 + Number(keys[i].split("A")[1]),
							//   cellClass:color,
							name: "Part Group Baseline" + Number(keys[i].split("A")[1]),
							visible: true,
							field: keys[i],
							width: 200,
							cellClass: color,
							editableCellTemplate: 'ui-grid/dropdownEditor',
							cellFilter: 'mapStatus',
							editDropdownOptionsFunction: function editDropdownOptionsFunction(rowEntity, colDef) {
								if (rowEntity.STATUS != "Submitted" && rowEntity.CATEGORY == "B") return [{
									id: 'B1',
									value: 'B1'
								}, {
									id: 'B2',
									value: 'B2'
								}, {
									id: 'B3',
									value: 'B3'
								}, {
									id: 'B4',
									value: 'B4'
								}, {
									id: 'B5',
									value: 'B5'
								}, {
									id: 'B6',
									value: 'B6'
								}, {
									id: 'B7',
									value: 'B7'
								}, {
									id: 'B8',
									value: 'B8'
								}, {
									id: 'B9',
									value: 'B9'
								}, {
									id: 'B10',
									value: 'B10'
								}, {
									id: 'B11',
									value: 'B11'
								}, {
									id: 'B12',
									value: 'B12'
								}, {
									id: 'B13',
									value: 'B13'
								}, {
									id: 'B14',
									value: 'B14'
								}, {
									id: 'B15',
									value: 'B15'
								}];
								if (rowEntity.STATUS != "Submitted" && rowEntity.CATEGORY == "A") return [{
									id: 'A1',
									value: 'A1'
								}, {
									id: 'A2',
									value: 'A2'
								}, {
									id: 'A3',
									value: 'A3'
								}, {
									id: 'A4',
									value: 'A4'
								}, {
									id: 'A5',
									value: 'A5'
								}, {
									id: 'A6',
									value: 'A6'
								}, {
									id: 'A7',
									value: 'A7'
								}, {
									id: 'A8',
									value: 'A8'
								}, {
									id: 'A9',
									value: 'A9'
								}, {
									id: 'A10',
									value: 'A10'
								}, {
									id: 'A11',
									value: 'A11'
								}, {
									id: 'A12',
									value: 'A12'
								}, {
									id: 'A13',
									value: 'A13'
								}, {
									id: 'A14',
									value: 'A14'
								}, {
									id: 'A15',
									value: 'A15'
								}];
							}
						});
					}
				}
				$scope.gridOptions.columnDefs = _.sortBy($scope.gridOptions.columnDefs, 'srt');
				var _flagName = $scope.gridOptions.columnDefs.filter(function (d) {
					return d.field == "A" + Number(label);
				});

				if (_flagName.length > 0) {
					$scope.gridOptions.columnDefs.pop();
				}
				var temp_data = _.filter($scope.gridOptions.data, function (d) {
					return d.STATUS == "Panel Grouping" || d.STATUS == null;
				});
				if (temp_data.length > 0) {
					$scope.gridOptions.columnDefs[$scope.gridOptions.columnDefs.length - 1].name = "Panel Group";
					delete $scope.gridOptions.columnDefs[$scope.gridOptions.columnDefs.length - 1].cellClass;
				}

				console.log("$scope.gridOptions=>", $scope.gridOptions);
				$scope.$apply();
			},
			error: function error(jqXHR, textStatus, errorThrown) {}
		});
	};

	$scope.download = function () {

		$scope.fileName = 'report_' + new Date().toISOString();
		$scope.exportData = [];
		// Headers:
		// $scope.exportData.push(_.keys($scope.gridOptions.data[0]));
		$scope.exportData.push(_.map($scope.gridOptions.columnDefs, 'field'));

		// Data:

		angular.forEach($scope.gridOptions.data, function (value, key) {
			var temp = [];
			for (var i = 0; i < $scope.exportData[0].length; i++) {
				temp.push(value[$scope.exportData[0][i]]);
			}
			$scope.exportData.push(temp);
		});

		function datenum(v, date1904) {
			if (date1904) v += 1462;
			var epoch = Date.parse(v);
			return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
		};

		function getSheet(data, opts) {
			var ws = {};
			var range = {
				s: {
					c: 10000000,
					r: 10000000
				},
				e: {
					c: 0,
					r: 0
				}
			};
			for (var R = 0; R != data.length; ++R) {
				for (var C = 0; C != data[R].length; ++C) {
					if (range.s.r > R) range.s.r = R;
					if (range.s.c > C) range.s.c = C;
					if (range.e.r < R) range.e.r = R;
					if (range.e.c < C) range.e.c = C;
					var cell = {
						v: data[R][C]
					};
					if (cell.v == null) continue;
					var cell_ref = XLSX.utils.encode_cell({
						c: C,
						r: R
					});

					if (typeof cell.v === 'number') cell.t = 'n';
					else if (typeof cell.v === 'boolean') cell.t = 'b';
					else if (cell.v instanceof Date) {
						cell.t = 'n';
						cell.z = XLSX.SSF._table[14];
						cell.v = datenum(cell.v);
					} else cell.t = 's';

					ws[cell_ref] = cell;
				}
			}
			if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
			return ws;
		};

		function Workbook() {
			if (!(this instanceof Workbook)) return new Workbook();
			this.SheetNames = [];
			this.Sheets = {};
		}
		$scope.exportData[0] = _.map($scope.gridOptions.columnDefs, 'name');
		var wb = new Workbook(),
			ws = getSheet($scope.exportData);
		/* add worksheet to workbook */
		wb.SheetNames.push($scope.fileName);
		wb.Sheets[$scope.fileName] = ws;
		var wbout = XLSX.write(wb, {
			bookType: 'xlsx',
			bookSST: true,
			type: 'binary'
		});

		function s2ab(s) {
			var buf = new ArrayBuffer(s.length);
			var view = new Uint8Array(buf);
			for (var i = 0; i != s.length; ++i) {
				view[i] = s.charCodeAt(i) & 0xFF;
			}
			return buf;
		}

		saveAs(new Blob([s2ab(wbout)], {
			type: "application/octet-stream"
		}), $scope.fileName + '.xlsx');
	};
	/////////////////file upload//////////////
	$scope.uploadFiles = function (files, errFiles) {
		if (files.length > 0) {
			var farr = files[0].name.split(".");
			var ext = farr[farr.length - 1];


			if (ext == '3DXML' || ext == 'IGES' || ext == 'XML' || ext == 'XSD' || ext == 'IGS' || ext == '3dxml' || ext == 'iges' || ext == 'xml' || ext == 'xsd' || ext == 'igs') {
				$scope.files = files;
				$scope.errFiles = errFiles;
				angular.forEach(files, function (file) {
					var reader = new FileReader();
					reader.onloadend = function () {
						file.base64 = reader.result;
					};
					reader.readAsDataURL(file);
				});
			} else {
				files = [];
				toastr.error("CAD Data Type: only IGS and 3D xml applicable");
				return;
			}
		}


	};
	$scope.browseAndAddRow = function () {
		if ($scope.selectedRow.DOCUMENT_ID == null) {
			$.cordys.ajax({
				method: "UploadERFQDoc",
				namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
				dataType: '* json',
				parameters: {
					FileName: $scope.files[0].name,
					FileContent: $scope.files[0].base64.split(",")[1]
				},
				success: function success(e) {
					$scope.ServerFilePath = $.cordys.json.findObjects(e, "uploadERFQDoc")[0].uploadERFQDoc;
					$.cordys.ajax({
						method: "UpdateErfqUploadedDocument",
						namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
						dataType: '* json',
						parameters: {
							tuple: {
								"new": {
									"ERFQ_UPLOADED_DOCUMENT": {
										"PROJECT_CODE": vm.data.pass.ProjectCode,
										"DOCUMENT_NAME": $scope.files[0].name,
										"DOCUMENT_PATH": $scope.ServerFilePath,
										"DOCUMENT_TYPE": "CAD_DATA", //as per the screen
										//   "UPLOADED_BY": "db", //we will get from login
										//   "UPLOADED_ON": new Date().toISOString(),
										//   "UPDATED_BY": "", //we will get from login
										//   "UPDATED_ON": new Date().toISOString(),
										"REVISION": vm.selectedItem,
										"DOCUMENT_DESC": "",
										"PART_NUMBER": $scope.selectedRow.PART_NUMBER
									}
								}
							}
						},
						success: function success(e) {
							//console.log(e);
							$.cordys.json.findObjects(e, "ERFQ_UPLOADED_DOCUMENT")[0].DOCUMENT_ID;
							$scope.DOCUMENT_NAME1 = null;
							$scope.DOCUMENT_DESC1 = null;
							$scope.files = "";
							$scope.DOCUMENT_DESC1 = "";
							$scope.changechange({}, {}, vm.selectedItem.value);
						},
						error: function error(jqXHR, textStatus, errorThrown) {
							//debugger;
							alert("Error in uploading file");
						}
					});
				},
				error: function error(jqXHR, textStatus, errorThrown) {
					alert("Error in uploading file");
				}
			});
		} else {
			$.cordys.ajax({
				method: "UploadERFQDoc",
				namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
				dataType: '* json',
				parameters: {
					FileName: $scope.files[0].name,
					FileContent: $scope.files[0].base64.split(",")[1]
				},
				success: function success(e) {
					$scope.ServerFilePath = $.cordys.json.findObjects(e, "uploadERFQDoc")[0].uploadERFQDoc;
					$.cordys.ajax({
						method: "UpdateErfqUploadedDocument",
						namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
						dataType: "* json",
						parameters: {
							"tuple": {
								"old": {
									"ERFQ_UPLOADED_DOCUMENT": {
										"DOCUMENT_ID": $scope.selectedRow.DOCUMENT_ID
									}
								},
								"new": {
									"ERFQ_UPLOADED_DOCUMENT": {
										//check once
										"DOCUMENT_ID": $scope.selectedRow.DOCUMENT_ID,
										"PROJECT_CODE": vm.data.pass.ProjectCode,
										"DOCUMENT_NAME": $scope.files[0].name,
										"DOCUMENT_PATH": $scope.ServerFilePath,
										"DOCUMENT_TYPE": "CAD_DATA", //as per the screen
										//"UPLOADED_BY":"Priyanka",//we will get from login
										//"UPLOADED_ON":$scope.TodayDate,
										//UPDATED_BY":"",//we will get from login
										//"UPDATED_ON":$scope.TodayDate,
										"REVISION": vm.selectedItem,
										// "DOCUMENT_DESC": $scope.DOCUMENT_DESC1
										"DOCUMENT_DESC": ""

									}
								}
							}

						},
						success: function success(data) {
							//debugger;
							//console.log(data);
							//alert("Uploaded successfully");
							toastr.success("Uploaded successfully!");

							$scope.DOCUMENT_NAME1 = null;
							$scope.DOCUMENT_DESC1 = null;
							$scope.files = "";
							$scope.DOCUMENT_DESC1 = "";
							$scope.changechange({}, {}, vm.selectedItem.value);

							//$scope.eventList= $.cordys.json.findObjects(data, "ERFQ_EVENT_MASTER");
							//$scope.$apply();  
						},
						error: function error(jqXHR, textStatus, errorThrown) {
							//debugger;
							alert("Error in loading data");
						}
					});
				},
				error: function error(jqXHR, textStatus, errorThrown) {
					alert("Error in uploading file");
				}
			});
		}
	};
}).filter('mapStatus', function () {

	return function (input) {
		return input;
	};
});
