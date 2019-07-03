"use strict";

angular.module('app', ['ngMaterial']).config(function ($mdDateLocaleProvider) {
  $mdDateLocaleProvider.formatDate = function (date) {
    return date ? moment(date).format('DD-MM-YYYY') : '';
  };
}).directive('number', function () {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function link(scope, element, attrs, ctrl) {
      ctrl.$parsers.push(function (input) {
        if (input == undefined) return '';
        var inputNumber = input.toString().replace(/[^0-9]/g, '');

        if (inputNumber != input) {
          ctrl.$setViewValue(inputNumber);
          ctrl.$render();
        }

        return inputNumber;
      });
    }
  };
}).controller("initiatectrl", function ($scope, NgTableParams, Upload, $uibModal, $stateParams, $state) {
  $scope.nextPageNum1 = 1;
  $scope.nextPageNum2 = 1;
  $scope.pageAnch = true;
  var foo = $stateParams.foo;
  $scope.PLATFORM = [];
  $scope.DIVISION = [];
  $scope.PROJCATEGORY = [];
  $scope.SCALABILITY = [];
  $scope.GATEWAY = [];
  $scope.FUNCTION = [];
  $scope.deviation = [];
  $scope.deliverables = [];
  $scope.clrdownload = [];
  $scope.deleteddeviations = [];
  $scope.buttonname = "Submit Request";
  $scope.username = localStorage.getItem("Username");
  $scope.deviation.SBT = $scope.username + "-" + localStorage.getItem("GdmsFullUserName");
  $scope.logr = $scope.username + "-" + localStorage.getItem("GdmsFullUserName");
  $scope.deviation.SUBMITTED_ON = new Date();
  $scope.currentdate = new Date();
  $scope.viewmode = localStorage.getItem("gdmsviewmode");
  $scope.taskidtup = JSON.parse(localStorage.getItem("task"));

  if ($scope.taskidtup != null) {
    $scope.gdmstaskid = $scope.taskidtup.key;
    $scope.taskid = $scope.taskidtup.id;
  } else {
    $scope.gdmstaskid = "";
    $scope.taskid = "";
  }

  $scope.status = {
    isCustomHeaderOpen: false,
    isFirstOpen: true,
    isFirstDisabled: false
  };
  $scope.projcode;
  $scope.departments;
  $scope.pqh = false;
  $scope.adpdqhc = false;
  $scope.adpd = false;
  $scope.cdmmh = false;
  $scope.oh = false;
  $scope.cch = false;
  $scope.ahphc = false;
  $scope.pph = false;
  $scope.workflowrem = "";
  $scope.appr = [];
  $scope.download = [];
  $scope.allUsers = [];
  $scope.tempUser = [];
  $scope.resp1 = [];
  $scope.submitdisabled = false;
  $scope.savedisabled = false;
  $scope.resubmitFlag = 0;

  $scope.clearfields = function () {
    $scope.deviation = [];
    $scope.deliverables = [];
    $scope.download = [];
    $scope.appr = [];
  };

  var initNgTable1 = function initNgTable1(data) {
    $scope.totalRacords1 = data.length;
    $scope.tableParams1 = new NgTableParams({
      count: 5
    }, {
      dataset: data
    });
    $scope.totalPages1 = Math.ceil($scope.totalRacords1 / $scope.tableParams1.count());
  };

  $scope.changePage1 = function (nextPage1) {
    $scope.nextPageNum1 = nextPage1;
    $scope.tableParams1.page(nextPage1);
    setTimeout(function () {
      var statusElements = document.querySelectorAll('td[data-title-text="Status"]');

      for (var i = 0; i < statusElements.length; i++) {
        if (statusElements[i].innerHTML == "IN PROGRESS") statusElements[i].style.color = "blue";else if (statusElements[i].innerHTML == "APPROVED" || statusElements[i].innerHTML == "APPROVED") statusElements[i].style.color = "green";else statusElements[i].style.color = "red";
      }
    }, 500);
  };

  var initNgTable2 = function initNgTable2(data) {
    $scope.totalRacords2 = data.length;
    $scope.tableParams2 = new NgTableParams({
      count: 5
    }, {
      dataset: data
    });
    $scope.totalPages2 = Math.ceil($scope.totalRacords2 / $scope.tableParams2.count());
  };

  $scope.changePage2 = function (nextPage2) {
    $scope.nextPageNum2 = nextPage2;
    $scope.tableParams2.page(nextPage2);
    setTimeout(function () {
      var statusElements = document.querySelectorAll('td[data-title-text="Status"]');

      for (var i = 0; i < statusElements.length; i++) {
        if (statusElements[i].innerHTML == "IN PROGRESS") statusElements[i].style.color = "blue";else if (statusElements[i].innerHTML == "APPROVED" || statusElements[i].innerHTML == "APPROVED") statusElements[i].style.color = "green";else statusElements[i].style.color = "red";
      }
    }, 500);
  };

  $scope.completetask = function () {
    if ($scope.taskid != "") {
      $.cordys.ajax({
        method: "PerformTaskActionWrapper",
        namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
        dataType: "* json",
        parameters: {
          taskId: $scope.taskid,
          action: 'COMPLETE'
        },
        success: function success(d) {},
        fail: function fail(jqXHR, textStatus, errorThrown) {
          alert("Error in loading data");
        }
      });
    }
  };

  $scope.gettaskid = function () {
    if ($scope.accessedfromInbox == true) {
      $.cordys.ajax({
        method: "GetTaskidbygdmsrole",
        namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
        dataType: "* json",
        parameters: {
          gdmsCode: $scope.taskid,
          role: "",
          assgnto: ""
        },
        success: function success(d) {
          $scope.tresp = $.cordys.json.findObjects(d, "GDMS_TRA_TASKS");
          $scope.gdmstaskid = $scope.tresp[0].GDMS_TASK_ID;
        },
        fail: function fail(jqXHR, textStatus, errorThrown) {
          alert("Error in loading data");
        }
      });
    }
  };

  $scope.initdev = function () {
    $scope.deviation.GDMS_ID = localStorage.getItem("gdmscode");
    $.cordys.ajax({
      method: "GetAllMasterData",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      success: function success(d) {
        $scope.alldata = $.cordys.json.findObjects(d, "LOV_MASTER_AUTO");

        _.groupBy($scope.alldata, 'LMF_TYPE');

        $scope.PLATFORM = _.groupBy($scope.alldata, 'LMF_TYPE')["PLATFORM"];
        $scope.DIVISION = _.groupBy($scope.alldata, 'LMF_TYPE')["DIVISION"];
        $scope.SCALABILITY = _.groupBy($scope.alldata, 'LMF_TYPE')["SCALABILITY"];
        $scope.GATEWAY = _.groupBy($scope.alldata, 'LMF_TYPE')["GATEWAY"];
        $scope.PROJCATEGORY = _.groupBy($scope.alldata, 'LMF_TYPE')["PROJECTCATEGORY"];
        $scope.FUNCTION = _.groupBy($scope.alldata, 'LMF_TYPE')["FUNCTION"];
      },
      fail: function fail(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
    $.cordys.ajax({
      method: "GetGdmsMtrProjectCodesObjects",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      parameters: {
        fromPROJECT_ID: '1',
        toPROJECT_ID: '99999999'
      },
      success: function success(d) {
        $scope.projcodes = $.cordys.json.findObjects(d, "GDMS_MTR_PROJECT_CODES");
      },
      fail: function fail(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
    $.cordys.ajax({
      method: "GetAllUserRoles",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      success: function success(d) {
        $scope.userroles = $.cordys.json.findObjects(d, "PROJECT_TEAM");
        $scope.adpdqp = _.groupBy($scope.userroles, 'GDMS_ROLE')["ADPD Quality Plannner"];
        $scope.platformowner = _.groupBy($scope.userroles, 'GDMS_ROLE')["Platform Owner"];
        $scope.adpdqh = _.groupBy($scope.userroles, 'GDMS_ROLE')["ADPD Quality Head"];
        $scope.cdmmhead = _.groupBy($scope.userroles, 'GDMS_ROLE')["CDMM Head"];
        $scope.ahph = _.groupBy($scope.userroles, 'GDMS_ROLE')["ADPD Head or Powertrain Head"];
        $scope.adpdh = _.groupBy($scope.userroles, 'GDMS_ROLE')["ADPD Head"];
        $scope.operationhead = _.groupBy($scope.userroles, 'GDMS_ROLE')["Operation Head"];
        $scope.pqohead = _.groupBy($scope.userroles, 'GDMS_ROLE')["PQO Head"];
        $scope.president = _.groupBy($scope.userroles, 'GDMS_ROLE')["President"];
        $scope.pleader = _.groupBy($scope.userroles, 'GDMS_ROLE')["Project Leader"];
        $scope.pqhead = _.groupBy($scope.userroles, 'GDMS_ROLE')["Product Quality Head"];
        $scope.cchead = _.groupBy($scope.userroles, 'GDMS_ROLE')["Customer Care Head"];
        $scope.pphead = _.groupBy($scope.userroles, 'GDMS_ROLE')["Product Planning Head"];
        $scope.qhead = _.groupBy($scope.userroles, 'GDMS_ROLE')["Quality Head"];
        $scope.rowner = _.groupBy($scope.userroles, 'GDMS_ROLE')["Risk Owner"];
        $scope.rmanager = _.groupBy($scope.userroles, 'GDMS_ROLE')["Risk Manager"];
      },
      fail: function fail(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
    $.cordys.ajax({
      method: "GetGdmsMtrDeptObjects",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      parameters: {
        fromDEPT_ID: '0',
        toDEPT_ID: '99999999'
      },
      success: function success(d) {
        $scope.departments = $.cordys.json.findObjects(d, "GDMS_MTR_DEPT");
      },
      fail: function fail(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
    $.cordys.ajax({
      method: "GetManufacturingLocationsObjects",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      parameters: {
        fromMFG_LOC_ID: '1',
        toMFG_LOC_ID: '99999999'
      },
      success: function success(d) {
        $scope.locations = $.cordys.json.findObjects(d, "MANUFACTURING_LOCATIONS");
      },
      fail: function fail(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
    $.cordys.ajax({
      method: "GetTaskStatusfromTaskID",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      parameters: {
        taskid: $scope.taskid
      },
      success: function success(dx) {
        $scope.taskStatus = $.cordys.json.findObjects(dx, "GDMS_TRA_TASKS");

        if (dx.tuple != undefined) {
          if ($scope.taskStatus[0].STATUS == "COMPLETED") {
            $scope.viewmode = "true";
          }
        }
      },
      fail: function fail(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });

    if ($scope.deviation.GDMS_ID != "") {
      $scope.GetDeviationsByGDMSCode();
      $scope.GetAppForGDMSCode();
      $scope.GetDocByGDMSCode();
      $scope.Getgdmsreqbyno();
    }
  };

  $scope.downloadfile = function (fpath, filename) {
    $.cordys.ajax({
      method: "DownloadGDMSFile",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      parameters: {
        filePath: fpath
      },
      success: function success(d) {
        var byteCharacters = atob(d["return"]);
        var byteNumbers = new Array(byteCharacters.length);

        for (var i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);
        var blob = new Blob([byteArray], {
          type: ""
        });

        if (window.navigator.msSaveBlob) {
          window.navigator.msSaveOrOpenBlob(blob, filename);
        } else {
          var a = window.document.createElement("a");
          a.href = window.URL.createObjectURL(blob, {
            type: ""
          });
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      },
      fail: function fail(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
  };

  $scope.downloadPreview = function () {
    if ($scope.deviation.GDMS_ID == undefined || $scope.deviation.GDMS_ID == "") {
      toastr.error("Please save once before downloading");
      return;
    }

    $.cordys.ajax({
      method: "GenerateGDMSPDF",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      parameters: {
        gdmsNo: $scope.deviation.GDMS_CODE,
        gdmsId: $scope.deviation.GDMS_ID
      },
      success: function success(d) {
        var filename = $scope.deviation.GDMS_CODE + ".pdf";
        if ($scope.deviation.GDMS_CODE == null || $scope.deviation.GDMS_CODE == undefined) filename = $scope.deviation.GDMS_ID + ".pdf";
        var byteCharacters = atob(d.tuple.old.generateGDMSPDF.generateGDMSPDF);
        var byteNumbers = new Array(byteCharacters.length);

        for (var i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);
        var blob = new Blob([byteArray], {
          type: ""
        });

        if (window.navigator.msSaveBlob) {
          window.navigator.msSaveOrOpenBlob(blob, filename);
        } else {
          var a = window.document.createElement("a");
          a.href = window.URL.createObjectURL(blob, {
            type: ""
          });
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      },
      fail: function fail(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
  };

  $scope.clearPopUpData = function () {
    $scope.DOCUMENT_NAME1 = null;
    $scope.DOCUMENT_DESC1 = null;
  };

  $scope.browseAndAddRow = function () {
    for (var i = 0; i < $scope.download.length; i++) {
      if ($scope.download[i].DOCUMENT_NAME == $scope.FileObject.name) {
        toastr.error("File name already exists");
        return;
      }
    }

    if ($scope.FileObject != null) {
      $scope.fileName = $scope.FileObject.name;

      if ($scope.fileName.split('.')[1] == 'pdf' || $scope.fileName.split('.')[1] == 'jpg' || $scope.fileName.split('.')[1] == 'png' || $scope.fileName.split('.')[1] == 'jpeg' || $scope.fileName.split('.')[1] == 'docx' || $scope.fileName.split('.')[1] == 'doc') {}

      extension = $scope.FileObject.name.substr($scope.FileObject.name.lastIndexOf(".") + 1);

      if ("dll" != extension.toLowerCase() && "exe" != extension.toLowerCase()) {
        var fileReader = new FileReader();

        fileReader.onload = function (fileLoadedEvent) {
          $scope.uploadFile(fileLoadedEvent.target.result, fileLoadedEvent.target.filename);
        };

        fileReader.filename = $scope.FileObject.name;
        $scope.fileNow = $scope.FileObject.name;
        fileReader.readAsDataURL($scope.FileObject);
      } else {
        alert('Unable to Read File');
      }

      $scope.uploadFile = function (file, name) {
        if (!(file == "data:" || file == null)) {
          file = file.split("base64,")[1];
          $.cordys.ajax({
            method: "UploadGDMSFile",
            namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
            dataType: '* json',
            parameters: {
              fileName: $scope.fileNow,
              fileContent: file
            },
            success: function success(e) {
              $scope.ServerFilePath = $.cordys.json.findObjects(e, "uploadGDMSFile")[0].uploadGDMSFile;
              var dte = new Date();
              var d = dte.getDate();
              var m = dte.getMonth() + 1;
              var y = dte.getFullYear();
              var dateStr = (d <= 9 ? '0' + d : d) + '-' + (m <= 9 ? '0' + m : m) + '-' + y;
              document.getElementById("pX").innerHTML = "Choose File";
              var FileNameObj = {
                "GDMS_ID": $scope.deviation.GDMS_ID,
                "UPLOADED_ON": dateStr,
                "DOCUMENT_NAME": $scope.fileNow,
                "DOCUMENT_PATH": $scope.ServerFilePath,
                "REMARKS": $scope.DOCUMENT_DESC1,
                "UPLOADED_BY": $scope.logr
              };
              $scope.download.push(FileNameObj);
              $scope.DOCUMENT_NAME = $scope.fileNow;
              toastr.success("Document uploaded successfully");
              $scope.$apply();
              $scope.clearPopUpData();
              $scope.manageTextareaHeight("remarkTable1");
            },
            error: function error(jqXHR, textStatus, errorThrown) {}
          });
        } else {
          alert("Sorry file is empty, Pls upload other file");
        }
      };
    } else {}
  };

  $scope.browseAndAddRow1 = function () {
    for (var i = 0; i < $scope.clrdownload.length; i++) {
      if ($scope.clrdownload[i].DOCUMENT_NAME == $scope.FileObject.name) {
        toastr.error("File name already exists");
        return;
      }
    }

    if ($scope.FileObject != null) {
      $scope.fileName = $scope.FileObject.name;

      if ($scope.fileName.split('.')[1] == 'pdf' || $scope.fileName.split('.')[1] == 'jpg' || $scope.fileName.split('.')[1] == 'png' || $scope.fileName.split('.')[1] == 'jpeg' || $scope.fileName.split('.')[1] == 'docx' || $scope.fileName.split('.')[1] == 'doc') {}

      extension = $scope.FileObject.name.substr($scope.FileObject.name.lastIndexOf(".") + 1);

      if ("dll" != extension.toLowerCase() && "exe" != extension.toLowerCase()) {
        var fileReader = new FileReader();

        fileReader.onload = function (fileLoadedEvent) {
          $scope.uploadFile(fileLoadedEvent.target.result, fileLoadedEvent.target.filename);
        };

        fileReader.filename = $scope.FileObject.name;
        $scope.fileNow = $scope.FileObject.name;
        fileReader.readAsDataURL($scope.FileObject);
      } else {
        alert('Unable to Read File');
      }

      $scope.uploadFile = function (file, name) {
        if (!(file == "data:" || file == null)) {
          file = file.split("base64,")[1];
          $.cordys.ajax({
            method: "UploadGDMSFile",
            namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
            dataType: '* json',
            parameters: {
              fileName: $scope.fileNow,
              fileContent: file
            },
            success: function success(e) {
              $scope.ServerFilePath = $.cordys.json.findObjects(e, "uploadGDMSFile")[0].uploadGDMSFile;
              var dte = new Date();
              var d = dte.getDate();
              var m = dte.getMonth() + 1;
              var y = dte.getFullYear();
              var dateStr = (d <= 9 ? '0' + d : d) + '-' + (m <= 9 ? '0' + m : m) + '-' + y;
              document.getElementById("labX").innerHTML = "Choose File";
              var FileNameObj = {
                "GDMS_ID": $scope.deviation.GDMS_ID,
                "UPLOADED_ON": dateStr,
                "DOCUMENT_NAME": $scope.fileNow,
                "DOCUMENT_PATH": $scope.ServerFilePath,
                "REMARKS": $scope.DOCUMENT_DESC1,
                "UPLOADED_BY": $scope.logr
              };
              $scope.clrdownload.push(FileNameObj);
              $scope.DOCUMENT_NAME = $scope.fileNow;
              $scope.$apply();
              $scope.clearPopUpData();
              $scope.manageTextareaHeight("remarkTable2");
            },
            error: function error(jqXHR, textStatus, errorThrown) {}
          });
        } else {
          alert("Sorry file is empty, Pls upload other file");
        }
      };
    } else {}
  };

  $scope.showuploadDialog = function (ev) {
    var modalInstance = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: './html/upload.html',
      controller: 'initiatectrl',
      controllerAs: 'in',
      resolve: {
        data: function data() {}
      }
    });
  };

  $scope.Size = 10240;

  $scope.ViewFileName = function (fileObj, ctr) {
    if (fileObj != null) {
      var fsize = fileObj.size;
      if (ctr == 0) document.getElementById("pX").innerHTML = fileObj.name;
      if (ctr == 1) document.getElementById("labX").innerHTML = fileObj.name;
      var iConvert = (fsize / 1048576).toFixed(2);

      if (iConvert <= $scope.Size) {
        $scope.FileObject = fileObj;
        $scope.fileName = fileObj.name;

        if ($scope.fileName.split('.')[1] == 'pdf' || $scope.fileName.split('.')[1] == 'jpg' || $scope.fileName.split('.')[1] == 'png' || $scope.fileName.split('.')[1] == 'jpeg' || $scope.fileName.split('.')[1] == 'docx' || $scope.fileName.split('.')[1] == 'doc') {}

        extension = fileObj.name.substr(fileObj.name.lastIndexOf(".") + 1);

        if ("dll" != extension.toLowerCase() && "exe" != extension.toLowerCase()) {
          var fileReader = new FileReader();

          fileReader.onload = function (fileLoadedEvent) {};

          fileReader.filename = fileObj.name;
          fileReader.readAsDataURL(fileObj);
          $scope.DOCUMENT_NAME1 = fileObj.name;
          $scope.$apply();
        } else {
          alert("Unable to read File");
        }
      } else {
        toastr.error("Select file smaller than " + $scope.Size + " MB");
        return false;
      }
    } else {}
  };

  $scope.saveGDMSdetails = function () {
    $scope.savedisabled = true;

    if ($scope.deviation.PROJECT_CODE == undefined || $scope.deviation.PROJECT_CODE == "") {
      toastr.error("Please enter Project Code");
      $scope.savedisabled = false;
      return;
    }

    if ($scope.deviation.GDMS_ID) {
      $.cordys.ajax({
        method: "UpdateGdmsTraGdmsReq",
        namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
        dataType: "* json",
        parameters: {
          "tuple": {
            "old": {
              "GDMS_TRA_GDMS_REQ": {
                "GDMS_ID": $scope.deviation.GDMS_ID
              }
            },
            "new": {
              "GDMS_TRA_GDMS_REQ": {
                "GDMS_ID": $scope.deviation.GDMS_ID,
                "PROJECT_CODE": $scope.deviation.PROJECT_CODE,
                "GDMS_PLATFORM": $scope.deviation.GDMS_PLATFORM,
                "GDMS_GATEWAY": $scope.deviation.GDMS_GATEWAY,
                "NO_OF_RED_DELI": $scope.deviation.NO_OF_RED_DELI,
                "NO_OF_GREEN_DELI": $scope.deviation.NO_OF_GREEN_DELI,
                "NO_OF_YELLOW_DELI": $scope.deviation.NO_OF_YELLOW_DELI,
                "PLANT_CODE": $scope.deviation.PLANT_CODE,
                "GDMS_FUNCTION": $scope.deviation.GDMS_FUNCTION,
                "GDMS_DIVISION": $scope.deviation.GDMS_DIVISION,
                "SCALABILITY": $scope.deviation.SCALABILITY,
                "PROJCATEGORY": $scope.deviation.PROJCATEGORY,
                "WORKFLOW_REMARKS": $scope.workflowrem
              }
            }
          }
        },
        success: function success(d) {
          $scope.resp = $.cordys.json.findObjects(d, "GDMS_TRA_GDMS_REQ");
          $scope.deviation.GDMS_CODE = $scope.resp[0].GDMS_CODE;
          $scope.deviation.GDMS_ID = $scope.resp[0].GDMS_ID;
          $scope.Getgdmsreqbyno();
          $scope.savedeviations();
          if ($scope.deviation.CURRENT_STAGE == "INITIATOR" || !$scope.deviation.CURRENT_STAGE) $scope.saveapprovers();
          $scope.savefiledb();
          toastr.success("Data Saved Successfully");
        },
        fail: function fail(jqXHR, textStatus, errorThrown) {
          alert("Error in loading data");
        }
      });
    } else {
      $.cordys.ajax({
        method: "UpdateGdmsTraGdmsReq",
        namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
        dataType: "* json",
        parameters: {
          "tuple": {
            "new": {
              "GDMS_TRA_GDMS_REQ": {
                "PROJECT_CODE": $scope.deviation.PROJECT_CODE,
                "GDMS_PLATFORM": $scope.deviation.GDMS_PLATFORM,
                "GDMS_GATEWAY": $scope.deviation.GDMS_GATEWAY,
                "NO_OF_RED_DELI": $scope.deviation.NO_OF_RED_DELI,
                "NO_OF_GREEN_DELI": $scope.deviation.NO_OF_GREEN_DELI,
                "NO_OF_YELLOW_DELI": $scope.deviation.NO_OF_YELLOW_DELI,
                "PLANT_CODE": $scope.deviation.PLANT_CODE,
                "GDMS_FUNCTION": $scope.deviation.GDMS_FUNCTION,
                "GDMS_DIVISION": $scope.deviation.GDMS_DIVISION,
                "SCALABILITY": $scope.deviation.SCALABILITY,
                "PROJCATEGORY": $scope.deviation.PROJCATEGORY,
                "CURRENT_STAGE": "INITIATOR",
                "CURRENT_OWNER": localStorage.getItem("Username"),
                "WORKFLOW_REMARKS": $scope.workflowrem,
                "STATUS": "SAVED",
                "SUBMITTED_BY": localStorage.getItem("Username")
              }
            }
          }
        },
        success: function success(d) {
          $scope.resp = $.cordys.json.findObjects(d, "GDMS_TRA_GDMS_REQ");
          $scope.deviation.GDMS_CODE = $scope.resp[0].GDMS_CODE;
          $scope.deviation.GDMS_ID = $scope.resp[0].GDMS_ID;
          $scope.deviation.CURRENT_STAGE = $scope.resp[0].CURRENT_STAGE;
          $scope.headerText = $scope.deviation.GDMS_CODE;
          $scope.$apply();
          $scope.savedeviations();
          if ($scope.deviation.CURRENT_STAGE == "INITIATOR" || !$scope.deviation.CURRENT_STAGE) $scope.saveapprovers();
          $scope.savefiledb();
          toastr.success("Data Saved Successfully");
        },
        fail: function fail(jqXHR, textStatus, errorThrown) {
          alert("Error in loading data");
        }
      });
    }

    $scope.savedisabled = false;
  };

  $scope.saveGDMS = function (status) {
    $scope.savedisabled = true;

    if ($scope.deviation.PROJECT_CODE == undefined || $scope.deviation.PROJECT_CODE == "") {
      toastr.error("Please enter Project Code");
      $scope.savedisabled = false;
      return;
    }

    if (($scope.deviation.CURRENT_STAGE == "INITIATOR" || $scope.deviation.CURRENT_STAGE == undefined) && $scope.deviation.STATUS != "REJECTED") status = "SUBMITTED";else status = "REVIEWED";

    if ($scope.deviation.STATUS == "REJECTED") {} else if ($scope.deviation.GDMS_ID) {
      $.cordys.ajax({
        method: "UpdateGdmsTraGdmsReq",
        namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
        dataType: "* json",
        parameters: {
          "tuple": {
            "old": {
              "GDMS_TRA_GDMS_REQ": {
                "GDMS_ID": $scope.deviation.GDMS_ID
              }
            },
            "new": {
              "GDMS_TRA_GDMS_REQ": {
                "GDMS_ID": $scope.deviation.GDMS_ID,
                "PROJECT_CODE": $scope.deviation.PROJECT_CODE,
                "GDMS_PLATFORM": $scope.deviation.GDMS_PLATFORM,
                "GDMS_GATEWAY": $scope.deviation.GDMS_GATEWAY,
                "NO_OF_RED_DELI": $scope.deviation.NO_OF_RED_DELI,
                "NO_OF_GREEN_DELI": $scope.deviation.NO_OF_GREEN_DELI,
                "NO_OF_YELLOW_DELI": $scope.deviation.NO_OF_YELLOW_DELI,
                "PLANT_CODE": $scope.deviation.PLANT_CODE,
                "GDMS_FUNCTION": $scope.deviation.GDMS_FUNCTION,
                "GDMS_DIVISION": $scope.deviation.GDMS_DIVISION,
                "SCALABILITY": $scope.deviation.SCALABILITY,
                "PROJCATEGORY": $scope.deviation.PROJCATEGORY,
                "WORKFLOW_REMARKS": $scope.workflowrem,
                "STATUS": status
              }
            }
          }
        },
        success: function success(d) {
          $scope.resp = $.cordys.json.findObjects(d, "GDMS_TRA_GDMS_REQ");
          $scope.deviation.GDMS_CODE = $scope.resp[1].GDMS_CODE;
          $scope.deviation.GDMS_ID = $scope.resp[1].GDMS_ID;
          $scope.Getgdmsreqbyno();
          $scope.savedeviations();
          if ($scope.deviation.CURRENT_STAGE == "INITIATOR" || !$scope.deviation.CURRENT_STAGE) $scope.saveapprovers();
          $scope.savefiledb();

          if ($scope.taskid == "" && status == "SUBMITTED") {
            $scope.GDMSApprovalFlow();
          }

          if (status == "SUBMITTED") alert($scope.deviation.GDMS_CODE + " Submitted Successfully");else toastr.success("Data Saved Successfully");
        },
        fail: function fail(jqXHR, textStatus, errorThrown) {
          alert("Error in loading data");
        }
      });
    } else {
      $.cordys.ajax({
        method: "UpdateGdmsTraGdmsReq",
        namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
        dataType: "* json",
        parameters: {
          "tuple": {
            "new": {
              "GDMS_TRA_GDMS_REQ": {
                "PROJECT_CODE": $scope.deviation.PROJECT_CODE,
                "GDMS_PLATFORM": $scope.deviation.GDMS_PLATFORM,
                "GDMS_GATEWAY": $scope.deviation.GDMS_GATEWAY,
                "NO_OF_RED_DELI": $scope.deviation.NO_OF_RED_DELI,
                "NO_OF_GREEN_DELI": $scope.deviation.NO_OF_GREEN_DELI,
                "NO_OF_YELLOW_DELI": $scope.deviation.NO_OF_YELLOW_DELI,
                "PLANT_CODE": $scope.deviation.PLANT_CODE,
                "GDMS_FUNCTION": $scope.deviation.GDMS_FUNCTION,
                "GDMS_DIVISION": $scope.deviation.GDMS_DIVISION,
                "SCALABILITY": $scope.deviation.SCALABILITY,
                "PROJCATEGORY": $scope.deviation.PROJCATEGORY,
                "CURRENT_STAGE": "INITIATOR",
                "CURRENT_OWNER": localStorage.getItem("Username"),
                "WORKFLOW_REMARKS": $scope.workflowrem,
                "STATUS": status,
                "SUBMITTED_BY": localStorage.getItem("Username")
              }
            }
          }
        },
        success: function success(d) {
          $scope.resp = $.cordys.json.findObjects(d, "GDMS_TRA_GDMS_REQ");
          $scope.deviation.GDMS_CODE = $scope.resp[0].GDMS_CODE;
          $scope.deviation.GDMS_ID = $scope.resp[0].GDMS_ID;
          $scope.deviation.CURRENT_STAGE = $scope.resp[0].CURRENT_STAGE;
          $scope.headerText = $scope.deviation.GDMS_CODE;
          $scope.$apply();
          $scope.savedeviations();
          if ($scope.deviation.CURRENT_STAGE == "INITIATOR" || !$scope.deviation.CURRENT_STAGE) $scope.saveapprovers();
          $scope.savefiledb();

          if ($scope.taskid == "" && status == "SUBMITTED") {
            $scope.GDMSApprovalFlow();
          }

          if (status == "SUBMITTED") alert($scope.deviation.GDMS_CODE + " Submitted Successfully");else toastr.success("Data Saved Successfully");
        },
        fail: function fail(jqXHR, textStatus, errorThrown) {
          alert("Error in loading data");
        }
      });
    }

    $scope.savedisabled = false;
  };

  $scope.paramtuple;

  $scope.savedeviations = function () {
    if (!$scope.deviation.GDMS_ID) {} else {
      var reqObj = {};
      reqObj = $scope.generatedevtuple();
      $.cordys.ajax({
        method: "UpdateGdmsTraDeviations",
        namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
        dataType: "* json",
        parameters: {
          "tuple": reqObj
        },
        success: function success(d) {
          $scope.GetDeviationsByGDMSCode();
        },
        fail: function fail(jqXHR, textStatus, errorThrown) {
          alert("Error in loading data");
        }
      });
    }
  };

  $scope.generatedevtuple = function () {
    $scope.deviationobj = {};
    $scope.deviationarr = [];

    for (var i = 0; i < $scope.deliverables.length; i++) {
      var ro = $scope.deliverables[i].RISK_OWNER != undefined ? $scope.deliverables[i].RISK_OWNER.TOKEN_ID : null;
      var rm = $scope.deliverables[i].RISK_MANAGER != undefined ? $scope.deliverables[i].RISK_MANAGER.TOKEN_ID : null;
      var tid = "";
      var st = "";
      if ($scope.deliverables[i].START_DATE != null) if (typeof $scope.deliverables[i].START_DATE == "string") st = $scope.deliverables[i].START_DATE;else st = $scope.deliverables[i].START_DATE.getFullYear() + "-" + ($scope.deliverables[i].START_DATE.getMonth() + 1) + "-" + $scope.deliverables[i].START_DATE.getDate();
      if ($scope.deliverables[i].TARGET_IMPLE_DATE != null) if (typeof $scope.deliverables[i].TARGET_IMPLE_DATE == "string") tid = $scope.deliverables[i].TARGET_IMPLE_DATE;else tid = $scope.deliverables[i].TARGET_IMPLE_DATE.getFullYear() + "-" + ($scope.deliverables[i].TARGET_IMPLE_DATE.getMonth() + 1) + "-" + $scope.deliverables[i].TARGET_IMPLE_DATE.getDate();

      if ($scope.deliverables[i].DEVIATION_ID == undefined || $scope.deviation.STATUS == "REJECTED" && $scope.resubmitFlag == 1) {
        $scope.deviationobj = {
          "new": {
            "GDMS_TRA_DEVIATIONS": {
              "GDMS_ID": $scope.deviation.GDMS_ID,
              "GDMS_CODE": $scope.deviation.GDMS_CODE,
              "DELIVERABLES": $scope.deliverables[i].DELIVERABLES,
              "IMPACT_LEVEL": $scope.deliverables[i].IMPACT_LEVEL,
              "DEPARTMENT": $scope.deliverables[i].DEPARTMENT,
              "TRACKING_SCHEDULE": $scope.deliverables[i].TRACKING_SCHEDULE,
              "RISK": $scope.deliverables[i].RISK,
              "ROOT_CAUSE": $scope.deliverables[i].ROOT_CAUSE,
              "RISK_RESPONSE_STRATEGY": $scope.deliverables[i].RISK_RESPONSE_STRATEGY,
              "INTERIM_CONT_PLAN": $scope.deliverables[i].INTERIM_CONT_PLAN,
              "PERM_CORRECTIVE_PLAN": $scope.deliverables[i].PERM_CORRECTIVE_PLAN,
              "RISK_STATUS": $scope.deliverables[i].RISK_STATUS,
              "RISK_OWNER": ro,
              "RISK_MANAGER": rm,
              "REMARKS": $scope.deliverables[i].REMARKS,
              "DEVIATION_CODE": $scope.deviation.PROJECT_CODE + "-" + $scope.deviation.GDMS_GATEWAY + "-" + $scope.deliverables[i].DEPARTMENT + "-" + ("0" + (i + 1)).slice(-2)
            }
          }
        };
      } else {
        $scope.deviationobj = {
          "old": {
            "GDMS_TRA_DEVIATIONS": {
              "DEVIATION_ID": $scope.deliverables[i].DEVIATION_ID
            }
          },
          "new": {
            "GDMS_TRA_DEVIATIONS": {
              "DEVIATION_ID": $scope.deliverables[i].DEVIATION_ID,
              "GDMS_ID": $scope.deviation.GDMS_ID,
              "GDMS_CODE": $scope.deviation.GDMS_CODE,
              "DELIVERABLES": $scope.deliverables[i].DELIVERABLES,
              "IMPACT_LEVEL": $scope.deliverables[i].IMPACT_LEVEL,
              "TARGET_IMPLE_DATE": tid,
              "DEPARTMENT": $scope.deliverables[i].DEPARTMENT,
              "TRACKING_SCHEDULE": $scope.deliverables[i].TRACKING_SCHEDULE,
              "RISK": $scope.deliverables[i].RISK,
              "ROOT_CAUSE": $scope.deliverables[i].ROOT_CAUSE,
              "RISK_RESPONSE_STRATEGY": $scope.deliverables[i].RISK_RESPONSE_STRATEGY,
              "INTERIM_CONT_PLAN": $scope.deliverables[i].INTERIM_CONT_PLAN,
              "PERM_CORRECTIVE_PLAN": $scope.deliverables[i].PERM_CORRECTIVE_PLAN,
              "START_DATE": st,
              "RISK_STATUS": $scope.deliverables[i].RISK_STATUS,
              "RISK_OWNER": ro,
              "RISK_MANAGER": rm,
              "REMARKS": $scope.deliverables[i].REMARKS,
              "DEVIATION_CODE": $scope.deviation.PROJECT_CODE + "-" + $scope.deviation.GDMS_GATEWAY + "-" + $scope.deliverables[i].DEPARTMENT + "-" + ("0" + (i + 1)).slice(-2)
            }
          }
        };
      }

      $scope.deviationarr.push($scope.deviationobj);
    }

    for (var i = 0; i < $scope.deleteddeviations.length; i++) {
      $scope.deviationobj = {
        "old": {
          "GDMS_TRA_DEVIATIONS": {
            "DEVIATION_ID": $scope.deleteddeviations[i]
          }
        }
      };
      $scope.deviationarr.push($scope.deviationobj);
    }

    return $scope.deviationarr;
  };

  $scope.saveapproverstring = function () {
    var a = "";

    if ($scope.appr.adpdqp != undefined) {
      a = a + "ADPD Quality Plannner" + "##" + $scope.appr.adpdqp.TOKEN_ID + "$$$";
    } else {
      a = a + "ADPD Quality Plannner##$$$";
    }

    if ($scope.appr.platformowner != undefined) {
      a = a + "Platform Owner" + "##" + $scope.appr.platformowner.TOKEN_ID + "$$$";
    } else {
      a = a + "Platform Owner##$$$";
    }

    if ($scope.appr.adpdqh != undefined) {
      a = a + "ADPD Quality Head" + "##" + $scope.appr.adpdqh.TOKEN_ID + "$$$";
    } else {
      a = a + "ADPD Quality Head##$$$";
    }

    if ($scope.appr.cdmmhead != undefined) {
      a = a + "CDMM Head" + "##" + $scope.appr.cdmmhead.TOKEN_ID + "$$$";
    } else {
      a = a + "CDMM Head##$$$";
    }

    if ($scope.appr.ahph != undefined) {
      a = a + "ADPD Head or Powertrain Head" + "##" + $scope.appr.ahph.TOKEN_ID + "$$$";
    } else {
      a = a + "ADPD Head or Powertrain Head##$$$";
    }

    if ($scope.appr.operationhead != undefined) {
      a = a + "Operation Head" + "##" + $scope.appr.operationhead.TOKEN_ID + "$$$";
    } else {
      a = a + "Operation Head##$$$";
    }

    if ($scope.appr.pqohead != undefined) {
      a = a + "PQO Head" + "##" + $scope.appr.pqohead.TOKEN_ID + "$$$";
    } else {
      a = a + "PQO Head##$$$";
    }

    if ($scope.appr.president != undefined) {
      a = a + "President" + "##" + $scope.appr.president.TOKEN_ID + "$$$";
    } else {
      a = a + "President##$$$";
    }

    if ($scope.appr.pleader != undefined) {
      a = a + "Project Leader" + "##" + $scope.appr.pleader.TOKEN_ID + "$$$";
    } else {
      a = a + "Project Leader##$$$";
    }

    if ($scope.appr.pqhead != undefined) {
      a = a + "Product Quality Head" + "##" + $scope.appr.pqhead.TOKEN_ID + "$$$";
    } else {
      a = a + "Product Quality Head##$$$";
    }

    if ($scope.appr.cchead != undefined) {
      a = a + "Customer Care Head" + "##" + $scope.appr.cchead.TOKEN_ID + "$$$";
    } else {
      a = a + "Customer Care Head##$$$";
    }

    if ($scope.appr.pphead != undefined) {
      a = a + "Product Planning Head" + "##" + $scope.appr.pphead.TOKEN_ID + "$$$";
    } else {
      a = a + "Product Planning Head##$$$";
    }

    if ($scope.appr.qhead != undefined) {
      a = a + "Quality Head" + "##" + $scope.appr.qhead.TOKEN_ID + "$$$";
    } else {
      a = a + "Quality Head##$$$";
    }

    if ($scope.appr.adpdh != undefined) {
      a = a + "ADPD Head" + "##" + $scope.appr.adpdh.TOKEN_ID + "$$$";
    } else {
      a = a + "ADPD Head##";
    }

    return a;
  };

  $scope.saveapprovers = function () {
    var appstring = $scope.saveapproverstring();
    $.cordys.ajax({
      method: "AddGDMSProcessApprovers",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      parameters: {
        gdmsId: $scope.deviation.GDMS_ID,
        gdmsCode: $scope.deviation.GDMS_CODE,
        approverList: appstring
      },
      success: function success(d) {},
      fail: function fail(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
  };

  $scope.addRow = function () {
    var obj = {
      "DELIVERABLES": "",
      "IMPACT_LEVEL": "",
      "TARGET_IMPLE_DATE": "",
      "DEPARTMENT": "",
      "TRACKING_SCHEDULE": "",
      "RISK": "",
      "ROOT_CAUSE": "",
      "RISK_STATUS": "Open",
      "RISK_RESPONSE_STRATEGY": "",
      "INTERIM_CONT_PLAN": "",
      "PERM_CORRECTIVE_PLAN": "",
      "selected": ""
    };
    obj["new"] = true;
    $scope.deliverables.push(obj);
  };

  $scope.deleteRow = function () {
    var i;
    var len = $scope.deliverables.length;
    var count = 0;

    for (i = len - 1; i >= 0; i--) {
      if ($scope.deliverables[i].selected == true) {
        count++;
      }
    }

    if (count > 1) {
      toastr.error("Please select only one deviation at a time");
      return;
    }

    if (count == 0) {
      toastr.error("Please select at least on row to delete");
      return;
    }

    for (i = len - 1; i >= 0; i--) {
      if ($scope.deliverables[i].selected == true) {
        if ($scope.deliverables[i].DEVIATION_ID != undefined) $scope.deleteddeviations.push($scope.deliverables[i].DEVIATION_ID);
        $scope.deliverables.splice(i, 1);
      }
    }
  };

  $scope.deletedfile = [];

  $scope.gensavefilerequest = function () {
    $scope.fileupdtuple = {};
    $scope.fileupdarr = [];

    for (var i = 0; i < $scope.download.length; i++) {
      if ($scope.download[i].DOCUMENT_ID == undefined || $scope.deviation.STATUS == "REJECTED" && $scope.resubmitFlag == 1) {
        $scope.fileupdtuple = {
          "new": {
            "GDMS_TRA_DOCUMENTS": {
              "GDMS_ID": $scope.deviation.GDMS_ID,
              "GDMS_CODE": $scope.deviation.GDMS_CODE,
              "DOCUMENT_NAME": $scope.download[i].DOCUMENT_NAME,
              "DOCUMENT_PATH": $scope.download[i].DOCUMENT_PATH,
              "REMARKS": $scope.download[i].REMARKS,
              "UPLOADED_BY": localStorage.getItem("Username")
            }
          }
        };
        $scope.fileupdarr.push($scope.fileupdtuple);
      }
    }

    for (var i = 0; i < $scope.deletedfile.length; i++) {
      $scope.fileupdtuple = {
        "old": {
          "GDMS_TRA_DOCUMENTS": {
            "DOCUMENT_ID": $scope.deletedfile[i]
          }
        }
      };
      $scope.fileupdarr.push($scope.fileupdtuple);
    }

    $scope.deletedfile = [];
    return $scope.fileupdarr;
  };

  $scope.savefiledb = function () {
    var reqObj1 = {};
    reqObj1 = $scope.gensavefilerequest();

    if (reqObj1.length != 0) {
      $.cordys.ajax({
        method: "UpdateGdmsTraDocuments",
        namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
        dataType: "* json",
        parameters: {
          "tuple": reqObj1
        },
        success: function success(d) {
          $scope.GetDocByGDMSCode();
        },
        fail: function fail(jqXHR, textStatus, errorThrown) {
          alert("Error in loading data");
        }
      });
    }
  };

  $scope.genFileClrRequest = function (gclrid) {
    $scope.fileclrupdtuple = {};
    $scope.fileclrupdarr = [];

    for (var i = 0; i < $scope.clrdownload.length; i++) {
      if ($scope.clrdownload[i].DOCUMENT_ID == undefined) {
        $scope.fileclrupdtuple = {
          "new": {
            "GDMS_TRA_DOCUMENTS": {
              "GDMS_ID": gclrid,
              "GDMS_CODE": gclrid,
              "DOCUMENT_NAME": $scope.clrdownload[i].DOCUMENT_NAME,
              "DOCUMENT_PATH": $scope.clrdownload[i].DOCUMENT_PATH,
              "REMARKS": $scope.clrdownload[i].REMARKS,
              "UPLOADED_BY": localStorage.getItem("Username")
            }
          }
        };
        $scope.fileclrupdarr.push($scope.fileclrupdtuple);
      }
    }

    for (var i = 0; i < $scope.deletedfile.length; i++) {
      $scope.fileclrupdtuple = {
        "old": {
          "GDMS_TRA_DOCUMENTS": {
            "DOCUMENT_ID": $scope.deletedfile[i]
          }
        }
      };
      $scope.fileclrupdarr.push($scope.fileclrupdtuple);
    }

    $scope.deletedfile = [];
    return $scope.fileclrupdarr;
  };

  $scope.savefiledbclarify = function (clrid) {
    var reqObj1 = {};
    reqObj1 = $scope.genFileClrRequest(clrid);

    if (reqObj1.length != 0) {
      $.cordys.ajax({
        method: "UpdateGdmsTraDocuments",
        namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
        dataType: "* json",
        parameters: {
          "tuple": reqObj1
        },
        success: function success(d) {},
        fail: function fail(jqXHR, textStatus, errorThrown) {
          alert("Error in loading data");
        }
      });
    }
  };

  $scope.deletefileRow = function () {
    var i;
    var len = $scope.download.length;
    var count = 0;

    for (i = len - 1; i >= 0; i--) {
      if ($scope.download[i].selected == true) {
        count++;

        if ($scope.download[i].UPLOADED_BY != $scope.logr) {
          toastr.error("You are not authorised to delete these documents");
          return;
        }
      }
    }

    if (count == 0) {
      toastr.error("Please select at least one row to delete");
      return;
    }

    if (!confirm("Are you sure you want to delete this record")) return;

    for (i = len - 1; i >= 0; i--) {
      if ($scope.download[i].selected == true) {
        if ($scope.download[i].DOCUMENT_ID != undefined) $scope.deletedfile.push($scope.download[i].DOCUMENT_ID);
        $scope.download.splice(i, 1);
      }
    }
  };

  $scope.deleteClrFileRow = function () {
    var i;
    var len = $scope.clrdownload.length;
    var count = 0;

    for (i = len - 1; i >= 0; i--) {
      if ($scope.clrdownload[i].selected == true) {
        count++;

        if ($scope.clrdownload[i].UPLOADED_BY != $scope.logr) {
          toastr.error("You are not authorised to delete these documents");
          return;
        }
      }
    }

    if (count == 0) {
      toastr.error("Please select at least one row to delete");
      return;
    }

    if (!confirm("Are you sure you want to delete this record")) return;

    for (i = len - 1; i >= 0; i--) {
      if ($scope.clrdownload[i].selected == true) {
        if ($scope.clrdownload[i].DOCUMENT_ID != undefined) $scope.deletedfile.push($scope.clrdownload[i].DOCUMENT_ID);
        $scope.clrdownload.splice(i, 1);
      }
    }
  };

  $scope.pqhchange = function () {
    if ($scope.pqh == false) $scope.pqh = true;else $scope.pqh = false;
    $scope.appr.pqhead = null;
  };

  $scope.adpdqhchange = function () {
    if ($scope.adpdqhc == false) $scope.adpdqhc = true;else $scope.adpdqhc = false;
    $scope.appr.adpdqh = null;
  };

  $scope.adpdchange = function () {
    if ($scope.adpd == false) $scope.adpd = true;else $scope.adpd = false;
    $scope.appr.adpdh = null;
  };

  $scope.cdmmhchange = function () {
    if ($scope.cdmmh == false) $scope.cdmmh = true;else $scope.cdmmh = false;
    $scope.appr.cdmmhead = null;
  };

  $scope.ccheadchange = function () {
    if ($scope.cch == false) $scope.cch = true;else $scope.cch = false;
    $scope.appr.cchead = null;
  };

  $scope.ahphchange = function () {
    if ($scope.ahphc == false) $scope.ahphc = true;else $scope.ahphc = false;
    $scope.appr.ahph = null;
  };

  $scope.ohchange = function () {
    if ($scope.oh == false) $scope.oh = true;else $scope.oh = false;
    $scope.appr.operationhead = null;
  };

  $scope.pphchange = function () {
    if ($scope.pph == false) $scope.pph = true;else $scope.pph = false;
    $scope.appr.pphead = null;
  };

  $scope.submitTasks = function () {
    if ($scope.deviation.PROJECT_CODE == undefined || $scope.deviation.PROJECT_CODE == "") {
      toastr.error("Please enter Project Code");
      return;
    }

    if ($scope.deviation.GDMS_PLATFORM == undefined || $scope.deviation.GDMS_PLATFORM == "") {
      toastr.error("Please enter Platform");
      return;
    }

    if ($scope.deviation.GDMS_GATEWAY == undefined || $scope.deviation.GDMS_GATEWAY == "") {
      toastr.error("Please enter Gateway");
      return;
    }

    if ($scope.deviation.SCALABILITY == undefined || $scope.deviation.SCALABILITY == "") {
      toastr.error("Please enter Scalability ");
      return;
    }

    if ($scope.deviation.PROJCATEGORY == undefined || $scope.deviation.PROJCATEGORY == "") {
      toastr.error("Please enter Project Category");
      return;
    }

    if ($scope.pqh && ($scope.appr.pqhead == undefined || $scope.appr.pqhead == "")) {
      toastr.error("Please Enter Product Quality Head");
      return;
    }

    if ($scope.adpdqhc && ($scope.appr.adpdqh == undefined || $scope.appr.adpdqh == "")) {
      toastr.error("Please Enter ADPD Quality Head");
      return;
    }

    if ($scope.adpd && ($scope.appr.adpdh == undefined || $scope.appr.adpdh == "")) {
      toastr.error("Please Enter ADPD Head");
      return;
    }

    if ($scope.cdmmh && ($scope.appr.cdmmhead == undefined || $scope.appr.cdmmhead == "")) {
      toastr.error("Please Enter CDMM Head");
      return;
    }

    if ($scope.cch && ($scope.appr.cchead == undefined || $scope.appr.cchead == "")) {
      toastr.error("Please Enter Customer Care Head");
      return;
    }

    if ($scope.ahphc && ($scope.appr.ahph == undefined || $scope.appr.ahph == "")) {
      toastr.error("Please Enter ADPD Head Or PowerTrain Head");
      return;
    }

    if ($scope.pph && ($scope.appr.pphead == undefined || $scope.appr.pphead == "")) {
      toastr.error("Please Enter Product Planning Head");
      return;
    }

    if ($scope.oh && ($scope.appr.operationhead == undefined || $scope.appr.operationhead == "")) {
      toastr.error("Please Enter Operation Head");
      return;
    }

    if ($scope.appr.adpdqp == undefined || $scope.appr.adpdqp == "") {
      toastr.error("Please Enter ADPD Quality Planner");
      return;
    }

    if ($scope.appr.pleader == undefined || $scope.appr.pleader == "") {
      toastr.error("Please Enter Project Leader");
      return;
    }

    if ($scope.appr.platformowner == undefined || $scope.appr.platformowner == "") {
      toastr.error("Please Enter Platform Owner");
      return;
    }

    if ($scope.appr.qhead == undefined || $scope.appr.qhead == "") {
      toastr.error("Please Enter Quality Head");
      return;
    }

    if ($scope.appr.pqohead == undefined || $scope.appr.pqohead == "") {
      toastr.error("Please Enter PQO Head");
      return;
    }

    if ($scope.appr.president == undefined || $scope.appr.president == "") {
      toastr.error("Please Enter President");
      return;
    }

    if ($scope.deliverables.length == 0) {
      toastr.error("Please add Deliverables");
      return;
    }

    for (var i = 0; i < $scope.deliverables.length; i++) {
      if ($scope.deliverables[i].DEPARTMENT == undefined || $scope.deliverables[i].DEPARTMENT == "") {
        toastr.error("Please Enter Department for Deliverable - " + ("0" + (i + 1)).slice(-2));
        return;
      }

      if ($scope.deliverables[i].IMPACT_LEVEL == undefined || $scope.deliverables[i].IMPACT_LEVEL == "") {
        toastr.error("Please Enter Impact Level for Deliverable - " + ("0" + (i + 1)).slice(-2));
        return;
      }

      if ($scope.deliverables[i].DELIVERABLES == undefined || $scope.deliverables[i].DELIVERABLES == "") {
        toastr.error("Please Enter details for Deliverable - " + ("0" + (i + 1)).slice(-2));
        return;
      }

      if ($scope.deliverables[i].RISK_MANAGER == undefined || $scope.deliverables[i].RISK_MANAGER == "") {
        toastr.error("Please Enter RISK MANAGER for " + $scope.deviation.PROJECT_CODE + "-" + $scope.deviation.GDMS_GATEWAY + "-" + $scope.deliverables[i].DEPARTMENT + "-" + ("0" + (i + 1)).slice(-2));
        return;
      } else if ($scope.deliverables[i].RISK_MANAGER.TOKEN_ID == null) {
        toastr.error("Please Enter RISK MANAGER for " + $scope.deviation.PROJECT_CODE + "-" + $scope.deviation.GDMS_GATEWAY + "-" + $scope.deliverables[i].DEPARTMENT + "-" + ("0" + (i + 1)).slice(-2));
        return;
      }

      if ($scope.deliverables[i].RISK_OWNER == undefined || $scope.deliverables[i].RISK_OWNER == "") {
        toastr.error("Please Enter RISK OWNER for " + $scope.deviation.PROJECT_CODE + "-" + $scope.deviation.GDMS_GATEWAY + "-" + $scope.deliverables[i].DEPARTMENT + "-" + ("0" + (i + 1)).slice(-2));
        return;
      } else if ($scope.deliverables[i].RISK_OWNER.TOKEN_ID == null) {
        toastr.error("Please Enter RISK OWNER for " + $scope.deviation.PROJECT_CODE + "-" + $scope.deviation.GDMS_GATEWAY + "-" + $scope.deliverables[i].DEPARTMENT + "-" + ("0" + (i + 1)).slice(-2));
        return;
      }

      if ($scope.deliverables[i].RISK_MANAGER.TOKEN_ID == localStorage.getItem("Username") && $scope.deviation.CURRENT_STAGE == "RISK MANAGER") {
        if ($scope.deliverables[i].TRACKING_SCHEDULE == undefined || $scope.deliverables[i].TRACKING_SCHEDULE == "") {
          toastr.error("Please Select Tracking Schedule for Deliverable - " + $scope.deviation.GDMS_GATEWAY + "-" + $scope.deliverables[i].DEPARTMENT + "-" + ("0" + (i + 1)).slice(-2));
          return;
        }

        if ($scope.deliverables[i].DELIVERABLES == undefined || $scope.deliverables[i].DELIVERABLES == "") {
          toastr.error("Please enter Deliverables for " + $scope.deviation.PROJECT_CODE + "-" + $scope.deviation.GDMS_GATEWAY + "-" + $scope.deliverables[i].DEPARTMENT + "-" + ("0" + (i + 1)).slice(-2));
          return;
        }

        if ($scope.deliverables[i].RISK == "" || $scope.deliverables[i].RISK == undefined) {
          toastr.error("Please enter Risk for Product/Customer Deliverable - " + $scope.deviation.GDMS_GATEWAY + "-" + $scope.deliverables[i].DEPARTMENT + "-" + ("0" + (i + 1)).slice(-2));
          return;
        }

        if ($scope.deliverables[i].IMPACT_LEVEL == undefined || $scope.deliverables[i].IMPACT_LEVEL == "") {
          toastr.error("Please enter Impact Level for Deliverable - " + $scope.deviation.GDMS_GATEWAY + "-" + $scope.deliverables[i].DEPARTMENT + "-" + ("0" + (i + 1)).slice(-2));
          return;
        }

        if ($scope.deliverables[i].ROOT_CAUSE == undefined || $scope.deliverables[i].ROOT_CAUSE == "") {
          toastr.error("Please enter Root Cause for Deliverable - " + $scope.deviation.GDMS_GATEWAY + "-" + $scope.deliverables[i].DEPARTMENT + "-" + ("0" + (i + 1)).slice(-2));
          return;
        }

        if ($scope.deliverables[i].RISK_RESPONSE_STRATEGY == undefined || $scope.deliverables[i].RISK_RESPONSE_STRATEGY == "") {
          toastr.error("Please enter Risk Response Strategy for Deliverable - " + $scope.deviation.GDMS_GATEWAY + "-" + $scope.deliverables[i].DEPARTMENT + "-" + ("0" + (i + 1)).slice(-2));
          return;
        }

        if ($scope.deliverables[i].INTERIM_CONT_PLAN == undefined || $scope.deliverables[i].INTERIM_CONT_PLAN == "") {
          toastr.error("Please enter Interim Containment Plan for Deliverable - " + $scope.deviation.GDMS_GATEWAY + "-" + $scope.deliverables[i].DEPARTMENT + "-" + ("0" + (i + 1)).slice(-2));
          return;
        }

        if ($scope.deliverables[i].PERM_CORRECTIVE_PLAN == undefined || $scope.deliverables[i].PERM_CORRECTIVE_PLAN == "") {
          toastr.error("Please enter Permanent Corrective Plan for Deliverable - " + $scope.deviation.GDMS_GATEWAY + "-" + $scope.deliverables[i].DEPARTMENT + "-" + ("0" + (i + 1)).slice(-2));
          return;
        }

        if ($scope.deliverables[i].START_DATE == "" || $scope.deliverables[i].START_DATE == undefined) {
          toastr.error("Please enter Start Date for Deliverable - " + $scope.deviation.GDMS_GATEWAY + "-" + $scope.deliverables[i].DEPARTMENT + "-" + ("0" + (i + 1)).slice(-2));
          return;
        }

        if ($scope.deliverables[i].TARGET_IMPLE_DATE == "" || $scope.deliverables[i].TARGET_IMPLE_DATE == undefined) {
          toastr.error("Please enter Target Implentation Date for Deliverable - " + $scope.deviation.GDMS_GATEWAY + "-" + $scope.deliverables[i].DEPARTMENT + "-" + ("0" + (i + 1)).slice(-2));
          return;
        }

        if ($scope.deliverables[i].RISK_STATUS == "" || $scope.deliverables[i].RISK_STATUS == undefined) {
          toastr.error("Please enter Risk Status for Deliverable - " + $scope.deviation.GDMS_GATEWAY + "-" + $scope.deliverables[i].DEPARTMENT + "-" + ("0" + (i + 1)).slice(-2));
          return;
        }

        if ($scope.deliverables[i].DEPARTMENT == undefined || $scope.deliverables[i].DEPARTMENT == "") {
          toastr.error("Please enter Department for Deliverable - " + ("0" + (i + 1)).slice(-2));
          return;
        }
      }
    }

    if ($scope.deviation.STATUS == "REJECTED") {
      $.cordys.ajax({
        method: "UpdateGdmsTraGdmsReq",
        namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
        dataType: "* json",
        parameters: {
          "tuple": {
            "new": {
              "GDMS_TRA_GDMS_REQ": {
                "GDMS_CODE": $scope.deviation.GDMS_CODE,
                "PROJECT_CODE": $scope.deviation.PROJECT_CODE,
                "GDMS_PLATFORM": $scope.deviation.GDMS_PLATFORM,
                "GDMS_GATEWAY": $scope.deviation.GDMS_GATEWAY,
                "NO_OF_RED_DELI": $scope.deviation.NO_OF_RED_DELI,
                "NO_OF_GREEN_DELI": $scope.deviation.NO_OF_GREEN_DELI,
                "NO_OF_YELLOW_DELI": $scope.deviation.NO_OF_YELLOW_DELI,
                "PLANT_CODE": $scope.deviation.PLANT_CODE,
                "GDMS_FUNCTION": $scope.deviation.GDMS_FUNCTION,
                "GDMS_DIVISION": $scope.deviation.GDMS_DIVISION,
                "SCALABILITY": $scope.deviation.SCALABILITY,
                "PROJCATEGORY": $scope.deviation.PROJCATEGORY,
                "CURRENT_STAGE": "INITIATOR",
                "CURRENT_OWNER": localStorage.getItem("Username"),
                "WORKFLOW_REMARKS": $scope.workflowrem,
                "STATUS": "REVIEWED",
                "SUBMITTED_BY": localStorage.getItem("Username"),
                "REVISION": Number($scope.deviation.REVISION) + 1,
                "REVISION_DATE": new Date().toISOString()
              }
            }
          }
        },
        success: function success(d) {
          $scope.resp = $.cordys.json.findObjects(d, "GDMS_TRA_GDMS_REQ");
          $scope.deviation.GDMS_CODE = $scope.resp[0].GDMS_CODE;
          $scope.deviation.GDMS_ID = $scope.resp[0].GDMS_ID;
          $scope.deviation.CURRENT_STAGE = $scope.resp[0].CURRENT_STAGE;

          for (var i = 0; i < $scope.download.length; i++) {
            $scope.download[i].DOCUMENT_ID = undefined;
          }

          $scope.$apply();
          $scope.resubmitFlag = 1;
          $scope.savedeviations();
          $scope.saveapprovers();
          $scope.savefiledb();
          $scope.resubmitFlag = 0;
          $scope.GDMSApprovalFlow();
          toastr.success("Data Submitted Successfully and New revision created for : " + $scope.deviation.GDMS_CODE);
        },
        fail: function fail(jqXHR, textStatus, errorThrown) {
          alert("Error in loading data");
        }
      });
    }

    $scope.saveGDMS('SUBMITTED');

    if ($scope.taskid == "") {} else {
      $scope.completetask();
      $.cordys.ajax({
        method: "UpdateGdmsTraTasks",
        namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
        dataType: "* json",
        parameters: {
          "tuple": {
            "old": {
              "GDMS_TRA_TASKS": {
                "GDMS_TASK_ID": $scope.gdmstaskid
              }
            },
            "new": {
              "GDMS_TRA_TASKS": {
                "GDMS_TASK_ID": $scope.gdmstaskid,
                "STATUS": 'COMPLETED',
                "COMPLETED_ON": new Date().toISOString(),
                "COMPLETED_BY": localStorage.getItem("Username"),
                "REMARKS": $scope.workflowrem,
                "DECISION": "APPROVED"
              }
            }
          }
        },
        success: function success(d) {
          if ($scope.deviation.CURRENT_STAGE = "PRESIDENT") {
            toastr.success("Task Approved Successfully");
          } else if ($scope.deviation.CURRENT_STAGE = "QUALITY HEAD") {
            toastr.success("Task Reviewed Successfully");
          } else {
            toastr.success("Task Submitted Successfully");
          }
        },
        fail: function fail(jqXHR, textStatus, errorThrown) {
          alert("Error in loading data");
        }
      });
    }

    $scope.submitdisabled = true;
    $scope.viewmode = "true";
    setTimeout(function () {
      if ($scope.accessedfromInbox != true) $state.go('app.main.mytasks');
    }, 500);
  };

  $scope.clarificationReq = function () {
    $scope.tempUser = [];
    $scope.query = "";
    document.getElementById("labX").innerHTML = "Choose File";
    $scope.clrdownload = [];
    $.cordys.ajax({
      method: "GetalluserDetails",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      success: function success(e) {
        $scope.allUsers = $.cordys.json.findObjects(e, 'USER_MASTER');
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
  };

  $scope.userTextChange = function (search) {
    return new Promise(function (resolve, reject) {
      if (search.length == 3) {
        $.cordys.ajax({
          method: "GetFilteredUserDetails",
          namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
          dataType: "* json",
          parameters: {
            nameId: search
          },
          success: function success(e) {
            $scope.filteredUsers = [];

            if (e.tuple != undefined) {
              var temp = $.cordys.json.findObjects(e, 'USER_MASTER');
              if (!temp.length) $scope.filteredUsers.push(temp);else $scope.filteredUsers = temp;
              resolve($scope.filteredUsers);
            } else {
              resolve($scope.filteredUsers);
            }
          },
          error: function error(jqXHR, textStatus, errorThrown) {
            alert("Error in loading data");
            reject([]);
          }
        });
      } else if (search.length > 3) {
        resolve($scope.filteredUsers.filter(function (obj, index) {
          if (obj.FULLNAME.indexOf(search) > -1) return obj.FULLNAME;
        }));
      }
    });
  };

  $scope.getUsers = getUsers;

  function getUsers(search) {
    return $scope.userTextChange(search).then(function (success) {
      return success;
    }, function (error) {
      return error;
    });
  }

  $scope.clarificationSubmit = function () {
    var uid = $scope.tempUser.substring(0, $scope.tempUser.lastIndexOf('-'));
    $.cordys.ajax({
      method: "UpdateGdmsTraClarifications",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      parameters: {
        "tuple": {
          "new": {
            "GDMS_TRA_CLARIFICATIONS": {
              "GDMS_ID": $scope.deviation.GDMS_ID,
              "GDMS_CODE": $scope.deviation.GDMS_CODE,
              "CLARIFIED_BY": uid,
              "REQUEST_QUERY": $scope.query
            }
          }
        }
      },
      success: function success(d) {
        $scope.resp1 = $.cordys.json.findObjects(d, "GDMS_TRA_CLARIFICATIONS");
        $scope.savefiledbclarify($scope.resp1[0].CLARIFICATION_ID);
        $.cordys.ajax({
          method: "GDMSClarificationFlow_WS",
          namespace: "http://schemas.cordys.com/default",
          dataType: "* json",
          parameters: {
            CLF_ID: $scope.resp1[0].CLARIFICATION_ID
          },
          success: function success(e) {
            toastr.success(" Clarification Request Submitted Successfully");
          },
          fail: function fail(jqXHR, textStatus, errorThrown) {
            alert("Error in TRIGGERING");
          }
        });
      },
      fail: function fail(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
  };

  $scope.rejectTasks = function () {
    if ($scope.workflowrem == "" || $scope.workflowrem == undefined) {
      toastr.error("Please enter Workflow Remarks");
      return;
    }

    $.cordys.ajax({
      method: "UpdateGdmsTraGdmsReq",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      parameters: {
        "tuple": {
          "old": {
            "GDMS_TRA_GDMS_REQ": {
              "GDMS_ID": $scope.deviation.GDMS_ID
            }
          },
          "new": {
            "GDMS_TRA_GDMS_REQ": {
              "GDMS_ID": $scope.deviation.GDMS_ID,
              "PROJECT_CODE": $scope.deviation.PROJECT_CODE,
              "GDMS_PLATFORM": $scope.deviation.GDMS_PLATFORM,
              "GDMS_GATEWAY": $scope.deviation.GDMS_GATEWAY,
              "NO_OF_RED_DELI": $scope.deviation.NO_OF_RED_DELI,
              "NO_OF_GREEN_DELI": $scope.deviation.NO_OF_GREEN_DELI,
              "NO_OF_YELLOW_DELI": $scope.deviation.NO_OF_YELLOW_DELI,
              "PLANT_CODE": $scope.deviation.PLANT_CODE,
              "GDMS_FUNCTION": $scope.deviation.GDMS_FUNCTION,
              "GDMS_DIVISION": $scope.deviation.GDMS_DIVISION,
              "SCALABILITY": $scope.deviation.SCALABILITY,
              "PROJCATEGORY": $scope.deviation.PROJCATEGORY,
              "WORKFLOW_REMARKS": $scope.workflowrem,
              "STATUS": "REJECTED"
            }
          }
        }
      },
      success: function success(d) {
        $scope.savefiledb();
        toastr.success("GDMS Rejected Successfully");
      },
      fail: function fail(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
    $.cordys.ajax({
      method: "GetPendingParallelTask",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      parameters: {
        "gdmsCode": $scope.deviation.GDMS_ID
      },
      success: function success(d) {},
      fail: function fail(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });

    if ($scope.deviation.CURRENT_STAGE != "CDMM/CCHEAD/OH/PH") {
      $.cordys.ajax({
        method: "UpdateGdmsTraTasks",
        namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
        dataType: "* json",
        parameters: {
          "tuple": {
            "old": {
              "GDMS_TRA_TASKS": {
                "GDMS_TASK_ID": $scope.gdmstaskid
              }
            },
            "new": {
              "GDMS_TRA_TASKS": {
                "GDMS_TASK_ID": $scope.gdmstaskid,
                "STATUS": 'COMPLETED',
                "COMPLETED_ON": new Date().toISOString(),
                "COMPLETED_BY": localStorage.getItem("Username"),
                "REMARKS": $scope.workflowrem,
                "DECISION": "REJECTED"
              }
            }
          }
        },
        success: function success(d) {},
        fail: function fail(jqXHR, textStatus, errorThrown) {
          alert("Error in loading data");
        }
      });
      $scope.completetask();
      $scope.viewmode = "true";
    }

    $state.go('app.main.mytasks');
  };

  $scope.clarificationHis = function () {
    $scope.nextPageNum1 = 1;
    $scope.nextPageNum2 = 1;
    $scope.pageAnch = true;
    $.cordys.ajax({
      method: "GetClarificationHistory",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      parameters: {
        gdmsCode: $scope.deviation.GDMS_CODE,
        gdmsId: $scope.deviation.GDMS_ID
      },
      success: function success(e) {
        $scope.res1 = $.cordys.json.findObjects(e, 'user_master');
        initNgTable1($scope.res1);
        $scope.$apply();
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
  };

  $scope.workflowHis = function () {
    $scope.nextPageNum1 = 1;
    $scope.nextPageNum2 = 1;
    $scope.pageAnch = true;
    $.cordys.ajax({
      method: "GetWorkflowHistory",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      parameters: {
        gdmsCode: $scope.deviation.GDMS_CODE,
        gdmsId: $scope.deviation.GDMS_ID
      },
      success: function success(e) {
        $scope.res2 = $.cordys.json.findObjects(e, 'GDMS_TRA_TASKS');
        initNgTable2($scope.res2);
        $scope.$apply();
        setTimeout(function () {
          var statusElements = document.querySelectorAll('td[data-title-text="Status"]');

          for (var i = 0; i < statusElements.length; i++) {
            if (statusElements[i].innerHTML == "IN PROGRESS") statusElements[i].style.color = "blue";else if (statusElements[i].innerHTML == "APPROVED" || statusElements[i].innerHTML == "APPROVED") statusElements[i].style.color = "green";else statusElements[i].style.color = "red";
          }
        }, 500);
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
  };

  $scope.createnewversion = function () {
    $.cordys.ajax({
      method: "UpdateGdmsTraGdmsReq",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      parameters: {
        "tuple": {
          "old": {
            "GDMS_TRA_GDMS_REQ": {
              "GDMS_ID": $scope.deviation.GDMS_ID
            }
          },
          "new": {
            "GDMS_TRA_GDMS_REQ": {
              "GDMS_ID": $scope.deviation.GDMS_ID,
              "STATUS": "CLOSED",
              "CLOSED_BY": $scope.username,
              "CLOSED_ON": new Date().toISOString()
            }
          }
        }
      },
      success: function success(res) {
        $.cordys.ajax({
          method: "UpdateGdmsTraGdmsReq",
          namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
          dataType: "* json",
          parameters: {
            "tuple": {
              "new": {
                "GDMS_TRA_GDMS_REQ": {
                  "GDMS_CODE": $scope.deviation.GDMS_CODE,
                  "PROJECT_CODE": $scope.deviation.PROJECT_CODE,
                  "GDMS_PLATFORM": $scope.deviation.GDMS_PLATFORM,
                  "GDMS_GATEWAY": $scope.deviation.GDMS_GATEWAY,
                  "NO_OF_RED_DELI": $scope.deviation.NO_OF_RED_DELI,
                  "NO_OF_GREEN_DELI": $scope.deviation.NO_OF_GREEN_DELI,
                  "NO_OF_YELLOW_DELI": $scope.deviation.NO_OF_YELLOW_DELI,
                  "PLANT_CODE": $scope.deviation.PLANT_CODE,
                  "GDMS_FUNCTION": $scope.deviation.GDMS_FUNCTION,
                  "GDMS_DIVISION": $scope.deviation.GDMS_DIVISION,
                  "SCALABILITY": $scope.deviation.SCALABILITY,
                  "PROJCATEGORY": $scope.deviation.PROJCATEGORY,
                  "WORKFLOW_REMARKS": $scope.workflowrem,
                  "CURRENT_STAGE": '',
                  "STATUS": "OPEN",
                  "REVISION": Number($scope.deviation.REVISION) + 1,
                  "REVISION_DATE": new Date().toISOString(),
                  "SUBMITTED_BY": $scope.deviation.SUBMITTED_BY,
                  "SUBMITTED_ON": $scope.deviation.SUBMITTED_ON.toISOString()
                }
              }
            }
          },
          success: function success(d) {
            $scope.resp = $.cordys.json.findObjects(d, "GDMS_TRA_GDMS_REQ");
            $scope.deviation.GDMS_CODE = $scope.resp[0].GDMS_CODE;
            $scope.deviation.GDMS_ID = $scope.resp[0].GDMS_ID;
            $scope.deviation.CURRENT_STAGE = $scope.resp[0].CURRENT_STAGE;
            $scope.headerText = $scope.deviation.GDMS_CODE;

            for (var i = 0; i < $scope.download.length; i++) {
              $scope.download[i].DOCUMENT_ID = undefined;
            }

            $scope.$apply();
            $scope.savedeviations();
            $scope.saveapprovers();
            $scope.savefiledb();
            toastr.success("New Version of GDMS created with updated Date");
          },
          fail: function fail(jqXHR, textStatus, errorThrown) {
            alert("Error in loading data");
          }
        });
      },
      fail: function fail(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
  };

  $scope.timold = [];

  $scope.GetDeviationsByGDMSCode = function () {
    $.cordys.ajax({
      method: "GetDeviationsByGDMSCode",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      parameters: {
        gdmsCode: $scope.deviation.GDMS_ID
      },
      success: function success(d) {
        $scope.deliverables = $.cordys.json.findObjects(d, "user_master");

        for (var i = 0; i < $scope.deliverables.length; i++) {
          $scope.timold.push($scope.deliverables[i].TARGET_IMPLE_DATE);
          $scope.deliverables[i].RISK_OWNER = {
            "TOKEN_ID": $scope.deliverables[i].TRO,
            "USERTEXT": $scope.deliverables[i].ARO
          };
          $scope.deliverables[i].RISK_MANAGER = {
            "TOKEN_ID": $scope.deliverables[i].TRM,
            "USERTEXT": $scope.deliverables[i].ARM
          };
        }
      },
      fail: function fail(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
  };

  $scope.GetAppForGDMSCode = function () {
    $.cordys.ajax({
      method: "GetAppForGDMSCode",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      parameters: {
        gdmsCode: $scope.deviation.GDMS_ID
      },
      success: function success(d) {
        $scope.approvers = $.cordys.json.findObjects(d, "GDMS_TRA_APPROVERS");

        for (var i = 0; i < $scope.approvers.length; i++) {
          switch ($scope.approvers[i].APPROVER_ROLE) {
            case "Platform Owner":
              $scope.appr.platformowner = {
                "TOKEN_ID": $scope.approvers[i].TOKEN_ID,
                "USERTEXT": $scope.approvers[i].APPRSTRING
              };
              break;

            case "Project Leader":
              $scope.appr.pleader = {
                "TOKEN_ID": $scope.approvers[i].TOKEN_ID,
                "USERTEXT": $scope.approvers[i].APPRSTRING
              };
              break;

            case "ADPD Quality Head":
              $scope.appr.adpdqh = {
                "TOKEN_ID": $scope.approvers[i].TOKEN_ID,
                "USERTEXT": $scope.approvers[i].APPRSTRING
              };
              if ($scope.approvers[i].TOKEN_ID) $scope.adpdqhc = true;
              break;

            case "CDMM Head":
              $scope.appr.cdmmhead = {
                "TOKEN_ID": $scope.approvers[i].TOKEN_ID,
                "USERTEXT": $scope.approvers[i].APPRSTRING
              };
              if ($scope.approvers[i].TOKEN_ID) $scope.cdmmh = true;
              break;

            case "ADPD Head or Powertrain Head":
              $scope.appr.ahph = {
                "TOKEN_ID": $scope.approvers[i].TOKEN_ID,
                "USERTEXT": $scope.approvers[i].APPRSTRING
              };
              if ($scope.approvers[i].TOKEN_ID) $scope.ahphc = true;
              break;

            case "ADPD Head":
              $scope.appr.adpdh = {
                "TOKEN_ID": $scope.approvers[i].TOKEN_ID,
                "USERTEXT": $scope.approvers[i].APPRSTRING
              };
              if ($scope.approvers[i].TOKEN_ID) $scope.adpd = true;
              break;

            case "Operation Head":
              $scope.appr.operationhead = {
                "TOKEN_ID": $scope.approvers[i].TOKEN_ID,
                "USERTEXT": $scope.approvers[i].APPRSTRING
              };
              if ($scope.approvers[i].TOKEN_ID) $scope.oh = true;
              break;

            case "President":
              $scope.appr.president = {
                "TOKEN_ID": $scope.approvers[i].TOKEN_ID,
                "USERTEXT": $scope.approvers[i].APPRSTRING
              };
              break;

            case "Product Quality Head":
              $scope.appr.pqhead = {
                "TOKEN_ID": $scope.approvers[i].TOKEN_ID,
                "USERTEXT": $scope.approvers[i].APPRSTRING
              };
              if ($scope.approvers[i].TOKEN_ID) $scope.pqh = true;
              break;

            case "Customer Care Head":
              $scope.appr.cchead = {
                "TOKEN_ID": $scope.approvers[i].TOKEN_ID,
                "USERTEXT": $scope.approvers[i].APPRSTRING
              };
              if ($scope.approvers[i].TOKEN_ID) $scope.cch = true;
              break;

            case "Product Planning Head":
              $scope.appr.pphead = {
                "TOKEN_ID": $scope.approvers[i].TOKEN_ID,
                "USERTEXT": $scope.approvers[i].APPRSTRING
              };
              if ($scope.approvers[i].TOKEN_ID) $scope.pph = true;
              break;

            case "Quality Head":
              $scope.appr.qhead = {
                "TOKEN_ID": $scope.approvers[i].TOKEN_ID,
                "USERTEXT": $scope.approvers[i].APPRSTRING
              };
              break;

            case "ADPD Quality Plannner":
              $scope.appr.adpdqp = {
                "TOKEN_ID": $scope.approvers[i].TOKEN_ID,
                "USERTEXT": $scope.approvers[i].APPRSTRING
              };
              break;

            case "PQO Head":
              $scope.appr.pqohead = {
                "TOKEN_ID": $scope.approvers[i].TOKEN_ID,
                "USERTEXT": $scope.approvers[i].APPRSTRING
              };
          }
        }
      },
      fail: function fail(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
  };

  $scope.changeStatus = function () {
    var changeStatusFlag = 0;
    $scope.savedeviations();

    for (var i = 0; i < $scope.deliverables.length; i++) {
      if (new Date($scope.timold[i]).getTime() != new Date($scope.deliverables[i].TARGET_IMPLE_DATE).getTime()) {
        $scope.createnewversion();
        changeStatusFlag = 1;
        $state.go('app.main.mytasks');
        return;
      }
    }

    if (changeStatusFlag == 0) toastr.success("Data Saved Successfully");
    $state.go('app.main.mytasks');
  };

  $scope.manageTextareaHeight = function (tableName) {
    var tableRows = document.getElementById(tableName).rows;

    for (var i = 1; i < tableRows.length; i++) {
      var rowHeight = $(tableRows[i]).height();
      document.getElementById(tableName).rows[i].getElementsByTagName("textarea")[0].style.height = $(document.getElementById(tableName).rows[i]).height() - 1 + "px";
    }
  };

  $scope.GetDocByGDMSCode = function () {
    $.cordys.ajax({
      method: "GetDocByGDMSCode",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      parameters: {
        gdmsCode: $scope.deviation.GDMS_ID
      },
      success: function success(d) {
        $scope.download = $.cordys.json.findObjects(d, "GDMS_TRA_DOCUMENTS");

        for (var i = 0; i < $scope.download.length; i++) {
          $scope.download[i].UPLOADED_ON = $scope.download[i].UPLOADED_ON.substring(8, 10) + "-" + $scope.download[i].UPLOADED_ON.substring(5, 8) + $scope.download[i].UPLOADED_ON.substring(0, 4);
        }

        $scope.$apply();
        $scope.manageTextareaHeight("remarkTable1");
      },
      fail: function fail(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
  };

  $scope.rback = function () {
    if ($scope.gdmstaskid != "") $state.go('app.main.mytasks');else $state.go('app.main.report');
  };

  $scope.Getgdmsreqbyno = function () {
    $.cordys.ajax({
      method: "Getgdmsreqbyno",
      namespace: "http://schemas.cordys.com/GDMS_WSAppSerPackage",
      dataType: "* json",
      parameters: {
        gdmsno: $scope.deviation.GDMS_ID
      },
      success: function success(d) {
        $scope.deviation = $.cordys.json.findObjects(d, "USER_MASTER")[0];
        if ($scope.deviation.CURRENT_STAGE != 'INITIATOR' || $scope.deviation.STATUS == 'REJECTED') $scope.gettaskid();
        $scope.deviation.NO_OF_YELLOW_DELI = $scope.deviation.NO_OF_YELLOW_DELI ? Number($scope.deviation.NO_OF_YELLOW_DELI) : '';
        $scope.deviation.NO_OF_GREEN_DELI = $scope.deviation.NO_OF_GREEN_DELI ? Number($scope.deviation.NO_OF_GREEN_DELI) : '';
        $scope.deviation.NO_OF_RED_DELI = $scope.deviation.NO_OF_RED_DELI ? Number($scope.deviation.NO_OF_RED_DELI) : '';
        $scope.deviation.SUBMITTED_ON = $scope.deviation.SUBMITTED_ON ? new Date($scope.deviation.SUBMITTED_ON) : new Date();
        if ($scope.deviation.CURRENT_STAGE == "PRESIDENT" || !$scope.deviation.CURRENT_STAGE) $scope.buttonname = "Approve";else if ($scope.deviation.CURRENT_STAGE == "QUALITY HEAD" || !$scope.deviation.CURRENT_STAGE) $scope.buttonname = "Review";else $scope.buttonname = "Submit Request";

        if (localStorage.currentuserroles.indexOf("ADPD Quality Plannner") != -1 || localStorage.currentuserroles.indexOf("ADPD Quality Head") != -1) {
          $scope.node = true;

          if ($scope.deviation.CURRENT_STAGE == "Open") {
            $scope.viewmode = "false";
          }
        } else if ($scope.viewmode == "true") {
          $scope.deviation.CURRENT_STAGE = "ViewMode";
        }

        $scope.$apply();
      },
      fail: function fail(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
  };

  $scope.GDMSApprovalFlow = function () {
    $.cordys.ajax({
      method: "GDMSApprovalFlow_WS",
      namespace: "http://schemas.cordys.com/default",
      dataType: "* json",
      parameters: {
        GDMS_CODE: $scope.deviation.GDMS_CODE,
        GDMS_ID: $scope.deviation.GDMS_ID
      },
      success: function success(d) {},
      fail: function fail(jqXHR, textStatus, errorThrown) {
        alert("Error in TRIGGERING");
      }
    });
  };
});