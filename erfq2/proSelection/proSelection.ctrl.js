"use strict";

angular.module('App.quoteComparisionCtrl').controller('proSelectionCtrl', function ($scope, Upload, $window, $log, $state, NgTableParams, cmm) {
  $scope.data = {};
  $scope.cmm = cmm;
  $scope.PanelGrpDrpdwn = [];
  $scope.cmm.label = 'A';
  var selectedPart = [];
  $scope.cmm.selectedPartNumber = {};

  $scope.setLab = function (d) {
    $scope.cmm.label = d;
    $scope.PartCombinationSelectionFun(d);
  };

  var isInitialized;

  $scope.PartCombinationSelectionFunInit = function (panelGroup, projectCode, baslineNum, selectedPart, PARTNUM, partNumIndex, rowIndex) {
    isInitialized = false;
    $scope.PartCombinationSelectionFun('A');
  };

  $scope.PartCombinationSelectionFun = function (panelGroup, projectCode, baslineNum) {
    $scope.data = {};
    $scope.panelGroup = panelGroup;

    if ($scope.cmm.projectCode != undefined) {
      if (panelGroup == 'A') {
        document.getElementById('buttonPanelGrpB').classList.remove('active');
        document.getElementById('buttonPanelGrpA').className += ' active';
        $scope.selected = "A";
      }

      if (panelGroup == 'B') {
        document.getElementById('buttonPanelGrpA').className += ' active';
        document.getElementById('buttonPanelGrpB').classList.remove('active');
        $scope.selected = "B";
      }

      $.cordys.ajax({
        method: "GetERFQPartCombinationSelection ",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        parameters: {
          "projectCode": cmm.projectCode,
          "panelGroup": $scope.selected
        },
        success: function success(data, rowIndex) {
          $scope.PartCombinationSelection = $.cordys.json.findObjects(data, 'PARTCOMBINATION');
          $scope.changePart($scope.PartCombinationSelection[0].PARTS);
          $scope.$apply();
        },
        error: function error(jqXHR, textStatus, errorThrown) {
          toastr.error("Unable to load data. Please try refreshing the page.");
        }
      });
    }
  };

  $scope.PartCombinationSelectionFunInit();

  $scope.changePart = function (data) {
    data = _.map(data, function (d) {
      if (_.isArray(d.PARTDETAIL.PART) && d.PARTDETAIL.PART[0].length > 1) {
        d.selected = d.PARTDETAIL.PART[0];
        d.isDisabled = false;
      } else {
        d.PARTDETAIL.PART = [d.PARTDETAIL.PART];
        d.selected = d.PARTDETAIL.PART[0];
        var selectedPart = [];
        selectedPart = [];

        for (var i = 0; i < $scope.PartCombinationSelection[0].PARTS.length; i++) {
          selectedPart.push(d.selected);
        }

        var dlabel = $scope.cmm.label;
        $scope.cmm.selectedPartNumber[dlabel] = selectedPart.join(",");
        d.isDisabled = false;
      }

      return d;
    }).map(function (dd) {
      if (dd.isDisabled == true) return dd;
      dd.selected.split(";").forEach(function (ddd) {
        if (ddd != dd.PARTNUM) {
          var freez = _.find(data, {
            "PARTNUM": ddd
          });

          freez.isDisabled = true;
        }
      });
      return dd;
    });
  };

  $scope.changePartSelected = function (data, id, sel) {
    data.map(function (d) {
      d.isDisabled = false;
      return d;
    }).forEach(function (d, i) {
      if (i == id) d.selected = sel;
    });
    data.map(function (dd) {
      if (dd.isDisabled == true) return dd;
      dd.selected.split(";").forEach(function (ddd) {
        if (ddd != dd.PARTNUM) {
          var freez = _.find(data, {
            "PARTNUM": ddd
          });

          freez.isDisabled = true;
        }
      });
      return dd;
    });
  };

  $scope.sendToRevPanel = function () {
    $state.go('quoteComparisionCtrl.revisePanel');
  };

  var passData = [{
    "projectCode": cmm.projectCode,
    "panelGroup": "A"
  }, {
    "projectCode": cmm.projectCode,
    "panelGroup": "B"
  }];

  function storeCmm(pass, cnt, cb) {
    if (cnt <= -1) {
      cb(pass);
      return;
    }

    $.cordys.ajax({
      method: "GetERFQPartCombinationSelection ",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: pass[cnt],
      success: function success(data, rowIndex) {
        var _ev = $.cordys.json.findObjects(data, 'PARTCOMBINATION');

        pass[cnt].data = _ev[0].PARTS.map(function (d) {
          return d.PARTDETAIL.PART;
        }).join(",");
        storeCmm(pass, cnt - 1, cb);
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Unable to load data. Please try refreshing the page.");
      }
    });
  }

  storeCmm(passData, 1, function (data) {
    $scope.cmm.selectedPartNumber = {};
    data.forEach(function (d) {
      $scope.cmm.selectedPartNumber[d.panelGroup] = d.data;
    });
  });
});
