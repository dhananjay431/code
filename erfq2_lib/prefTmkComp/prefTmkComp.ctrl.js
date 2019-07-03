"use strict";

angular.module('App.quoteComparisionCtrl').controller('prefTmkCompCtrl', function ($scope, Upload, $window, $log, $state, cmm) {
  console.log("cmm=>", cmm);
  $scope.toolmakerDropdown = [];
  $scope.PanelGrpDrpdwn = [];
  $scope.budgetedToolmk = [];
  $scope.MaterialGrades = [];

  function cl() {
    this.data = {};
  }

  cl.prototype.gridInit = function () {
    return {
      headerHeight: 40,
      rowHeight: 40,
      rowDrag: false,
      columnDefs: [{
        headerName: "PART_NUMBER",
        field: "PART_NUMBER",
        resizable: true
      }],
      components: {
        moodEditor: DropDownTemplate
      }
    };
  };

  cl.prototype.initPro = function (data) {
    $scope.setting.p = [];
    $scope.setting.l = [];

    _.keys(data[0].ToolmakerPref).map(function (d) {
      $scope.setting.p.push({
        key: d,
        value: true
      });
    });

    _.keys(data[0].LANDEDCOST).map(function (d) {
      $scope.setting.l.push({
        key: d,
        value: true
      });
    });

    return _.map(data, function (d) {
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
  };

  cl.prototype.addTm = function (temp) {
    var TOOLMAKER = [];
    Object.keys(temp[0].ToolmakerPref).forEach(function (d) {
      var z = {
        headerName: d,
        field: "ToolmakerPref." + d,
        editable: true,
        resizable: true,
        cellClass: ['ToolmakerPref'],
        cellEditorSelector: function cellEditorSelector(params) {
          var arr = ['Select'];
          arr = _.concat(arr, _.map(_.isArray(params.data.TOOLMAKER) ? params.data.TOOLMAKER : [params.data.TOOLMAKER], 'NAME'));
          return {
            component: 'moodEditor',
            params: {
              values: arr
            }
          };
        }
      };
      TOOLMAKER.push(z);
    });
    return {
      headerName: '<b>Toolmaker Preference</b><div class="float-right"> <i id="subFun" ng-click="addCol()" class="border rounded-circle bg-danger text-light fas fa-minus" style="font-size: 25px;"></i> <i id="addFun" ng-click="addSub()" class="border rounded-circle bg-success text-light   fas fa-plus " style="font-size: 25px;"></i> </div>',
      children: TOOLMAKER,
      headerGroupComponent: 'customHeaderGroupComponent'
    };
  };

  cl.prototype.addTmLP = function (data) {
    var tp = data.columnDefs.filter(function (d) {
      return d.headerName.match(/Toolmaker Preference/g);
    });

    if (tp.length > 0) {
      tp[0].children.push(angular.copy(tp[0].children[tp[0].children.length - 1]));
    }

    tp[0].children[tp[0].children.length - 1].headerName = "P" + tp[0].children.length;
    tp[0].children[tp[0].children.length - 1].field = "ToolmakerPref.P" + tp[0].children.length;
    data.api.setColumnDefs(data.columnDefs);
    console.log(data);
  };

  cl.prototype.addAuto = function (temp) {
    var tmp = [];

    _.filter(_.keys(temp[0]), function (d) {
      return d.match(/L[0-9]/);
    }).forEach(function (d) {
      var arr = [];
      arr.push({
        resizable: true,
        headerName: "Toolmaker",
        field: d + ".BASICCOST.TOOLMAKER"
      });
      arr.push({
        resizable: true,
        headerName: "Base Cost",
        field: d + ".BASICCOST.VALUE"
      });
      arr.push({
        resizable: true,
        headerName: "Landed Cost",
        field: d + ".LANDEDCOST.VALUE"
      });
      arr.push({
        resizable: true,
        headerName: "No Of Dies",
        field: d + ".NOOFDIES.VALUE"
      });
      arr.push({
        resizable: true,
        headerName: "Die Weight",
        field: d + ".DIEWEIGHT.VALUE"
      });
      arr.push({
        resizable: true,
        headerName: "Cost Per Ton",
        field: d + ".COSTPERTON.VALUE"
      });
      tmp.push({
        resizable: true,
        headerName: d,
        children: arr
      });
    });

    return tmp;
  };

  var zz = new cl();

  function autoSizeAll(gop) {
    var allColumnIds = [];
    gop.columnApi.getAllColumns().forEach(function (column) {
      allColumnIds.push(column.colId);
    });
    gop.columnApi.autoSizeColumns(allColumnIds);
  }

  $scope.baseLineD = {};

  $scope.addCol = function () {
    var tmCol = _.find($scope.gridOptions.columnDefs, function (d) {
      return d.headerName.match(/Toolmaker Preference/g);
    });

    if (tmCol.children.length < $scope.gridOptions.api.getRowNode(0).data.TOOLMAKER.length) {
      zz.addTmLP($scope.gridOptions);
      $("#addFun").click(function () {
        alert("#addFun / #subFun");
        console.log("addFun");
        $scope.addCol();
      });
      $("#subFun").click(function () {
        console.log("subFun");
        $scope.addSub();
      });
    } else {
      toastr.info("Not Valid");
      $scope.gridOptions.columnApi.autoSizeColumns($scope.gridOptions.columnDefs);
    }

    $scope.setting.p = [];
    $scope.setting.l = [];

    _.find($scope.gridOptions.columnDefs, function (d) {
      return d.headerName.match(/Toolmaker Preference/g);
    }).children.forEach(function (d) {
      $scope.setting.p.push({
        key: d.headerName,
        value: true
      });
    });

    _.map($scope.gridOptions.columnDefs, 'headerName').filter(function (d) {
      return d.match(/^L[0-9]/);
    }).map(function (d) {
      $scope.setting.l.push({
        key: d,
        value: true
      });
    });
  };

  $scope.addSub = function () {
    var tmCol = _.find($scope.gridOptions.columnDefs, function (d) {
      return d.headerName.match(/Toolmaker Preference/g);
    });

    if (tmCol.children.length > 1) {
      var rem = tmCol.children.pop();
      var remArr = [];
      $scope.gridOptions.api.forEachLeafNode(function (n, i) {
        if (n.data.SeqPref != undefined && n.data.SeqPref[rem.headerName] != undefined) remArr.push({
          old: {
            ERFQ_COMPARISON_PREFERENCE: {
              "PREFERENCE_SEQ": n.data.SeqPref[rem.headerName]
            }
          }
        });
      });
      console.log("removeArr=>", remArr);
      $.cordys.ajax({
        method: "UpdateErfqComparisonPreference",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        parameters: {
          "tuple": remArr
        },
        success: function success(data) {
          $scope.changePrj(cmm.projectCode, cmm.label, cmm.baslineNum);
          console.log("successfully data deleted");
        },
        error: function error(jqXHR, textStatus, errorThrown) {
          console.log("error");
        }
      });
      $scope.gridOptions.api.setColumnDefs($scope.gridOptions.columnDefs);
      $("#addFun").click(function () {
        console.log("addFun");
        $scope.addCol();
      });
      $("#subFun").click(function () {
        console.log("subFun");
        $scope.addSub();
      });
      toastr.success("Successfully Deleted");
    } else {
      toastr.info("Not Valid");
    }

    $scope.setting.p = [];
    $scope.setting.l = [];

    var tmCol = _.find($scope.gridOptions.columnDefs, function (d) {
      return d.headerName.match(/Toolmaker Preference/g);
    }).children.forEach(function (d) {
      $scope.setting.p.push({
        key: d.headerName,
        value: true
      });
    });

    _.map($scope.gridOptions.columnDefs, 'headerName').filter(function (d) {
      return d.match(/^L[0-9]/);
    }).map(function (d) {
      $scope.setting.l.push({
        key: d,
        value: true
      });
    });
  };

  $scope.baselineSave = function () {
    console.log("baseline save", $scope.baseLineD);
    console.log("cmm", cmm);
    var qr = {
      "new": {
        "ERFQ_BASELINE_MAIN": {
          "PROJECT_CODE": cmm.projectCode,
          "BASELINE_NUM": Number(cmm.baslineNum) + 1,
          "BASELINE_NAME": $scope.baseLineD.name,
          "BASELINE_REMARK": $scope.baseLineD.remark,
          "PREFERENCE": $scope.setting.menus.replace(/\s/g, ''),
          "BASELINE_STATUS": "QUCO"
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
        cmm.baslineNum = cmm.baslineNum != undefined ? Number(cmm.baslineNum) + 1 : 1;
        console.log("$scope.data.erfq_toolmaker_master=>", $scope.data.erfq_toolmaker_master);
        $.cordys.ajax({
          method: "GetQuoteComparisionbyProject",
          namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
          dataType: "* json",
          parameters: {
            ProjectCode: cmm.projectCode,
            baselinenum: cmm.baslineNum,
            GROUP: ""
          },
          success: function success(data) {
            var saveQrData = $.cordys.json.findObjects(data, "ERFQ_QUOTE_COMPARISON");

            if (saveQrData.length == 0) {
              var _a = [];
              $scope.gridOptions.api.forEachNode(function (n, i) {
                _a.push({
                  "new": {
                    "ERFQ_QUOTE_COMPARISON": {
                      "PROJECT_CODE": cmm.projectCode,
                      "PART_NUMBER": n.data.PART_NUMBER,
                      "NEW_PART_GROUP": "",
                      "BASELINE_NUM": cmm.baslineNum,
                      "PART_GROUP": cmm.label
                    }
                  }
                });
              });
              $.cordys.ajax({
                method: "UpdateErfqQuoteComparison",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
                parameters: {
                  "tuple": _a
                },
                success: function success(data) {
                  console.log("success=>");
                  $scope.tableDataSave();
                },
                error: function error() {}
              });
            }
          },
          error: function error(jqXHR, textStatus, errorThrown) {}
        });
      },
      error: function error(jqXHR, textStatus, errorThrown) {}
    });
  };

  $scope.settingFun = function () {
    console.log("$scope.setting=>", $scope.setting);
    console.log("$scope.gridOptions=>", $scope.gridOptions);
    $scope.hideAll($scope.setting.p.length, $scope.setting.l.length);
    var temp = "";

    for (var i = 0; i < $scope.setting.p.length; i++) {
      if ($scope.setting.p[i].value == true) {
        temp = i + 1;
        $scope.gridOptions.columnApi.setColumnVisible(['ToolmakerPref.P' + temp + ''], true);
      }
    }

    var tmp = "";

    for (var j = 0; j < $scope.setting.l.length; j++) {
      if ($scope.setting.l[j].value == true) {
        tmp = j + 1;
        $scope.gridOptions.columnApi.setColumnVisible(['L' + tmp + '.BASICCOST.TOOLMAKER'], true);
        $scope.gridOptions.columnApi.setColumnVisible(['L' + tmp + '.BASICCOST.VALUE'], true);
        $scope.gridOptions.columnApi.setColumnVisible(['L' + tmp + '.LANDEDCOST.VALUE'], true);
        $scope.gridOptions.columnApi.setColumnVisible(['L' + tmp + '.NOOFDIES.VALUE'], true);
        $scope.gridOptions.columnApi.setColumnVisible(['L' + tmp + '.DIEWEIGHT.VALUE'], true);
        $scope.gridOptions.columnApi.setColumnVisible(['L' + tmp + '.COSTPERTON.VALUE'], true);
      }
    }
  };

  $scope.setting = {
    p: [],
    l: [],
    menus: "LANDEDCOST",
    ps: {
      "key": "Select All",
      "value": true,
      f: function f(dt) {
        if (this.value == true) {
          dt.map(function (d) {
            d.value = true;
            return d;
          });
        }
      }
    },
    ls: {
      "key": "Select All",
      "value": true,
      f: function f(dt) {
        if (this.value == true) {
          dt.map(function (d) {
            d.value = true;
            return d;
          });
        }
      }
    }
  };

  $scope.setLab = function (d) {
    $scope.cmm.label = $scope.cmm.label;
  };

  $scope.tableDataSave = function () {
    var arr = [];
    $scope.gridOptions.api.forEachNode(function (node, i) {
      _.keys(node.data.ToolmakerPref).forEach(function (d) {
        var temp = {
          "new": {
            ERFQ_COMPARISON_PREFERENCE: {
              "PROJECT_CODE": cmm.projectCode,
              "PART_NUMBER": node.data.PART_NUMBER,
              "BASELINE_NUM": cmm.baslineNum,
              "LEVEL_PREFERNCE": node.data[d.replace("P", "L")] == undefined || node.data[d.replace("P", "L")].BASICCOST == undefined || node.data[d.replace("P", "L")].BASICCOST.TOOLMAKER ? "" : node.data[d.replace("P", "L")].BASICCOST.TOOLMAKER,
              "TOOLMAKER_PREFERNCE": node.data.ToolmakerPref[d] != undefined ? node.data.ToolmakerPref[d] : "",
              "PREFERENCE_NUM": d,
              "JUSTIFICATION": node.data.JUSTIFICATION,
              "CATEGORY": cmm.label
            }
          }
        };

        if (node.data.SeqPref != undefined && node.data.SeqPref[d] != undefined && node.data.SeqPref[d] != "") {
          temp.old = {
            ERFQ_COMPARISON_PREFERENCE: {
              "PREFERENCE_SEQ": node.data.SeqPref[d]
            }
          };
        }

        arr.push(temp);
      });
    });
    console.log("req=>", arr);
    $.cordys.ajax({
      method: "UpdateErfqComparisonPreference",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "tuple": arr
      },
      success: function success(data) {
        console.log("success");
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        console.log("error");
      }
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
    $scope.gridOptions.api.exportDataAsCsv(params);
  };

  $scope.gridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true
    },
    headerHeight: 40,
    rowHeight: 40,
    pagination: true,
    paginationPageSize: 10,
    columnDefs: [{
      headerName: "PART_NUMBER",
      field: "PART_NUMBER"
    }],
    components: {
      moodEditor: DropDownTemplate,
      customHeaderGroupComponent: htmlText
    },
    rowData: null
  };
  $scope.data = {};
  $scope.cmm = cmm;
  $scope.cmm.label = _.keys(cmm.selectedPartNumber)[0];
  console.log(cmm);
  setTimeout(function () {
    $("#subFun").click(function () {
      console.log("subFun");
      $scope.addSub();
    });
    $("#addFun").click(function () {
      console.log("addFun");
      $scope.addCol();
    });
  }, 1000);

  $scope.changePrj = function (projectCode, panelGroup, bNum) {
    if (cmm.baslineNum == undefined) {
      cmm.baslineNum = "";
    } else {
      cmm.baslineNum = Number(cmm.baslineNum);
    }

    $.cordys.ajax({
      method: "GetERFQComparisonData",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "comparisonType": "Preference",
        "panelGroup": panelGroup,
        "projectCode": projectCode,
        "baselineNum": cmm.baslineNum,
        "budgeted": "",
        "partNum": cmm.selectedPartNumber[$scope.cmm.label],
        "decimalPlace": "5",
        "preferences": "",
        "ComparePref": "LandedCost",
        "toolmakersRequired": '',
        "panelGrouping": ''
      },
      success: function success(data) {
        var temp = $.cordys.json.findObjects(data, "COMPARISON");

        if (temp.length > 0) {
          $scope.gridOptions.columnDefs = [{
            headerName: "PART_NUMBER",
            field: "PART_NUMBER"
          }];
          temp = zz.initPro(temp);
          $scope.gridOptions.columnDefs.push(zz.addTm(temp));
          console.log("$scope.gridOptions.columnDefs=>", $scope.gridOptions.columnDefs);
          $scope.gridOptions.columnDefs.push({
            headerName: "Justification",
            field: "JUSTIFICATION",
            resizable: true,
            editable: true
          });
          $scope.gridOptions.columnDefs = _.concat($scope.gridOptions.columnDefs, zz.addAuto(temp));

          if (window.location.hash.match(/prefTmkComp/g)) {
            $scope.gridOptions.api.setColumnDefs($scope.gridOptions.columnDefs);
            console.log("show data=>", temp);
            $scope.gridOptions.api.setRowData(temp);
            $scope.makeHeader();
            $scope.settleData();
            $scope.$apply();
            autoSizeAll($scope.gridOptions);
          }
        } else {
          console.log("no data on base line ");
        }
      },
      error: function error(jqXHR, textStatus, errorThrown) {}
    });
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
          if (d.BASELINE_STATUS == "Submitted") $scope.baseLineLead.ch.push({
            "key": d.BASELINE_NUM,
            value: true,
            status: d.BASELINE_STATUS,
            name: d.BASELINE_NAME
          });else $scope.baseLineLead.ch.push({
            "key": d.BASELINE_NUM,
            value: false,
            status: d.BASELINE_STATUS,
            name: d.BASELINE_NAME
          });
          $scope.$apply();
        });

        if (d != undefined) {
          $(d).modal("show");
        }
      },
      error: function error(jqXHR, textStatus, errorThrown) {}
    });
  };

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
    });
  };

  $scope.hideAll = function (countPTm, countLCols) {
    for (var i = 1; i <= countPTm; i++) {
      $scope.gridOptions.columnApi.setColumnVisible(['ToolmakerPref.P' + i + ''], false);
    }

    for (var j = 1; j <= countLCols; j++) {
      $scope.gridOptions.columnApi.setColumnVisible(['L' + j + '.BASICCOST.VALUE'], false);
      $scope.gridOptions.columnApi.setColumnVisible(['L' + j + '.LANDEDCOST.VALUE'], false);
      $scope.gridOptions.columnApi.setColumnVisible(['L' + j + '.NOOFDIES.VALUE'], false);
      $scope.gridOptions.columnApi.setColumnVisible(['L' + j + '.DIEWEIGHT.VALUE'], false);
      $scope.gridOptions.columnApi.setColumnVisible(['L' + j + '.COSTPERTON.VALUE'], false);
    }
  };

  $scope.$watchCollection('cmm', function (newValue, oldValue) {
    $scope.data.dynamicCnt = 1;
    if (newValue != undefined && !_.isEqual(oldValue, newValue)) $scope.changePrj(newValue.projectCode, newValue.label, cmm.baslineNum);
  }, true);

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
        "comparisonType": "Preference",
        "panelGroup": $scope.cmm.label,
        "projectCode": $scope.cmm.projectCode,
        "budgeted": cmm.filtObj != undefined && cmm.filtObj.filterBT != undefined ? cmm.filtObj.filterBT : '',
        "partNum": cmm.selectedPartNumber[$scope.cmm.label],
        "baselineNum": $scope.cmm.baslineNum,
        "decimalPlace": "5",
        "preferences": "",
        "ComparePref": "LandedCost",
        "toolmakersRequired": cmm.filtObj != undefined && cmm.filtObj.filtReq != undefined ? cmm.filtObj.filtReq : '',
        "panelGrouping": cmm.filtObj != undefined && cmm.filtObj.filterPG != undefined ? cmm.filtObj.filterPG : '',
        "materialGrade": cmm.filtObj != undefined && cmm.filtObj.filterMG != undefined ? cmm.filtObj.filterMG : ''
      },
      success: function success(data) {
        $scope.gridOptions.data = $.cordys.json.findObjects(data, "COMPARISON");
        console.log("filtered: ", $scope.gridOptions.data);
        $scope.gridOptions2.api.setRowData($scope.gridOptions.data);
        $scope.gridOptions2.columnDefs.splice(7);
        $scope.colAdd($scope.gridOptions.data);
        $scope.settleData();
        console.log("Filtered BasicCost: ", $scope.gridOptions2.columnDefs);
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
    $scope.changePrj($scope.cmm.projectCode, $scope.cmm.label, $scope.cmm.baslineNum);
  };

  if (cmm.projectCode == undefined) toastr.warning("Select ProjectCode");else $scope.changePrj(cmm.projectCode, cmm.label, cmm.baslineNum);
});