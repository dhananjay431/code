"use strict";

angular.module('App.tmProcessSubmission', ['ui.router', 'ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ngFileUpload']).component('dbmultiple', {
  transclude: true,
  template: "<div class=\"dropdown\" ng-transclude>\n    <button class=\"btn border dropdown-toggle\" \n    type=\"button\" \n    style=\"width:100%;\"\n    id=\"dropdownMenuButton\" \n    data-toggle=\"dropdown\" \n    aria-haspopup=\"true\" \n    aria-expanded=\"false\"\n    ng-class=\"{disabled:!($ctrl.dbdisabled=='Yes')}\"\n    >\n    <div class=\"float-left\">\n    </div>\n      Select\n    </button>\n    <div class=\"dropdown-menu\" aria-labelledby=\"dropdownMenuButton\">\n    <span class=\"dropdown-item\" ng-repeat=\"d in $ctrl.op\">\n        <input type=\"checkbox\" class=\"m-2\" ng-model=\"$ctrl.arr[$index]\" ng-change=\"$ctrl.change($index)\">{{d.PART_NUMBER}}\n      </span>\n    </div>\n  </div>",
  controller: function controller($compile) {
    var that = this;
    this.arr = [];

    this.$onInit = function () {
      this.model = [];
    };

    this.change = function (id) {
      if (that.index == id) {
        toastr.error("Not Selected!");
        return;
      }

      if (_.find(that.model, function (d) {
        return that.op[id].PART_NUMBER == d;
      }) == undefined) {
        $("#" + that.op[id].PART_NUMBER).hide();
        that.op[id].freeze = true;
        that.model.push(that.op[id].PART_NUMBER);
      } else {
        var index = _.findIndex(that.model, function (d) {
          return d == that.op[id].PART_NUMBER;
        });

        $("#" + that.model[index]).show();

        var _d = _.find(this.op, {
          PART_NUMBER: that.model[index]
        });

        _d.freeze = false;
        that.model.splice(index, 1);
      }
    };
  },
  bindings: {
    op: '<',
    model: '=',
    dbdisabled: '<',
    index: '<',
    scope: '='
  }
}).config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
  $stateProvider.state('tmProcessSubmission', {
    url: '/tmProcessSubmission/:erfqID',
    templateUrl: 'app/TMProcessSubmission/tmProcessSubmission.tpl.htm',
    controller: 'tmProcessSubmission as vm',
    params: {
      erfqID: null,
      erfqDetails: []
    }
  });
}).controller('tmProcessSubmission', function ($scope, NgTableParams, $state, Upload, $timeout) {
  var that = this;

  $scope.scope = function () {
    return $scope;
  };

  $scope._user = JSON.parse(localStorage.user);

  if ($state.params.erfqDetails.hasOwnProperty("TASK_ID")) {
    $scope.obj = $state.params.erfqDetails;
    $scope.indix = $state.params.erfqID;
    $scope.group = $scope.obj.ERFQ_NUMBER.split("-")[2];
    localStorage.setItem("erfqdetails", JSON.stringify($scope.obj));
  } else if (JSON.parse(localStorage.getItem("erfqdetails")) != null) {
    $scope.obj = JSON.parse(localStorage.getItem("erfqdetails"));
  } else {
    $state.go("erfqInbox");
  }

  $scope.row = {};
  $scope.isValid = [];
  $scope.isView = [];
  $scope.isParts = [];
  $scope.enableParts = [];
  $scope.noclicks = [];
  $scope.fileData = [];
  $scope.FiletupleIndex = [];
  $scope.loggedUserID = [];
  $scope.xmlObject = [];
  $scope.currStatus = [];
  $scope.newERFQNum = [];
  $.cordys.ajax({
    method: "GetXMLObject",
    namespace: "http://schemas.cordys.com/1.0/xmlstore",
    dataType: "* json",
    parameters: {
      key: "com/Mahindra/Mahindra_eRFQ/erfqMailConfig.xml"
    },
    async: false,
    success: function success(e) {
      $scope.xmlObject = $.cordys.json.findObjects(e, "eRFQConfig");
    },
    error: function error(jqXHR, textStatus, errorThrown) {
      toastr.error("Error while loading XML object data");
    }
  });

  $scope.getInboxStatus = function (erfq, btnStatus) {
    $.cordys.ajax({
      method: "GetErfqInboxObject",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        ERFQ_NUMBER: erfq
      },
      success: function success(response) {
        $scope.inboxDetails = $.cordys.json.findObjects(response, "ERFQ_INBOX")[0];

        if (btnStatus == 'MOM') {
          toastr.info("Please wait till process is getting completed");
          $.cordys.ajax({
            method: "UpdateErfqInbox",
            namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
            dataType: "* json",
            parameters: {
              "tuple": {
                "old": {
                  "ERFQ_INBOX": {
                    TASK_ID: $scope.inboxDetails.TASK_ID,
                    ERFQ_NUMBER: $scope.inboxDetails.ERFQ_NUMBER,
                    PROJECT_CODE: $scope.inboxDetails.PROJECT_CODE,
                    USERNAME: $scope.inboxDetails.USERNAME,
                    USER_ID: $scope.inboxDetails.USER_ID,
                    TARGET_DATE: $scope.inboxDetails.TARGET_DATE,
                    RECEIVED_DATE: $scope.inboxDetails.RECEIVED_DATE,
                    STATUS: $scope.inboxDetails.STATUS,
                    INITIATED_BY: $scope.inboxDetails.INITIATED_BY
                  }
                },
                "new": {
                  "ERFQ_INBOX": {
                    STATUS: "TEDIMO",
                    USER_ID: $scope.MSIE.AFSPM_MEMBER_TOKEN
                  }
                }
              }
            },
            success: function success(response) {
              $.cordys.ajax({
                method: "SendMailWrapper",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
                parameters: {
                  toDisplayNames: $scope.ToolMakerData[0].CONTACT_PERSON,
                  toEmailIDs: $scope.ToolMakerData[0].EMAIL_TO,
                  ccDisplayNames: $scope.StampL.AFSPM_MEMBER_NAME + ";" + $scope.MSIE.AFSPM_MEMBER_NAME + ";",
                  ccEmailIDs: $scope.StampL.AFSPM_MEMBER_TOKEN + ";" + $scope.MSIE.AFSPM_MEMBER_TOKEN + ";",
                  emailBody: "Dear " + $scope.ToolMakerData[0].CONTACT_PERSON + ",<br/>Greetings from Mahindra &amp; Mahindra Ltd.!<br/><br/>This is to inform you that our team has uploaded TEDIMO on VOB system. <br/>Please go through all the point.<br/>In-case of queries please contact project lead Mr. (" + $scope.MSIE.AFSPM_MEMBER_NAME + "), contact no (number).<br/><br/>Direct link: www.xxxxxxxxxxxxxxxxxxxx.com <br/><br/><br/>Kind regards, CME dept, Mahindra &amp; Mahindra Ltd."
                },
                success: function success(data) {
                  toastr.info("Mail has been send to Toolmaker for Technical discussion confirmation.");
                  $scope.currStatus = 'TEDIMO';
                  $scope.showHide();
                },
                error: function error(jqXHR, textStatus, errorThrown) {
                  toastr.error("Error while sending mail of technical discussion confirmation to Toolamaker,please contact administrator");
                  $scope.currStatus = 'TEDIMO';
                  $scope.showHide();
                }
              });
            },
            error: function error(jqXHR, textStatus, errorThrown) {
              toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
            }
          });
        }

        if (btnStatus == '') {
          if ($scope.obj.STATUS == 'TEDIMO' || $scope.inboxDetails.STATUS == 'TEDIMO') {
            updateinbox("QUSU", $scope.username);
          }
        }

        if (btnStatus == 'reject') {
          updateinbox("TOREPRDO", $scope.username);
        }

        if (btnStatus == 'qReview') {
          updateinbox("QUCO", $scope.MSIE.AFSPM_MEMBER_NAME);
        }
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
      }
    });
  };

  $scope.showHide = function () {
    if ($scope.roles == 'TOOLMAKER') {
      if ($scope.obj.STATUS == 'TOPRSU' || $scope.obj.STATUS == 'TOREPRDO') {
        $('#BtnSubmit').show();
        $('#BtnRegret').show();
        $('#BtnIntTechD').hide();
        $('#BtnTechDM').hide();
        $('#BTNReject').hide();
      } else if ($scope.obj.STATUS == 'RGRT') {
        $('#BtnSubmit').hide();
        $('#BtnRegret').hide();
      } else if ($scope.obj.STATUS == 'QUSU' || $scope.obj.STATUS == 'QURESU') {
        $('#BtnSubmit').show();
        $('#BtnRegret').hide();
        $('#BtnIntTechD').hide();
        $('#BtnTechDM').hide();
        $('#BTNReject').hide();
      } else if ($scope.obj.STATUS == 'CMEAC' || $scope.obj.STATUS == 'QURE') {
        $('#BtnSubmit').hide();
        $('#BtnRegret').hide();
        $('#BtnIntTechD').hide();
        $('#BtnTechDM').hide();
        $('#BTNReject').hide();
        $('#BTNReject1').hide();
        $("#textArea").val($scope.obj.TOOLMAKER_REMARK);
      }
    } else if ($scope.roles == 'MSIE' && ($scope.obj.STATUS == 'TOREPRDO' || $scope.obj.STATUS == 'CMEAC' || $scope.obj.STATUS == 'INTRDI' || $scope.obj.STATUS == 'TEDIMO' || $scope.obj.STATUS == 'QURE' || $scope.obj.STATUS == 'QUSU' || $scope.obj.STATUS == 'QURESU')) {
      if ($scope.roles == 'MSIE' && $scope.currStatus == 'INTRDI') {
        $('#BtnSubmit').hide();
        $('#BtnRegret').hide();
        document.getElementById("BtnIntTechD").disabled = true;
        document.getElementById("BtnTechDM").disabled = false;
        $('#BTNReject').show();
      } else if ($scope.roles == 'MSIE' && $scope.currStatus == 'TEDIMO') {
        document.getElementById("BtnIntTechD").disabled = true;
        document.getElementById("BtnTechDM").disabled = true;
        $('#BtnSubmit').show();
        $('#BtnRegret').hide();
        $('#BTNReject').show();
      } else if ($scope.roles == 'MSIE' && $scope.obj.STATUS == 'QUSU') {
        $('#BtnSubmit').hide();
        $('#BtnRegret').hide();
        $("#textArea").val($scope.obj.MSIE_REMARKS);
      } else if ($scope.roles == 'MSIE' && ($scope.obj.STATUS == 'TOREPRDO' || $scope.obj.STATUS == 'QURESU')) {
        $('#BtnSubmit').hide();
        $('#BtnRegret').hide();
        $("#textArea").val($scope.obj.MSIE_REMARKS);
      } else {
        if ($scope.obj.STATUS == 'INTRDI') {
          document.getElementById("BtnIntTechD").disabled = true;
          document.getElementById("BtnTechDM").disabled = false;
          $('#BtnSubmit').hide();
          $('#BtnRegret').hide();
          $('#BTNReject').show();
        } else if ($scope.obj.STATUS == 'TEDIMO') {
          document.getElementById("BtnIntTechD").disabled = true;
          document.getElementById("BtnTechDM").disabled = true;
          $('#BtnSubmit').show();
          $('#BtnRegret').hide();
          $('#BTNReject').show();
        } else {
          if ($scope.roles == 'MSIE' && $scope.obj.STATUS != 'QURE') {
            document.getElementById("BtnIntTechD").disabled = false;
            document.getElementById("BtnTechDM").disabled = true;
            $('#BtnSubmit').hide();
            $('#BtnRegret').hide();
            $('#BTNReject').hide();
          }
        }
      }
    }
  };

  $scope.combinations = [{
    "label": "Yes",
    "value": "Yes"
  }, {
    "label": "No",
    "value": ""
  }];
  var data = [];
  $scope.roleValue = [];
  $scope.roles = [];
  $scope.onerow = false;
  $scope.tmshow = false;
  $scope.msshow = false;
  $scope.tpsshow = false;
  $scope.cmeshow = false;
  $scope.qsshow = false;
  $scope.qrshow = false;
  $scope.fTCshow = false;
  $scope.msrows = false;
  $scope.complete = false;
  $scope.rejectT = false;
  $scope.rejectTC = false;
  $scope.checkA = [];
  $scope.checkA.push("false");
  $scope.checkR = [];
  $scope.checkR.push("false");
  $scope.checkC = [];
  $scope.checkC.push("false");
  $scope.disbleRows = [];

  $scope.dataCall = function (records) {
    $scope.tableParams = new NgTableParams({}, {
      filterDelay: 0,
      dataset: records
    });
  };

  $scope.FileArray = [];
  $scope.HFileArray = [];
  $.cordys.ajax({
    method: "GetDataByToolMakerID",
    namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
    dataType: "* json",
    parameters: {
      toolMaker_id: $scope.obj.TOOLMAKER_ID
    },
    success: function success(response) {
      $scope.tmDetails = response.tuple.old.ERFQ_TOOLMAKER_MASTER;
    },
    error: function error(jqXHR, textStatus, errorThrown) {
      toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
    }
  });
  $.cordys.ajax({
    method: "GetTaskIDByErfqNum",
    namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
    dataType: "* json",
    parameters: {
      erfqNumber: $scope.obj.ERFQ_NUMBER
    },
    success: function success(response) {
      $scope.obj.TASK_ID = response.tuple.old.erfq_inbox.TASK_ID;
    },
    error: function error(jqXHR, textStatus, errorThrown) {
      toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
    }
  });
  $.cordys.ajax({
    method: "GetErfqInboxObject",
    namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
    dataType: "* json",
    parameters: {
      ERFQ_NUMBER: $scope.obj.ERFQ_NUMBER
    },
    success: function success(response) {
      $scope.inboxDetails = $.cordys.json.findObjects(response, "ERFQ_INBOX")[0];
    },
    error: function error(jqXHR, textStatus, errorThrown) {
      toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
    }
  });

  $scope.getSLnMSIE = function () {
    if ($scope.complete == true) {
      $.cordys.ajax({
        method: "GetMSIEStampingLeadByTaskIDForComp",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        parameters: {
          taskid: $scope.obj.TASK_ID
        },
        success: function success(response) {
          for (var i = 0; i < response.tuple.length; i++) {
            if (response.tuple[i].old.afs_proj_members.AFSPM_MEMBER_ROLE == "MSIE") {
              $scope.MSIE = response.tuple[i].old.afs_proj_members;
            } else if (response.tuple[i].old.afs_proj_members.AFSPM_MEMBER_ROLE == "Stamping Lead") {
              $scope.StampL = response.tuple[i].old.afs_proj_members;
            }
          }
        },
        error: function error(jqXHR, textStatus, errorThrown) {
          toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
        }
      });
    } else {
      $.cordys.ajax({
        method: "GetMSIEStampingLeadByTaskID",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        parameters: {
          taskID: $scope.obj.TASK_ID
        },
        success: function success(response) {
          for (var i = 0; i < response.tuple.length; i++) {
            if (response.tuple[i].old.afs_proj_members.AFSPM_MEMBER_ROLE == "MSIE") {
              $scope.MSIE = response.tuple[i].old.afs_proj_members;
            } else if (response.tuple[i].old.afs_proj_members.AFSPM_MEMBER_ROLE == "Stamping Lead") {
              $scope.StampL = response.tuple[i].old.afs_proj_members;
            }
          }
        },
        error: function error(jqXHR, textStatus, errorThrown) {
          toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
        }
      });
    }
  };

  $scope.$watchGroup('records', function (newNames, oldNames) {}, true);

  $scope.getDataForToolmaker = function () {
    $scope.getSLnMSIE();
    $scope.newERFQNum = $scope.obj.ERFQ_NUMBER;
    $scope.newERFQNum = $scope.newERFQNum.substring(0, $scope.newERFQNum.lastIndexOf("-"));
    $scope.newERFQNum = $scope.newERFQNum + "-" + $scope.obj.E_BOM;
    $.cordys.ajax({
      method: "GetPartAndDocDataByErfqNumber",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      parameters: {
        erfqNumber: $scope.newERFQNum
      },
      dataType: "* json",
      async: false,
      success: function success(e) {
        $scope.docData = $.cordys.json.findObjects(e, "TABLE");
        $scope.records = angular.copy($scope.docData);
        $scope.parts = $scope.records;
        $scope.dataCall($scope.records);

        for (var i = 0; i < $scope.records.length; i++) {
          $scope.isValid[i] = false;
          $scope.isParts[i] = null;
          $scope.enableParts[i] = true;

          if ($scope.records[i].DOCEXIST == 'YES') {
            $scope.isView[i] = true;
          }

          $.cordys.ajax({
            method: "GetTotalCostByErfqNumberAndPart",
            namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
            parameters: {
              erfqNumber: $scope.obj.ERFQ_NUMBER,
              partNum: $scope.records[i].PART_NUMBER
            },
            dataType: "* json",
            async: false,
            success: function success(resp) {
              if (resp.tuple == undefined) {
                $scope.records[i].COST = null;
              } else {
                $scope.records[i].COST = resp.tuple.old.erfq_die_cost_Data.TOTAL_COST;
              }
            },
            error: function error(jqXHR, textStatus, errorThrown) {
              toastr.error("Error in loading data");
            }
          });
        }

        if ($scope.records.length == 1) {
          $scope.onerow = true;
        }
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Error in loading data");
      }
    });
  };

  $scope.getDataForMSIE = function () {
    $scope.getSLnMSIE();
    $.cordys.ajax({
      method: "GetPartAndDocDataByErfqNumberForMSIE",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      parameters: {
        erfqNumber: $scope.obj.ERFQ_NUMBER
      },
      dataType: "* json",
      async: false,
      success: function success(e) {
        $scope.docData = $.cordys.json.findObjects(e, "TABLE");
        $scope.records = angular.copy($scope.docData);
        $scope.parts = $scope.records;
        $scope.dataCall($scope.records);

        for (var i = 0; i < $scope.records.length; i++) {
          $scope.isValid[i] = false;
          $scope.isParts[i] = null;
          $scope.checkA[i] = false;
          $scope.checkR[i] = false;
          $scope.checkC[i] = false;
          $scope.enableParts[i] = true;

          if ($scope.records[i].DOCEXIST == 'YES') {
            $scope.isView[i] = true;
          }

          if ($scope.records[i].PROCESS_COMBINATION == 'Yes') {
            $scope.records[i].prcsCombo = $scope.records[i].PROCESS_COMBINATION;
            $scope.records[i].part_combined = $scope.records[i].PART_COMBINED;
            $scope.disbleRows.push($scope.records[i].PART_COMBINED);
            $scope.enableParts[i] = false;
          }

          $.cordys.ajax({
            method: "GetTotalCostByErfqNumberAndPart",
            namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
            parameters: {
              erfqNumber: $scope.obj.ERFQ_NUMBER,
              partNum: $scope.records[i].PART_NUMBER
            },
            dataType: "* json",
            async: false,
            success: function success(resp) {
              if (resp.tuple == undefined) {
                $scope.records[i].COST = null;
              } else {
                $scope.records[i].COST = resp.tuple.old.erfq_die_cost_Data.TOTAL_COST;
              }
            },
            error: function error(jqXHR, textStatus, errorThrown) {
              toastr.error("Error in loading data");
            }
          });
        }

        $scope.markDisabel();
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Error in loading data");
      }
    });
  };

  $scope.cftMappedUsers = [];
  $.cordys.ajax({
    method: "GetMyERFQDetails",
    namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
    parameters: {
      UserID: $scope.username
    },
    dataType: "* json",
    async: false,
    success: function success(e) {
      $scope.cftMappedUsers = $.cordys.json.findObjects(e, "ERFQ_PROJECT_REQ");
    },
    error: function error(jqXHR, textStatus, errorThrown) {
      toastr.error("Error in loading data");
    }
  });

  $scope.dataCallFunction = function (data) {
    $scope.tableParams = new NgTableParams({}, {
      filterDelay: 0,
      dataset: data
    });
  };

  $.cordys.ajax({
    method: "GetEventsforProject",
    namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
    dataType: "* json",
    parameters: {
      "ProjectCode": $scope.obj.PROJECT_CODE
    },
    success: function success(data) {
      $scope.PannelSupplyIdsArray = [];
      $scope.tableDetails = $.cordys.json.findObjects(data, "erfq_pannel_supply");

      if ($scope.tableDetails.length != 0) {
        $scope.tableArray = [];
      } else {
        toastr.error("Error in loading data");
      }

      $scope.tableArray = $.cordys.json.findObjects(data, "erfq_pannel_supply");

      for (var i = 0; i < $scope.tableArray.length; i++) {
        if ($scope.tableArray[i].PANNEL_SUPPLY_ID != "" && $scope.tableArray[i].PANNEL_SUPPLY_ID != null && $scope.tableArray[i].PANNEL_SUPPLY_ID != undefined) {
          $scope.PannelSupplyIdsArray.push(parseInt($scope.tableArray[i].PANNEL_SUPPLY_ID));
        }
      }

      $scope.tableArray = $scope.tableArray.map(function (d) {
        delete d.PANNEL_SUPPLY_ID;
        d.EVENT1 = JSON.stringify(d);
        return d;
      });
      data = angular.copy($scope.tableArray);
      $scope.dataCallFunction(data);
      $scope.$apply();
    },
    error: function error(jqXHR, textStatus, errorThrown) {
      toastr.error("Error in loading data");
    }
  });

  $scope.getPRDocs = function () {
    $.cordys.ajax({
      method: "GetERFQAllUploadedDoc",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "projectCode": $scope.obj.PROJECT_CODE,
        "documentType": $scope.username
      },
      success: function success(data) {
        if ($scope.roles == "TOOLMAKER") {
          $scope.FileArray = $.cordys.json.findObjects(data, "ERFQ_UPLOADED_DOCUMENT_HISTORY");
        } else {
          $scope.hFileArray = $.cordys.json.findObjects(data, "ERFQ_UPLOADED_DOCUMENT_HISTORY");
        }

        $scope.$apply();
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Error in loading data");
      }
    });
  };

  $.cordys.ajax({
    method: "GetERFQDocsbyProjCode",
    namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
    dataType: "* json",
    parameters: {
      "projectCode": $scope.obj.PROJECT_CODE,
      "documentType": "ProcessDocument"
    },
    success: function success(data) {
      $scope.HFileArray = data.tuple;
      $scope.getPRDocs();
      $scope.showHide();
    },
    error: function error(jqXHR, textStatus, errorThrown) {
      toastr.error("Error in loading data");
    }
  });
  $.cordys.ajax({
    method: "GetERFQ_PROJECT_REQObject",
    namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
    dataType: "* json",
    parameters: {
      "PROJECT_CODE": $scope.obj.PROJECT_CODE
    },
    success: function success(data) {
      if ($.cordys.json.findObjects(data, "ERFQ_PROJECT_REQ").length != 0) {
        $scope.LoadData = $.cordys.json.findObjects(data, "ERFQ_PROJECT_REQ");
        $scope.Total_Vol = $scope.LoadData[0].TOTAL_VALUE;
        $scope.Total_Prod = $scope.LoadData[0].TOTAL_PRODUCTION;
        $scope.Total_Duration = $scope.LoadData[0].DURABILITY_YEARS;
        $scope.Total_Waranty = $scope.LoadData[0].WARRANTY_YEARS;

        if ($scope.LoadData[0].BUILD_QUALITY == "M&M") {
          $scope.selectOne = true;
          $scope.selectTwo = false;
        } else {
          $scope.selectTwo = true;
          $scope.selectOne = false;
        }

        $scope.$apply();
      } else {}
    },
    error: function error(jqXHR, textStatus, errorThrown) {
      toastr.error("Error in loading data");
    }
  });

  $scope.markDisabel = function () {
    for (var i = 0; i < $scope.disbleRows.length; i++) {
      for (var j = 0; j < $scope.records.length; j++) {
        if ($scope.disbleRows[i] == $scope.records[j].PART_NUMBER) {
          $scope.isValid[j] = true;
          $scope.noclicks[j] = true;
        } else $scope.noclicks[j] = false;
      }
    }
  };

  $scope.processTemplate = function () {
    $.cordys.ajax({
      method: "GetXMLObject",
      namespace: "http://schemas.cordys.com/1.0/xmlstore",
      dataType: "* json",
      parameters: {
        key: "com/Mahindra/Mahindra_eRFQ/FixedDocuments.xml"
      },
      success: function success(data) {
        $scope.obj.DOCUMENTS = $.cordys.json.findObjects(data, "ProjectReqDoc");
        $scope.docLength = $scope.obj.DOCUMENTS.length;

        for (var i = 0; i < $scope.docLength; i++) {
          $scope.obj.DOCUMENT_PATH = $scope.obj.DOCUMENTS[i];
          $scope.downloadFile($scope.obj, 0);
        }
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
      }
    });
  };

  $scope.estimateSheet = function (selRow, num) {
    var inboxObj = $scope.obj;
    $state.go("dieCostEstimation", {
      rowNo: num,
      rowDetails: selRow,
      projDetails: inboxObj
    });
  };

  $scope.startDiscussion = function (btnStatus) {
    $scope.erfq = [];
    $scope.pojCode = [];
    $scope.toolmakerID = [];
    $scope.groupID = [];
    $scope.bomID = [];
    $scope.ToolMakerData = [];
    $scope.erfq = $scope.obj.ERFQ_NUMBER;
    $scope.pojCode = $scope.erfq.substring(0, $scope.erfq.indexOf("-"));
    $scope.erfq = $scope.erfq.substring($scope.erfq.indexOf("-") + 1, $scope.erfq.length);
    $scope.toolmakerID = $scope.erfq.substring(0, $scope.erfq.indexOf("-"));
    $scope.erfq = $scope.erfq.substring($scope.erfq.indexOf("-") + 1, $scope.erfq.length);
    $scope.groupID = $scope.erfq.substring(0, $scope.erfq.indexOf("-"));
    $scope.bomID = $scope.obj.E_BOM;
    $.cordys.ajax({
      method: "GetEmailID",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        groupNo: $scope.groupID,
        pojCode: $scope.pojCode,
        bomID: $scope.bomID,
        toolMakerID: $scope.toolmakerID
      },
      success: function success(data) {
        $scope.ToolMakerData = $.cordys.json.findObjects(data, "erfq_float");

        if (btnStatus == 'Initiate') {
          toastr.info("Please wait till process is getting completed.");
          $.cordys.ajax({
            method: "UpdateErfqInbox",
            namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
            dataType: "* json",
            parameters: {
              "tuple": {
                "old": {
                  "ERFQ_INBOX": {
                    TASK_ID: $scope.inboxDetails.TASK_ID,
                    ERFQ_NUMBER: $scope.inboxDetails.ERFQ_NUMBER,
                    PROJECT_CODE: $scope.inboxDetails.PROJECT_CODE,
                    USERNAME: $scope.inboxDetails.USERNAME,
                    USER_ID: $scope.inboxDetails.USER_ID,
                    TARGET_DATE: $scope.inboxDetails.TARGET_DATE,
                    RECEIVED_DATE: $scope.inboxDetails.RECEIVED_DATE,
                    STATUS: $scope.inboxDetails.STATUS,
                    INITIATED_BY: $scope.inboxDetails.INITIATED_BY
                  }
                },
                "new": {
                  "ERFQ_INBOX": {
                    STATUS: "INTRDI",
                    USER_ID: $scope.MSIE.AFSPM_MEMBER_TOKEN
                  }
                }
              }
            },
            success: function success(response) {
              $.cordys.ajax({
                method: "SendMailWrapper",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
                parameters: {
                  toDisplayNames: $scope.ToolMakerData[0].CONTACT_PERSON,
                  toEmailIDs: $scope.ToolMakerData[0].EMAIL_TO,
                  ccDisplayNames: $scope.StampL.AFSPM_MEMBER_NAME + ";" + $scope.MSIE.AFSPM_MEMBER_NAME + ";",
                  ccEmailIDs: $scope.StampL.AFSPM_MEMBER_TOKEN + ";" + $scope.MSIE.AFSPM_MEMBER_TOKEN + ";",
                  emailBody: "Dear (" + $scope.ToolMakerData[0].CONTACT_PERSON + "),<br/><br/>Greetings from Mahindra &amp; Mahindra ltd.!<br/><br/>This is to inform you that you have accomplished first step of Process submission.<br/>Our team has gone through your processes &amp; hence we will like to technically discuss the same in detail.<br/><br/>Below are the details for the meeting plan:<br/>Date:(date)<br/> Time:(time) Indian std time.<br/>Venue:(place) or webex<br/><br/><br/> Kind regards,CME dept.Mahindra &amp; Mahindra Ltd"
                },
                success: function success(data) {
                  toastr.info("Mail has been send to Toolmaker for discussion.");
                  toastr.success("Please discuss with toolmaker and update the status.");
                  $scope.currStatus = 'INTRDI';
                  $scope.showHide();
                },
                error: function error(jqXHR, textStatus, errorThrown) {
                  toastr.error("Error while sending mail to Toolamaker due to technical error, please contact administrator.");
                  $scope.currStatus = 'INTRDI';
                  $scope.showHide();
                }
              });
            },
            error: function error(jqXHR, textStatus, errorThrown) {
              toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
            }
          });
        }

        if (btnStatus == 'MOM') {
          $scope.getInboxStatus($scope.obj.ERFQ_NUMBER, btnStatus);
        }
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Error while loading Toolmaker details.");
      }
    });
  };

  $scope.decide = function (val, num) {
    if (val == 'Accept') {
      $scope.checkA[num] = true;
      $scope.checkC[num] = false;
      $scope.checkR[num] = false;
      $scope.records[num].DECISION = val;
    } else if (val == 'Conditionally Accept') {
      $scope.checkA[num] = false;
      $scope.checkC[num] = true;
      $scope.checkR[num] = false;
      $scope.records[num].DECISION = val;
    } else if (val == 'Rework') {
      $scope.checkA[num] = false;
      $scope.checkC[num] = false;
      $scope.checkR[num] = true;
      $scope.records[num].DECISION = val;
    }
  };

  $scope.enable = function (data, no) {
    if (data == "Yes") {
      $scope.enableParts[no] = false;
    } else {
      $scope.enableParts[no] = true;
      $scope.records[no].PANEL_QUANTITY = null;
      $scope.records[no].prcsCombo = '';
      $scope.records[no].PROCESS_COMBINATION = '';

      for (var i = 0; i < $scope.parts.length; i++) {
        if ($scope.parts[i].PART_NUMBER == $scope.records[no].part_combined) {
          $scope.isValid[i] = false;
          $scope.noclicks[i] = false;
          document.getElementById("row" + i).style.pointerEvents = "auto";
          document.getElementById("row" + i).style.backgroundColor = "#ffffff";
          $scope.records[no].part_combined = null;
          return;
        }
      }
    }
  };

  $scope.calc = function (number, no) {
    if ($scope.parts[no].PART_NUMBER == number) {
      toastr.warning("cannot select same part");
      $scope.records[no].part_combined = $scope.isParts[no];
      return;
    }

    if ($scope.isParts[no] != null && $scope.isParts[no] != number) {
      for (var c = 0; c < $scope.parts.length; c++) {
        if ($scope.isParts[no] == $scope.parts[c].PART_NUMBER) {
          $scope.isValid[c] = false;
          document.getElementById("row" + c).style.backgroundColor = "#ffffff";
        }
      }
    }

    for (var i = 0; i < $scope.parts.length; i++) {
      if ($scope.parts[i].PART_NUMBER == number) {
        if ($scope.parts[i].prcsCombo == "No") {
          toastr.error("Cannot be Combined");
          $scope.records[no].part_combined = $scope.isParts[no];
          $scope.records[no].PANEL_QUANTITY = null;
          return;
        }

        if ($scope.isValid[i] == true) {
          toastr.error("already selected");
          $scope.records[no].part_combined = $scope.isParts[no];
          $scope.records[no].PANEL_QUANTITY = null;
          document.getElementById("row" + i).style.pointerEvents = "auto";
          document.getElementById("row" + i).style.backgroundColor = "#ffffff";
          return;
        } else {
          $scope.records[no].PANEL_QUANTITY = 2;
          $scope.isParts[no] = number;
          $scope.noclicks[no] = false;
          $scope.noclicks[i] = true;
          $scope.isValid[i] = true;
          $scope.enable('', i);
          document.getElementById("row" + i).readOnly = true;
          document.getElementById("row" + i).style.backgroundColor = "#e9ecef";
          return;
        }
      }
    }
  };

  $scope.CordysRole = JSON.parse(localStorage.user).USER_ROLE;

  if ($scope.CordysRole.includes("MSIE")) {
    $scope.roles = "MSIE";
    $scope.msshow = true;

    if ($scope.obj.STATUS == 'CMEAC' || $scope.obj.STATUS == 'INTRDI' || $scope.obj.STATUS == 'TEDIMO') {
      $scope.tpsshow = false;
      $scope.cmeshow = true;
      $scope.qsshow = false;
      $scope.qrshow = false;
      $scope.fTCshow = false;
      $scope.rejectTC = true;
      $scope.getDataForMSIE();
    } else if ($scope.obj.STATUS == 'QURE') {
      $scope.tpsshow = false;
      $scope.cmeshow = false;
      $scope.qsshow = false;
      $scope.qrshow = true;
      $scope.fTCshow = false;
      $scope.rejectTC = true;
      $scope.getDataForMSIE();
    } else if ($scope.obj.STATUS == 'QUSU' || $scope.obj.STATUS == 'QURESU') {
      toastr.info("Task Completed");
      $scope.complete = true;
      $scope.tpsshow = false;
      $scope.cmeshow = false;
      $scope.qsshow = true;
      $scope.qrshow = false;
      $scope.fTCshow = false;
      $scope.getDataForMSIE();

      if (!$scope.obj.MSIE_REMARKS == "") {
        $("#textArea").val($scope.obj.MSIE_REMARKS);
        document.getElementById("textArea").readOnly = true;
      }
    } else if ($scope.obj.STATUS == 'TOREPRDO') {
      toastr.info("Task Completed");
      $scope.complete = true;
      $scope.tpsshow = true;
      $scope.rejectT = true;
      $scope.cmeshow = false;
      $scope.qsshow = false;
      $scope.qrshow = false;
      $scope.fTCshow = false;
      $scope.getDataForMSIE();

      if (!$scope.obj.MSIE_REMARKS == "") {
        $("#textArea").val($scope.obj.MSIE_REMARKS);
        document.getElementById("textArea").readOnly = true;
      }
    } else if ($scope.obj.STATUS == 'Quote Comparison') {
      toastr.info("Task Completed");
      $scope.complete = true;
      $scope.tpsshow = false;
      $scope.cmeshow = false;
      $scope.qsshow = false;
      $scope.qrshow = true;
      $scope.fTCshow = false;
      $scope.getDataForMSIE();

      if (!$scope.obj.MSIE_REMARKS == "") {
        $("#textArea").val($scope.obj.MSIE_REMARKS);
        document.getElementById("textArea").readOnly = true;
      }
    }
  }

  if ($scope.CordysRole.includes("TOOLMAKER")) {
    $scope.roles = "TOOLMAKER";
    $scope.tmshow = true;

    if ($scope.obj.STATUS == 'TOPRSU') {
      $scope.tpsshow = true;
      $scope.cmeshow = false;
      $scope.qsshow = false;
      $scope.qrshow = false;
      $scope.rejectTC = true;
      $scope.fTCshow = false;
      $scope.getDataForToolmaker();
    } else if ($scope.obj.STATUS == 'RGRT') {
      $scope.tpsshow = true;
      $scope.cmeshow = false;
      $scope.qsshow = false;
      $scope.qrshow = false;
      $scope.rejectTC = true;
      $scope.fTCshow = false;
      $scope.getDataForToolmaker();
    } else if ($scope.obj.STATUS == 'TOREPRDO') {
      $scope.tpsshow = true;
      $scope.rejectT = true;
      $scope.cmeshow = false;
      $scope.qsshow = false;
      $scope.qrshow = false;
      $scope.fTCshow = false;
      $scope.getDataForMSIE();
    } else if ($scope.obj.STATUS == 'QUSU' || $scope.obj.STATUS == 'QURESU') {
      $scope.tpsshow = false;
      $scope.cmeshow = false;
      $scope.qsshow = true;
      $scope.qrshow = false;
      $scope.fTCshow = false;
      $scope.getDataForMSIE();
    } else if ($scope.obj.STATUS == 'STRC') {
      $scope.tpsshow = false;
      $scope.cmeshow = false;
      $scope.qsshow = false;
      $scope.qrshow = false;
      $scope.fTCshow = true;
      $scope.getDataForMSIE();
    } else if ($scope.obj.STATUS == 'CMEAC') {
      toastr.info("Task Completed");
      $scope.complete = true;
      $scope.tpsshow = false;
      $scope.cmeshow = true;
      $scope.qsshow = false;
      $scope.qrshow = false;
      $scope.fTCshow = false;
      $scope.rejectTC = false;
      $scope.getDataForMSIE();

      if (!$scope.obj.TOOLMAKER_REMARK == "") {
        $("#textArea").val($scope.obj.TOOLMAKER_REMARK);
        document.getElementById("textArea").readOnly = true;
      }
    } else if ($scope.obj.STATUS == 'QURE') {
      toastr.info("Task Completed");
      $scope.complete = true;
      $scope.tpsshow = false;
      $scope.cmeshow = false;
      $scope.qsshow = false;
      $scope.qrshow = true;
      $scope.fTCshow = false;
      $scope.getDataForMSIE();

      if (!$scope.obj.TOOLMAKER_REMARK == "") {
        $("#textArea").val($scope.obj.TOOLMAKER_REMARK);
        document.getElementById("textArea").readOnly = true;
      }
    }
  }

  if ($scope.CordysRole.includes("TOOLMAKER") && $scope.CordysRole.includes("MSIE")) {
    $scope.roles = "";
  }

  $scope.CreateDeleteFileArray = function (obj, tid) {
    if ($scope.FiletupleIndex.indexOf(tid) <= -1 && (obj != undefined || obj != "")) {
      $scope.FileNameArray.push(obj);
      $scope.FiletupleIndex.push(tid);
    } else if ($scope.FiletupleIndex.indexOf(tid) > -1 && (obj != undefined || obj != "")) {
      var indxOfObj = $scope.FileNameArray.indexOf(obj);
      var tuplIndxOfObj1 = $scope.FiletupleIndex.indexOf(tid);
      $scope.FileNameArray.splice(indxOfObj, 1);
      $scope.FiletupleIndex.splice(tuplIndxOfObj1, 1);
    }
  };

  $scope.FiledeleteRow = function () {
    $scope.FiletupleIndex = $scope.FiletupleIndex.sort(function (a, b) {
      return b - a;
    });

    if ($scope.FiletupleIndex.length != 0) {
      for (var i = 0; i < $scope.FiletupleIndex.length; i++) {
        $scope.deleteFileFrom_UDH($scope.FileArray[$scope.FiletupleIndex[i]]);
        $scope.FileArray.splice($scope.FiletupleIndex[i], 1);
      }
    }

    $scope.FiletupleIndex.length = 0;
    $scope.FiletupleIndex = [];
  };

  $scope.deleteFileFrom_UDH = function (DeleteFile) {
    $.cordys.ajax({
      method: "UpdateErfqUploadedDocumentHistory",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: '* json',
      parameters: {
        tuple: {
          "old": {
            "ERFQ_UPLOADED_DOCUMENT_HISTORY": {
              "DOCUMENT_HISTORY_SEQID": DeleteFile.DOCUMENT_HISTORY_SEQID
            }
          }
        }
      },
      success: function success(e) {
        toastr.success("File is deleted!");
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Error in uploading file");
      }
    });
  };

  $scope.downloadFile = function (grid, myRow) {
    debugger;
    $scope.attachObj = grid;
    var filPath = window.location.href.split("com")[0] + grid.DOCUMENT_PATH.split("shared\\")[1];
    var dnldFile = document.createElement("A");
    dnldFile.href = filPath;
    dnldFile.download = filPath.substr(filPath.lastIndexOf('/') + 1);
    document.body.appendChild(dnldFile);
    dnldFile.click();
    document.body.removeChild(dnldFile);
  };

  $scope.InsertUD_InsertUDH = function (type) {
    if (type == 'ProjectReq') {
      $scope.caughtPN = null;
      var doctype = $scope.username;
    } else {
      var doctype = type;
    }

    if ($scope.obj.STATUS == 'TOPRSU') {
      $scope.revision = '001';
    } else if ($scope.obj.STATUS == 'TOREPRDO') {
      $scope.revision = '002';
    }

    $.cordys.ajax({
      method: "UpdateErfqUploadedDocument",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: '* json',
      parameters: {
        tuple: {
          "new": {
            "ERFQ_UPLOADED_DOCUMENT": {
              "PROJECT_CODE": $scope.obj.PROJECT_CODE,
              "DOCUMENT_NAME": $scope.fileName,
              "DOCUMENT_PATH": $scope.ServerFilePath,
              "DOCUMENT_TYPE": doctype,
              "DOCUMENT_DESC": 'uploaded from inbox task',
              "PART_NUMBER": $scope.caughtPN,
              "REVISION": $scope.revision
            }
          }
        }
      },
      success: function success(e) {
        $scope.ids = $.cordys.json.findObjects(e, "ERFQ_UPLOADED_DOCUMENT")[0].DOCUMENT_ID;
        toastr.info("File Uploaded!");
        $scope.$apply;

        if (type == 'ProjectReq') {
          var FileNameObj = {
            "DOCUMENT_NAME": $scope.fileName,
            "DOCUMENT_PATH": $scope.ServerFilePath,
            "DOCUMENT_TYPE": doctype,
            "REVISION": $scope.revision
          };
          $scope.FileArray.push(FileNameObj);
          $scope.$apply();
        }
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Error in uploading file");
      }
    });
  };

  $scope.browseAndAddRow = function (fileObj, ev, screen) {
    debugger;
    $scope.ev = ev;

    if (screen == 'ProcessDocument') {
      if (_.at(ev, 'target.files')[0] == undefined) return;
      fileObj = ev.target.files[0];
      $scope.fileName = fileObj.name;
      $scope.fileData.push($scope.fileName);
      $scope.isView[$scope.rowNo] = true;
    }

    if (fileObj != null) {
      $scope.fileName = fileObj.name;

      if ($scope.fileName.split('.')[1] == 'pdf' || $scope.fileName.split('.')[1] == 'jpg' || $scope.fileName.split('.')[1] == 'png' || $scope.fileName.split('.')[1] == 'jpeg' || $scope.fileName.split('.')[1] == 'docx' || $scope.fileName.split('.')[1] == 'doc') {}

      var extension = fileObj.name.substr(fileObj.name.lastIndexOf(".") + 1);

      if ("dll" != extension.toLowerCase() && "exe" != extension.toLowerCase()) {
        var fileReader = new FileReader();

        fileReader.onload = function (fileLoadedEvent) {
          $scope.uploadFile(fileLoadedEvent.target.result, fileLoadedEvent.target.filename);
        };

        fileReader.filename = fileObj.name;
        fileReader.readAsDataURL(fileObj);
      } else {
        toastr.error('Unable to Read File');
      }

      $scope.uploadFile = function (file, name) {
        debugger;
        name = $scope.fileName;

        if (!(file == "data:" || file == null)) {
          file = file.split("base64,")[1];
          $.cordys.ajax({
            method: "UploadERFQDoc",
            namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
            dataType: '* json',
            parameters: {
              FileName: name,
              FileContent: file
            },
            success: function success(e) {
              debugger;
              $scope.ServerFilePath = $.cordys.json.findObjects(e, "uploadERFQDoc")[0].uploadERFQDoc;
              $scope.InsertUD_InsertUDH(screen);
              $scope.$apply;
              $.cordys.ajax({
                method: "GetERFQDocsbyProjCode",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
                parameters: {
                  "projectCode": $scope.obj.PROJECT_CODE,
                  "documentType": screen
                },
                success: function success(data) {
                  debugger;
                },
                error: function error(jqXHR, textStatus, errorThrown) {
                  toastr.error("Error in loading data");
                }
              });
            },
            error: function error(jqXHR, textStatus, errorThrown) {
              toastr.error("Error in uploading file");
            }
          });
        } else {
          toastr.error("Sorry file is empty, Pls upload other file");
          $scope.fileData.pop();
          $scope.$apply;
        }
      };
    } else {}
  };

  $scope.ViewFileName = function (fileObj) {
    if (fileObj != null) {
      $scope.FileObject = fileObj;
      $scope.fileName = fileObj.name;
      $scope.fileData.push(fileObj.name);
      $scope.DOCUMENT_NAME1 = fileObj.name;

      if ($scope.fileName.split('.')[1] == 'pdf' || $scope.fileName.split('.')[1] == 'jpg' || $scope.fileName.split('.')[1] == 'png' || $scope.fileName.split('.')[1] == 'jpeg' || $scope.fileName.split('.')[1] == 'docx' || $scope.fileName.split('.')[1] == 'doc') {}

      extension = fileObj.name.substr(fileObj.name.lastIndexOf(".") + 1);

      if ("dll" != extension.toLowerCase() && "exe" != extension.toLowerCase()) {
        var fileReader = new FileReader();

        fileReader.onload = function (fileLoadedEvent) {};

        fileReader.filename = fileObj.name;
        fileReader.readAsDataURL(fileObj);
      } else {
        toastr.error('Unable to Read File');
      }
    } else {}
  };

  $scope.getPartN = function (arr, no) {
    $scope.caughtPN = arr.PART_NUMBER;
    $scope.rowNo = no;
    $scope.fileData = [];
    $.cordys.ajax({
      method: "GetDocumentDetailsByPartNumber",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "projCode": $scope.obj.PROJECT_CODE,
        "documentType": "ProcessDocument",
        "partNumber": $scope.caughtPN
      },
      success: function success(data) {
        if (data.tuple != undefined) {
          $scope.allDocs = $.cordys.json.findObjects(data, "erfq_uploaded_document");
          $scope.fileData.push();
        } else {
          $scope.allDocs = [];
          $scope.fileData.push();
        }

        $scope.$apply();
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Error in loading data");
      }
    });
  };

  function completeTask() {
    $.cordys.ajax({
      method: "PerformTaskAction",
      namespace: "http://schemas.cordys.com/notification/workflow/1.0",
      dataType: "* json",
      parameters: {
        TaskId: $scope.obj.TASK_ID,
        Action: 'COMPLETE',
        Memo: ''
      },
      success: function success(response) {
        toastr.success("Task Completed");
        $state.go("erfqInbox", {
          flag: "child"
        });
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
      }
    });
  }

  function updateinbox(getstatus, username) {
    $.cordys.ajax({
      method: "UpdateErfqInbox",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "tuple": {
          "old": {
            "ERFQ_INBOX": {
              TASK_ID: $scope.inboxDetails.TASK_ID,
              ERFQ_NUMBER: $scope.inboxDetails.ERFQ_NUMBER,
              PROJECT_CODE: $scope.inboxDetails.PROJECT_CODE,
              USERNAME: $scope.inboxDetails.USERNAME,
              USER_ID: $scope.inboxDetails.USER_ID,
              TARGET_DATE: $scope.inboxDetails.TARGET_DATE,
              RECEIVED_DATE: $scope.inboxDetails.RECEIVED_DATE,
              STATUS: $scope.inboxDetails.STATUS,
              INITIATED_BY: $scope.inboxDetails.INITIATED_BY
            }
          },
          "new": {
            "ERFQ_INBOX": {
              STATUS: getstatus
            }
          }
        }
      },
      success: function success(response) {
        toastr.success("Inbox Updated");
        completeTask();
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
      }
    });
  }

  $scope.updateLastRemarks = function (setStatus) {
    if ($scope.obj.LastRemarks == undefined) {
      $scope.obj.LastRemarks = null;
    }

    if ($scope.obj.LastRemarks != undefined) {
      if ($scope.roles == "TOOLMAKER") {
        $.cordys.ajax({
          method: "UpdateErfqProcessSubmission",
          namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
          dataType: "* json",
          parameters: {
            "tuple": {
              "old": {
                "ERFQ_PROCESS_SUBMISSION": {
                  ERFQ_NUMBER: $scope.obj.ERFQ_NUMBER
                }
              },
              "new": {
                "ERFQ_PROCESS_SUBMISSION": {
                  TOOLMAKER_REMARK: $scope.obj.LastRemarks,
                  STATUS: setStatus
                }
              }
            }
          },
          success: function success(response) {},
          error: function error(jqXHR, textStatus, errorThrown) {
            toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
          }
        });
      } else if ($scope.roles == "MSIE") {
        $.cordys.ajax({
          method: "UpdateErfqProcessSubmission",
          namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
          dataType: "* json",
          parameters: {
            "tuple": {
              "old": {
                "ERFQ_PROCESS_SUBMISSION": {
                  ERFQ_NUMBER: $scope.obj.ERFQ_NUMBER
                }
              },
              "new": {
                "ERFQ_PROCESS_SUBMISSION": {
                  MSIE_REMARKS: $scope.obj.LastRemarks,
                  STATUS: setStatus
                }
              }
            }
          },
          success: function success(response) {},
          error: function error(jqXHR, textStatus, errorThrown) {
            toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
          }
        });
      }
    }
  };

  function call(d, id, STAT) {
    if (id - 1 < 0) return;
    var tmpstr = "";

    if (d != undefined && _.isArray(d[id - 1]) && d[id - 1].part_combined != undefined) {
      tmpstr = d[id - 1].part_combined.length > 0 ? d[id - 1].part_combined.join(";") : "";

      if (tmpstr == "") {
        tmpstr = d[id - 1].PART_NUMBER;
      }
    } else {
      tmpstr = d[id - 1].PART_NUMBER;
    }

    $.cordys.ajax({
      method: "ERFQPartsDuplicateCheck",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "tuple": {
          "projectCode": $scope.obj.PROJECT_CODE,
          "PartInfo": tmpstr,
          "toolmakedID": JSON.parse(localStorage.user).USER_ID
        }
      },
      success: function success(response) {
        var sts = $.cordys.json.findObjects(response, "ERFQPartsDuplicateCheck");

        if ($scope.roles == "TOOLMAKER") {
          call2(d[id - 1], sts[0].ERFQPartsDuplicateCheck, id, d, STAT);
        } else if ($scope.roles == "MSIE") {
          MSIEcall2(d[id - 1], sts[0].ERFQPartsDuplicateCheck, id, d, STAT);
        }

        if (id == 1) {
          $scope.updateLastRemarks(STAT);
          updateinbox(STAT, $scope.MSIE.AFSPM_MEMBER_NAME);
          return;
        }
      },
      error: function error(jqXHR, textStatus, errorThrown) {}
    });
  }

  function call2(data, status, index, all, STAT) {
    debugger;
    var PART_INFO = "",
        PART_COMBINED = "";

    if (_.isArray(data.part_combined) && data.part_combined.length > 0) {
      PART_COMBINED = data.part_combined.join(";");
    } else {
      PART_COMBINED = null;
    }

    if (PART_COMBINED != null && PART_COMBINED != "") {
      PART_INFO = data.PART_NUMBER + ";" + PART_COMBINED;
    } else {
      PART_INFO = data.PART_NUMBER;
    }

    if ($scope.obj.STATUS == 'TOPRSU') {
      var sss = {
        "tuple": {
          "new": {
            "ERFQ_PROCESS_PARTS": {
              ERFQ_NUMBER: $scope.obj.ERFQ_NUMBER,
              PROJECT_CODE: $scope.obj.PROJECT_CODE,
              TOOLMAKER_NAME: $scope.obj.TOOLMAKER_ID,
              PROCESS_COMBINATION: data.prcsCombo,
              PART_COMBINED: data.prcsCombo != undefined && data.prcsCombo != "no" ? PART_INFO : null,
              PANEL_QUANTITY: null,
              TOOLMAKER_REMARK: data.TMRemarks,
              MSIE_REMARK: "",
              PART_NUMBER: data.PART_NUMBER,
              DECISION: "",
              COST: "",
              STATUS: STAT,
              PANEL_GROUPING: $scope.group,
              DUPLICACY: status == "false" ? "ND" : "D",
              PART_INFO: PART_INFO
            }
          }
        }
      };
    }

    if ($scope.obj.STATUS != 'TOPRSU') {
      var sss = {
        "tuple": {
          "old": {
            "ERFQ_PROCESS_PARTS": {
              PROCESS_PARTS_SEQ: data.PARTS_SEQ
            }
          },
          "new": {
            "ERFQ_PROCESS_PARTS": {
              TOOLMAKER_REMARK: data.TMRemarks,
              STATUS: STAT
            }
          }
        }
      };
    }

    console.log("Success Data=>", sss);
    $.cordys.ajax({
      method: "UpdateErfqProcessParts",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: sss,
      success: function success(response) {
        call(all, index - 1, STAT);
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
      }
    });
  }

  function MSIEcall2(data, status, index, all, STAT) {
    var sss = {
      "tuple": {
        "old": {
          "ERFQ_PROCESS_PARTS": {
            PROCESS_PARTS_SEQ: data.PARTS_SEQ
          }
        },
        "new": {
          "ERFQ_PROCESS_PARTS": {
            MSIE_REMARK: data.MSIE_REMARK,
            DECISION: "",
            COST: "",
            STATUS: STAT
          }
        }
      }
    };
    console.log("sss=>", sss);
    $.cordys.ajax({
      method: "UpdateErfqProcessParts",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: sss,
      success: function success(response) {
        call(all, index - 1, STAT);
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
      }
    });
  }

  $scope.savechanges = function () {
    console.log("$scope.records, $scope.records.length", $scope.records, $scope.records.length);

    if ($scope.obj.STATUS == 'STRC') {
      call($scope.records, $scope.records.length, "QUCOAM");
    }

    if ($scope.obj.STATUS == 'TOPRSU') {
      call($scope.records, $scope.records.length, "CMEAC");
    }

    if ($scope.obj.STATUS == 'TOREPRDO') {
      call($scope.records, $scope.records.length, "CMEAC");
    }

    if ($scope.obj.STATUS == 'QUSU' || $scope.obj.STATUS == 'QURESU') {
      call($scope.records, $scope.records.length, "QURE");
    }

    if ($scope.obj.STATUS == 'CMEAC' || $scope.obj.STATUS == 'TEDIMO' || $scope.obj.STATUS == 'INTRDI') {
      call($scope.records, $scope.records.length, "QUSU");
    }

    if ($scope.obj.STATUS == 'QURE') {
      call($scope.records, $scope.records.length, "QUCO");
    }
  };

  $scope.dumpchanges = function () {
    if ($scope.obj.LastRemarks != undefined) {
      $.cordys.ajax({
        method: "UpdateErfqProcessSubmission",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        parameters: {
          "tuple": {
            "old": {
              "ERFQ_PROCESS_SUBMISSION": {
                ERFQ_NUMBER: $scope.obj.ERFQ_NUMBER
              }
            },
            "new": {
              "ERFQ_PROCESS_SUBMISSION": {
                TOOLMAKER_REMARK: $scope.obj.LastRemarks,
                STATUS: $scope.obj.STATUS
              }
            }
          }
        },
        success: function success(response) {
          updateinbox("RGRT", $scope.username);
          localStorage.oldURL = window.location.href;
        },
        error: function error(jqXHR, textStatus, errorThrown) {
          toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
        }
      });
    } else {
      toastr.warning("Remarks Mandatory!");
      return;
    }
  };

  $scope.revertchanges = function () {
    if ($scope.obj.rejectRemarks != undefined) {
      if ($scope.obj.rejectRemarks != "") {
        $.cordys.ajax({
          method: "UpdateErfqProcessSubmission",
          namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
          dataType: "* json",
          parameters: {
            "tuple": {
              "old": {
                "ERFQ_PROCESS_SUBMISSION": {
                  ERFQ_NUMBER: $scope.obj.ERFQ_NUMBER
                }
              },
              "new": {
                "ERFQ_PROCESS_SUBMISSION": {
                  MSIE_REMARKS: $scope.obj.rejectRemarks,
                  STATUS: $scope.obj.STATUS
                }
              }
            }
          },
          success: function success(response) {
            $scope.getInboxStatus($scope.obj.ERFQ_NUMBER, "reject");
            localStorage.oldURL = window.location.href;
          },
          error: function error(jqXHR, textStatus, errorThrown) {
            toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
          }
        });
      } else {
        toastr.warning("Remarks Mandatory!");
        return;
      }
    } else {
      toastr.warning("Remarks Mandatory!");
      return;
    }
  };

  $scope.rejectchanges = function () {
    if ($scope.obj.LastRemarks != undefined) {
      $.cordys.ajax({
        method: "UpdateErfqProcessSubmission",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        parameters: {
          "tuple": {
            "old": {
              "ERFQ_PROCESS_SUBMISSION": {
                ERFQ_NUMBER: $scope.obj.ERFQ_NUMBER
              }
            },
            "new": {
              "ERFQ_PROCESS_SUBMISSION": {
                TOOLMAKER_REMARK: $scope.obj.LastRemarks,
                STATUS: $scope.obj.STATUS
              }
            }
          }
        },
        success: function success(response) {
          updateinbox("QURESU", $scope.username);
          localStorage.oldURL = window.location.href;
        },
        error: function error(jqXHR, textStatus, errorThrown) {
          toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
        }
      });
    } else {
      toastr.warning("Remarks Mandatory!");
      return;
    }
  };

  $scope.getAllTargetDetails = function () {
    $.cordys.ajax({
      method: "GetAllTargetDetailsByERFQ",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "erfqNumber": "input request parameter"
      },
      success: function success(response) {},
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.info("request:" + jqXHR + " \nStatus :" + textStatus + " \n error:" + errorThrown);
      }
    });
  };

  setTimeout(function () {}, 500);
});