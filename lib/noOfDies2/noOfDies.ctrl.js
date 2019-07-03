"use strict";

angular.module('App.quoteComparisionCtrl').controller('noOfDiesCtrl', function ($scope, Upload, $window, $log, $state, NgTableParams, cmm) {
  console.log("cmm=>", cmm);
  $scope.data = {};
  $scope.toolmakerDropdown = [];
  $scope.PanelGrpDrpdwn = [];
  $scope.budgetedToolmk = [];
  $scope.MaterialGrades = [];
  $scope.setArr = [];
  $scope.excelDataArray = [];
  $scope.gridOptions = {};
  $scope.gridOptions.enableColumnMenus = false;
  $scope.gridOptions.enableSorting = false;
  $scope.cmm = cmm;
  $scope.cmm.label = 'A';
  $scope.funcRun = 0;

  $scope.setLab = function (d) {
    $scope.cmm.label = d;
  };

  $scope.gridOptions2 = {
    enableColResize: true,
    headerHeight: 40,
    rowHeight: 40,
    pagination: true,
    paginationPageSize: 10,
    defaultColDef: {
      sortable: true,
      resizable: true
    },
    columnDefs: [{
      headerName: "S.No",
      width: 80,
      cellStyle: changeRowColor,
      cellRenderer: function cellRenderer(params) {
        return parseInt(params.node.id) + 1;
      }
    }, {
      headerName: "Part Number",
      field: "PART_NUMBER",
      cellStyle: changeRowColor
    }, {
      headerName: "Nomenclature",
      field: "PART_NAME",
      cellStyle: changeRowColor
    }, {
      headerName: "Budgated Toolmaker",
      field: "BUDGETED_TOOLMAKER",
      cellStyle: changeRowColor
    }, {
      headerName: "Blanking Die",
      field: "NO_OF_DIES_BLANKINGDIE",
      cellStyle: changeRowColor,
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
    }, {
      headerName: "Die Budgeted ",
      field: "DIES_BUDGETED",
      cellStyle: changeRowColor,
      valueGetter: 'data.NO_OF_DIES_BLANKINGDIE',
      cellRenderer: function cellRenderer(params) {
        if (params.data.NO_OF_DIES_BLANKINGDIE == "Excluded") return params.data.EX_DIES_BUDGETED;else return params.data.IN_DIES_BUDGETED;
      }
    }],
    components: {
      moodEditor: DropDownTemplate,
      customHeaderGroupComponent: CustomHeaderGroup,
      htmlText: htmlText,
      genderCellRenderer: CellRender,
      cellSelect: CellSelect
    }
  };

  function changeRowColor(params) {
    var key = _.keys(params.data).filter(function (d) {
      return d.match(/TOOLMAKER[0-9]/i);
    });

    for (var i = 0; i < key.length; i++) {
      if (Number(params.data.DIES_BUDGETED) > Number(params.data[key[i]].NODIES)) {
        return {
          backgroundColor: '#FFE8E8'
        };
      }
    }
  }

  $scope.$watchCollection('cmm.SaveTab', function (newValue, oldValue) {
    if (cmm.SaveTab == true) $scope.xlSave();
  }, true);

  $scope.changePrj = function (projectCode, panelGroup, bNum) {
    $scope.panelGroup = panelGroup;
    $.cordys.ajax({
      method: "GetERFQComparisonData",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "comparisonType": "NoOfDies",
        "panelGroup": panelGroup,
        "projectCode": projectCode,
        "budgeted": cmm.filtObj != undefined && cmm.filtObj.filterBT != undefined ? cmm.filtObj.filterBT : '',
        "partNum": cmm.selectedPartNumber != undefined && cmm.selectedPartNumber.length > 0 ? cmm.selectedPartNumber[0] : "",
        "baselineNum": bNum,
        "decimalPlace": '',
        "preferences": '',
        "ComparePref": '',
        "toolmakersRequired": cmm.filtObj != undefined && cmm.filtObj.filtReq != undefined ? cmm.filtObj.filtReq : '',
        "panelGrouping": cmm.filtObj != undefined && cmm.filtObj.filterPG != undefined ? cmm.filtObj.filterPG : '',
        "materialGrade": cmm.filtObj != undefined && cmm.filtObj.filterMG != undefined ? cmm.filtObj.filterMG : ''
      },
      success: function success(data) {
        $scope.gridOptions.data = $.cordys.json.findObjects(data, "COMPARISON");
        console.log("No Of Dies :", $scope.gridOptions.data);
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
        $scope.$apply();
      },
      error: function error(jqXHR, textStatus, errorThrown) {}
    });
  };

  $scope.makeHeader = function () {
    $.cordys.ajax({
      method: "GetERFQComparisonData",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "comparisonType": "NoOfDies",
        "panelGroup": $scope.panelGroup,
        "projectCode": $scope.cmm.projectCode,
        "budgeted": '',
        "partNum": cmm.selectedPartNumber != undefined && cmm.selectedPartNumber.length > 0 ? cmm.selectedPartNumber[0] : "",
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

  $scope.fillValue1 = function (v1) {
    $scope.filterMG = v1;
  };

  $scope.fillValue2 = function (v1) {
    $scope.filterBT = v1;
  };

  $scope.fillValue3 = function (v1) {
    $scope.filterPG = v1;
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
    console.log(a.TOOLMAKER_ID);

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
    debugger;
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

    console.log($scope.filterMG);
    console.log($scope.filterBT);
    console.log($scope.filterPG);
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
        "comparisonType": "NoOfDies",
        "panelGroup": $scope.panelGroup,
        "projectCode": $scope.cmm.projectCode,
        "budgeted": cmm.filtObj != undefined && cmm.filtObj.filterBT != undefined ? cmm.filtObj.filterBT : '',
        "partNum": cmm.selectedPartNumber != undefined && cmm.selectedPartNumber.length > 0 ? cmm.selectedPartNumber[0] : "",
        "baselineNum": $scope.cmm.baslineNum,
        "decimalPlace": "",
        "preferences": "",
        "ComparePref": "",
        "toolmakersRequired": cmm.filtObj != undefined && cmm.filtObj.filtReq != undefined ? cmm.filtObj.filtReq : '',
        "panelGrouping": cmm.filtObj != undefined && cmm.filtObj.filterPG != undefined ? cmm.filtObj.filterPG : '',
        "materialGrade": cmm.filtObj != undefined && cmm.filtObj.filterMG != undefined ? cmm.filtObj.filterMG : ''
      },
      success: function success(data) {
        $scope.gridOptions.data = $.cordys.json.findObjects(data, "COMPARISON");
        $scope.settleData();
        $scope.colAdd($scope.gridOptions.data);
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
    $scope.triggerRequest();
  };

  $scope.xl = function () {
    console.log($scope.gridOptions);
    var arrXl = [];
    arrXl.push(_.map($scope.gridOptions.columnDefs, 'displayName'));
  };

  $.cordys.ajax({
    method: "GetRoles",
    namespace: "http://schemas.cordys.com/1.0/ldap",
    parameters: {
      dn: "",
      depth: ""
    },
    dataType: "* json",
    async: false,
    success: function success(e) {
      debugger;
      $scope.roles1 = $.cordys.json.findObjects(e, "user");

      for (var i = 0; i < $scope.roles1[0].role.length; i++) {
        $scope.CordysRole = $scope.CordysRole + "," + $scope.roles1[0].role[i].description;
      }

      if ($scope.CordysRole.includes("MSIE")) {
        console.log("MSIE");
        $scope.CurrentRole = "MSIE";
      }

      if ($scope.CordysRole.includes("Stamping Lead")) {
        console.log("Stamping Lead");
        $scope.CurrentRole = "Stamping Lead";
      }

      if ($scope.CordysRole.includes("Asset Manager")) {
        console.log("Asset Manager");
        $scope.CurrentRole = "Asset Manager";
      }
    },
    error: function error(jqXHR, textStatus, errorThrown) {
      toastr.error("Error in loading data");
    }
  });
  $scope.$watchCollection('cmm', function (newValue, oldValue) {
    if (newValue.projectCode != oldValue.projectCode || newValue.label != oldValue.label) $scope.changePrj(newValue.projectCode, newValue.label, cmm.baslineNum);
  }, true);

  $scope._init = function () {};

  $scope.budgetedCH = function (row) {
    if (row.entity.NO_OF_DIES_BLANKINGDIE == "Excluded") {
      row.entity = row.entity;
    }

    document.getElementById("revtab1").style.display = "none";
    document.getElementById("revtab2").style.display = "";
    document.getElementById("dietab1").style.display = "none";
    document.getElementById("dietab2").style.display = "";
    document.getElementById("basictab1").style.display = "none";
    document.getElementById("basictab2").style.display = "";
    document.getElementById("landedtab1").style.display = "none";
    document.getElementById("landedtab2").style.display = "";
    document.getElementById("costtab1").style.display = "none";
    document.getElementById("costtab2").style.display = "";
    document.getElementById("besttab1").style.display = "none";
    document.getElementById("besttab2").style.display = "";
    document.getElementById("preftab1").style.display = "none";
    document.getElementById("preftab2").style.display = "";
    document.getElementById("targettab1").style.display = "none";
    document.getElementById("targettab2").style.display = "";
    document.getElementById("subtab1").style.display = "none";
    document.getElementById("subtab2").style.display = "";
  };

  $scope._init();

  if ($scope.cmm.projectCode == undefined) toastr.warning("Select ProjectCode");else $scope.changePrj($scope.cmm.projectCode, $scope.cmm.label, cmm.baslineNum);

  $scope.setLab = function (d) {
    $scope.cmm.label = d;
  };

  $scope.openFilterBox = function () {
    document.getElementById("filterBtn").style.backgroundColor = "#24c0c0";
  };

  $scope.colAdd = function (data) {
    var key = _.keys(data[0]).filter(function (d) {
      return d.match(/TOOLMAKER[0-9]/i);
    });

    for (var i = 0; i < key.length; i++) {
      $scope.gridOptions2.columnDefs.push({
        headerName: data[0][key[i]].TOOLMAKERNAME,
        field: key[i] + ".NODIES",
        cellStyle: changeRowColor,
        valueGetter: 'data.NO_OF_DIES_BLANKINGDIE',
        cellRenderer: function cellRenderer(params) {
          var obj = _.keys(params.data).filter(function (dd) {
            return dd.match(/^TOOLMAKER/i);
          }).map(function (dd) {
            return params.data[dd];
          }).filter(function (dd) {
            return dd.TOOLMAKERNAME == params.colDef.headerName;
          });

          if (params.data.NO_OF_DIES_BLANKINGDIE == "Excluded") return obj[0].EX_NODIES;else return obj[0].IN_NODIES;
        }
      });
    }

    $scope.gridOptions2.api.setColumnDefs($scope.gridOptions2.columnDefs);
    $scope.funcRun += 1;
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

  $scope.xlSave = function () {
    console.log("no of dies save Data:", $scope.gridOptions.data);

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
              'BASIC_COST_BLANKINGDIE': "Included",
              'LANDED_COST_BLANKINGDIE': "Included",
              'COST_PER_TON_BLANKINGDIE': "Included",
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
              'NO_OF_DIES_BLANKINGDIE': d.NO_OF_DIES_BLANKINGDIE
            }
          }
        };
      }
    }));
  };
}).filter('mapGender', function () {
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