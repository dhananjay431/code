angular.module('App.quoteComparisionCtrl')
    .controller('prefTmkCompCtrl', function($scope, Upload, $window, $log, $state, NgTableParams, cmm, $sce) {
        $scope.data = {};
        $scope.data.dynamicCnt = 1;
        $scope.cmm = cmm;
        $scope.cmm.label = 'A';

        $scope._init2 = function() {
            $.cordys.ajax({
                method: "GetAllToolmakerDetails",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
                parameters: {},
                success: function success(data) {

                    $scope.data.erfq_toolmaker_master = $.cordys.json.findObjects(data, "ERFQ_TOOLMAKER_MASTER");
                },
                error: function error(jqXHR, textStatus, errorThrown) {}
            });

        }
        $scope.changePrj = function(projectCode, panelGroup, bNum) {

            $.cordys.ajax({
                method: "GetToolMakersforCompair",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
                parameters: {
                    "projectCode": projectCode,
                    "panelGroup": panelGroup
                },
                success: function(data) {

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
                        success: function(data) {
                            $scope._init();
                            var temp = $.cordys.json.findObjects(data, "COMPARISON");
                            $scope.gridOptions.data = _.map(temp, function(d) {
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
                            var yy = $scope.dropdownArr.map(function(d) {
                                    return '<option value="' + d.TOOLMAKER_ID + '"">' + d.TOOLMAKER_NAME + '</option>'
                            });
                            $scope.dropdown = '<select style="width:100%;height:100%;border:none;" ng-model="row.entity.ToolmakerPref[\'{XXX}\']">' + yy + '</select>';

                            var yy = $scope.dropdownArr.map(function(d) {
                                return '<option value="' + d.TOOLMAKER_ID + '"">' + d.TOOLMAKER_NAME + '</option>'
                            });

                            var _ToolmakerPref = _.keys($scope.gridOptions.data[0].ToolmakerPref);
                            for (var i = 0; i < _ToolmakerPref.length; i++) {
                                $scope.add('<select style="width:100%;height:100%;border:none;" ng-model="row.entity.ToolmakerPref[\'' + _ToolmakerPref[i] + '\']">' + yy + '</select>');
                            }


                            $scope.colAdd($scope.gridOptions.data);
                            console.log("data=>", $scope.gridOptions.data)
                            $scope.$apply();

                        },
                        error: function(jqXHR, textStatus, errorThrown) {

                        }
                    });
                    //end table data

                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(
                        "jqXHR=>", jqXHR,
                        "textStatus=>", textStatus,
                        "errorThrown=>", errorThrown
                    );
                }
            });


        }
        $scope._init2();


        $scope.xl = function() {
            console.log($scope.gridOptions);
            var arrXl = [];
            arrXl.push(_.map($scope.gridOptions.columnDefs, 'displayName'));


        }
        $scope.xlSave = function() {
            console.log($scope.gridOptions);


            (function(_data) {
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

                    },
                    error: function error(jqXHR, textStatus, errorThrown) {
                        console.log(
                            "jqXHR=>", jqXHR,
                            "textStatus=>", textStatus,
                            "errorThrown=>", errorThrown
                        );
                    }
                });
            })(
                _.map($scope.gridOptions.data, function(d) {
                    if (d.COMPARISON_SEQ) {
                        return {
                            "old": {
                                'ERFQ_QUOTE_COMPARISON': {
                                    'COMPARISON_SEQ': d.COMPARISON_SEQ
                                }
                            },
                            "new": {
                                'ERFQ_QUOTE_COMPARISON': {
                                    'COMPARISON_SEQ': d.COMPARISON_SEQ,
                                    'NO_OF_DIES_BLANKINGDIE': d.NO_OF_DIES_BLANKINGDIE
                                }
                            }
                        };
                    } else {
                        return {
                            "new": {
                                'ERFQ_QUOTE_COMPARISON': {
                                    'NO_OF_DIES_BLANKINGDIE': d.NO_OF_DIES_BLANKINGDIE
                                }
                            }
                        };
                    }
                })
            )
        }
        $scope.$watchCollection('cmm', function(newValue, oldValue) {
            $scope.data.dynamicCnt = 1;
            if ((newValue.projectCode != oldValue.projectCode) || (newValue.label != oldValue.label))
                $scope.changePrj(newValue.projectCode, newValue.label, cmm.baslineNum);
        }, true);

        function cellClass(grid, row, col, rowRenderIndex, colRenderIndex) {
            if (row.entity.NO_OF_DIES_BLANKINGDIE == "Included") {
                var key = _.keys(row.entity).filter(function(d) {
                    return d.match(/TOOLMAKER[0-9]/i)
                });
                for (var i = 0; i < key.length; i++) {
                    if (Number(row.entity[key[i]].IN_NODIES) < Number(row.entity.IN_DIES_BUDGETED)) {
                        return 'dicostRed';
                    }
                }
            }
            if (row.entity.NO_OF_DIES_BLANKINGDIE == "Excluded") {
                var key = _.keys(row.entity).filter(function(d) {
                    return d.match(/TOOLMAKER[0-9]/i)
                });
                for (var i = 0; i < key.length; i++) {
                    if (Number(row.entity[key[i]].EX_NODIES) < Number(row.entity.IN_DIES_BUDGETED)) {
                        return 'dicostRed';
                    }
                }
            }
        }
        $scope._init = function() {
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
        $scope.addredCol = function(row) {
            console.log("addredCol=>", row);
        }
        $scope.dropDiff = function(grid, row) {
            return row.entity.dropdown;
            // return row.entity.TOOLMAKER.map(function (d) {
            //     return "<option value='"+d.ID+"'>" + d.NAME + "</option>";
            // });
        }
        $scope.add = function(select) {

            if (select == undefined){
                var tt = ("P" + $scope.data.dynamicCnt);
               select =  $scope.dropdown.replace('{XXX}', tt);
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
        $scope.openFilterBox = function() {

            document.getElementById("filterBtn").style.backgroundColor = "#24c0c0";
            document.getElementById("ruPBtn").style.backgroundColor = "#dfdede";
            document.getElementById("preFBtn").style.backgroundColor = "#dfdede";
        }
        if (($scope.cmm.projectCode == undefined))
            toastr.warning("Select ProjectCode");
        else
            $scope.changePrj($scope.cmm.projectCode, $scope.cmm.label, cmm.baslineNum);
        $scope.setLab = function(d) {
            $scope.cmm.label = d;
        }
        $scope.downloadFileOut = function(grid, row, num, col) {
            return row.entity[num][col].VALUE;
        }
        $scope.colAdd = function(data) {
            var ll = _.keys(data[0]).filter(function(d) {
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
    .filter('mapGender', function() {
        var genderHash = {
            'Included': 'Included',
            'Excluded': 'Excluded'
        };
        return function(input) {
            if (!input) {
                return '';
            } else {
                return genderHash[input];
            }
        };
    })
