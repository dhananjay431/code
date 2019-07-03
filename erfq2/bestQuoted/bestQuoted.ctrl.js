"use strict";

angular.module('App.quoteComparisionCtrl').controller('bestQuotedCtrl', function ($scope, Upload, $window, $log, $state, NgTableParams, cmm) {
  console.log("cmm=>", cmm);
  $scope.data = {};
  $scope.gridOptions = {};
  $scope.cmm = cmm;
  $scope.cmm.label = _.keys(cmm.selectedPartNumber)[0];
  $scope.decimals = parseInt("2");
  $scope.budgetedParam = '';
  $scope.toolmakerDropdown = [];
  $scope.PanelGrpDrpdwn = [];
  $scope.budgetedToolmk = [];
  $scope.MaterialGrades = [];
  $scope.setArr = [];
  $scope.funcRun = 0;

  $scope.setLab = function (d) {
    $scope.cmm.label = d;
  };
  
  $scope.preferences = ["Basic Cost", "Landed Cost", "No of Dies", "Die Weight", "Cost Per Ton"];
  $scope.selected = ["Basic Cost", "Landed Cost", "No of Dies", "Die Weight", "Cost Per Ton"];

  $scope.toggle = function (item, list) {
    var idx = list.indexOf(item);
    
    if (idx > -1) {
    list.splice(idx, 1);
  } else {
    list.push(item);
  }
  };

  $scope.exists = function (item, list) {
    return list.indexOf(item) > -1;
  };

  $scope.openpreFBox = function (valU) {
    document.getElementById("filterBtn").style.backgroundColor = "#202121";
    document.getElementById("preFBtn").style.backgroundColor = "#dc3545";
  };

  $scope.applypreF = function () {
    $scope.hideAll();

    for (var i = 0; i < $scope.selected.length; i++) {
      if ($scope.selected[i] == "Basic Cost") {
        $scope.gridOptions2.columnApi.setColumnVisible("BASICCOST.TOOLMAKER", true);
        $scope.gridOptions2.columnApi.setColumnVisible("BASICCOST.VALUE", true);
      }

      if ($scope.selected[i] == "Landed Cost") {
        $scope.gridOptions2.columnApi.setColumnVisible("LANDEDCOST.TOOLMAKER", true);
        $scope.gridOptions2.columnApi.setColumnVisible("LANDEDCOST.VALUE", true);
      }

      if ($scope.selected[i] == "No of Dies") {
        $scope.gridOptions2.columnApi.setColumnVisible("NOOFDIES.TOOLMAKER", true);
        $scope.gridOptions2.columnApi.setColumnVisible("NOOFDIES.VALUE", true);
      }

      if ($scope.selected[i] == "Die Weight") {
        $scope.gridOptions2.columnApi.setColumnVisible("DIEWEIGHT.TOOLMAKER", true);
        $scope.gridOptions2.columnApi.setColumnVisible("DIEWEIGHT.VALUE", true);
      }

      if ($scope.selected[i] == "Cost Per Ton") {
        $scope.gridOptions2.columnApi.setColumnVisible("COSTPERTON.TOOLMAKER", true);
        $scope.gridOptions2.columnApi.setColumnVisible("COSTPERTON.VALUE", true);
      }
    }
  };

  $scope.hideAll = function () {
    $scope.gridOptions2.columnApi.setColumnVisible("BASICCOST.TOOLMAKER", false);
    $scope.gridOptions2.columnApi.setColumnVisible("BASICCOST.VALUE", false);
    $scope.gridOptions2.columnApi.setColumnVisible("LANDEDCOST.TOOLMAKER", false);
    $scope.gridOptions2.columnApi.setColumnVisible("LANDEDCOST.VALUE", false);
    $scope.gridOptions2.columnApi.setColumnVisible("NOOFDIES.TOOLMAKER", false);
    $scope.gridOptions2.columnApi.setColumnVisible("NOOFDIES.VALUE", false);
    $scope.gridOptions2.columnApi.setColumnVisible("DIEWEIGHT.TOOLMAKER", false);
    $scope.gridOptions2.columnApi.setColumnVisible("DIEWEIGHT.VALUE", false);
    $scope.gridOptions2.columnApi.setColumnVisible("COSTPERTON.TOOLMAKER", false);
    $scope.gridOptions2.columnApi.setColumnVisible("COSTPERTON.VALUE", false);
  };

  $scope.getBestQuoatedDetails = function (panelGroup, projectCode, bNum) {
    $scope.gridOptions = {};

    if (projectCode == undefined || bNum == undefined) {
      projectCode = $scope.cmm.projectCode;
      bNum = $scope.cmm.baslineNum;
    }

    $scope.currentLable = panelGroup;

    if (panelGroup == 'A') {
      document.getElementById('buttonPanelGrpB').classList.remove('active');
      document.getElementById('buttonPanelGrpA').className += ' active';
    }

    if (panelGroup == 'B') {
      document.getElementById('buttonPanelGrpA').className += ' active';
      document.getElementById('buttonPanelGrpB').classList.remove('active');
    }

    $.cordys.ajax({
      method: "GetERFQComparisonData",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "comparisonType": "BestQuoted",
        "panelGroup": panelGroup,
        "projectCode": projectCode,
        "budgeted": cmm.filtObj != undefined && cmm.filtObj.filterBT != undefined ? cmm.filtObj.filterBT : '',
        "partNum": cmm.selectedPartNumber[$scope.cmm.label],
        "baselineNum": '',
        "decimalPlace": $scope.decimals,
        "preferences": '',
        "ComparePref": '',
        "toolmakersRequired": cmm.filtObj != undefined && cmm.filtObj.filtReq != undefined ? cmm.filtObj.filtReq : '',
        "panelGrouping": cmm.filtObj != undefined && cmm.filtObj.filterPG != undefined ? cmm.filtObj.filterPG : '',
        "materialGrade": cmm.filtObj != undefined && cmm.filtObj.filterMG != undefined ? cmm.filtObj.filterMG : ''
      },
      success: function success(data) {
        $scope._init();
		var _data_ = $.cordys.json.findObjects(data, "COMPARISON");
		if( _data_.length == 0 ) {
			toastr.info("Data Is Empty");
			return;
		  }

        if ($.cordys.json.findObjects(data, "COMPARISON").length > 0) {
          $scope.gridOptions.data = $.cordys.json.findObjects(data, "COMPARISON");
          $scope.gridOptions2.api.setRowData($scope.gridOptions.data);
          $.cordys.ajax({
            method: "GetToolMakersforCompair",
            namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
            dataType: "* json",
            parameters: {
              "projectCode": $scope.cmm.projectCode,
              "panelGroup": panelGroup
            },
            success: function success(data) {
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

                  for (var t = 0; t < tk.length; t++) {
                    var a = tk[t];
                    $scope.toolmakerDropdown[a].selected1 = true;
                  }
                }
              }
            },
            error: function error(jqXHR, textStatus, errorThrown) {
              toastr.error("Unable to load data. Please try refreshing the page.");
            }
          });
          $scope.makeHeader();
          $scope.settleData();
          console.log("Best Quoted:", $scope.gridOptions2.columnDefs);
        } else {
          $scope.getAllData(panelGroup, projectCode, bNum);
        }

        $scope.$apply();
      },
      error: function error(jqXHR, textStatus, errorThrown) {}
    });
  };

  $scope.xl = function () {
    var params = {
      "skipHeader": false,
      "columnGroups": true,
      "skipFooters": false,
      "skipGroups": false,
      "skipPinnedTop": false,
      "skipPinnedBottom": false,
      "allColumns": false,
      "onlySelected": false,
      "suppressQuotes": false,
      "fileName": "",
      "columnSeparator": ""
    };
    $scope.gridOptions2.api.exportDataAsCsv(params);
  };

  $scope.gridOptions2 = {
    enableColResize: true,
    headerHeight: 40,
    rowHeight: 40,
    pagination: true,
    paginationPageSize: 10,
    defaultColDef: {
      sortable: true
    },
    columnDefs: [{
      headerName: "S.No",
      width: 80,
      cellRenderer: function cellRenderer(params) {
        return parseInt(params.node.id) + 1;
      }
    }, {
      headerName: "Part Number",
      field: "PART_NUMBER"
    }, {
      headerName: "Nomenclature",
      field: "PART_NAME"
    }, {
      headerName: "Budgated Toolmaker",
      field: "BUDGETED_TOOLMAKER"
    }, {
      headerName: "Basic Cost (rupees)",
      children: [{
        headerName: "Toolmaker",
        field: "BASICCOST.TOOLMAKER"
      }, {
        headerName: "Basic Cost (in lakhs)",
        field: "BASICCOST.VALUE"
      }]
    }, {
      headerName: "Landed Cost (rupees)",
      children: [{
        headerName: "Toolmaker",
        field: "LANDEDCOST.TOOLMAKER"
      }, {
        headerName: "Landed Cost (in lakhs)",
        field: "LANDEDCOST.VALUE"
      }]
    }, {
      headerName: "No of Dies",
      children: [{
        headerName: "Toolmaker",
        field: "NOOFDIES.TOOLMAKER"
      }, {
        headerName: "No of Dies",
        field: "NOOFDIES.VALUE"
      }]
    }, {
      headerName: "Die Weight",
      children: [{
        headerName: "Toolmaker",
        field: "DIEWEIGHT.TOOLMAKER"
      }, {
        headerName: "Die Weight",
        field: "DIEWEIGHT.VALUE"
      }]
    }, {
      headerName: "Cost per Ton (rupees)",
      children: [{
        headerName: "Toolmaker",
        field: "COSTPERTON.TOOLMAKER"
      }, {
        headerName: "Cost per Ton",
        field: "COSTPERTON.VALUE"
      }]
    }]
  };
  $scope.$watchCollection('cmm', function (newValue, oldValue) {
    $scope.cmm.label = newValue.label;
    $scope.cmm.projectCode = newValue.projectCode;
    if (newValue.projectCode != oldValue.projectCode || newValue.label != oldValue.label) $scope.getBestQuoatedDetails(newValue.label, newValue.projectCode, cmm.baslineNum);
  }, true);

  $scope.getAllData = function (panelGroup, projectCode, bNum) {
    $.cordys.ajax({
      method: "GetQuoteComparisionbyProject",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        ProjectCode: cmm.projectCode,
        baselinenum: cmm.baslineNum,
        GROUP: $scope.currentLable
      },
      success: function success(data) {
        var allDataArr = $.cordys.json.findObjects(data, "ERFQ_QUOTE_COMPARISON");
        var requestTupleJsonArr = [];
        var requestTupleJsonObj = {};

        if (allDataArr.length > 0) {
          for (var i = 0; i < allDataArr.length; i++) {
            var requestObj = {};
            var oldReqObjInternal = {};
            var newReqObjInternal = {};
            var oldReqObjInternalNew = {};
            var newReqObjInternalNew = {};

            if (allDataArr[i].COMPARISON_SEQ != undefined) {
              $scope.currentBaseLineNum = allDataArr[i].BASELINE_NUM;
              $scope.currentProjectCode = allDataArr[i].PROJECT_CODE;

              if (allDataArr[i].COMPARISON_SEQ.length > 0) {
                oldReqObjInternal['COMPARISON_SEQ'] = allDataArr[i].COMPARISON_SEQ;
                oldReqObjInternalNew['ERFQ_QUOTE_COMPARISON'] = oldReqObjInternal;
                newReqObjInternal['BASELINE_NUM'] = allDataArr[i].BASELINE_NUM;
                newReqObjInternal['BASIC_COST_BLANKINGDIE'] = allDataArr[i].BASIC_COST_BLANKINGDIE;
                newReqObjInternal['COST_PER_TON_BLANKINGDIE'] = allDataArr[i].COST_PER_TON_BLANKINGDIE;
                newReqObjInternal['DIE_WEIGHT_BLANKINGDIE'] = allDataArr[i].DIE_WEIGHT_BLANKINGDIE;
                newReqObjInternal['LANDED_COST_BLANKINGDIE'] = allDataArr[i].LANDED_COST_BLANKINGDIE;
                newReqObjInternal['NO_OF_DIES_BLANKINGDIE'] = allDataArr[i].NO_OF_DIES_BLANKINGDIE;
                newReqObjInternal['PART_NUMBER'] = allDataArr[i].PART_NUMBER;
                newReqObjInternal['PART_GROUP'] = allDataArr[i].PART_GROUP;
                newReqObjInternal['PROJECT_CODE'] = allDataArr[i].PROJECT_CODE;
                newReqObjInternalNew['ERFQ_QUOTE_COMPARISON'] = newReqObjInternal;
                requestObj['old'] = oldReqObjInternalNew;
                requestObj['new'] = newReqObjInternalNew;
                requestTupleJsonArr.push(requestObj);
              } else if ($scope.gridOptions.data[i].COMPARISON_SEQ.length == 0) {
                newReqObjInternal['BASELINE_NUM'] = allDataArr[i].BASELINE_NUM;
                newReqObjInternal['BASIC_COST_BLANKINGDIE'] = allDataArr[i].BASIC_COST_BLANKINGDIE;
                newReqObjInternal['COST_PER_TON_BLANKINGDIE'] = allDataArr[i].COST_PER_TON_BLANKINGDIE;
                newReqObjInternal['DIE_WEIGHT_BLANKINGDIE'] = allDataArr[i].DIE_WEIGHT_BLANKINGDIE;
                newReqObjInternal['LANDED_COST_BLANKINGDIE'] = allDataArr[i].LANDED_COST_BLANKINGDIE;
                newReqObjInternal['NO_OF_DIES_BLANKINGDIE'] = allDataArr[i].NO_OF_DIES_BLANKINGDIE;
                newReqObjInternal['PART_NUMBER'] = allDataArr[i].PART_NUMBER;
                newReqObjInternal['PART_GROUP'] = allDataArr[i].PART_GROUP;
                newReqObjInternal['PROJECT_CODE'] = allDataArr[i].PROJECT_CODE;
                newReqObjInternalNew['ERFQ_QUOTE_COMPARISON'] = newReqObjInternal;
                requestObj['new'] = newReqObjInternalNew;
                requestTupleJsonArr.push(requestObj);
              }
            }
          }

          requestTupleJsonObj['tuple'] = requestTupleJsonArr;
          debugger;
        } else {
          var requestObj = {};
          var oldReqObjInternal = {};
          var newReqObjInternal = {};
          var oldReqObjInternalNew = {};
          var newReqObjInternalNew = {};
          $.cordys.ajax({
            method: "GetERFQComparisonData",
            namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
            dataType: "* json",
            parameters: {
              "comparisonType": "BasicCost",
              "panelGroup": $scope.currentLable,
              "projectCode": cmm.projectCode,
              "budgeted": "",
              "partNum": cmm.selectedPartNumber[$scope.cmm.label],
              "baselineNum": cmm.baslineNum,
              "decimalPlace": 5,
              "preferences": "USD($),YEN(¥‎),EURO($),INR(₹)",
              "ComparePref": '',
              "toolmakersRequired": '',
              "panelGrouping": '',
              "materialGrade": ''
            },
            success: function success(data) {
              console.log("success=>");
              $scope.basicCostDataArr = $.cordys.json.findObjects(data, "COMPARISON");
			  if( $scope.basicCostDataArr.length == 0 ) {
				toastr.info("Data Is Empty");
				return;
			  }
              for (var i = 0; i < $scope.basicCostDataArr.length; i++) {
                newReqObjInternal['BASELINE_NUM'] = cmm.baslineNum;
                newReqObjInternal['BASIC_COST_BLANKINGDIE'] = "Included";
                newReqObjInternal['COST_PER_TON_BLANKINGDIE'] = "Included";
                newReqObjInternal['DIE_WEIGHT_BLANKINGDIE'] = "Included";
                newReqObjInternal['LANDED_COST_BLANKINGDIE'] = "Included";
                newReqObjInternal['NO_OF_DIES_BLANKINGDIE'] = "Included";
                newReqObjInternal['PART_NUMBER'] = $scope.basicCostDataArr[i].PART_NUMBER;
                newReqObjInternal['PART_GROUP'] = $scope.currentLable;
                newReqObjInternal['PROJECT_CODE'] = cmm.projectCode;
                newReqObjInternalNew['ERFQ_QUOTE_COMPARISON'] = newReqObjInternal;
                requestObj['new'] = newReqObjInternalNew;
                requestTupleJsonArr.push(requestObj);
              }

              requestTupleJsonObj['tuple'] = requestTupleJsonArr;
              debugger;
            },
            error: function error(jqXHR, textStatus, errorThrown) {
              console.log("error=>");
            }
          });
        }
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    });
  };

  $scope._init = function () {};

  $scope._init();

  if ($scope.cmm.projectCode == undefined) {
    toastr.warning("Select ProjectCode");
  } else {
    $scope.getBestQuoatedDetails($scope.cmm.label, $scope.cmm.projectCode, cmm.baslineNum);
  }

  $scope.fillValue1 = function (v1) {
    $scope.filterMG = v1;
  };

  $scope.fillValue2 = function (v1) {
    $scope.filterBT = v1;
  };

  $scope.fillValue3 = function (v1) {
    $scope.filterPG = v1;
  };

  $scope.makeHeader = function () {
    $.cordys.ajax({
      method: "GetERFQComparisonData",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "comparisonType": "BasicCost",
        "panelGroup": $scope.cmm.label,
        "projectCode": $scope.cmm.projectCode,
        "budgeted": '',
        "partNum": cmm.selectedPartNumber[$scope.cmm.label],
        "baselineNum": $scope.cmm.baslineNum,
        "decimalPlace": "",
        "preferences": "",
        "ComparePref": "",
        "toolmakersRequired": '',
        "panelGrouping": '',
        "materialGrade": ''
      },
      success: function success(data) {
        $scope.gridOptions.data1 = $.cordys.json.findObjects(data, "COMPARISON");
		
		if($scope.gridOptions.data1.length == 0 ) {
		  toastr.info("Data Is Empty");
		  return;
		}
        for (var i = 0; i < $scope.gridOptions.data1.length; i++) {
          $scope.callFunction1($scope.gridOptions.data1[i]);
        }
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Unable to load data. Please try refreshing the page.");
      }
    });
  };

  $scope.settleData = function () {
    if (cmm.filtObj != null || cmm.filtObj != undefined) {
      $scope.filtObj = cmm.filtObj;
    }

    if ($scope.filtObj != undefined && $scope.filtObj != "" && $scope.filtObj != null) {
      $scope.fillValue1($scope.filtObj.filterMG);
      $scope.fillValue2($scope.filtObj.filterBT);
      $scope.fillValue3($scope.filtObj.filterPG);

      if ($scope.toolmakerDropdown.length != 0) {
        var tk = cmm.filtObj.filtertmk;

        for (var t = 0; t < tk.length; t++) {
          var a = tk[t];
          $scope.toolmakerDropdown[a].selected1 = true;
        }
      }

      $scope.tmkReq = $scope.filtObj.tmkReq;
      $scope.setArr = $scope.filtObj.setArr;
    }
  };

  $scope.adddrp = function (value1) {
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
  };

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
  };

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
  };

  $scope.callFunction1 = function (obj) {
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key.startsWith("BUDGETED_TOOLMAKER")) {
          $scope.value = {
            value: obj[key]
          };
          var ret = 0;
          ret = $scope.adddrp($scope.value);

          if (ret == undefined || ret == 0) {
            $scope.budgetedToolmk.push($scope.value);
          }
        }

        if (key.startsWith("PART_GROUP")) {
          $scope.value1 = {
            grp: obj[key]
          };
          var ret1 = 0;
          ret1 = $scope.addPaneldrp($scope.value1);

          if (ret1 == undefined || ret1 == 0) {
            $scope.PanelGrpDrpdwn.push($scope.value1);
          }
        }

        if (key.startsWith("MATERIAL")) {
          $scope.value2 = {
            grp: obj[key]
          };
          var ret1 = 0;
          ret1 = $scope.addMaterial($scope.value2);

          if (ret1 == undefined || ret1 == 0) {
            $scope.MaterialGrades.push($scope.value2);
          }
        }
      }
    }
  };

  $scope.tmkReq = [];

  $scope.makeTmkArray = function (a) {
    debugger;

    if (a.selected1 == true) {
      $scope.tmkReq.push(a.TOOLMAKER_ID);
      var set = $scope.toolmakerDropdown.indexOf(a);
      $scope.setArr.push(set);
    }

    if (a.selected1 == false) {
      var indxOfObj = $scope.tmkReq.indexOf(a.TOOLMAKER_ID);
      $scope.tmkReq.splice(indxOfObj, 1);
      var set = $scope.toolmakerDropdown.indexOf(a);
      var s = $scope.setArr.indexOf(set);
      $scope.setArr.splice(s, 1);
    }
  };

  $scope.filter = function () {
    document.getElementById("myDropdown").classList.toggle("show");
    array = $scope.tmkReq;
    var flags = [],
        output = [],
        l = array.length,
        i;

    for (i = 0; i < l; i++) {
      if (flags[array[i]]) continue;
      flags[array[i]] = true;
      output.push(array[i]);
    }

    $scope.tmkReq = output;

    if ($scope.tmkReq.length > 0) {
      $scope.tmkarg = "";

      for (var i = 0; i < $scope.tmkReq.length; i++) {
        if ($scope.tmkarg != "") {
          $scope.tmkarg += ",";
        }

        $scope.tmkarg = $scope.tmkarg + "'" + $scope.tmkReq[i] + "'";
      }
    } else {
      $scope.tmkarg = '';
    }

    if ($scope.filterMG == undefined) {
      $scope.filterMG = '';
    }

    if ($scope.filterBT == undefined) {
      $scope.filterBT = '';
    }

    if ($scope.filterPG == undefined) {
      $scope.filterPG = '';
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
  };

  $scope.triggerRequest = function () {
    $.cordys.ajax({
      method: "GetERFQComparisonData",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "comparisonType": "BestQuoted",
        "panelGroup": $scope.panelGroup,
        "projectCode": $scope.cmm.projectCode,
        "budgeted": cmm.filtObj != undefined && cmm.filtObj.filterBT != undefined ? cmm.filtObj.filterBT : '',
        "partNum": cmm.selectedPartNumber[$scope.cmm.label],
        "baselineNum": $scope.cmm.baslineNum,
        "decimalPlace": $scope.decimals,
        "preferences": "",
        "ComparePref": "",
        "toolmakersRequired": cmm.filtObj != undefined && cmm.filtObj.filtReq != undefined ? cmm.filtObj.filtReq : '',
        "panelGrouping": cmm.filtObj != undefined && cmm.filtObj.filterPG != undefined ? cmm.filtObj.filterPG : '',
        "materialGrade": cmm.filtObj != undefined && cmm.filtObj.filterMG != undefined ? cmm.filtObj.filterMG : ''
      },
      success: function success(data) {
		$scope.gridOptions.data = $.cordys.json.findObjects(data, "COMPARISON");
		if( $scope.gridOptions.data.length == 0 ) {
			toastr.info("Data Is Empty");
			return;
		  }
        console.log("filtered: ", $scope.gridOptions.data);
        $scope.gridOptions2.api.setRowData($scope.gridOptions.data);
        $scope.gridOptions2.columnDefs.splice(7);
        $scope.colAdd($scope.gridOptions.data);
        $scope.settleData();
        console.log("Filtered Landed Cost: ", $scope.gridOptions2.columnDefs);
        $scope.$apply();
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Unable to load data. Please try refreshing the page.");
      }
    });
  };

  $scope.openDD = function () {
    document.getElementById("myDropdown").classList.toggle("show");
  };

  $scope.clearAllField = function () {
    $scope.filterMG = "";
    $scope.filterBT = "";
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
    $scope.getBestQuoatedDetails($scope.cmm.projectCode, $scope.panelGroup, $scope.cmm.baslineNum);
  };

  $scope.xlSave = function () {
    console.log("Best Quoted save Data:", $scope.gridOptions.data);

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
              'COMPARISON_SEQ': d.COMPARISON_SEQ
            }
          }
        };
      }
    }));
  };

  $scope.$watchCollection('cmm.SaveTab', function (newValue, oldValue) {
	// if (cmm.SaveTab == true) 
	// $scope.xlSave();
  }, true);
});