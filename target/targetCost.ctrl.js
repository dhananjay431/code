angular.module('App.quoteComparisionCtrl')
    .controller('targetCostCtrl', function ($scope, Upload, $window, $log, $state, NgTableParams, cmm) {
    $scope.cmm = cmm;
    $scope.cmm.label = 'A';
    $scope.gridOptions = {
        columnDefs: [
            {
                headerName: "PART_NUMBER",
                field: "PART_NUMBER"
            }
        ],
        components: {
            moodEditor: DropDownTemplate
        },
        rowData: null
    };
    function xmltojson(data, key) {
        return $.cordys.json.findObjects(data, key);
    }
    function post(method, qr, success, cb) {
        $.cordys.ajax({
            method: method,
            namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
            dataType: "* json",
            parameters: qr,
            success: success, cb: cb
        });
    }
    function initPro(temp) {
        return _.map(temp, function (d) {
            var ll = _.keys(d.LANDEDCOST);
            for (var i = 1; i <= ll.length; i++) {
                d['L' + i] = {
                    LANDEDCOST: d.LANDEDCOST['L' + i],
                    NOOFDIES: d.NOOFDIES['L' + i],
                    DIEWEIGHT: d.DIEWEIGHT['L' + i],
                    BASICCOST: d.BASICCOST['L' + i],
                    COSTPERTON: d.BASICCOST['L' + i]
                };
            }
            ;
            return d;
        });
    }
    function gridopInit() {
        return [
            {
                headerName: "PART_NUMBER",
                field: "PART_NUMBER"
            }
        ];
    }
    function changePrjQr(projectCode, panelGroup, bNum, _cmm) {
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
    function changePrjSuccess(data) {
        var temp = xmltojson(data, "COMPARISON");
        temp = initPro(temp);
        console.log("grid-data=>", temp);
        $scope.$apply();
        $scope.gridOptions.api.setColumnDefs($scope.gridOptions.columnDefs);
        $scope.gridOptions.api.setRowData(temp);
    }
    function addTm(temp) {
        var TOOLMAKER = [];
        Object.keys(temp[0].ToolmakerPref).forEach(function (d) {
            var z = {
                headerName: d,
                field: "ToolmakerPref." + d,
                editable: true,
                cellEditorSelector: function (params) {
                    debugger;
                    return {
                        component: 'moodEditor',
                        params: { values: _.map(params.data.TOOLMAKER, 'ID') }
                    };
                }
            };
            TOOLMAKER.push(z);
        });
        return {
            headerName: 'Toolmaker Preference',
            children: TOOLMAKER
        };
    }
    function addL(temp) {
        var tmp = [];
        _.filter(_.keys(temp[0]), function (d) {
            return d.match(/L[0-9]/);
        }).forEach(function (d) {
            var arr = [];
            arr.push({
                headerName: "Base Cost",
                field: d + ".BASICCOST.VALUE",
                icons: {
                    menu: '<i class="fas fa-file-download"/>',
                    filter: '<i class="fas fa-file-download"/>',
                    columns: '<i class="fas fa-file-download"/>',
                    sortAscending: '<i class="fas fa-file-download"/>',
                    sortDescending: '<i class="fas fa-file-download"/>'
                }
            });
            arr.push({ headerName: "Landed Cost", field: d + ".LANDEDCOST.VALUE" });
            arr.push({ headerName: "No Of Dies", field: d + ".NOOFDIES.VALUE" });
            arr.push({ headerName: "Die Weight", field: d + ".DIEWEIGHT.VALUE" });
            arr.push({ headerName: "Cost Per Ton", field: d + ".COSTPERTON.VALUE" });
            tmp.push({ headerName: d, children: arr });
        });
        return tmp;
    }
    $scope.changePrj = function (projectCode, panelGroup, bNum) {
        post('GetERFQComparisonData', changePrjQr(projectCode, panelGroup, bNum, cmm), function (data) {
            var temp = xmltojson(data, "COMPARISON");
            temp = initPro(temp);
            console.log("grid-data=>", temp);
            $scope.gridOptions.api.setRowData(temp);
            $scope.gridOptions.columnDefs = gridopInit();
            $scope.gridOptions.columnDefs.push(addTm(temp));
            $scope.gridOptions.columnDefs = _.concat($scope.gridOptions.columnDefs, addL(temp));
            $scope.gridOptions.api.setColumnDefs($scope.gridOptions.columnDefs);
        }, function (e1, e2, e3) { });
    };
    $scope.$watchCollection('cmm', function (newValue, oldValue) {
        if ((newValue.projectCode != oldValue.projectCode) || (newValue.label != oldValue.label))
            $scope.changePrj(newValue.projectCode, newValue.label, cmm.baslineNum);
    }, true);
    if (($scope.cmm.projectCode == undefined))
        toastr.warning("Select ProjectCode");
    else
        $scope.changePrj($scope.cmm.projectCode, $scope.cmm.label, cmm.baslineNum);
});
