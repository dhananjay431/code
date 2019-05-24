'use strict';


angular.module('App.mainApp').controller('panelGroupingCtrl', function ($scope, Upload, $timeout, $window, $uibModal, $log, $document, $state, uiGridConstants, $compile) {
    var vm = this;
    vm.data = {};
    $scope.ssaveFlag = false;
    vm.respArr = [];
    $scope.fileName = 'report_' + new Date().toISOString();
    $scope.exportData = [];
    $scope.export = function () {
        var myElement = angular.element(document.querySelectorAll(".custom-csv-link-location"));
        $scope.gridApi.exporter.csvExport("ALL", "ALL", myElement);
    };
if(localStorage.role !='MSIE')
{
 $state.go('main');
}

     vm.ssave = function () {
    var dd=[];
    for(var d in $scope.gridOptions.data){
        var z = Object.keys($scope.gridOptions.data[d]).filter(function(d){ return d.match(/GROUP/i) }).map(function(x){
            $scope.gridOptions.data[d][x].grp = x;
            $scope.gridOptions.data[d][x].PART_NUMBER= $scope.gridOptions.data[d].PART_NUMBER;
            return $scope.gridOptions.data[d][x];
        });
        dd = dd.concat(z);
    }
        var req = dd.map(function(d){
            if(d.PART_ID){
                return {
                    "old": {
                        "ERFQ_PART_GROUP": {
                            "PART_ID": d.PART_ID
                        }
                    },
                        "new": {
                        "ERFQ_PART_GROUP": {
                            "PART_ID": d.PART_ID,
                            "PROJECT_CODE": vm.data.pass.ProjectCode,
                            "PART_GROUP_NO":d.grp == 'PartGroup'?"GROUP"+(Number($scope.keys.length) +1 ):d.grp,

                            "PART_VALUE": d.VALUE
                        }
                    }

                };
            }else{
                return {
                    "new": {
                        "ERFQ_PART_GROUP": {
                            "PART_NUMBER": d.PART_NUMBER,
                            "PROJECT_CODE": vm.data.pass.ProjectCode,
                            "E_BOM_REVISION": vm.selectedItem.value,
                            "PART_GROUP_NO": "GROUP" + (Number($scope.keys.length)+1),
                            "PART_VALUE":  d.VALUE,
                            "STATUS":"Panel Grouping"
                        }
                    }

                };
            }
        });
          console.log("req=>",JSON.stringify(req));
                 $.cordys.ajax({
            method: "UpdateErfqPartGroup",
            namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
            dataType: "* json",
            parameters: {
                "tuple": req
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
        $scope.selectedRow = myRow.entity;
    };
    $scope.animationsEnabled = true;

    $scope._next = function (size, parentSelector) {};

    function color(grid, row, col, rowRenderIndex, colRenderIndex) {
        if (row.entity.DELETED_DATA == "0" && row.entity.STATUS == "Submitted") return 'green';
        if (row.entity.DELETED_DATA == "0" && row.entity.STATUS == "") return 'white';
        if (row.entity.DELETED_DATA == "1") return 'red';
    }    
    function colordrop(grid, row, col, rowRenderIndex, colRenderIndex) {

      var str = col.colDef.name;
      str = str.replace(/\s/g,'');
        window.setTimeout(function(){if ( row.entity.STATUS == "Submitted") {$("."+str).attr("disabled",true);}},500);
        if (row.entity.DELETED_DATA == "0" && row.entity.STATUS == "Submitted") return 'greend';
        if (row.entity.DELETED_DATA == "0" && row.entity.STATUS == "") return 'whited';
        if (row.entity.DELETED_DATA == "1") return 'redd';
    }
function redimp(grid, row, col, rowRenderIndex, colRenderIndex) {
         if (row.entity.DELETED_DATA == "1") return 'redd';
    }


    $scope.tableCol = {

        "PART_NUMBER": {
            value: 1,
            coldef: {
                srt: 1,
								enableCellEdit: false,
								enableColumnMenu:false,
                name: 'Part Number',
                field: 'PART_NUMBER',
                enablePinning: true,
                pinnedLeft: true,
                 width: '*',minWidth: 200, maxWidth: 2000,
                cellClass: color,
                visible: true
            }
        },
        "EBOM_REV": {
            value: 2,
            coldef: {
                srt: 2,
								enableCellEdit: false,
								enableColumnMenu:false,
                name: 'Revision',
                field: 'PART_REV',
                enablePinning: true,
                pinnedLeft: true,
                 width: '*',minWidth: 200, maxWidth: 2000,
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
								enableColumnMenu:false,
                name: 'Nomenclature',
                field: 'PART_NAME',
                enablePinning: true,
                pinnedLeft: true,
                 width: '*',minWidth: 200, maxWidth: 2000,
                cellClass: color,
                visible: true
            }
        },
        "SOURCE": {
            value: 3,
            coldef: {
                srt: 4,
								enableCellEdit: false,
								enableColumnMenu:false,
                name: 'Source',
                field: 'SOURCE',
                 width: '*',minWidth: 200, maxWidth: 2000,

                cellClass: color,
                visible: true
            }
        },
        "CATEGORY": {
            value: 4,
            coldef: {
                srt: 4,
								enableCellEdit: false,
								enableColumnMenu:false,
                name: 'Part Category',
                field: 'CATEGORY',
                 width: '*',minWidth: 200, maxWidth: 2000,
                cellClass: color,
                visible: true
            }
        },
        "CAD_THICKNESS": {
            value: 5,
            coldef: {
                srt: 5,
								enableCellEdit: false,
								enableColumnMenu:false,
                name: 'CAD Thickness',
                displayName: "CAD Thickness",
                field: "CAD_THICKNESS",
                 width: '*',minWidth: 200, maxWidth: 2000,
                cellClass: color,
                visible: true
            }
        },
        "DIE_WEIGHT": {
            value: 5,
            coldef: {
                srt: 5,
								enableCellEdit: false,
								enableColumnMenu:false,
                name: 'Die Weight',
                field: "DIE_WEIGHT",
                 width: '*',minWidth: 200, maxWidth: 2000,
                cellClass: color,
                visible: true
            }
        },
        "CAD_DATA": {
            value: 6,
            coldef: {
                srt: 98,
								enableCellEdit: false,
								enableColumnMenu:false,
                name: 'CAD Data',
                displayName: "CAD Data",
                field: 'DOCUMENT_NAME',
                cellTemplate: '<ins><a class="ml-2" ng-if="grid.appScope.downloadGrid(grid, row)"  ng-click="grid.appScope.downloadFile(grid, row)">{{row.entity.DOCUMENT_NAME}}</a></ins><i ng-if="grid.appScope.uploadGrid(grid, row)" class="ml-2 fas fa-file-upload" data-toggle="modal" data-target="#myModal" ng-click="grid.appScope.cumulative(grid, row)" ></i>',
                 width: '*',minWidth: 200, maxWidth: 2000,
                cellClass: color,
                visible: true
            }
        },
        "NO_OF_DIES": {
            value: 8,
            coldef: {
								srt: 7,
								enableColumnMenu:false,
                enableCellEdit: false,
                name: 'No. of Dies',
                field: 'NO_OF_DIES',
                 width: '*',minWidth: 200, maxWidth: 2000,
                cellClass: color,
                visible: true
            }
        },

        "PART_GROUP": {
            value: 10,
            coldef: {
								srt: 1000,
								enableColumnMenu:false,
                cellClass: redimp,
                visible: true,
                name: 'Part Group',
                field: 'PART_GROUP',
                 width: '*',minWidth: 200, maxWidth: 2000,
                //cellTemplate:'<div><div ng-if="row.entity.CATEGORY==\'A\'"><select ng-disabled="row.entity.DELETED_DATA == \'1\'" class="redd" style="width:1'*'%;height:100%;border:none;" ng-model="row.entity.PartGroup.VALUE"> <option>A1</option> <option>A2</option> <option>A3</option> <option>A4</option> <option>A5</option> <option>A6</option> <option>A7</option> <option>A8</option> <option>A9</option> <option>A10</option> <option>A11</option> <option>A12</option> <option>A13</option> <option>A14</option> <option>A15</option> </select> </div> <div ng-if="row.entity.CATEGORY==\'B\'"><select ng-disabled="row.entity.DELETED_DATA == \'1\'" class="redd" style="width:1'*'%;height:100%;border:none;" ng-model="row.entity.PartGroup.VALUE"> <option>B1</option> <option>B2</option> <option>B3</option> <option>B4</option> <option>B5</option> <option>B6</option> <option>B7</option> <option>B8</option> <option>B9</option> <option>B10</option> <option>B11</option> <option>B12</option> <option>B13</option> <option>B14</option> <option>B15</option> </select></div></div>'
                cellTemplate: `<div><div ng-if="row.entity.CATEGORY=='A'"><select ng-disabled="row.entity.DELETED_DATA == 1" class="redd" style="width:100%;height:100%;border:none;" ng-model="row.entity.PartGroup.VALUE"> <option>A1</option> <option>A2</option> <option>A3</option> <option>A4</option> <option>A5</option> <option>A6</option> <option>A7</option> <option>A8</option> <option>A9</option> <option>A10</option> <option>A11</option> <option>A12</option> <option>A13</option> <option>A14</option> <option>A15</option> </select> </div> <div ng-if="row.entity.CATEGORY=='B'"><select ng-disabled="row.entity.DELETED_DATA == 1" class="redd" style="width:100%;height:100%;border:none;" ng-model="row.entity.PartGroup.VALUE"> <option>B1</option> <option>B2</option> <option>B3</option> <option>B4</option> <option>B5</option> <option>B6</option> <option>B7</option> <option>B8</option> <option>B9</option> <option>B10</option> <option>B11</option> <option>B12</option> <option>B13</option> <option>B14</option> <option>B15</option> </select></div></div>`
            }
        }
    };

    $scope.temp_gridOptions = {
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
				$scope.BL = $.cordys.json.findObjects(data, "ROOT")[0].GROUPING;

                $scope.gridOptions.data = _.sortBy($.cordys.json.findObjects(data, "PANELDATA"), "PART_NUMBER");
                console.log("$scope.gridOptions.data=>", angular.copy($scope.gridOptions.data));
                $scope.gridOptions.columnDefs = [];

                for (var d in $scope.tableCol) {
                    $scope.gridOptions.columnDefs.push($scope.tableCol[d].coldef);
                }

                var tkey = $scope.gridOptions.data.map(function(d){ return _.keys(d).filter(function(d1){ return d1.match(/^GROUP[0-9]/)})});
                 $scope.keys = _.uniq(_.flatten(tkey,Infinity));
                $scope.keys = _.sortBy($scope.keys);
                var projectCode = JSON.parse(localStorage.projectCode);
				
				if ($scope.BL != "") {
					projectCode.group = $scope.BL;
				}
                else {
					projectCode.group = $scope.keys[$scope.keys.length -1];
				}
				
                localStorage.projectCode = JSON.stringify(projectCode);
                
                for(var i=0;i<$scope.keys.length;i++){
                    $scope.gridOptions.columnDefs.push({
                            name: "Part Group Baseline " + (i+1) ,
                            field: 'keys[i].VALUE',
														 width: '*',minWidth: 200, maxWidth: 2000,
														enableColumnMenu:false,
                            visible: true,
                             srt: 990,
                            enableCellEdit: false,
                            flagName: $scope.keys[i],
                            cellClass: colordrop,
                            //ng-init="grid.appScope.sh123(grid,row,\'.PartGroupBaseline'+(i+1)+'\')"
                            cellTemplate:'<div><div ng-if="row.entity.CATEGORY==\'A\'"><select  class="PartGroupBaseline'+(i+1)+'"  style="width:100%;height:100%;border:none;" ng-model="row.entity.GROUP'+(i+1)+'.VALUE"> <option>A1</option> <option>A2</option> <option>A3</option> <option>A4</option> <option>A5</option> <option>A6</option> <option>A7</option> <option>A8</option> <option>A9</option> <option>A10</option> <option>A11</option> <option>A12</option> <option>A13</option> <option>A14</option> <option>A15</option> </select> </div> <div ng-if="row.entity.CATEGORY==\'B\'"><select class="PartGroupBaseline'+(i+1)+'"  style="width:100%;height:100%;border:none;"ng-model="row.entity.GROUP'+(i+1)+'.VALUE"> <option>B1</option> <option>B2</option> <option>B3</option> <option>B4</option> <option>B5</option> <option>B6</option> <option>B7</option> <option>B8</option> <option>B9</option> <option>B10</option> <option>B11</option> <option>B12</option> <option>B13</option> <option>B14</option> <option>B15</option> </select></div></div>'
                    });
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
                    //delete $scope.gridOptions.columnDefs[$scope.gridOptions.columnDefs.length - 1].cellClass;
                    $scope.gridOptions.columnDefs[$scope.gridOptions.columnDefs.length - 1].cellClass;
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
        if ($scope.selectedRow.DOCUMENT_ID == "") {
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
                                        "REVISION": vm.selectedItem,
                                        "DOCUMENT_DESC": ""

                                    }
                                }
                            }

                        },
                        success: function success(data) {
                            toastr.success("Uploaded successfully!");

                            $scope.DOCUMENT_NAME1 = null;
                            $scope.DOCUMENT_DESC1 = null;
                            $scope.files = "";
                            $scope.DOCUMENT_DESC1 = "";
                            $scope.changechange({}, {}, vm.selectedItem.value);
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
