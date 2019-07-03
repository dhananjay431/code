"use strict";

angular.module('App.dieCostEstimationController', ['ui.router', 'ngAnimate', 'ngSanitize', 'ui.bootstrap', 'App.plugins']).config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
  $stateProvider.state('dieCostEstimation', {
    url: '/dieCostEstimation',
    templateUrl: 'app/dieCostEstimation/dieCostEstimation.tpl.htm',
    controller: 'dieCostEstimationController as vm',
    params: {
      rowNo: null,
      rowDetails: null,
      projDetails: null
    }
  });
}).controller('dieCostEstimationController', function ($scope, $stateParams, $state) {
  var vm = this;
  $scope.loggedUserID = [];
  $("#fileUpload").click(function () {
    $("input[type='file']").trigger('click');
  });
  $('input[type="file"]').on('change', function (e) {
    xlsx.read(e.target, function (data) {
      var ky = _.keys(data);

      $scope.dataArr[0] = data[ky[0]];
      $scope.valCh();
      $scope.$apply();
    });
  });

  $scope.downloadXl = function () {
    console.log("dataArr=>", $scope.dataArr[0]);
    var filename = "write" + new Date().getTime() + ".xlsx";
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet($scope.dataArr[0]), "DieCost", {
      compression: true
    });
    XLSX.writeFile(wb, filename);
  };

  $.cordys.ajax({
    method: "GetLoggedInUserID",
    namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
    dataType: "* json",
    async: false,
    success: function success(e) {
      console.log(e);
      $scope.loggedUserID = $.cordys.json.findObjects(e, "getLoggedInUserID")[0];
      $scope.username = $scope.loggedUserID.getLoggedInUserID;
    },
    error: function error(jqXHR, textStatus, errorThrown) {
      alert("Error in loading data");
    }
  });
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
      console.log(e);
      $scope.roles1 = $.cordys.json.findObjects(e, "user");

      for (var i = 0; i < $scope.roles1[0].role.length; i++) {
        $scope.CordysRole = $scope.CordysRole + "," + $scope.roles1[0].role[i].description;
      }

      if ($scope.CordysRole.includes("MSIE")) {
        $scope.roles = "MSIE";
      }

      if ($scope.CordysRole.includes("Toolmaker")) {
        $scope.roles = "Toolmaker";
      }
    },
    error: function error(jqXHR, textStatus, errorThrown) {
      toastr.error("Error in loading data");
    }
  });

  $scope.status = function (d) {
    $scope.statusFlag = d;
  };

  $scope.saveStatus = function () {
    console.log("$scope.statusFlag=>", $scope.statusFlag);
    console.log("$scope.PROCESS_PARTS_SEQ=>", $scope.PROCESS_PARTS_SEQ);
    console.log("data", $scope.data);
    $scope.saveDecisionCur($scope.PROCESS_PARTS_SEQ, $scope.statusFlag, $scope.data.curr);
  };

  $scope.saveDecisionCur = function (seq, decision, curr) {
    $.cordys.ajax({
      method: "UpdateErfqProcessParts",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      parameters: {
        "tuple": {
          "old": {
            "ERFQ_PROCESS_PARTS": {
              PROCESS_PARTS_SEQ: seq
            }
          },
          "new": {
            "ERFQ_PROCESS_PARTS": {
              DIE_COST_DECISION: decision,
              CURRENCY_UNIT: curr
            }
          }
        }
      },
      dataType: "* json",
      async: false,
      success: function success(e) {
        toastr.success("Successfully Saved");
        $state.go('erfqInbox');
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Error while saving currency and decision in process parts.");
      }
    });
  };

  function GetDetailsforDieCostByPartNum(bata) {
    $.cordys.ajax({
      method: "GetDetailsforDieCostByPartNum",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      parameters: {
        ERFQNum: $scope.data.projDetails.ERFQ_NUMBER,
        partNumber: $scope.data.rowDetails.PART_NUMBER
      },
      dataType: "* json",
      async: false,
      success: function success(e) {
        var d = $.cordys.json.findObjects(e, 'ERFQ_PROCESS_PARTS');
        $scope.ERFQ_PROCESS_PARTS = $.cordys.json.findObjects(e, 'ERFQ_PROCESS_PARTS');
        $scope.statusFlag = d[0].DIE_COST_DECISION;
        if (d[0].CURRENCY_UNIT != null && d[0].CURRENCY_UNIT != undefined) $scope.data.curr = d[0].CURRENCY_UNIT;
        $scope.data.toolmaker_name = d[0].TOOLMAKER_NAME;
        console.log("GetDetailsforDieCostByPartNum=>", d);
        GetFactorsbyProject(bata);
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
  }

  function GetFactorsbyProject(bata) {
    $.cordys.ajax({
      method: "GetFactorsbyProject",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      parameters: {
        projectCode: $scope.data.projDetails.PROJECT_CODE,
        factor: 'Currency'
      },
      dataType: "* json",
      async: false,
      success: function success(e) {
        console.log("CUS");
        var curr = $.cordys.json.findObjects(e, "ERFQFACTOR");
        $scope.curr = curr.map(function (d) {
          return {
            key: d.FACTOR,
            value: d.FACTOR_NAME
          };
        });
        GetSeqNoByErfqAndPartNumber(bata);
      },
      error: function error(jqXHR, textStatus, errorThrown) {}
    });
  }

  function GetSeqNoByErfqAndPartNumber(bata) {
    $.cordys.ajax({
      method: "GetSeqNoByErfqAndPartNumber",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "erfqNumber": $scope.data.projDetails.ERFQ_NUMBER,
        "partNumber": $scope.data.rowDetails.PART_NUMBER
      },
      success: function success(data) {
        $scope.PROCESS_PARTS_SEQ = $.cordys.json.findObjects(data, "erfq_process_parts")[0].PROCESS_PARTS_SEQ;
        GetDieCostByPartandERFQNo(bata);
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Error in loading data");
      }
    });
  }

  function GetDieCostByPartandERFQNo(bata) {
    $.cordys.ajax({
      method: "GetDieCostByPartandERFQNo",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      parameters: {
        ERFQNum: $scope.data.projDetails.ERFQ_NUMBER,
        partNumber: $scope.data.rowDetails.PART_NUMBER
      },
      dataType: "* json",
      async: false,
      success: function success(e) {
        console.log("GetDieCostByPartandERFQNo=>", $.cordys.json.findObjects(e, "ERFQ_DIE_COST_DATA"));
        var prevData = $.cordys.json.findObjects(e, "ERFQ_DIE_COST_DATA");

        if (prevData.length == 0) {
          vm.data = {
            "PROJECT_CODE": $scope.data.projDetails.PROJECT_CODE,
            "ERFQ_NUMBER": $scope.data.projDetails.ERFQ_NUMBER,
            "PART_NUMBER": $scope.data.rowDetails.PART_NUMBER,
            "PART_NAME": $scope.data.rowDetails.NOMENCLATURE,
            "OP_NUMBER": "",
            "OP_NAME": "",
            "TOOL_SIZE_L_TO_R": "",
            "TOOL_SIZE_F_TO_B": "",
            "TOOL_SIZE_SH": "",
            "TOOL_WEIGHT": "",
            "DIE_CFQTY": "",
            "SIMULATION_HR": "",
            "SIMULATION_COST": "",
            "DIE_DESIGN_HRS": "",
            "DIE_DESIGN_COST": "",
            "CNC_PROGRAM_COST": "",
            "CNC_PROGRAM_HRS": "",
            "CASTING_WEIGHT": "",
            "TOOL_STEEL_WEIGHT": "",
            "RAW_MATERIAL_INCL_CASTING": "",
            "MATERIAL_COST_STD_ITEMS": "",
            "MACHINING_HRS": "",
            "MACHINING_COST": "",
            "ASSY_FINISHING_HRS": "",
            "ASSY_FINISHING_COST": "",
            "TRYOUT_HRS": "",
            "TRYOUT_COST": "",
            "TOTAL_MANUFACTURING_COST": "",
            "FOB_CHARGE": "",
            "FOB_TOTAL": "",
            "ESTIMATED_TONNAGE": "",
            "SPM_COMMITTED": "",
            "YIELD": "",
            "EST_BANK": "",
            "NO_OF_DIES": "",
            "NO_OF_CHECKING_FIXTURE": "",
            "TOTAL_WEIGHT": "",
            "COST_TON": "",
            "TOTAL_COST": "",
            "NO_OF_PARTS": "",
            "DIE_COST_ROW_NUM": "",
            "DIE_COST_REVISION": 1,
            "DIE_COST_VERSION": "LATEST"
          };

          for (var i = 0; i < 15; i++) {
            $scope.dataArr.push(angular.copy(vm.data));
            $scope.dataArr[i].DIE_COST_ROW_NUM = i + 1;
          }

          $scope.dataArr = _.chunk($scope.dataArr, 15);
          console.log("vm.dataArr=>", $scope.dataArr);
          $scope.$apply();
        } else {
          var prev = _.max(_.map(prevData, 'DIE_COST_REVISION'));

          vm.data = {
            "PROJECT_CODE": $scope.data.projDetails.PROJECT_CODE,
            "ERFQ_NUMBER": $scope.data.projDetails.ERFQ_NUMBER,
            "PART_NUMBER": $scope.data.rowDetails.PART_NUMBER,
            "PART_NAME": $scope.data.rowDetails.NOMENCLATURE,
            "OP_NUMBER": "",
            "OP_NAME": "",
            "TOOL_SIZE_L_TO_R": "",
            "TOOL_SIZE_F_TO_B": "",
            "TOOL_SIZE_SH": "",
            "TOOL_WEIGHT": "",
            "DIE_CFQTY": "",
            "SIMULATION_HR": "",
            "SIMULATION_COST": "",
            "DIE_DESIGN_HRS": "",
            "DIE_DESIGN_COST": "",
            "CNC_PROGRAM_COST": "",
            "CNC_PROGRAM_HRS": "",
            "CASTING_WEIGHT": "",
            "TOOL_STEEL_WEIGHT": "",
            "RAW_MATERIAL_INCL_CASTING": "",
            "MATERIAL_COST_STD_ITEMS": "",
            "MACHINING_HRS": "",
            "MACHINING_COST": "",
            "ASSY_FINISHING_HRS": "",
            "ASSY_FINISHING_COST": "",
            "TRYOUT_HRS": "",
            "TRYOUT_COST": "",
            "TOTAL_MANUFACTURING_COST": "",
            "FOB_CHARGE": "",
            "FOB_TOTAL": "",
            "ESTIMATED_TONNAGE": "",
            "SPM_COMMITTED": "",
            "YIELD": "",
            "EST_BANK": "",
            "NO_OF_DIES": "",
            "NO_OF_CHECKING_FIXTURE": "",
            "TOTAL_WEIGHT": "",
            "COST_TON": "",
            "TOTAL_COST": "",
            "NO_OF_PARTS": "",
            "DIE_COST_ROW_NUM": "",
            "DIE_COST_REVISION": Number(prev) + 1,
            "DIE_COST_VERSION": "LATEST"
          };
          if ($scope.roles != "MSIE") if ($scope.ERFQ_PROCESS_PARTS[0].DIE_COST_STATUS != "saved") {
            for (var i = 0; i < 15; i++) {
              vm.data.DIE_COST_ROW_NUM = i + 1;
              var t = prevData.push(angular.copy(vm.data));
            }
          }
          $scope.dataArr = [];

          var tt = _.groupBy(_.sortBy(prevData, [function (o) {
            return Number(o.DIE_COST_REVISION);
          }]), "DIE_COST_REVISION");

          for (var d in tt) {
            if (tt[d].length == 14) tt[d].push(vm.data);
            $scope.dataArr.push(tt[d].sort(function (o1, o2) {
              if (Number(o1.DIE_COST_ROW_NUM) > Number(o2.DIE_COST_ROW_NUM)) return 1;else return -1;
            }));
          }

          console.log("vm dataArr before=>", $scope.dataArr);
          $scope.dataArr = $scope.dataArr.reverse();
          $scope.$apply();
          console.log("vm dataArr after=>", $scope.dataArr);
        }

        bata(new Date().getTime());
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
  }

  if ($stateParams.rowDetails != null && $stateParams.rowDetails != undefined && $stateParams.rowDetails != null && $stateParams.rowDetails != undefined && $stateParams.projDetails != null && $stateParams.projDetails != undefined && $stateParams.projDetails != null && $stateParams.projDetails != undefined && $stateParams.rowNo != null && $stateParams.rowNo != undefined && $stateParams.rowNo != null && $stateParams.rowNo != undefined) {
    $scope.data = angular.copy($stateParams);
    $scope.data.curr = "INR";
    $scope.data.Date = new Date();
    $scope.dataArr = [];
    console.log("$scope.data=>", $scope.data);
    console.log("Start DONE!...", new Date().getTime());
    GetDetailsforDieCostByPartNum(function (t) {
      console.log("End DONE!...", t);
    });
  } else {
    console.log("alert");
  }

  $scope.valCh = function () {
    $scope.dataArr[0][7].TOOL_WEIGHT = 0;
    $scope.dataArr[0][7].DIE_CFQTY = 0;
    $scope.dataArr[0][7].SIMULATION_HR = 0;
    $scope.dataArr[0][7].SIMULATION_COST = 0;
    $scope.dataArr[0][7].DIE_DESIGN_HRS = 0;
    $scope.dataArr[0][7].DIE_DESIGN_COST = 0;
    $scope.dataArr[0][7].CNC_PROGRAM_HRS = 0;
    $scope.dataArr[0][7].CNC_PROGRAM_COST = 0;
    $scope.dataArr[0][7].CASTING_WEIGHT = 0;
    $scope.dataArr[0][7].TOOL_STEEL_WEIGHT = 0;
    $scope.dataArr[0][7].RAW_MATERIAL_INCL_CASTING = 0;
    $scope.dataArr[0][7].MATERIAL_COST_STD_ITEMS = 0;
    $scope.dataArr[0][7].MACHINING_HRS = 0;
    $scope.dataArr[0][7].MACHINING_COST = 0;
    $scope.dataArr[0][7].ASSY_FINISHING_HRS = 0;
    $scope.dataArr[0][7].ASSY_FINISHING_COST = 0;
    $scope.dataArr[0][7].TRYOUT_HRS = 0;
    $scope.dataArr[0][7].TRYOUT_COST = 0;
    $scope.dataArr[0][7].TOTAL_MANUFACTURING_COST = 0;
    $scope.dataArr[0][7].FOB_CHARGE = 0;
    $scope.dataArr[0][7].FOB_TOTAL = 0;
    $scope.dataArr[0][14].FOB_TOTAL = 0;

    for (var i = 0; i <= 6; i++) {
      var rowCnt = 0;

      if ($scope.dataArr[0][i].TOOL_WEIGHT != undefined && $scope.dataArr[0][i].TOOL_WEIGHT != null && $scope.dataArr[0][i].TOOL_WEIGHT != "") {
        $scope.dataArr[0][7].TOOL_WEIGHT += Number($scope.dataArr[0][i].TOOL_WEIGHT);
      }

      if ($scope.dataArr[0][i].DIE_CFQTY != undefined && $scope.dataArr[0][i].DIE_CFQTY != null && $scope.dataArr[0][i].DIE_CFQTY != "") {
        $scope.dataArr[0][7].DIE_CFQTY += Number($scope.dataArr[0][i].DIE_CFQTY);
      }

      if ($scope.dataArr[0][i].SIMULATION_HR != undefined && $scope.dataArr[0][i].SIMULATION_HR != null && $scope.dataArr[0][i].SIMULATION_HR != "") {
        $scope.dataArr[0][7].SIMULATION_HR += Number($scope.dataArr[0][i].SIMULATION_HR);
      }

      if ($scope.dataArr[0][i].SIMULATION_COST != undefined && $scope.dataArr[0][i].SIMULATION_COST != null && $scope.dataArr[0][i].SIMULATION_COST != "") {
        $scope.dataArr[0][7].SIMULATION_COST += Number($scope.dataArr[0][i].SIMULATION_COST);
        rowCnt += Number($scope.dataArr[0][i].SIMULATION_COST);
      }

      if ($scope.dataArr[0][i].DIE_DESIGN_HRS != undefined && $scope.dataArr[0][i].DIE_DESIGN_HRS != null && $scope.dataArr[0][i].DIE_DESIGN_HRS != "") {
        $scope.dataArr[0][7].DIE_DESIGN_HRS += Number($scope.dataArr[0][i].DIE_DESIGN_HRS);
      }

      if ($scope.dataArr[0][i].DIE_DESIGN_COST != undefined && $scope.dataArr[0][i].DIE_DESIGN_COST != null && $scope.dataArr[0][i].DIE_DESIGN_COST != "") {
        $scope.dataArr[0][7].DIE_DESIGN_COST += Number($scope.dataArr[0][i].DIE_DESIGN_COST);
        rowCnt += Number($scope.dataArr[0][i].DIE_DESIGN_COST);
      }

      if ($scope.dataArr[0][i].CNC_PROGRAM_HRS != undefined && $scope.dataArr[0][i].CNC_PROGRAM_HRS != null && $scope.dataArr[0][i].CNC_PROGRAM_HRS != "") {
        $scope.dataArr[0][7].CNC_PROGRAM_HRS += Number($scope.dataArr[0][i].CNC_PROGRAM_HRS);
      }

      if ($scope.dataArr[0][i].CNC_PROGRAM_COST != undefined && $scope.dataArr[0][i].CNC_PROGRAM_COST != null && $scope.dataArr[0][i].CNC_PROGRAM_COST != "") {
        $scope.dataArr[0][7].CNC_PROGRAM_COST += Number($scope.dataArr[0][i].CNC_PROGRAM_COST);
        rowCnt += Number($scope.dataArr[0][i].CNC_PROGRAM_COST);
      }

      if ($scope.dataArr[0][i].CASTING_WEIGHT != undefined && $scope.dataArr[0][i].CASTING_WEIGHT != null && $scope.dataArr[0][i].CASTING_WEIGHT != "") {
        $scope.dataArr[0][7].CASTING_WEIGHT += Number($scope.dataArr[0][i].CASTING_WEIGHT);
      }

      if ($scope.dataArr[0][i].TOOL_STEEL_WEIGHT != undefined && $scope.dataArr[0][i].TOOL_STEEL_WEIGHT != null && $scope.dataArr[0][i].TOOL_STEEL_WEIGHT != "") {
        $scope.dataArr[0][7].TOOL_STEEL_WEIGHT += Number($scope.dataArr[0][i].TOOL_STEEL_WEIGHT);
      }

      if ($scope.dataArr[0][i].RAW_MATERIAL_INCL_CASTING != undefined && $scope.dataArr[0][i].RAW_MATERIAL_INCL_CASTING != null && $scope.dataArr[0][i].RAW_MATERIAL_INCL_CASTING != "") {
        $scope.dataArr[0][7].RAW_MATERIAL_INCL_CASTING += Number($scope.dataArr[0][i].RAW_MATERIAL_INCL_CASTING);
        rowCnt += Number($scope.dataArr[0][i].RAW_MATERIAL_INCL_CASTING);
      }

      if ($scope.dataArr[0][i].MATERIAL_COST_STD_ITEMS != undefined && $scope.dataArr[0][i].MATERIAL_COST_STD_ITEMS != null && $scope.dataArr[0][i].MATERIAL_COST_STD_ITEMS != "") {
        $scope.dataArr[0][7].MATERIAL_COST_STD_ITEMS += Number($scope.dataArr[0][i].MATERIAL_COST_STD_ITEMS);
        rowCnt += Number($scope.dataArr[0][i].MATERIAL_COST_STD_ITEMS);
      }

      if ($scope.dataArr[0][i].MACHINING_HRS != undefined && $scope.dataArr[0][i].MACHINING_HRS != null && $scope.dataArr[0][i].MACHINING_HRS != "") {
        $scope.dataArr[0][7].MACHINING_HRS += Number($scope.dataArr[0][i].MACHINING_HRS);
      }

      if ($scope.dataArr[0][i].MACHINING_COST != undefined && $scope.dataArr[0][i].MACHINING_COST != null && $scope.dataArr[0][i].MACHINING_COST != "") {
        $scope.dataArr[0][7].MACHINING_COST += Number($scope.dataArr[0][i].MACHINING_COST);
        rowCnt += Number($scope.dataArr[0][i].MACHINING_COST);
      }

      if ($scope.dataArr[0][i].ASSY_FINISHING_HRS != undefined && $scope.dataArr[0][i].ASSY_FINISHING_HRS != null && $scope.dataArr[0][i].ASSY_FINISHING_HRS != "") {
        $scope.dataArr[0][7].ASSY_FINISHING_HRS += Number($scope.dataArr[0][i].ASSY_FINISHING_HRS);
      }

      if ($scope.dataArr[0][i].ASSY_FINISHING_COST != undefined && $scope.dataArr[0][i].ASSY_FINISHING_COST != null && $scope.dataArr[0][i].ASSY_FINISHING_COST != "") {
        $scope.dataArr[0][7].ASSY_FINISHING_COST += Number($scope.dataArr[0][i].ASSY_FINISHING_COST);
        rowCnt += Number($scope.dataArr[0][i].ASSY_FINISHING_COST);
      }

      if ($scope.dataArr[0][i].TRYOUT_HRS != undefined && $scope.dataArr[0][i].TRYOUT_HRS != null && $scope.dataArr[0][i].TRYOUT_HRS != "") {
        $scope.dataArr[0][7].TRYOUT_HRS += Number($scope.dataArr[0][i].TRYOUT_HRS);
      }

      if ($scope.dataArr[0][i].TRYOUT_COST != undefined && $scope.dataArr[0][i].TRYOUT_COST != null && $scope.dataArr[0][i].TRYOUT_COST != "") {
        $scope.dataArr[0][7].TRYOUT_COST += Number($scope.dataArr[0][i].TRYOUT_COST);
        rowCnt += Number($scope.dataArr[0][i].TRYOUT_COST);
      }

      $scope.dataArr[0][i].TOTAL_MANUFACTURING_COST = rowCnt;
      $scope.dataArr[0][i].FOB_TOTAL = 0;

      if ($scope.dataArr[0][i].TOTAL_MANUFACTURING_COST != undefined && $scope.dataArr[0][i].TOTAL_MANUFACTURING_COST != null && $scope.dataArr[0][i].TOTAL_MANUFACTURING_COST != "") {
        $scope.dataArr[0][7].TOTAL_MANUFACTURING_COST += Number($scope.dataArr[0][i].TOTAL_MANUFACTURING_COST);
        $scope.dataArr[0][i].FOB_TOTAL += Number($scope.dataArr[0][i].TOTAL_MANUFACTURING_COST);
      }

      if ($scope.dataArr[0][i].FOB_CHARGE != undefined && $scope.dataArr[0][i].FOB_CHARGE != null && $scope.dataArr[0][i].FOB_CHARGE != "") {
        $scope.dataArr[0][7].FOB_CHARGE += Number($scope.dataArr[0][i].FOB_CHARGE);
        $scope.dataArr[0][i].FOB_TOTAL += Number($scope.dataArr[0][i].FOB_CHARGE);
      }

      if ($scope.dataArr[0][i].FOB_TOTAL != undefined && $scope.dataArr[0][i].FOB_TOTAL != null && $scope.dataArr[0][i].FOB_TOTAL != "") {
        $scope.dataArr[0][7].FOB_TOTAL += Number($scope.dataArr[0][i].FOB_TOTAL);
      }
    }

    $scope.dataArr[0][14].FOB_CHARGE = 0;
    $scope.dataArr[0][14].TOTAL_MANUFACTURING_COST = 0;
    $scope.dataArr[0][14].FOB_CHARGE = 0;

    for (var j = 7; j <= 13; j++) {
      $scope.dataArr[0][j].FOB_TOTAL = (Number($scope.dataArr[0][j].TOTAL_MANUFACTURING_COST) == NaN ? Number(0) : Number($scope.dataArr[0][j].TOTAL_MANUFACTURING_COST)) + (Number($scope.dataArr[0][j].FOB_CHARGE) == NaN ? Number(0) : Number($scope.dataArr[0][j].FOB_CHARGE));
      $scope.dataArr[0][14].TOTAL_MANUFACTURING_COST += Number($scope.dataArr[0][j].TOTAL_MANUFACTURING_COST) == NaN ? Number(0) : Number($scope.dataArr[0][j].TOTAL_MANUFACTURING_COST);
      $scope.dataArr[0][14].FOB_CHARGE += Number($scope.dataArr[0][j].FOB_CHARGE) == NaN ? Number(0) : Number($scope.dataArr[0][j].FOB_CHARGE);
      $scope.dataArr[0][14].FOB_TOTAL += Number($scope.dataArr[0][j].FOB_TOTAL) == NaN ? Number(0) : Number($scope.dataArr[0][j].FOB_TOTAL);
    }

    $scope.dataArr[0][0].NO_OF_DIES = 0;
    if ($scope.dataArr[0][7].DIE_CFQTY != undefined && $scope.dataArr[0][7].DIE_CFQTY != null && $scope.dataArr[0][7].DIE_CFQTY != "") $scope.dataArr[0][0].NO_OF_DIES = $scope.dataArr[0][7].DIE_CFQTY;
    $scope.dataArr[0][0].NO_OF_CHECKING_FIXTURE = 0;
    if ($scope.dataArr[0][9].DIE_CFQTY != undefined && $scope.dataArr[0][9].DIE_CFQTY != null && $scope.dataArr[0][9].DIE_CFQTY != "") $scope.dataArr[0][0].NO_OF_CHECKING_FIXTURE = Number($scope.dataArr[0][9].DIE_CFQTY);
    $scope.dataArr[0][0].TOTAL_WEIGHT = 0;
    if ($scope.dataArr[0][7].TOOL_WEIGHT != undefined && $scope.dataArr[0][7].TOOL_WEIGHT != null && $scope.dataArr[0][7].TOOL_WEIGHT != "") $scope.dataArr[0][0].TOTAL_WEIGHT = Number($scope.dataArr[0][7].TOOL_WEIGHT);
    $scope.dataArr[0][0].COST_TON = 0;
    if ($scope.dataArr[0][14].FOB_TOTAL != undefined && $scope.dataArr[0][14].FOB_TOTAL != null && $scope.dataArr[0][14].FOB_TOTAL != "" && $scope.dataArr[0][7].TOOL_WEIGHT != undefined && $scope.dataArr[0][7].TOOL_WEIGHT != null && $scope.dataArr[0][7].TOOL_WEIGHT != "") $scope.dataArr[0][0].COST_TON = Math.floor(Number($scope.dataArr[0][14].FOB_TOTAL) / Number($scope.dataArr[0][7].TOOL_WEIGHT));
    $scope.dataArr[0][0].TOTAL_COST = 0;
    if ($scope.dataArr[0][14].FOB_TOTAL != undefined && $scope.dataArr[0][14].FOB_TOTAL != null && $scope.dataArr[0][14].FOB_TOTAL != "") $scope.dataArr[0][0].TOTAL_COST = Number($scope.dataArr[0][14].FOB_TOTAL);
  };

  function UpdateErfqDieCostData(data, status) {
    if (status === void 0) {
      status = "LATEST";
    }

    if (status == "OLD") {
      data = _.map(data, function (d) {
        d.DIE_COST_VERSION = "OLD";
        return d;
      });
    }
    var qr = _.map(data, function (d) {
      var t = {};
      if (d.DIE_COST_SEQ != undefined) {
        t.old = {
          "ERFQ_DIE_COST_DATA": {
            "DIE_COST_SEQ": d.DIE_COST_SEQ
          }
        };
      }
      t["new"] = {
        "ERFQ_DIE_COST_DATA": d
      };
      return t;
    });

    $.cordys.ajax({
      method: "UpdateErfqDieCostData",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      parameters: {
        tuple: qr
      },
      dataType: "* json",
      async: false,
      success: function success(e) {
        toastr.info("Quote submitted sucessfully");
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
  }

  $scope.save = function () {
    if ($scope.data.curr != "" && $scope.data.curr != undefined) {
      console.log("$scope.ERFQ_PROCESS_PARTS=>", $scope.ERFQ_PROCESS_PARTS);
      var dd = {
        old: {
          "ERFQ_PROCESS_PARTS": {
            PROCESS_PARTS_SEQ: $scope.ERFQ_PROCESS_PARTS[0].PROCESS_PARTS_SEQ
          }
        },
        "new": {
          "ERFQ_PROCESS_PARTS": {
            CURRENCY_UNIT: $scope.data.curr,
            DIE_COST_REMARK: $scope.ERFQ_PROCESS_PARTS[0].DIE_COST_REMARK + $scope.roles + ":" + ($scope.data.remark == undefined ? "" : $scope.data.remark) + "\n",
            DIE_COST_STATUS: "saved"
          }
        }
      };
      $.cordys.ajax({
        method: "UpdateErfqProcessParts",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        parameters: {
          tuple: dd
        },
        dataType: "* json",
        async: false,
        success: function success(e) {
          console.log("UpdateErfqProcessParts saved successfully");
          UpdateErfqDieCostData($scope.dataArr[0]);

          if ($scope.dataArr.length > 1) {
            for (var i = 1; i < $scope.dataArr.length; i++) {
              UpdateErfqDieCostData($scope.dataArr[i], 'OLD');
            }
          }
        },
        error: function error(jqXHR, textStatus, errorThrown) {}
      });
      console.log("vm dataArr=>", $scope.dataArr);
    } else {
      toastr.info("Please select currency unit.");
    }
  };
});