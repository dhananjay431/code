angular.module('App.quoteComparisionCtrl')
    .controller('prefTmkCompCtrl', function($scope, Upload, $window, $log, $state, cmm) { 
        $scope.gridOptions = {
            columnDefs:[
                {
                    headerName: "PART_NUMBER",
                    field: "PART_NUMBER"
                }
            ]
            
        };
        $scope.data ={};
        $scope.cmm = cmm;
        $scope.cmm.label = 'A';
        console.log(cmm);
        $scope.changePrj = function(projectCode, panelGroup, bNum) {
            $.cordys.ajax({
                method: "GetERFQComparisonData",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
                parameters: {
                    "comparisonType": "Preference",
                    "panelGroup": panelGroup,
                    "projectCode": projectCode,
                    "baselineNum": Number(cmm.baslineNum),
                    "budgeted": "",
                    "partNum": "",
                    "decimalPlace": "5",
                    "preferences": "",
                    "ComparePref": "LandedCost",
                    "toolmakersRequired": '',
                    "panelGrouping": ''
                },
                success: function(data) {
                    
                    var temp = $.cordys.json.findObjects(data, "COMPARISON");

                    if (temp.length > 0) {
                        $scope.gridOptions.data = _.map(temp, function(d) {
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
                        
                        $scope.gridOptions.api.setRowData(temp);
                        console.log($scope.gridOptions.data);
             
                        $scope.$apply();
                    } else {
                        console.log("no data on base line ");
                        // 
                    //    $scope.tableDataGet();
                        // 
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {

                }
            });

        }

        $scope.$watchCollection('cmm', function(newValue, oldValue) {
            $scope.data.dynamicCnt = 1;
            if(newValue != undefined && !_.isEqual(oldValue, newValue))
                $scope.changePrj(newValue.projectCode, newValue.label, cmm.baslineNum);
        }, true);
   

        if ((cmm.projectCode == undefined))
        toastr.warning("Select ProjectCode");
            else
        $scope.changePrj(cmm.projectCode, cmm.label, cmm.baslineNum);
    });