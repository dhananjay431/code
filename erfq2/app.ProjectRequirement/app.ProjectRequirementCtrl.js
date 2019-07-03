"use strict";

angular.module('App.mainApp').controller('app.ProjectRequirementCtrl', function ($scope, Upload, $window, $log, $state, NgTableParams) {
  $(function () {
    $('body').on('focus', ".datepicker", function () {
      $(this).datepicker({
        dateFormat: 'yy-mm-dd',
        onSelect: function onSelect(dateText) {
          console.log(dateText);
          console.log($(this).data('id'));
          var id = $(this).data('id');
          var d = dateText;
          d = new Date(d);
          var year = d.getFullYear();
          var month = (1 + d.getMonth()).toString();
          var day = d.getDate();
          $scope.changedData[id].EVENT_DATE = year + "-" + month + "-" + day;
          console.log($scope.changedData);

          if (document.getElementById("PList") != null) {
            document.getElementById("some-submit-element").disabled = false;
            document.getElementById("nextbtn").disabled = true;
          }
        }
      });
    });
  });

  if (localStorage.role != 'MSIE') {
    $state.go('main');
  }

  var vm = this;
  var data = [];

  if (localStorage.projectCode != undefined) {
    $scope.pass = JSON.parse(localStorage.projectCode);

    if (JSON.parse(localStorage.projectCode).ProjectCode != undefined) {
      $scope.Plist = JSON.parse(localStorage.projectCode).ProjectCode;
      $scope.MSIE = null;
      $scope.StampingLead = null;
      $scope.Total_Vol = null;
      $scope.Total_Prod = null;
      $scope.Total_Duration = null;
      $scope.Total_Waranty = null;
      $scope.FileArray = [];
      $.cordys.ajax({
        method: "GetERFQProjectMembers",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        parameters: {
          "projectCode": JSON.parse(localStorage.projectCode).ProjectCode
        },
        success: function success(data) {
          $scope.Incharges = $.cordys.json.findObjects(data, "AFS_PROJ_MEMBERS");

          for (var i = 0; i < $scope.Incharges.length; i++) {
            if ($scope.Incharges[i].AFSPM_MEMBER_ROLE == "MSIE") {
              $scope.MSIE = $scope.Incharges[i].AFSPM_MEMBER_NAME;
            }

            if ($scope.Incharges[i].AFSPM_MEMBER_ROLE == "Stamping Lead") {
              $scope.StampingLead = $scope.Incharges[i].AFSPM_MEMBER_NAME;
            }
          }

          $scope.$apply();
        },
        error: function error(jqXHR, textStatus, errorThrown) {
          toastr.error("Unable to load data. Please try refreshing the page.");
        }
      });
      $.cordys.ajax({
        method: "GetERFQ_PROJECT_REQObject",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        parameters: {
          "PROJECT_CODE": JSON.parse(localStorage.projectCode).ProjectCode
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
          toastr.error("Unable to load data. Please try refreshing the page.");
        }
      });
      $.cordys.ajax({
        method: "GetERFQAllUploadedDoc",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        parameters: {
          "projectCode": JSON.parse(localStorage.projectCode).ProjectCode,
          "documentType": "ProjectReq"
        },
        success: function success(data) {
          $scope.FileArray = $.cordys.json.findObjects(data, "ERFQ_UPLOADED_DOCUMENT_HISTORY");
          $scope.$apply();
        },
        error: function error(jqXHR, textStatus, errorThrown) {
          toastr.error("Unable to load data. Please try refreshing the page.");
        }
      });
      $.cordys.ajax({
        method: "GetEventsforProject",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        parameters: {
          "ProjectCode": JSON.parse(localStorage.projectCode).ProjectCode
        },
        success: function success(data) {
          $scope.PannelSupplyIdsArray = [];
          $scope.tableDetails = $.cordys.json.findObjects(data, "erfq_pannel_supply");

          if ($scope.tableDetails.length != 0) {
            $scope.checkDetails = $scope.tableDetails;
            $scope.tableArray = [];
          } else {
            $scope.getTableDataInitial();
          }

          $scope.tableArray = $.cordys.json.findObjects(data, "erfq_pannel_supply");

          for (var i = 0; i < $scope.tableArray.length; i++) {
            if ($scope.tableArray[i].PANNEL_SUPPLY_ID != "" && $scope.tableArray[i].PANNEL_SUPPLY_ID != null && $scope.tableArray[i].PANNEL_SUPPLY_ID != undefined) {
              $scope.PannelSupplyIdsArray.push(parseInt($scope.tableArray[i].PANNEL_SUPPLY_ID));
            }
          }

          $scope.tableArray = $scope.tableArray.map(function (d) {
            d.DATA_FLAG = "E";
            return d;
          });
          data = angular.copy($scope.tableArray);
          $scope.changedData = data;
          $scope.dataCallFunction(data);
          $scope.PassValue = {};

          if ($scope.tableArray.length != 0) {
            $scope.PassValue.SendDate = $scope.tableArray[0].EVENT_DATE;
            $scope.PassValue.dataFlag = $scope.tableArray[0].DATA_FLAG;
          }

          $scope.PassValue.MSIE = $scope.MSIE;
          $scope.PassValue.StampingLead = $scope.StampingLead;

          if ($scope.label1 == undefined && localStorage.projectCode == undefined) {
            $scope.PassValue.ProjectCode = null;
          } else if ($scope.label1 == undefined && localStorage.projectCode != undefined && JSON.parse(localStorage.projectCode).ProjectCode != undefined) {
            $scope.PassValue.ProjectCode = JSON.parse(localStorage.projectCode).ProjectCode;
          } else if ($scope.label1 != undefined) {
            $scope.PassValue.ProjectCode = $scope.label1;
          }

          localStorage.projectCode = JSON.stringify($scope.PassValue);
          document.getElementById("UploadButton").disabled = false;
          $scope.$apply();
          return;
        },
        error: function error(jqXHR, textStatus, errorThrown) {
          toastr.error("Unable to load data. Please try refreshing the page.");
        }
      });
    }
  }

  $scope.arr = [];
  $scope.DFileArray = [];
  $.cordys.ajax({
    method: "GetXMLObject",
    namespace: "http://schemas.cordys.com/1.0/xmlstore",
    parameters: {
      key: "com/Mahindra/Mahindra_eRFQ/FixedDocuments.xml"
    },
    dataType: "* json",
    async: false,
    success: function success(data) {
      $scope.FileSizeLimit = $.cordys.json.findObjects(data, "Documents");
      $scope.Size = parseInt($scope.FileSizeLimit[0].FileSize);
      $scope.DObj11 = $.cordys.json.findObjects(data, "ProjectReqDoc");

      for (var i = 0; i < $scope.DObj11.length; i++) {
        var p = $scope.DObj11[i];
        var filename = p.replace(/^.*[\\\/]/, '');
        var DownloadFile = {
          "DOCUMENT_NAME": filename,
          "DOCUMENT_PATH": p
        };
        $scope.DFileArray.push(DownloadFile);
      }
    },
    error: function error(jqXHR, textStatus, errorThrown) {
      toastr.error("Unable to load data. Please try refreshing the page.");
    }
  });

  $scope.getDate = function () {
    $.cordys.ajax({
      method: "GetERFQServerDate",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {},
      success: function success(data) {
        $scope.disDate = $.cordys.json.findObjects(data, "GetERFQServerDate");
        var a = $scope.disDate[0].GetERFQServerDate;
        var b = a.split(" ");
        var StringDate = b[1] + " " + b[2] + " " + b[5];
        var d = new Date(StringDate);
        var year = d.getFullYear();
        var month = (1 + d.getMonth()).toString();
        var day = d.getDate().toString();

        if (/^\d$/.test(month)) {
          month = String("0" + month);
        }

        if (/^\d$/.test(day)) {
          day = String("0" + day);
        }

        var _final = day + '/' + month + '/' + year;

        $scope.tmkSumDiv1 = _final;
        $scope.$apply();
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Unable to load data. Please try refreshing the page.");
      }
    });
  };

  $.cordys.ajax({
    method: "GetERFQProjectCodes",
    namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
    dataType: "* json",
    parameters: {},
    success: function success(data) {
      $scope.PrjMembers = $.cordys.json.findObjects(data, "AFS_PROJ_MEMBERS");
      var PrjArray = $.cordys.json.findObjects(data, "AFS_PROJ_MEMBERS");
    },
    error: function error(jqXHR, textStatus, errorThrown) {
      toastr.error("Unable to load data. Please try refreshing the page.");
    }
  });

  $scope.checkValueT = function () {
    $scope.MSIE = null;
    $scope.StampingLead = null;
    $scope.Total_Vol = null;
    $scope.Total_Prod = null;
    $scope.Total_Duration = null;
    $scope.Total_Waranty = null;
    $scope.FileArray = [];
    $scope.toolmakerInit();
    localStorage.clear();
  };

  $scope.UpdateUD_InsertUDH = function (Docid) {
    $scope.pass = JSON.parse(localStorage.projectCode);
    $.cordys.ajax({
      method: "UpdateErfqUploadedDocument",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "tuple": {
          "old": {
            "ERFQ_UPLOADED_DOCUMENT": {
              "DOCUMENT_ID": Docid
            }
          },
          "new": {
            "ERFQ_UPLOADED_DOCUMENT": {
              "DOCUMENT_ID": Docid,
              "PROJECT_CODE": JSON.parse(localStorage.projectCode).ProjectCode,
              "DOCUMENT_NAME": $scope.DOCUMENT_NAME1,
              "DOCUMENT_PATH": $scope.ServerFilePath,
              "DOCUMENT_TYPE": "ProjectReq",
              "DOCUMENT_DESC": $scope.DOCUMENT_DESC1
            }
          }
        }
      },
      success: function success(data) {
        $scope.FileArray[$scope.FileArray.length - 1].DOCUMENT_PATH = $scope.ServerFilePath;
        toastr.success("Uploaded successfully!");
        $scope.getALLUploadedDocAfterSave();
        $scope.DOCUMENT_NAME1 = null;
        $scope.DOCUMENT_DESC1 = null;
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Unable to load data. Please try refreshing the page.");
      }
    });
  };

  $scope.InsertUD_InsertUDH = function () {
    $scope.pass = JSON.parse(localStorage.projectCode);
    $.cordys.ajax({
      method: "UpdateErfqUploadedDocument",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: '* json',
      parameters: {
        tuple: {
          "new": {
            "ERFQ_UPLOADED_DOCUMENT": {
              "PROJECT_CODE": JSON.parse(localStorage.projectCode).ProjectCode,
              "DOCUMENT_NAME": $scope.DOCUMENT_NAME1,
              "DOCUMENT_PATH": $scope.ServerFilePath,
              "DOCUMENT_TYPE": "ProjectReq",
              "DOCUMENT_DESC": $scope.DOCUMENT_DESC1
            }
          }
        }
      },
      success: function success(e) {
        $.cordys.json.findObjects(e, "ERFQ_UPLOADED_DOCUMENT")[0].DOCUMENT_ID;
        $scope.FileArray[$scope.FileArray.length - 1].DOCUMENT_PATH = $scope.ServerFilePath;
        $scope.getALLUploadedDocAfterSave();
        $scope.DOCUMENT_NAME1 = null;
        $scope.DOCUMENT_DESC1 = null;
        $scope.$apply();
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Unable to load data. Please try refreshing the page.");
      }
    });
  };

  $scope.browseAndAddRow = function () {
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
            method: "UploadERFQDoc",
            namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
            dataType: '* json',
            parameters: {
              FileName: $scope.fileNow,
              FileContent: file
            },
            success: function success(e) {
              $scope.ServerFilePath = $.cordys.json.findObjects(e, "uploadERFQDoc")[0].uploadERFQDoc;
              var FileNameObj = {
                "DOCUMENT_NAME": $scope.fileNow,
                "DOCUMENT_DESC": $scope.DOCUMENT_DESC1
              };
              $scope.FileArray.push(FileNameObj);
              $scope.DOCUMENT_NAME = $scope.fileNow;
              $scope.FileArray[$scope.FileArray.length - 1].DOCUMENT_NAME = FileNameObj.DOCUMENT_NAME;
              $scope.FileArray[$scope.FileArray.length - 1].DOCUMENT_DESC = FileNameObj.DOCUMENT_DESC;
              $scope.$apply();
              $.cordys.ajax({
                method: "GetERFQDocsbyProjCode",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
                parameters: {
                  "projectCode": JSON.parse(localStorage.projectCode).ProjectCode,
                  "documentType": "ProjectReq"
                },
                success: function success(data) {
                  if ($.cordys.json.findObjects(data, "ERFQ_UPLOADED_DOCUMENT").length != 0) {
                    $scope.DocId = $.cordys.json.findObjects(data, "ERFQ_UPLOADED_DOCUMENT")[0].DOCUMENT_ID;
                    $scope.UpdateUD_InsertUDH($scope.DocId);
                  } else {
                    $scope.InsertUD_InsertUDH();
                  }
                },
                error: function error(jqXHR, textStatus, errorThrown) {
                  toastr.error("Unable to load data. Please try refreshing the page.");
                }
              });
            },
            error: function error(jqXHR, textStatus, errorThrown) {
              toastr.error("Unable to load data. Please try refreshing the page.");
            }
          });
        } else {
          alert("Sorry file is empty, Pls upload other file");
        }
      };
    } else {}
  };

  $scope.contentTypeForImage = function (ext) {
    if (ext == 'jpg') return 'image/jpg';else if (ext == 'png') return 'image/png';else if (ext == 'jpeg') return 'image/jpeg';else if (ext == 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';else if (ext == 'doc') return 'application/msword';else if (ext == 'txt') return 'text/plain';else if (ext == 'pdf') return 'application/pdf';else if (ext == 'xls' || ext == 'xlsx') return 'application/vnd.ms-excel';
  };

  $scope.ViewFileName = function (fileObj) {
    if (fileObj != null) {
      var fsize = fileObj.size;
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
        } else {
          alert("Unable to read File");
        }
      } else {
        toastr.error("Select file smaller than " + $scope.Size + " MB");
        return false;
      }
    } else {}
  };

  $scope.getALLUploadedDocAfterSave = function () {
    $.cordys.ajax({
      method: "GetERFQAllUploadedDoc",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "projectCode": JSON.parse(localStorage.projectCode).ProjectCode,
        "documentType": "ProjectReq"
      },
      success: function success(data) {
        $scope.FileArray = $.cordys.json.findObjects(data, "ERFQ_UPLOADED_DOCUMENT_HISTORY");
        $scope.$apply();
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });
  };

  $scope.dataCallFunction = function (data) {
    $scope.tableParams = new NgTableParams({}, {
      filterDelay: 0,
      dataset: data
    });
  };

  $scope.toolmakerInit = function () {
    $scope.tableArray = [];
    $scope.FileArray = [];
    $scope.PanelSupplyObj = {};
    $scope.InsertPanelSupplyArray = [];
    $scope.tableDetails = [];
    $scope.UpdatePanelSupplyArray = [];
    $scope.tupleIndex = [];
    $scope.albumNameArray = [];
    $scope.DeletFromMapTable = [];
    $scope.getDate();
    $scope.FiletupleIndex = [];
    $scope.FileNameArray = [];
    $scope.selectOne = true;

    if (document.getElementById("some-submit-element")) {
      document.getElementById("some-submit-element").disabled = true;
    }

    document.getElementById("UploadButton").disabled = true;
    $scope.arrayToDeleteFromBackend = [];
    $.cordys.ajax({
      method: "GetAllEvents",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {},
      success: function success(data) {
        $scope.eventList = $.cordys.json.findObjects(data, "ERFQ_EVENT_MASTER");
        $scope.eventList = $scope.eventList.map(function (d1) {
          d1.DATA_FLAG = "I";
          return d1;
        });
        $scope.CurrentEventList = $.cordys.json.findObjects(data, "ERFQ_EVENT_MASTER");
        $scope.$apply();
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        alert("Error in loading data");
      }
    });

    if ($scope.checkDetails == undefined) {
      $scope.getTableDataInitial();
    } else {}
  };

  $scope.getTableDataInitial = function () {
    $.cordys.ajax({
      method: "GetEventsforProject",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "ProjectCode": ""
      },
      success: function success(data) {
        debugger;

        if ($scope.checkDetails == undefined || $scope.checkDetails.length == 0) {
          $scope.tableArray = [];
          $scope.PannelSupplyIdsArray = [];
          $scope.tableArray = $.cordys.json.findObjects(data, "ERFQ_EVENT_MASTER");

          for (var i = 0; i < $scope.tableArray.length; i++) {
            if ($scope.tableArray[i].PANNEL_SUPPLY_ID != "" && $scope.tableArray[i].PANNEL_SUPPLY_ID != null && $scope.tableArray[i].PANNEL_SUPPLY_ID != undefined) {
              $scope.PannelSupplyIdsArray.push($scope.tableArray[i].PANNEL_SUPPLY_ID);
            }
          }

          $scope.tableArray = $scope.tableArray.map(function (dd) {
            delete dd.PANNEL_SUPPLY_ID;
            return dd;
          });
          $scope.tableArray = $scope.tableArray.map(function (d) {
            d.DATA_FLAG = "I";
            return d;
          });
          data = angular.copy($scope.tableArray);
          $scope.changedData = data;
          $scope.dataCallFunction(data);
          $scope.PassValue = {};

          if ($scope.tableArray.length != 0) {
            $scope.PassValue.SendDate = $scope.tableArray[0].EVENT_DATE;
            $scope.PassValue.dataFlag = $scope.tableArray[0].DATA_FLAG;
          }

          $scope.PassValue.MSIE = $scope.MSIE;
          $scope.PassValue.StampingLead = $scope.StampingLead;

          if ($scope.label1 == undefined && localStorage.projectCode == undefined) {
            $scope.PassValue.ProjectCode = null;
          } else if ($scope.label1 == undefined && localStorage.projectCode != undefined && JSON.parse(localStorage.projectCode).ProjectCode != undefined) {
            $scope.PassValue.ProjectCode = JSON.parse(localStorage.projectCode).ProjectCode;
          } else if ($scope.label1 != undefined) {
            $scope.PassValue.ProjectCode = $scope.label1;
          }

          localStorage.projectCode = JSON.stringify($scope.PassValue);
          $scope.$apply();
        }
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Unable to load data. Please try refreshing the page.");
      }
    });
  };

  $scope.addRow = function () {
    $scope.obj1 = {
      "selected1": false,
      "EVENT": "",
      "EVENT_DATE": "",
      "PANEL_QUALITY": "",
      "PIST_LEVEL": "",
      "PANEL_CONDITIONS": "",
      "DELIVERY_ADDRESS": "",
      "DATA_FLAG": "I"
    };
    $scope.tableArray.push($scope.obj1);
    data = angular.copy($scope.tableArray);
    $scope.changedData = data;
    $scope.dataCallFunction(data);
  };

  $scope.getUploadedDocForProject = function () {
    $.cordys.ajax({
      method: "GetERFQAllUploadedDoc",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "projectCode": $scope.abc1 != undefined ? $scope.abc1.AFSPM_POJ_CODE : JSON.parse(localStorage.projectCode).ProjectCode,
        "documentType": "ProjectReq"
      },
      success: function success(data) {
        $scope.FileArray = $.cordys.json.findObjects(data, "ERFQ_UPLOADED_DOCUMENT_HISTORY");
        $scope.$apply();
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Unable to load data. Please try refreshing the page.");
      }
    });
  };

  $scope.passProjectCode = function (item, abc, label) {
    debugger;
    $scope.PassValue = {};

    if (label != undefined) {
      document.getElementById("test").maxLength = label.length;
    }

    if (localStorage != undefined && localStorage.projectCode != undefined && JSON.parse(localStorage.projectCode).ProjectCode != undefined) {
      document.getElementById("test").maxLength = JSON.parse(localStorage.projectCode).ProjectCode.length;
    }

    $scope.item1 = item;
    $scope.abc1 = abc;
    $scope.label1 = label;

    if (document.getElementById("some-submit-element")) {
      document.getElementById("some-submit-element").disabled = false;
    }

    if (abc != null || abc != undefined || JSON.parse(localStorage.projectCode).ProjectCode != undefined) {
      document.getElementById("UploadButton").disabled = false;
      $scope.MSIE = null;
      $scope.StampingLead = null;
      $scope.Total_Vol = null;
      $scope.Total_Prod = null;
      $scope.Total_Duration = null;
      $scope.Total_Waranty = null;
      $scope.FileArray = [];
      $.cordys.ajax({
        method: "GetERFQListofEbomRev",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        parameters: {
          ProjectCode: abc != undefined ? abc.AFSPM_POJ_CODE : JSON.parse(localStorage.projectCode).ProjectCode
        },
        success: function success(data) {
          vm.arr = $.cordys.json.findObjects(data, "getERFQListofEbomRev")[0].getERFQListofEbomRev;
          vm.arr = vm.arr.split(",")[vm.arr.split(",").length - 1];
          $scope.PassValue.E_BOM_Rev = vm.arr;
        }
      });
      $.cordys.ajax({
        method: "GetERFQProjectMembers",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        parameters: {
          "projectCode": abc != undefined ? abc.AFSPM_POJ_CODE : JSON.parse(localStorage.projectCode).ProjectCode
        },
        success: function success(data) {
          var flagtest = 1;
          $scope.Incharges = $.cordys.json.findObjects(data, "AFS_PROJ_MEMBERS");

          for (var i = 0; i < $scope.Incharges.length; i++) {
            if ($scope.Incharges[i].AFSPM_MEMBER_ROLE == "MSIE") {
              $scope.MSIE = $scope.Incharges[i].AFSPM_MEMBER_NAME;
              $scope.PassValue.MSIE = $scope.MSIE;
            }

            if ($scope.Incharges[i].AFSPM_MEMBER_ROLE == "Stamping Lead") {
              $scope.StampingLead = $scope.Incharges[i].AFSPM_MEMBER_NAME;
              $scope.PassValue.StampingLead = $scope.StampingLead;
            }

            if ($scope.tableArray.length != 0) {
              $scope.PassValue.SendDate = $scope.tableArray[0].EVENT_DATE;
              $scope.PassValue.dataFlag = $scope.tableArray[0].DATA_FLAG;
            }

            $scope.PassValue.MSIE = $scope.MSIE;
            $scope.PassValue.StampingLead = $scope.StampingLead;

            if ($scope.label1 == undefined && localStorage.projectCode == undefined) {
              $scope.PassValue.ProjectCode = null;
            } else if ($scope.label1 == undefined && localStorage.projectCode != undefined && JSON.parse(localStorage.projectCode).ProjectCode != undefined) {
              $scope.PassValue.ProjectCode = JSON.parse(localStorage.projectCode).ProjectCode;
            } else if ($scope.label1 != undefined) {
              $scope.PassValue.ProjectCode = $scope.label1;
            }

            localStorage.projectCode = JSON.stringify($scope.PassValue);
          }

          $scope.$apply();
        },
        error: function error(jqXHR, textStatus, errorThrown) {
          toastr.error("Unable to load data. Please try refreshing the page.");
        }
      });
      $.cordys.ajax({
        method: "GetERFQ_PROJECT_REQObject",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        parameters: {
          "PROJECT_CODE": abc != undefined ? abc.AFSPM_POJ_CODE : JSON.parse(localStorage.projectCode).ProjectCode
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
          toastr.error("Unable to load data. Please try refreshing the page.");
        }
      });
      $scope.getUploadedDocForProject();
      $.cordys.ajax({
        method: "GetEventsforProject",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        parameters: {
          "ProjectCode": abc != undefined ? abc.AFSPM_POJ_CODE : JSON.parse(localStorage.projectCode).ProjectCode
        },
        success: function success(data) {
          $scope.PannelSupplyIdsArray = [];
          $scope.tableDetails = $.cordys.json.findObjects(data, "erfq_pannel_supply");

          if ($scope.tableDetails.length != 0) {
            $scope.checkDetails = $scope.tableDetails;
            $scope.tableArray = [];
            $scope.tableArray = $.cordys.json.findObjects(data, "erfq_pannel_supply");
            $scope.tableArray = $scope.tableArray.map(function (d) {
              d.DATA_FLAG = "E";
              return d;
            });
            data = angular.copy($scope.tableArray);
            $scope.changedData = data;
            $scope.dataCallFunction(data);
          } else {
            $scope.checkDetails = [];
            $scope.getTableDataInitial();
          }

          for (var i = 0; i < $scope.tableArray.length; i++) {
            if ($scope.tableArray[i].PANNEL_SUPPLY_ID != "" && $scope.tableArray[i].PANNEL_SUPPLY_ID != null && $scope.tableArray[i].PANNEL_SUPPLY_ID != undefined) {
              $scope.PannelSupplyIdsArray.push(parseInt($scope.tableArray[i].PANNEL_SUPPLY_ID));
            }
          }

          $scope.$apply();

          if ($scope.tableArray.length != 0) {
            $scope.PassValue.SendDate = $scope.tableArray[0].EVENT_DATE;
            $scope.PassValue.dataFlag = $scope.tableArray[0].DATA_FLAG;
          }

          $scope.PassValue.MSIE = $scope.MSIE;
          $scope.PassValue.StampingLead = $scope.StampingLead;

          if ($scope.label1 == undefined && localStorage.projectCode == undefined) {
            $scope.PassValue.ProjectCode = null;
          } else if ($scope.label1 == undefined && localStorage.projectCode != undefined && JSON.parse(localStorage.projectCode).ProjectCode != undefined) {
            $scope.PassValue.ProjectCode = JSON.parse(localStorage.projectCode).ProjectCode;
          } else if ($scope.label1 != undefined) {
            $scope.PassValue.ProjectCode = $scope.label1;
          }

          localStorage.projectCode = JSON.stringify($scope.PassValue);
        },
        error: function error(jqXHR, textStatus, errorThrown) {
          toastr.error("Unable to load data. Please try refreshing the page.");
        }
      });
    }
  };

  $scope.deleteFileFrom_UDH = function (DeleteFile) {
    deletObj = {};
    deletObj = $scope.DFFileArr;
    $.cordys.ajax({
      method: "UpdateErfqUploadedDocumentHistory",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: '* json',
      parameters: {
        "tuple": deletObj
      },
      success: function success(e) {
        toastr.success("File is deleted!");
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Unable to load data. Please try refreshing the page.");
      }
    });
  };

  $scope.tupleIndex = [];
  $scope.albumNameArray = [];
  $scope.FiletupleIndex = [];
  $scope.FileNameArray = [];

  $scope.CreateDeleteArray = function (obj, tid) {
    $scope.pass = JSON.parse(localStorage.projectCode);

    if ($scope.tupleIndex.indexOf(tid) <= -1 && (obj != undefined || obj != "")) {
        $scope.albumNameArray.push(obj);
        $scope.tupleIndex.push(tid);

        if ($scope.PannelSupplyIdsArray[tid] != null && $scope.PannelSupplyIdsArray[tid] != undefined) {
          document.getElementById("nextbtn").disabled = true;
          PanelSupplyDelObj = {
            "old": {
              "ERFQ_PANNEL_SUPPLY": {
                "PANNEL_SUPPLY_ID": parseInt($scope.PannelSupplyIdsArray[tid])
              }
            }
          };
          $scope.DeletFromMapTable.push(PanelSupplyDelObj);
        }
      } else if ($scope.tupleIndex.indexOf(tid) > -1 && (obj != undefined || obj != "")) {
      document.getElementById("nextbtn").disabled = false;
      var indxOfObj = $scope.albumNameArray.indexOf(obj);
      var tuplIndxOfObj = $scope.tupleIndex.indexOf(tid);
      $scope.albumNameArray.splice(indxOfObj, 1);
      $scope.tupleIndex.splice(tuplIndxOfObj, 1);
      $scope.DeletFromMapTable.splice(tuplIndxOfObj, 1);
    }
  };

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

  $scope.FormTupleForPannelSupply = function () {
    $scope.pass = JSON.parse(localStorage.projectCode);

    for (var i = 0; i < $scope.tableArray.length; i++) {
      if ($scope.tableArray[i].DATA_FLAG == "I") {
        var PanelSupplyObj = {
          "new": {
            "ERFQ_PANNEL_SUPPLY": {
              "PROJECT_CODE": JSON.parse(localStorage.projectCode).ProjectCode,
              "EVENT_ID": parseInt($scope.tableArray[i].EVENT_ID),
              "EVENT_DATE": $scope.changedData[i].EVENT_DATE,
              "PANEL_QUALITY": $scope.changedData[i].PANEL_QUALITY,
              "PIST_LEVEL": $scope.changedData[i].PIST_LEVEL,
              "PANEL_CONDITIONS": $scope.changedData[i].PANEL_CONDITIONS,
              "DELIVERY_ADDRESS": $scope.changedData[i].DELIVERY_ADDRESS,
              "EVENT": $scope.changedData[i].EVENT
            }
          }
        };
        $scope.InsertPanelSupplyArray.push(PanelSupplyObj);
      }

      if ($scope.tableArray[i].DATA_FLAG == "U") {
        var PanelSupplyObj1 = {
          "old": {
            "ERFQ_PANNEL_SUPPLY": {
              "PANNEL_SUPPLY_ID": parseInt($scope.tableArray[i].PANEL_SUPPLY_ID)
            }
          },
          "new": {
            "ERFQ_PANNEL_SUPPLY": {
              "PANNEL_SUPPLY_ID": parseInt($scope.tableArray[i].PANEL_SUPPLY_ID),
              "EVENT_ID": parseInt($scope.tableArray[i].EVENT_ID),
              "EVENT_DATE": $scope.changedData[i].EVENT_DATE,
              "PANEL_QUALITY": $scope.changedData[i].PANEL_QUALITY,
              "PIST_LEVEL": $scope.changedData[i].PIST_LEVEL,
              "PANEL_CONDITIONS": $scope.changedData[i].PANEL_CONDITIONS,
              "DELIVERY_ADDRESS": $scope.changedData[i].DELIVERY_ADDRESS,
              "EVENT": $scope.changedData[i].EVENT
            }
          }
        };
        $scope.UpdatePanelSupplyArray.push(PanelSupplyObj1);
      }

      if ($scope.tableArray[i].DATA_FLAG == "E") {
        var PanelSupplyObj1 = {
          "old": {
            "ERFQ_PANNEL_SUPPLY": {
              "PANNEL_SUPPLY_ID": parseInt($scope.changedData[i].PANNEL_SUPPLY_ID)
            }
          },
          "new": {
            "ERFQ_PANNEL_SUPPLY": {
              "PANNEL_SUPPLY_ID": parseInt($scope.changedData[i].PANNEL_SUPPLY_ID),
              "EVENT_ID": parseInt($scope.tableArray[i].EVENT_ID),
              "EVENT_DATE": $scope.changedData[i].EVENT_DATE,
              "PANEL_QUALITY": $scope.changedData[i].PANEL_QUALITY,
              "PIST_LEVEL": $scope.changedData[i].PIST_LEVEL,
              "PANEL_CONDITIONS": $scope.changedData[i].PANEL_CONDITIONS,
              "DELIVERY_ADDRESS": $scope.changedData[i].DELIVERY_ADDRESS,
              "EVENT": $scope.changedData[i].EVENT
            }
          }
        };
        $scope.UpdatePanelSupplyArray.push(PanelSupplyObj1);
      }
    }
  };

  $scope.SubmitProjectRequirement = function () {
    $scope.pass = JSON.parse(localStorage.projectCode);

    for (var i = 0; i < $scope.tableArray.length; i++) {
      if ($scope.tableArray[i].EVENT == null || $scope.tableArray[i].EVENT == "") {
        toastr.error("Please remove the blank event rows.");
        return;
      }
    }

    if ($scope.DeletFromMapTable.length != 0) {
      var reqObj1 = {};
      reqObj1 = $scope.DeletFromMapTable;
      $.cordys.ajax({
        method: "UpdateErfqPannelSupply",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        parameters: {
          "tuple": reqObj1
        },
        success: function success(data) {
          toastr.success("Events updated!");
          $scope.DeletFromMapTable = [];
          $scope.SaveDetailsAfterCheck();
          $.cordys.ajax({
            method: "GetEventsforProject",
            namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
            dataType: "* json",
            parameters: {
              "ProjectCode": abc != undefined ? abc.AFSPM_POJ_CODE : JSON.parse(localStorage.projectCode).ProjectCode
            },
            success: function success(data) {
              $scope.PannelSupplyIdsArray = [];
              $scope.tableDetails = $.cordys.json.findObjects(data, "erfq_pannel_supply");

              if ($scope.tableDetails.length != 0) {
                $scope.checkDetails = $scope.tableDetails;
                $scope.tableArray = [];
                $scope.tableArray = $.cordys.json.findObjects(data, "erfq_pannel_supply");
                $scope.tableArray = $scope.tableArray.map(function (d) {
                  d.DATA_FLAG = "E";
                  return d;
                });
                data = angular.copy($scope.tableArray);
                $scope.changedData = data;
                $scope.dataCallFunction(data);
              } else {
                $scope.checkDetails = [];
                $scope.getTableDataInitial();
              }

              for (var i = 0; i < $scope.tableArray.length; i++) {
                if ($scope.tableArray[i].PANNEL_SUPPLY_ID != "" && $scope.tableArray[i].PANNEL_SUPPLY_ID != null && $scope.tableArray[i].PANNEL_SUPPLY_ID != undefined) {
                  $scope.PannelSupplyIdsArray.push(parseInt($scope.tableArray[i].PANNEL_SUPPLY_ID));
                }
              }

              $scope.$apply();

              if ($scope.tableArray.length != 0) {
                $scope.PassValue.SendDate = $scope.tableArray[0].EVENT_DATE;
                $scope.PassValue.dataFlag = $scope.tableArray[0].DATA_FLAG;
              }

              $scope.PassValue.MSIE = $scope.MSIE;
              $scope.PassValue.StampingLead = $scope.StampingLead;

              if ($scope.label1 == undefined && localStorage.projectCode == undefined) {
                $scope.PassValue.ProjectCode = null;
              } else if ($scope.label1 == undefined && localStorage.projectCode != undefined && JSON.parse(localStorage.projectCode).ProjectCode != undefined) {
                $scope.PassValue.ProjectCode = JSON.parse(localStorage.projectCode).ProjectCode;
              } else if ($scope.label1 != undefined) {
                $scope.PassValue.ProjectCode = $scope.label1;
              }

              localStorage.projectCode = JSON.stringify($scope.PassValue);
            },
            error: function error(jqXHR, textStatus, errorThrown) {
              toastr.error("Unable to load data. Please try refreshing the page.");
            }
          });
        },
        error: function error(jqXHR, textStatus, errorThrown) {
          toastr.error("Unable to load data. Please try refreshing the page.");
        }
      });
    } else {
      $scope.SaveDetailsAfterCheck();
    }

    window.scrollTo(0, 0);
  };

  $scope.SaveDetailsAfterCheck = function () {
    $scope.pass = JSON.parse(localStorage.projectCode);

    if ($scope.tableArray.length != 0) {
      $scope.FormTupleForPannelSupply();
      var reqObj = {};
      reqObj = $scope.InsertPanelSupplyArray;
      $.cordys.ajax({
        method: "UpdateErfqPannelSupply",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        parameters: {
          "tuple": reqObj
        },
        success: function success(data) {
          $scope.InsertPanelSupplyArray = [];
        },
        error: function error(jqXHR, textStatus, errorThrown) {
          toastr.error("Unable to load data. Please try refreshing the page.");
        }
      });
      var UpdatereqObj = {};
      UpdatereqObj = $scope.UpdatePanelSupplyArray;
      $.cordys.ajax({
        method: "UpdateErfqPannelSupply",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        parameters: {
          "tuple": UpdatereqObj
        },
        success: function success(data) {
          $scope.UpdatePanelSupplyArray = [];
        },
        error: function error(jqXHR, textStatus, errorThrown) {
          toastr.error("Unable to load data. Please try refreshing the page.");
        }
      });
    }

    $.cordys.ajax({
      method: "GetErfqProjectReqObject",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "PROJECT_CODE": JSON.parse(localStorage.projectCode).ProjectCode
      },
      success: function success(data) {
        $scope.ReqObj = $.cordys.json.findObjects(data, "ERFQ_PROJECT_REQ");

        if ($scope.selectOne == true) {
          $scope.BuildChoice = "M&M";
        } else {
          $scope.BuildChoice = "DieMaker";
        }

        if ($scope.ReqObj.length > 0) {
          $scope.UpdateInProjectReq();
        } else {
          $scope.InsertInProjectReq();
        }
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Unable to load data. Please try refreshing the page.");
      }
    });
  };

  $scope.checkIfProceed = function () {
    if (localStorage != undefined && localStorage.projectCode != undefined) {
      $.cordys.ajax({
        method: "GetEventsforProject",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        parameters: {
          "ProjectCode": JSON.parse(localStorage.projectCode).ProjectCode
        },
        success: function success(data) {
          $scope.tableDetails = $.cordys.json.findObjects(data, "erfq_pannel_supply");

          if ($scope.tableDetails.length <= 0) {
            toastr.error("Please save the details and then proceed.");
          } else {
            var redirect2 = window.location.href;
            redirect2 = redirect2.replace("ProjectRequirement", "panelGrouping");
            window.location.href = redirect2;
          }
        },
        error: function error(jqXHR, textStatus, errorThrown) {
          toastr.error("Unable to load data. Please try refreshing the page.");
        }
      });
    } else {
      toastr.error("Please select Project Code and then proceed.");
    }
  };

  $scope.UpdateInProjectReq = function () {
    $scope.pass = JSON.parse(localStorage.projectCode);
    $.cordys.ajax({
      method: "UpdateErfqProjectReq",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "tuple": {
          "old": {
            "ERFQ_PROJECT_REQ": {
              "PROJECT_CODE": JSON.parse(localStorage.projectCode).ProjectCode
            }
          },
          "new": {
            "ERFQ_PROJECT_REQ": {
              "PROJECT_CODE": JSON.parse(localStorage.projectCode).ProjectCode,
              "TOTAL_VALUE": $scope.Total_Vol,
              "TOTAL_PRODUCTION": $scope.Total_Prod,
              "DURABILITY_YEARS": $scope.Total_Duration,
              "WARRANTY_YEARS": $scope.Total_Waranty,
              "BUILD_QUALITY": $scope.BuildChoice,
              "CREATED_BY": "",
              "CREATION_ON": "",
              "STATUS": "ProjectReq"
            }
          }
        }
      },
      success: function success(data) {
        toastr.success("Data is updated!");
        document.getElementById("nextbtn").disabled = false;
        $scope.passProjectCode($scope.item1, $scope.abc1, $scope.label1);
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Unable to load data. Please try refreshing the page.");
      }
    });
  };

  $scope.InsertInProjectReq = function () {
    $scope.pass = JSON.parse(localStorage.projectCode);
    $.cordys.ajax({
      method: "UpdateErfqProjectReq",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        "tuple": {
          "new": {
            "ERFQ_PROJECT_REQ": {
              "PROJECT_CODE": JSON.parse(localStorage.projectCode).ProjectCode,
              "TOTAL_VALUE": $scope.Total_Vol,
              "TOTAL_PRODUCTION": $scope.Total_Prod,
              "DURABILITY_YEARS": $scope.Total_Duration,
              "WARRANTY_YEARS": $scope.Total_Waranty,
              "BUILD_QUALITY": $scope.BuildChoice,
              "CREATED_BY": "",
              "CREATION_ON": "",
              "STATUS": "ProjectReq"
            }
          }
        }
      },
      success: function success(data) {
        toastr.success("Data is updated!");
        document.getElementById("nextbtn").disabled = false;
        $scope.passProjectCode($scope.item1, $scope.abc1, $scope.label1);
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        toastr.error("Unable to load data. Please try refreshing the page.");
      }
    });
  };

  $scope.deleteRow = function () {
    $scope.arrayToDeleteFromBackend = [];
    $scope.tupleIndex = $scope.tupleIndex.sort(function (a, b) {
      return b - a;
    });

    if ($scope.tupleIndex.length != 0) {
      for (var i = 0; i < $scope.tupleIndex.length; i++) {
        $scope.tableArray.splice($scope.tupleIndex[i], 1);
        data = angular.copy($scope.tableArray);
        $scope.changedData = data;
        $scope.dataCallFunction(data);
      }

      if (document.getElementById("some-submit-element")) {
        document.getElementById("some-submit-element").disabled = false;
      }
    }

    $scope.tupleIndex.length = 0;
    $scope.tupleIndex = [];
  };

  $scope.enableSave = function () {
    document.getElementById("some-submit-element").disabled = false;
    document.getElementById("nextbtn").disabled = true;
  };

  $scope.refOpenFile = function (attachFile, index) {
    debugger;
    $scope.attachObj = attachFile;
    abcd = window.location.href.split("com")[0] + attachFile.DOCUMENT_PATH.split("shared\\")[1];
    var aaaa = document.createElement("A");
    aaaa.href = abcd;
    aaaa.download = abcd.replace(/^.*[\\\/]/, '');
    document.body.appendChild(aaaa);
    aaaa.click();
    document.body.removeChild(aaaa);
  };

  $scope.openFile = function (attachFile, index) {
    debugger;
    $scope.attachObj = attachFile;
    abcd = window.location.href.split("com")[0] + attachFile.DOCUMENT_PATH.split("shared\\")[1];
    var aaaa = document.createElement("A");
    aaaa.href = abcd;
    aaaa.download = abcd.replace(/^.*[\\\/]/, '');
    document.body.appendChild(aaaa);
    aaaa.click();
    document.body.removeChild(aaaa);
  };

  $scope.CreateBuildChoice = function (CheckValue) {
    if (CheckValue == "M&M") {
      $scope.selectOne = true;
      $scope.selectTwo = false;
    } else {
      $scope.selectOne = false;
      $scope.selectTwo = true;
    }
  };

  $scope.clearPopUpData = function () {
    $scope.DOCUMENT_NAME1 = null;
    $scope.DOCUMENT_DESC1 = null;
  };

  $scope.FiledeleteRow = function () {
    $scope.FiletupleIndex = $scope.FiletupleIndex.sort(function (a, b) {
      return b - a;
    });

    if ($scope.FiletupleIndex.length != 0) {
      $scope.DFFileArr = [];

      for (var i = 0; i < $scope.FiletupleIndex.length; i++) {
        DFObj = {
          "old": {
            "ERFQ_UPLOADED_DOCUMENT_HISTORY": {
              "DOCUMENT_HISTORY_SEQID": parseInt($scope.FileArray[$scope.FiletupleIndex[i]].DOCUMENT_HISTORY_SEQID)
            }
          }
        };
        $scope.DFFileArr.push(DFObj);
        $scope.FileArray.splice($scope.FiletupleIndex[i], 1);
      }

      $scope.deleteFileFrom_UDH();
      $scope.DFFileArr = [];
    }

    $scope.FiletupleIndex.length = 0;
    $scope.FiletupleIndex = [];
  };

  $scope.passEventCode = function (rowObject, index1) {
    var Flag = 0;

    for (var j = 0; j < $scope.tableArray.length; j++) {
      if (rowObject.EVENT == $scope.tableArray[j].EVENT) {
        $scope.tableArray[index1].EVENT = null;
        $scope.tableArray[index1].EVENT_DATE = null;
        $scope.tableArray[index1].PANEL_QUALITY = null;
        $scope.tableArray[index1].PIST_LEVEL = null;
        $scope.tableArray[index1].PANEL_CONDITIONS = null;
        $scope.tableArray[index1].DELIVERY_ADDRESS = null;
        toastr.error("Event already exists.");
        Flag = 1;
        break;
      } else {}
    }

    if (Flag == 1) {
      data = angular.copy($scope.tableArray);
      $scope.changedData = data;
      $scope.dataCallFunction(data);
      return;
    }

    var i = 0;

    for (var i = 0; i < $scope.eventList.length; i++) {
      if ($scope.eventList[i].EVENT == rowObject.EVENT) {
        break;
      }
    }

    $scope.eventList[i].DATA_FLAG = rowObject.DATA_FLAG;

    if ($scope.eventList[i].DATA_FLAG == "E") {
      $scope.eventList[i].DATA_FLAG = "U";
      document.getElementById("nextbtn").disabled = true;
    } else $scope.eventList[i].DATA_FLAG = "I";

    document.getElementById("nextbtn").disabled = true;
    $scope.eventList[i].PANEL_SUPPLY_ID = $scope.tableArray[index1].PANNEL_SUPPLY_ID;
    $scope.tableArray[index1] = JSON.parse(JSON.stringify($scope.eventList[i]));

    if (document.getElementById("some-submit-element")) {
      document.getElementById("some-submit-element").disabled = false;
    }

    data = angular.copy($scope.tableArray);
    $scope.changedData = data;
    $scope.dataCallFunction(data);
  };
});