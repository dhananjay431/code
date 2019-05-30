"use strict";

angular.module('App.quoteComparisionCtrl').controller('targetCostCtrl', function ($scope, Upload, $window, $log, $state, NgTableParams, cmm) {
  $scope.cmm = cmm;
  $scope.cmm.label = 'A';
  $scope.gridOptions = {
    pagination: true,
    paginationPageSize: 10,
    components: {
      moodEditor: DropDownTemplate,
      customHeaderGroupComponent: CustomHeaderGroup,
      htmlText: htmlText,
      genderCellRenderer: CellRender,
      cellSelect: CellSelect
    },
    columnDefs: [{
      headerName: "PART_NUMBER",
      field: "PART_NUMBER"
    }],
    rowData: null
  };
 $scope.xlSave = function(){
  $scope.gridOptions.api.forEachLeafNode((n,i)=>{
    var keys = _.keys(n.data).filter((d)=>{
      return d.match(/^C/i);
    })



  })
 }
  function jqCall() {
    $("#rAdd").click(function () {
      $scope.pushRcolDef();
    });
    $("#rSub").click(function () {
      $scope.rmRcolDef();
    });
    $("#cAdd").click(function () {
      $scope.pushCcolDef();
    });
    $("#cSub").click(function () {
      $scope.rmCcolDef();
    });
    $("#tmkrAdd").click(()=>{
      tmkrAdd($scope.gridOptions);
    })
    $("#tmkrSub").click(()=>{
      console.log("tmkrSub");
    })
  }
  $scope.htmTmkrAdd =function(){
    tmkrAdd($scope.gridOptions);
  }

  function tmkrAdd(gop){
  var newAdd = "";
  var rArr = gop.columnDefs.filter(function (d) {
    return d.headerName.match(/Toolmaker Preference_$/i);
  });
  if (rArr.length > 0) {
    newAdd = "Toolmaker" + (Number(rArr[0].children.length) + 1);
  }
  gop.api.forEachLeafNode(function (n, i) {
    n.data[newAdd] = "";
  });

  if (rArr.length > 0) {
    rArr[0].children.push(
      {
        headerName: newAdd,
        field: newAdd,
        editable: true, 
        cellRenderer: 'genderCellRenderer',
        cellRendererParams: function cellRendererParams(params) {
          var _t = _.map(params.data.dropTm, function (d) {
            return {
              value: d.TOOLMAKER_NAME,
              key: d.TOOLMAKER_ID
            };
          });
          return {
            params2: _t
          };
        },
        cellEditorSelector: function cellEditorSelector(params) {
          var _t = _.map(params.data.dropTm, function (d) {
            return { text: d.TOOLMAKER_NAME, value: d.TOOLMAKER_ID };
          });
          return {
            component: 'cellSelect',
            params: {
              values: _t
            }
          };
        }
      }
    )
    console.log("gop.columnDefs R ADDED=>", gop.columnDefs);
    gop.api.setColumnDefs(angular.copy(gop.columnDefs));
    setTimeout(()=>{
      jqCall();
    },500);
  }
  
  }
  function xmltojson(data, key) {
    return $.cordys.json.findObjects(data, key);
  }

  function autoSizeAll(data) {
    var allColumnIds = [];
    data.columnApi.getAllColumns().forEach(function (column) {
      allColumnIds.push(column.colId);
    });
    data.columnApi.autoSizeColumns(allColumnIds);
  }

  function post(method, qr, success, cb) {
    $.cordys.ajax({
      method: method,
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: qr,
      success: success,
      cb: cb
    });
  }

  function initPro(temp) {
    return _.map(temp, function (d) {
      var rArr = _.keys(d).filter(function (d1) {
        return d1.match(/^R[0-9]/i);
      });

      if (rArr.length == 0) {
        d.R1 = {
          PROJECTCODE: "",
          PARTNUMBER: "",
          NOMENCLATURE: "",
          TOOLMAKER: "",
          BASICCOST: "",
          LANDEDCOST: "",
          NOOFDIES: "",
          DIEWEIGHT: "",
          COSTPERTON: ""
        };
      }

      var ll = _.keys(d.LANDEDCOST);

      for (var i = 1; i <= ll.length; i++) {
        d['L' + i] = {
          LANDEDCOST: d.LANDEDCOST['L' + i],
          NOOFDIES: d.NOOFDIES['L' + i],
          DIEWEIGHT: d.DIEWEIGHT['L' + i],
          BASICCOST: d.BASICCOST['L' + i],
          COSTPERTON: d.BASICCOST['L' + i]
        };
      };
      return d;
    });
  }
  function commDisc(data) {
    var cArr = _.filter(_.keys(data[0]), function (d) {
      return d.match(/^C[0-9]/);
    });

    if (cArr.length == 0) {
      data.forEach(function (d) {
        d.C1 = {
          key: "",
          value: ""
        };
      });
    }
    var tmkr = _.filter(_.keys(data[0]), function (d) {
      return d.match(/^Toolmaker[0-9]/);
    });
    if (tmkr.length == 0) {
      data.forEach(function (d) {
        d.Toolmaker1 = "";
      });
    }
    if (_.keys(data[0]).indexOf("Remark") == -1) {
      data.forEach(function (d) {
        d.Remark = "";
      });
    }
  }
  function rmC(gop) {
    var t = gop.columnDefs.filter(function (d) {
      return d.headerName.match(/^C[0-9]/i);
    });
    if (t.length > 1) {
      var id = _.findIndex(gop.columnDefs, t[t.length - 1]);
      gop.columnDefs.splice(id, 1);
      console.log(gop.columnDefs);
      gop.api.setColumnDefs(angular.copy(gop.columnDefs));
    } else {
      toastr.warning("Not a Valid");
    }
    jqCall();
  }

  function rmR(gop) {
    var t = gop.columnDefs.filter(function (d) {
      return d.headerName.match(/^R[0-9]/i);
    });

    if (t.length > 1) {
      var id = _.findIndex(gop.columnDefs, t[t.length - 1]);

      gop.columnDefs.splice(id, 1);
      console.log(gop.columnDefs);
      gop.api.setColumnDefs(angular.copy(gop.columnDefs));
    } else {
      toastr.warning("Not a Valid");
    }

    jqCall();
  }

  function pushC(gop) {
    debugger;

    var cArr = _.filter(gop.columnDefs, function (d) {
      return d.headerName.match(/^C[0-9]/i);
    });

    if (cArr.length > 0) {
      var lastIndex = _.findIndex(gop.columnDefs, cArr[cArr.length - 1]);

      var cellEditorSelector = function cellEditorSelector(params) {
        debugger;
        return {
          component: 'moodEditor',
          params: {
            values: _.map(params.data.dropTm, 'TOOLMAKER_NAME')
          }
        };
      };

      var arr = [];
      var d = "C" + (cArr.length + 1);
      gop.api.forEachNode(function (node, index) {
        node.data[d] = {
          key: "",
          value: ""
        };
      });
      arr.push({
        headerName: "Key",
        field: d + ".key",
        editable: true
      });
      arr.push({
        headerName: "Value",
        field: d + ".value",
        editable: true,
        cellRenderer: 'genderCellRenderer',
        cellRendererParams: function cellRendererParams(params) {
          var _t = _.map(params.data.dropTm, function (d) {
            return {
              value: '<i class="fas fa-rupee-sign"></i>' + d.TOOLMAKER_NAME,
              key: d.TOOLMAKER_ID
            };
          });

          return {
            params2: _t
          };
        },
        cellEditorSelector: function cellEditorSelector(params) {
          var _t = _.map(params.data.dropTm, function (d) {
            return {
              text: d.TOOLMAKER_NAME,
              value: d.TOOLMAKER_ID
            };
          });

          return {
            component: 'cellSelect',
            params: {
              values: _t
            }
          };
        }
      });
      gop.columnDefs.splice(lastIndex + 1, 0, {
        headerName: d,
        children: arr,
        headerGroupComponent: 'customHeaderGroupComponent'
      });
      gop.api.setColumnDefs(angular.copy(gop.columnDefs));
      jqCall();
    }
  }

  function pushR(gop) {
    var newAdd = "";
    var rArr = gop.columnDefs.filter(function (d) {
      return d.headerName.match(/^R[0-9]/i);
    });

    if (rArr.length > 0) {
      newAdd = "R" + (Number(rArr.length) + 1);
    }

    gop.api.forEachLeafNode(function (n, i) {
      n.data[newAdd] = {
        PROJECTCODE: "",
        PARTNUMBER: "",
        NOMENCLATURE: "",
        TOOLMAKER: "",
        BASICCOST: "",
        LANDEDCOST: "",
        NOOFDIES: "",
        DIEWEIGHT: "",
        COSTPERTON: ""
      };
    });

    if (rArr.length > 0) {
      gop.columnDefs.splice(_.findIndex(gop.columnDefs, {
        headerName: "L1"
      }), 0, {
        headerName: newAdd,
        children: rCol(newAdd),
        headerGroupComponent: 'customHeaderGroupComponent'
      });
      console.log("gop.columnDefs R ADDED=>", gop.columnDefs);
      gop.api.setColumnDefs(angular.copy(gop.columnDefs));
    }

    jqCall();
  }

  function rCol(colKey) {
    var arr = [];
    arr.push({
      editable: true,
      headerName: "PROJECTCODE",
      field: colKey + ".PROJECTCODE"
    });
    arr.push({
      editable: true,
      headerName: "PARTNUMBER",
      field: colKey + ".PARTNUMBER",
      columnGroupShow: 'open'
    });
    arr.push({
      editable: true,
      headerName: "NOMENCLATURE",
      field: colKey + ".NOMENCLATURE",
      columnGroupShow: 'open'
    });
    arr.push({
      editable: true,
      headerName: "TOOLMAKER",
      field: colKey + ".TOOLMAKER",
      columnGroupShow: 'open'
    });
    arr.push({
      editable: true,
      headerName: "BASICCOST",
      field: colKey + ".BASICCOST",
      columnGroupShow: 'open'
    });
    arr.push({
      editable: true,
      headerName: "LANDEDCOST",
      field: colKey + ".LANDEDCOST",
      columnGroupShow: 'open'
    });
    arr.push({
      editable: true,
      headerName: "NOOFDIES",
      field: colKey + ".NOOFDIES",
      columnGroupShow: 'open'
    });
    arr.push({
      editable: true,
      headerName: "DIEWEIGHT",
      field: colKey + ".DIEWEIGHT",
      columnGroupShow: 'open'
    });
    arr.push({
      editable: true,
      headerName: "COSTPERTON",
      field: colKey + ".COSTPERTON",
      columnGroupShow: 'open'
    });
    return arr;
  }

  function addR(temp) {
    var tmp = [];

    _.filter(_.keys(temp[0]), function (x1) {
      return x1.match(/^R[0-9]/);
    }).forEach(function (d) {
      tmp.push({
        headerName: d + '<div class="float-right"><i id="rSub" class="border rounded-circle bg-danger text-light fas fa-minus" style="font-size: 25px;"></i> <i id="rAdd"  class="border rounded-circle bg-success text-light   fas fa-plus " style="font-size: 25px;"></i></div>',
        children: rCol(d),
        headerGroupComponent: 'customHeaderGroupComponent'
      });
    });

    return tmp;
  }

  function gridopInit() {
    return [{
      headerName: "PART_NUMBER",
      field: "PART_NUMBER"
    }];
  }

  function changePrjQr(projectCode, panelGroup, bNum, cmm) {
    return {
      "comparisonType": "TargetCost",
      "panelGroup": panelGroup,
      "projectCode": projectCode,
      "baselineNum": cmm.baslineNum,
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
        cellClass: ['ToolmakerPref'],
        // columnGroupShow: 'open',
        editable: true,
        cellRenderer: 'genderCellRenderer',
        cellRendererParams: function cellRendererParams(params) {
          var _t = _.map(params.data.dropTm, function (d) {
            return {
              value: d.TOOLMAKER_NAME,
              key: d.TOOLMAKER_ID
            };
          });

          return {
            params2: _t
          };
        },
        cellEditorSelector: function cellEditorSelector(params) {
          var _t = _.map(params.data.dropTm, function (d) {
            return {
              text: d.TOOLMAKER_NAME,
              value: d.TOOLMAKER_ID
            };
          });

          return {
            component: 'cellSelect',
            params: {
              values: _t
            }
          };
        }
        // editable: true,
        // cellEditorSelector: function cellEditorSelector(params) {
        //   debugger;
        //   return {
        //     component: 'moodEditor',
        //     params: {
        //       values: _.map(params.data.TOOLMAKER, 'ID')
        //     }
        //   };
        // }
      };
      TOOLMAKER.push(z);
    });
    delete TOOLMAKER[0].columnGroupShow;
    return {
      headerName: 'Toolmaker Preference',
      headerGroupComponent: 'customHeaderGroupComponent',
      width: '300px',
      children: TOOLMAKER
    };
  }

  function addTmkColDef(temp) {
    var tmp = [];
    _.filter(_.keys(temp[0]), function (d) {
      return d.match(/^Toolmaker[0-9]/i);
    }).forEach(function (d) {
      var arr = [];
      arr.push({ headerName: d, field: d, 
        editable: true, 
        cellRenderer: 'genderCellRenderer',
        cellRendererParams: function cellRendererParams(params) {
          var _t = _.map(params.data.dropTm, function (d) {
            return {
              value: d.TOOLMAKER_NAME,
              key: d.TOOLMAKER_ID
            };
          });
          return {
            params2: _t
          };
        },
        cellEditorSelector: function cellEditorSelector(params) {
          var _t = _.map(params.data.dropTm, function (d) {
            return { text: d.TOOLMAKER_NAME, value: d.TOOLMAKER_ID };
          });
          return {
            component: 'cellSelect',
            params: {
              values: _t
            }
          };
        }
      });
      tmp.push({
        width:300,
        headerName: '<div class="float-right"><i id="tmkrSub" class="border rounded-circle bg-danger text-light fas fa-minus" style="font-size: 25px;"></i> <i id="tmkrAdd"  class="border rounded-circle bg-success text-light   fas fa-plus " style="font-size: 25px;"></i></div>'+'Toolmaker Preference_',
        children: arr,
        //Toolmaker Preference
     //   headerGroupComponent: 'customHeaderGroupComponent'

      });
    });

    tmp.push({
      headerName: "Remark",
      field: "Remark",
      editable: true
    });
    return tmp;
  }

  function addCommDisc(temp) {
    var tmp = [],
        cellEditorSelector = function cellEditorSelector(params) {
      var _t = _.map(params.data.dropTm, 'TOOLMAKER_NAME');

      _t.splice(0, 0, 'Select');

      return {
        component: 'moodEditor',
        params: {
          values: _t
        }
      };
    };

    _.filter(_.keys(temp[0]), function (d) {
      return d.match(/^C[0-9]/i);
    }).forEach(function (d) {
      var arr = [];
      arr.push({
        headerName: "Key",
        field: d + ".key",
        editable: true
      });
      arr.push({
        headerName: "Value",
        field: d + ".value",
        editable: true,
        cellRenderer: 'genderCellRenderer',
        cellRendererParams: function cellRendererParams(params) {
          var _t = _.map(params.data.dropTm, function (d) {
            return {
              value: d.TOOLMAKER_NAME,
              key: d.TOOLMAKER_ID
            };
          });

          return {
            params2: _t
          };
        },
        cellEditorSelector: function cellEditorSelector(params) {
          var _t = _.map(params.data.dropTm, function (d) {
            return {
              text: d.TOOLMAKER_NAME,
              value: d.TOOLMAKER_ID
            };
          });

          return {
            component: 'cellSelect',
            params: {
              values: _t
            }
          };
        }
      });
      tmp.push({
        headerName: d + '<div class="float-right"><i id="cSub" class="border rounded-circle bg-danger text-light fas fa-minus" style="font-size: 25px;"></i> <i id="cAdd"  class="border rounded-circle bg-success text-light   fas fa-plus " style="font-size: 25px;"></i></div>',
        children: arr,
        headerGroupComponent: 'customHeaderGroupComponent'
      });
    });

    return tmp;
  }

  function addL(temp) {
    var tmp = [];

    _.filter(_.keys(temp[0]), function (d) {
      return d.match(/L[0-9]/);
    }).forEach(function (d) {
      var arr = [];
      arr.push({
        headerName: "Base Cost",
        field: d + ".BASICCOST.VALUE"
      });
      arr.push({
        headerName: "Landed Cost",
        field: d + ".LANDEDCOST.VALUE",
        columnGroupShow: 'open'
      });
      arr.push({
        headerName: "No Of Dies",
        field: d + ".NOOFDIES.VALUE",
        columnGroupShow: 'open'
      });
      arr.push({
        headerName: "Die Weight",
        field: d + ".DIEWEIGHT.VALUE",
        columnGroupShow: 'open'
      });
      arr.push({
        headerName: "Cost Per Ton",
        field: d + ".COSTPERTON.VALUE",
        columnGroupShow: 'open'
      });
      tmp.push({
        headerName: d,
        children: arr,
        headerGroupComponent: 'customHeaderGroupComponent'
      });
    });

    return tmp;
  }

  $scope.createExcel = function () {
    $scope.gridOptions.api.forEachNode(function (node, index) {
      console.log(node.data);
    });
  };

  $scope.addRColNewDef = function () {
    pushR($scope.gridOptions);
  };

  $scope.pushRcolDef = function () {
    pushR($scope.gridOptions);
  };

  $scope.rmRcolDef = function () {
    rmR($scope.gridOptions);
  };

  $scope.pushCcolDef = function () {
    pushC($scope.gridOptions);
  };

  $scope.rmCcolDef = function () {
    rmC($scope.gridOptions);
  };

  function mainCall(projectCode, panelGroup, bNum, cmm, tmArr) {
    post('GetERFQComparisonData', changePrjQr(projectCode, panelGroup, bNum, cmm), function (data) {
      var temp = xmltojson(data, "TARGETCOMPARISON");
      temp.forEach(function (d) {
        d.dropTm = tmArr;
      });
      temp = initPro(temp);
      commDisc(temp);
      console.log("after commDuisc=>", temp);
      console.log("grid-data=>", temp);
      $scope.gridOptions.api.setRowData(temp);
      $scope.gridOptions.columnDefs = gridopInit();
      $scope.gridOptions.columnDefs.push(addTm(temp));
      $scope.gridOptions.columnDefs = _.concat($scope.gridOptions.columnDefs, addR(temp));
      $scope.gridOptions.columnDefs = _.concat($scope.gridOptions.columnDefs, addL(temp));
      $scope.gridOptions.columnDefs = _.concat($scope.gridOptions.columnDefs, addCommDisc(temp));
      $scope.gridOptions.columnDefs = _.concat($scope.gridOptions.columnDefs, addTmkColDef(temp));
      console.log("after add C col def=>", $scope.gridOptions.columnDefs);
      $scope.gridOptions.columnDefs.forEach(d=>{
        d.width = 400;
      })

      $scope.gridOptions.api.setColumnDefs($scope.gridOptions.columnDefs);
      autoSizeAll($scope.gridOptions);
      jqCall();
    }, function (e1, e2, e3) {});
  }

  $scope.changePrj = function (projectCode, panelGroup, bNum) {
    post('GetToolMakersforCompair', function (pcode, pgroup) {
      return {
        projectCode: pcode,
        panelGroup: pgroup
      };
    }(projectCode, panelGroup), function (data) {
      mainCall(projectCode, panelGroup, bNum, cmm, xmltojson(data, "ERFQ_TOOLMAKER_MASTER"));
    }, function (e1, e2, e3) {});
  };

  $scope.$watchCollection('cmm', function (newValue, oldValue) {
    if (newValue.projectCode != oldValue.projectCode || newValue.label != oldValue.label) $scope.changePrj(newValue.projectCode, newValue.label, cmm.baslineNum);
  }, true);
  if ($scope.cmm.projectCode == undefined) toastr.warning("Select ProjectCode");else $scope.changePrj($scope.cmm.projectCode, $scope.cmm.label, cmm.baslineNum);
});