  angular
    .module("App.quoteComparisionCtrl")
    .controller("prefTmkCompCtrl", function(
      $scope,
      Upload,
      $window,
      $log,
      $state,
      NgTableParams,
      cmm,
      $sce
    ) {
      $scope.data = {};
      $scope.data.dynamicCnt = 1;
      $scope.cmm = cmm;
      $scope.baslineNumArr = [];
      $scope.alltabData = [];
      $scope.cmm.label = "A";
      $scope.baseLineD = {};
      $scope.baseLineLead = {
        ch: []
      };
      $scope.tableDataSave = function() {
        var qr = _.flatten(
          $scope.gridOptions.data.map(function(d) {
            return Object.keys(d)
              .filter(function(d2) {
                return d2.match(/L[0-9]/i);
              })
              .map(function(d3) {
                var temp = {
                  new: {
                    ERFQ_COMPARISON_PREFERENCE: {
                      //"PREFERENCE_SEQ": d.ToolmakerPref[d3.replace("L", "P")].PREFERENCESEQ,
                      PROJECT_CODE: $scope.cmm.projectCode,
                      PART_NUMBER: d.PART_NUMBER,
                      BASELINE_NUM: Number(cmm.baslineNum),
                      LEVEL_PREFERNCE: d[d3].BASICCOST.TOOLMAKERID,
                      //"LEVEL_PREFERNCE": d.ToolmakerPref[d3.replace("L", "P")].TOOLMAKER,
                      TOOLMAKER_PREFERNCE: d.ToolmakerPref[d3.replace("L", "P")],
                      PREFERENCE_NUM: d3.replace("L", "P"),
                      JUSTIFICATION: ""
                    }
                  }
                };
                if (
                  d.SeqPref != undefined &&
                  d.SeqPref[d3.replace("L", "P")] != undefined &&
                  d.SeqPref[d3.replace("L", "P")] != ""
                ) {
                  temp.old = {
                    ERFQ_COMPARISON_PREFERENCE: {
                      PREFERENCE_SEQ: d.SeqPref[d3.replace("L", "P")]
                    }
                  };
                }
                return temp;
              });
          }),
          Infinity
        );
        //console.log("qr=>", qr);
        $.cordys.ajax({
          method: "UpdateErfqComparisonPreference",
          namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
          dataType: "* json",
          parameters: {
            tuple: qr
          },
          success: function(data) {
            console.log("success");
          },
          error: function error(jqXHR, textStatus, errorThrown) {
            console.log("error");
          }
        });
      };

      $scope.binit = function(d) {
        $scope.baseLineLead = {
          ch: []
        };
        $.cordys.ajax({
          method: "GetBaselineForProject",
          namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
          dataType: "* json",
          parameters: {
            projectCode: cmm.projectCode
          },
          success: function success(data) {
            $scope.baseLineLead = {
              ch: []
            };
            $.cordys.json
              .findObjects(data, "ERFQ_BASELINE_MAIN")
              .forEach(function(d) {
                if (d.BASELINE_STATUS == "Submitted")
                  $scope.baseLineLead.ch.push({
                    key: d.BASELINE_NUM,
                    value: true,
                    status: d.BASELINE_STATUS,
                    name: d.BASELINE_NAME
                  });
                else
                  $scope.baseLineLead.ch.push({
                    key: d.BASELINE_NUM,
                    value: false,
                    status: d.BASELINE_STATUS,
                    name: d.BASELINE_NAME
                  });
              });
            if (d != undefined) {
              $(d).modal("show");
            }
          },
          error: function error(jqXHR, textStatus, errorThrown) {}
        });
      };
      //$scope.binit();
      $scope.baselineLeadSave = function() {
        console.log("$scope.baseLineLead=>", $scope.baseLineLead);

        $scope.baseLineLead.ch
          .filter(function(d) {
            return d.value == true;
          })
          .forEach(function(d2) {
            $.cordys.ajax({
              method: "erfqQuoteCompare",
              namespace: "http://schemas.cordys.com/default",
              dataType: "* json",
              parameters: {
                pojCode: cmm.projectCode,
                baseLine: d2.key,
                other: d2.name
              },
              success: function success(data) {
                $scope.data.erfq_toolmaker_master = $.cordys.json.findObjects(
                  data,
                  "ERFQ_TOOLMAKER_MASTER"
                );
              },
              error: function error(jqXHR, textStatus, errorThrown) {}
            });
          });
      };
      $scope.baselineSave = function() {
        console.log("baseline save", $scope.baseLineD);
        console.log("cmm", cmm);

        var qr = {
          new: {
            ERFQ_BASELINE_MAIN: {
              //"BASELINE_SEQ":"",
              PROJECT_CODE: cmm.projectCode,
              BASELINE_NUM: Number(cmm.baslineNum + 1),
              BASELINE_NAME: $scope.baseLineD.name,
              BASELINE_REMARK: $scope.baseLineD.remark,
              PREFERENCE: "LandedCost"
            }
          }
        };

        $.cordys.ajax({
          method: "UpdateErfqBaselineMain",
          namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
          dataType: "* json",
          parameters: {
            tuple: qr
          },
          success: function success(data) {
            $scope.data.erfq_toolmaker_master = $.cordys.json.findObjects(
              data,
              "ERFQ_BASELINE_MAIN"
            );
            console.log(
              "$scope.data.erfq_toolmaker_master=>",
              $scope.data.erfq_toolmaker_master
            );
            $.cordys.ajax({
              method: "GetQuoteComparisionbyProject",
              namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
              dataType: "* json",
              parameters: {
                ProjectCode: cmm.projectCode,
                //baselinenum:cmm.baslineNum,
                baselinenum: cmm.baslineNum,
                GROUP: ""
              },
              success: function(data) {
                var saveQrData = $.cordys.json.findObjects(
                  data,
                  "ERFQ_QUOTE_COMPARISON"
                );
                if (saveQrData.length > 0) {
                  var _t = [];
                  saveQrData.forEach(function(_sd) {
                    // var tt = _sd;
                    // if (_sd.COMPARISON_SEQ)
                    //  delete tt.COMPARISON_SEQ;
                    // if (_sd.BASELINE_NUM)
                    //  tt.BASELINE_NUM = Number(cmm.baslineNum + 1);
                    // if (_sd.BASIC_COST_BLANKINGDIE == undefined)
                    //  tt.BASIC_COST_BLANKINGDIE = "Included";
                    if (_sd.COMPARISON_SEQ) delete _sd.COMPARISON_SEQ;
                    if (_sd.BASELINE_NUM)
                      _sd.BASELINE_NUM = Number(cmm.baslineNum + 1);

                    _t.push({
                      new: {
                        ERFQ_QUOTE_COMPARISON: _sd
                      }
                    });
                  });
                  console.log("SNU=>", _t);

                  $.cordys.ajax({
                    method: "UpdateErfqQuoteComparison",
                    namespace:
                      "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                    dataType: "* json",
                    parameters: {
                      tuple: _t
                    },
                    success: function(data) {
                      console.log("success=>");
                      $scope.xlSave(Number(cmm.baslineNum + 1));
                    },
                    error: function() {}
                  });
                }
              },
              error: function(jqXHR, textStatus, errorThrown) {}
            });
          },
          error: function error(jqXHR, textStatus, errorThrown) {}
        });
      };
      $scope._init2 = function() {
        $.cordys.ajax({
          method: "GetAllToolmakerDetails",
          namespace: "",
          dataType: "* json",
          parameters: {},
          success: function success(data) {
            $scope.data.erfq_toolmaker_master = $.cordys.json.findObjects(
              data,
              "ERFQ_TOOLMAKER_MASTER"
            );
          },
          error: function error(jqXHR, textStatus, errorThrown) {}
        });
      };
      $scope.htp = function(url, qr, data, err) {
        $.cordys.ajax({
          method: url,
          namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
          dataType: "* json",
          parameters: qr,
          success: data,
          error: err
        });
      };
      $scope.tableDataGet = function() {
        console.log("tableDataGet=> in");
        $scope.htp(
          "GetQuoteComparisionbyProject",
          {
            ProjectCode: cmm.projectCode,
            //baselinenum:cmm.baslineNum,
            baselinenum: cmm.baslineNum,
            GROUP: ""
          },
          function(data) {
            var saveQrData = $.cordys.json.findObjects(
              data,
              "ERFQ_QUOTE_COMPARISON"
            );
            if (saveQrData.length == 0) {
              $scope.GetERFQComparisonData();
            } else {
              //update
            }
          },
          function(jqXHR, textStatus, errorThrown) {}
        );
      };
      $scope.GetERFQComparisonData = function() {
        console.log("$scope.GetERFQComparisonData=>");
        var qr = {
          comparisonType: "PanelGroup",
          panelGroup: "A",
          projectCode: cmm.projectCode,
          budgeted: "",
          partNum: "",
          baselineNum: cmm.baslineNum,
          decimalPlace: "",
          preferences: "",
          ComparePref: "",
          toolmakersRequired: "",
          panelGrouping: "",
          materialGrade: ""
        };

        $scope.htp(
          "GetERFQComparisonData",
          qr,
          function(data) {
            $scope.tableArray = $.cordys.json.findObjects(data, "COMPARISON");

            (function(pData) {
              $scope.UpdateErfqQuoteComparison(pData);
            })(
              $scope.tableArray
                .map(function(d1) {
                  return d1.PART_NUMBER;
                })
                .map(function(d2) {
                  return {
                    new: {
                      ERFQ_QUOTE_COMPARISON: {
                        PROJECT_CODE: cmm.projectCode,
                        PART_NUMBER: d2,
                        NO_OF_DIES_BLANKINGDIE: "Included",
                        DIE_WEIGHT_BLANKINGDIE: "Included",
                        BASIC_COST_BLANKINGDIE: "Included",
                        LANDED_COST_BLANKINGDIE: "Included",
                        COST_PER_TON_BLANKINGDIE: "Included",
                        PART_GROUP: $scope.cmm.label,
                        BASELINE_NUM: cmm.baslineNum
                      }
                    }
                  };
                })
            );
          },
          function(jqXHR, textStatus, errorThrown) {}
        );
      };
      $scope.UpdateErfqQuoteComparison = function(upDateData) {
        $scope.htp(
          "UpdateErfqQuoteComparison",
          {
            tuple: upDateData
          },
          function(data) {
            console.log("update UpdateErfqQuoteComparison=>");
            $scope.changePrj(
              $scope.cmm.projectCode,
              $scope.cmm.label,
              $scope.cmm.baslineNum
            );
          },
          function(jqXHR, textStatus, errorThrown) {}
        );
      };

      $scope.changePrj = function(projectCode, panelGroup, bNum) {
        $.cordys.ajax({
          method: "GetERFQComparisonData",
          namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
          dataType: "* json",
          parameters: {
            comparisonType: "Preference",
            panelGroup: panelGroup,
            projectCode: projectCode,
            baselineNum: Number(cmm.baslineNum),
            budgeted: "",
            partNum: "",
            decimalPlace: "5",
            preferences: "",
            ComparePref: "LandedCost",
            toolmakersRequired: "",
            panelGrouping: ""
          },
          success: function(data) {
            $scope._init();
            var temp = $.cordys.json.findObjects(data, "COMPARISON");

            if (temp.length > 0) {
              $scope.gridOptions.data = _.map(temp, function(d) {
                var ll = _.keys(d.LANDEDCOST);
                for (var i = 1; i <= ll.length; i++) {
                  d["L" + i] = {
                    LANDEDCOST: d.LANDEDCOST["L" + i],
                    NOOFDIES: d.NOOFDIES["L" + i],
                    DIEWEIGHT: d.DIEWEIGHT["L" + i],
                    BASICCOST: d.BASICCOST["L" + i],
                    COSTPERTON: d.BASICCOST["L" + i]
                  };
                }

                return d;
              });
              $scope.colAdd($scope.gridOptions.data);
              $scope.add();
              $scope.add();
              $scope.add();
              $scope.$apply();
            } else {
              console.log("no data on base line ");
              //
              $scope.tableDataGet();
              //
            }
          },
          error: function(jqXHR, textStatus, errorThrown) {}
        });
      };
      //$scope._init2();

      $scope.xl = function() {
        console.log($scope.gridOptions);
        var arrXl = [];
        arrXl.push(_.map($scope.gridOptions.columnDefs, "displayName"));
      };
      $scope.xlSave = function(saveFromNewBaseLine) {
        if (saveFromNewBaseLine) {
          console.log("base line = 0  ", $scope.gridOptions.data);

          var qr = _.flatten(
            $scope.gridOptions.data.map(function(d) {
              return Object.keys(d)
                .filter(function(d2) {
                  return d2.match(/L[0-9]/i);
                })
                .map(function(d3) {
                  var temp = {
                    // "old": {
                    //  ERFQ_COMPARISON_PREFERENCE: {
                    //      "PREFERENCE_SEQ": d.ToolmakerPref[d3.replace("L", "P")].PREFERENCESEQ
                    //  }
                    // },
                    new: {
                      ERFQ_COMPARISON_PREFERENCE: {
                        //"PREFERENCE_SEQ": d.ToolmakerPref[d3.replace("L", "P")].PREFERENCESEQ,
                        PROJECT_CODE: $scope.cmm.projectCode,
                        PART_NUMBER: d.PART_NUMBER,
                        BASELINE_NUM: Number(saveFromNewBaseLine),
                        LEVEL_PREFERNCE: d[d3].BASICCOST.TOOLMAKERID,
                        //"LEVEL_PREFERNCE": d.ToolmakerPref[d3.replace("L", "P")].TOOLMAKER,
                        TOOLMAKER_PREFERNCE:
                          d.ToolmakerPref[d3.replace("L", "P")],
                        PREFERENCE_NUM: d3.replace("L", "P"),
                        JUSTIFICATION: ""
                      }
                    }
                  };
                  // if (d.ToolmakerPref[d3.replace("L", "P")].PREFERENCESEQ) {
                  //  temp.old = {
                  //      ERFQ_COMPARISON_PREFERENCE: {
                  //          PREFERENCE_SEQ: d.ToolmakerPref[d3.replace("L", "P")].PREFERENCESEQ
                  //      }

                  //  }
                  // };
                  return temp;
                });
            }),
            Infinity
          );

          console.log("param=>", qr);
          $.cordys.ajax({
            method: "UpdateErfqComparisonPreference",
            namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
            dataType: "* json",
            parameters: {
              tuple: qr
            },
            success: function(data) {
              console.log("success");
            },
            error: function error(jqXHR, textStatus, errorThrown) {
              console.log("error");
            }
          });
        }
        if (cmm.baslineNum == 0) {
          console.log("base line = 0  ", $scope.gridOptions.data);
          var qr = _.flatten(
            $scope.gridOptions.data.map(function(d) {
              return Object.keys(d)
                .filter(function(d2) {
                  return d2.match(/L[0-9]/i);
                })
                .map(function(d3) {
                  var temp = {
                    // "old": {
                    //  ERFQ_COMPARISON_PREFERENCE: {
                    //      "PREFERENCE_SEQ": d.ToolmakerPref[d3.replace("L", "P")].PREFERENCESEQ
                    //  }
                    // },
                    new: {
                      ERFQ_COMPARISON_PREFERENCE: {
                        //"PREFERENCE_SEQ": d.ToolmakerPref[d3.replace("L", "P")].PREFERENCESEQ,
                        PROJECT_CODE: $scope.cmm.projectCode,
                        PART_NUMBER: d.PART_NUMBER,
                        BASELINE_NUM: Number(cmm.baslineNum),
                        LEVEL_PREFERNCE: d[d3].BASICCOST.TOOLMAKERID,
                        //"LEVEL_PREFERNCE": d.ToolmakerPref[d3.replace("L", "P")].TOOLMAKER,
                        TOOLMAKER_PREFERNCE:
                          d.ToolmakerPref[d3.replace("L", "P")],
                        PREFERENCE_NUM: d3.replace("L", "P"),
                        JUSTIFICATION: ""
                      }
                    }
                  };
                  // if (d.ToolmakerPref[d3.replace("L", "P")].PREFERENCESEQ) {
                  //  temp.old = {
                  //      ERFQ_COMPARISON_PREFERENCE: {
                  //          PREFERENCE_SEQ: d.ToolmakerPref[d3.replace("L", "P")].PREFERENCESEQ
                  //      }

                  //  }
                  // };
                  return temp;
                });
            }),
            Infinity
          );

          console.log("param=>", qr);
          $.cordys.ajax({
            method: "UpdateErfqComparisonPreference",
            namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
            dataType: "* json",
            parameters: {
              tuple: qr
            },
            success: function(data) {
              console.log("success");
            },
            error: function error(jqXHR, textStatus, errorThrown) {
              console.log("error");
            }
          });
        } else {
          console.log("data = save = ", $scope.gridOptions.data);
          var qr = _.flatten(
            $scope.gridOptions.data.map(function(d) {
              return Object.keys(d)
                .filter(function(d2) {
                  return d2.match(/L[0-9]/i);
                })
                .map(function(d3) {
                  if (
                    d.ToolmakerPref[d3.replace("L", "P")].PREFERENCESEQ !=
                    undefined
                  ) {
                  }
                  var temp = {
                    new: {
                      ERFQ_COMPARISON_PREFERENCE: {
                        //"PREFERENCE_SEQ": d.ToolmakerPref[d3.replace("L", "P")].PREFERENCESEQ,
                        PROJECT_CODE: $scope.cmm.projectCode,
                        PART_NUMBER: d.PART_NUMBER,
                        BASELINE_NUM: Number(cmm.baslineNum),
                        LEVEL_PREFERNCE: d[d3].BASICCOST.TOOLMAKERID,
                        //"LEVEL_PREFERNCE": d.ToolmakerPref[d3.replace("L", "P")].TOOLMAKER,
                        TOOLMAKER_PREFERNCE:
                          d.ToolmakerPref[d3.replace("L", "P")],
                        PREFERENCE_NUM: d3.replace("L", "P"),
                        JUSTIFICATION: ""
                      }
                    }
                  };
                  if (d.ToolmakerPref[d3.replace("L", "P")].PREFERENCESEQ) {
                    temp.old = {
                      ERFQ_COMPARISON_PREFERENCE: {
                        PREFERENCE_SEQ:
                          d.ToolmakerPref[d3.replace("L", "P")].PREFERENCESEQ
                      }
                    };
                  }
                  return temp;
                });
            }),
            Infinity
          );

          console.log("param=>", qr);
          $.cordys.ajax({
            method: "UpdateErfqComparisonPreference",
            namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
            dataType: "* json",
            parameters: {
              tuple: qr
            },
            success: function(data) {
              console.log("success");
            },
            error: function error(jqXHR, textStatus, errorThrown) {
              console.log("error");
            }
          });
        }

        console.log("qr=>", qr);
        console.log("ctrl=>", $scope.cmm);
        console.log("service=>", cmm);
      };
      $scope.$watchCollection(
        "cmm",
        function(newValue, oldValue) {
          $scope.data.dynamicCnt = 1;
          if (
            newValue.projectCode != oldValue.projectCode ||
            newValue.label != oldValue.label
          )
            $scope.changePrj(
              newValue.projectCode,
              newValue.label,
              cmm.baslineNum
            );
        },
        true
      );

      function cellClass(grid, row, col, rowRenderIndex, colRenderIndex) {
        if (row.entity.NO_OF_DIES_BLANKINGDIE == "Included") {
          var key = _.keys(row.entity).filter(function(d) {
            return d.match(/TOOLMAKER[0-9]/i);
          });
          for (var i = 0; i < key.length; i++) {
            if (
              Number(row.entity[key[i]].IN_NODIES) <
              Number(row.entity.IN_DIES_BUDGETED)
            ) {
              return "dicostRed";
            }
          }
        }
        if (row.entity.NO_OF_DIES_BLANKINGDIE == "Excluded") {
          var key = _.keys(row.entity).filter(function(d) {
            return d.match(/TOOLMAKER[0-9]/i);
          });
          for (var i = 0; i < key.length; i++) {
            if (
              Number(row.entity[key[i]].EX_NODIES) <
              Number(row.entity.IN_DIES_BUDGETED)
            ) {
              return "dicostRed";
            }
          }
        }
      }
      $scope._init = function() {
        $scope.gridOptions = {
          showExpandAllButton: false
        };

        $scope.gridOptions.columnDefs = [
          {
            field: "COMPARISON_SEQ",
            enableCellEdit: false,
            displayName: "S.No",
            pinnedLeft: true,
            cellClass: cellClass,
            cellTemplate:
              '<div class="ui-grid-cell-contents">{{grid.renderContainers.body.visibleRowCache.indexOf(row) + 1}}</div>',
            enablePinning: true
          },
          {
            field: "PART_NUMBER",
            enableCellEdit: false,
            pinnedLeft: true,
            cellClass: cellClass,
            width: 150,
            headerCellTemplate:
              '<div>Part Number <i ng-click="grid.appScope.add(row)" class="fa fa-plus-circle float-right text-danger mt-2" aria-hidden="true"></i></div>'
          },
          {
            field: "JUSTIFICATION",
            enableCellEdit: false,
            displayName: "Justification",
            pinnedLeft: true,
            cellClass: cellClass,
            cellTemplate:
              "<div><input type='text' style='width:100%;height:100%;' ng-model='row.entity.JUSTIFICATION'>{{row.entity.JUSTIFICATION}}</div>",
            width: 150
          }
        ];
      };
      $scope.addredCol = function(row) {
        console.log("addredCol=>", row);
      };
      $scope.dropDiff = function(grid, row) {
        return row.entity.dropdown;
      };
      $scope.add = function(select) {
        var addLength = Object.keys($scope.gridOptions.data[0]).filter(function(
          d
        ) {
          return d.match(/^L[0-9]/);
        });
        // if(addLength.length <= $scope.data.dynamicCnt){
        $scope.gridOptions.columnDefs.splice($scope.data.dynamicCnt + 2, 0, {
          field: "ToolmakerPref." + ("P" + $scope.data.dynamicCnt),
          displayName: "P" + $scope.data.dynamicCnt,
          cellFilter: "ToolmakerPrefFIL",
          width: 150,
          editDropdownOptionsFunction: function(rowEntity, colDef) {
            var t = [];
            rowEntity.TOOLMAKER.forEach(function(d) {
              t.push({
                id: d.ID,
                value: d.NAME
              });
            });
            return t;
          },
          editableCellTemplate: "ui-grid/dropdownEditor"
        });
        $scope.data.dynamicCnt += 1;
      };
      $scope._init();
      $scope.openFilterBox = function() {
        document.getElementById("filterBtn").style.backgroundColor = "#24c0c0";
        document.getElementById("ruPBtn").style.backgroundColor = "#dfdede";
        document.getElementById("preFBtn").style.backgroundColor = "#dfdede";
      };
      if ($scope.cmm.projectCode == undefined)
        toastr.warning("Select ProjectCode");
      else
        $scope.changePrj(
          $scope.cmm.projectCode,
          $scope.cmm.label,
          cmm.baslineNum
        );

      $scope.setLab = function(d) {
        $scope.cmm.label = d;
      };
      $scope.downloadFileOut = function(grid, row, num, col) {
        return row.entity[num][col].VALUE;
      };
      $scope.colAdd = function(data) {
        var ll = _.keys(data[0]).filter(function(d) {
          return d.match(/L[0-9]/);
        });
        for (var i = 1; i <= ll.length; i++) {
          var aa = [
            "BASICCOST",
            "COSTPERTON",
            "DIEWEIGHT",
            "LANDEDCOST",
            "NOOFDIES"
          ];
          for (var j = 0; j < aa.length; j++) {
            $scope.gridOptions.columnDefs.push({
              field: "L",
              enableCellEdit: false,
              displayName: "L" + i + " " + aa[j],
              cellClass: cellClass,
              width: 150,
              cellTemplate:
                '<div>{{grid.appScope.downloadFileOut(grid,row,"L' +
                i +
                '","' +
                aa[j] +
                '")}}</div>'
            });
          }
        }
      };
    })
    .filter("mapGender", function() {
      var genderHash = {
        Included: "Included",
        Excluded: "Excluded"
      };
      return function(input) {
        if (!input) {
          return "";
        } else {
          return genderHash[input];
        }
      };
    })
    .filter("ToolmakerPrefFIL", function() {
      return function(input) {
        if (input.TOOLMAKER != undefined) return input.TOOLMAKER;
        else return input;
      };
    });
