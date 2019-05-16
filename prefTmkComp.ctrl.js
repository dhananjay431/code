angular.module('App.quoteComparisionCtrl')
    .controller('prefTmkCompCtrl', function($scope, Upload, $window, $log, $state, cmm) { 

        function cl(){
            this.data = {};
        }
        cl.prototype.gridInit = function(){
            return {
                headerHeight: 40,
	        rowHeight: 40,
                rowDrag: false,
                columnDefs:[
                    {
                        headerName: "PART_NUMBER",
                        field: "PART_NUMBER",
                    }
                ],
                components:{
                    moodEditor: DropDownTemplate
                }
            };
        }
        cl.prototype.initPro= function(data){
            $scope.setting.p = [];
            $scope.setting.l = [];
            _.keys(data[0].ToolmakerPref).map(function(d){
                $scope.setting.p.push({key:d,value:true});
            })
            _.keys(data[0].LANDEDCOST).map(function(d){
                $scope.setting.l.push({key:d,value:true});
            })
            return _.map(data, function(d) {
                var ll = _.keys(d.LANDEDCOST);
                for (var i = 1; i <= ll.length; i++) {
                    d['L' + i] = {
                        LANDEDCOST: d.LANDEDCOST['L' + i],
                        NOOFDIES: d.NOOFDIES['L' + i],
                        DIEWEIGHT: d.DIEWEIGHT['L' + i],
                        BASICCOST: d.BASICCOST['L' + i],
                        COSTPERTON: d.BASICCOST['L' + i],
                    }
                };
                return d;
            });
        }
        cl.prototype.addTm = function(temp){
            var TOOLMAKER=[];
         
            Object.keys(temp[0].ToolmakerPref).forEach(function(d){
                var z = {
                    headerName: d,
                    field: "ToolmakerPref."+d,
                    editable: true,
                    cellClass: ['ToolmakerPref'],
               //    cellRenderer: 'medalCellRenderer' ,
                    cellEditorSelector:function (params){
                        arr = ['Select'];
                        arr =  _.concat(arr,_.map(params.data.TOOLMAKER,'NAME'));
                           return {
                               component: 'moodEditor',
                               params: {values:  arr }
                           };
                       }
                }
                TOOLMAKER.push(z);
               
            })
           return { 
                headerName: 'Toolmaker Preference',
                children:TOOLMAKER
            };
        }
        cl.prototype.addTmLP = function (data){
                 var tp = data.columnDefs.filter(function(d){
                     return d.headerName == "Toolmaker Preference";
                 });
                 if(tp.length > 0){
                    //  var t = "P"+tp[0].children.length;
                     //tp[0].children.push({headerName:t, field: "ToolmakerPref."+t});
                     tp[0].children.push(angular.copy(tp[0].children[tp[0].children.length - 1]));
                 }
                 tp[0].children[tp[0].children.length -1].headerName = "P"+tp[0].children.length;
                 tp[0].children[tp[0].children.length -1].field =  "ToolmakerPref.P"+tp[0].children.length;
                 
                   var tl =  _.max(_.map(data.columnDefs,"headerName").filter(function(d){
                        return d.match(/L[0-9]/);
                    }));
                    var tlArr = angular.copy(data.columnDefs.filter(function(d){
                        return d.headerName == tl;
                    })[0]);
                    
                    tlArr.headerName = "L"+ (Number(tl.replace("L",""))+1);
                    data.api.forEachLeafNode(function(n,i){
                        n.data[tlArr.headerName] = {
                            "LANDEDCOST": {
                                "TOOLMAKERID": "",
                                "TOOLMAKER": "",
                                "VALUE": ""
                            },
                            "NOOFDIES": {
                                "TOOLMAKERID": "",
                                "TOOLMAKER": "",
                                "VALUE": ""
                            },
                            "DIEWEIGHT": {
                                "TOOLMAKERID": "",
                                "TOOLMAKER": "",
                                "VALUE": ""
                            },
                            "BASICCOST": {
                                "TOOLMAKERID": "",
                                "TOOLMAKER": "",
                                "VALUE": ""
                            },
                            "COSTPERTON": {
                                "TOOLMAKERID": "",
                                "TOOLMAKER": "",
                                "VALUE": ""
                            }
                        };
    
                    })
                   

                    tlArr.children.forEach(function(d){
                        d.field = d.field.replace(tl,tlArr.headerName);
                        d.editable = true;
                    })

                    data.columnDefs.push(tlArr);
                    data.api.setColumnDefs(data.columnDefs);
                    console.log(data);
            
        }
        cl.prototype.addAuto = function(temp){
           var tmp = [];
            _.filter(_.keys(temp[0]),function(d){
                return d.match(/L[0-9]/);
            }).forEach(function(d){
                var arr=[];
                arr.push(
                    {
                        headerName: "Base Cost",
                        field: d+".BASICCOST.VALUE",
                        // use font awesome for first col, with numbers for sort
                        icons: {
                            menu: '<i class="fas fa-file-download"/>',
                            filter: '<i class="fas fa-file-download"/>',
                            columns: '<i class="fas fa-file-download"/>',
                            sortAscending: '<i class="fas fa-file-download"/>',
                            sortDescending: '<i class="fas fa-file-download"/>'
                        },
                    }
                );
                arr.push( { headerName: "Landed Cost", field: d+".LANDEDCOST.VALUE" } );
                arr.push( { headerName: "No Of Dies", field: d+".NOOFDIES.VALUE" } );
                arr.push( { headerName: "Die Weight", field: d+".DIEWEIGHT.VALUE" } );
                arr.push( { headerName: "Cost Per Ton", field: d+".COSTPERTON.VALUE" } );
                tmp.push( { headerName:d, children:arr } );
            });
            return tmp;
        }
       
    
        zz = new cl();
        $scope.baseLineD = {};
        $scope.addCol = function(){
            console.log(zz.addTmLP($scope.gridOptions))   
           }
        $scope.baselineSave = function() {
            console.log("baseline save", $scope.baseLineD);
            console.log("cmm", cmm);


            var qr = {
                "new": {
                    "ERFQ_BASELINE_MAIN": {
                        //"BASELINE_SEQ":"",
                        "PROJECT_CODE": cmm.projectCode,
                        "BASELINE_NUM": Number(cmm.baslineNum)+ 1,
                        "BASELINE_NAME": $scope.baseLineD.name,
                        "BASELINE_REMARK": $scope.baseLineD.remark,
                        "PREFERENCE": $scope.setting.menus.replace(/\s/g,''),
                        "BASELINE_STATUS":"QUCO"
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
                    cmm.baslineNum = (cmm.baslineNum!=undefined)?(Number(cmm.baslineNum)+1):1;
                    console.log("$scope.data.erfq_toolmaker_master=>", $scope.data.erfq_toolmaker_master);
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
                            var saveQrData = $.cordys.json.findObjects(data, "ERFQ_QUOTE_COMPARISON");
                            if (saveQrData.length == 0) {
                                var _a=[];
                                $scope.gridOptions.api.forEachNode(function(n,i){
                                    
                                    _a.push(
                                        {
                                            "new": {
                                              "ERFQ_QUOTE_COMPARISON": {
                                                "PROJECT_CODE": cmm.projectCode,
                                                "PART_NUMBER": n.data.PART_NUMBER,
                                                "NEW_PART_GROUP": "",
                                                "BASELINE_NUM": cmm.baslineNum,
                                                "PART_GROUP": cmm.label
                                              }
                                            }
                                        })
                                });
                                // var _t = [];
                                // saveQrData.forEach(function(_sd) {
                                //     if (_sd.COMPARISON_SEQ)
                                //         delete _sd.COMPARISON_SEQ;
                                //     if (_sd.BASELINE_NUM)
                                //         _sd.BASELINE_NUM = Number(cmm.baslineNum)+ 1;
                                //     _t.push({
                                //         "new": {
                                //             "ERFQ_QUOTE_COMPARISON": _sd
                                //         }
                                //     });
                                // })
                                //console.log("SNU=>", _t);
                                $.cordys.ajax({
                                    method: "UpdateErfqQuoteComparison",
                                    namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                                    dataType: "* json",
                                    parameters: {
                                        "tuple": _a
                                    },
                                    success: function(data) {
                                        console.log("success=>");
                                    //    $scope.xlSave(Number(cmm.baslineNum + 1));
                                    $scope.tableDataSave()
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

        }

        $scope.settingFun =function(){
            // $scope.$apply();
            console.log("$scope.setting=>",$scope.setting);
            console.log("$scope.gridOptions=>",$scope.gridOptions)
            
			$scope.hideAll($scope.setting.p.length,$scope.setting.l.length);
			for (i=0;i<$scope.setting.p.length;i++) {
				if ($scope.setting.p[i].value == true) {
					temp = i+1;
					$scope.gridOptions.columnApi.setColumnVisible(['ToolmakerPref.P'+temp+''], true);
				}
			}
			for (j=0;j<$scope.setting.l.length;j++) {
				if ($scope.setting.l[j].value == true) {
					tmp = j+1;
					$scope.gridOptions.columnApi.setColumnVisible(['L'+tmp+'.'+$scope.setting.menus+'.VALUE'], true);
				}
			}
			
        }
        $scope.setting = {
            p:[],
            l:[],
            menus:"Landed Cost",
            // menus:[
            //     {"key":"Base Cost","value":true,"sval":"basecost"},
            //     {"key":"Landed Cost","value":true,"sval":"landedcost"},
            //     {"key":"No Of Dies","value":true,"sval":"noofdies"},
            //     {"key":"Die Weight","value":true,"sval":"dieweight"},
            //     {"key":"Cost per Tone","value":true,"sval":"costpertone"}
            // ],
            ps:{"key":"Select All","value":true,f:function(dt){
                if(this.value==true){
                    dt.map(function(d){
                        d.value = true;
                        return d;
                       })
                }
            }},
            ls:{"key":"Select All","value":true,f:function(dt){
                if(this.value==true){
                    dt.map(function(d){
                        d.value = true;
                        return d;
                       })
                }
            }}
        };
        $scope.setLab = function(d) {
            $scope.cmm.label = d;
        }
        $scope.tableDataSave =function(){
            
            var arr = [];
            $scope.gridOptions.api.forEachNode(function(node,i){

              
              _.keys(node.data.ToolmakerPref).forEach(function(d){
                  
                var temp = {
                    "new": {
                        ERFQ_COMPARISON_PREFERENCE: {
                            //"PREFERENCE_SEQ": d.ToolmakerPref[d3.replace("L", "P")].PREFERENCESEQ,
                            "PROJECT_CODE": cmm.projectCode,
                            "PART_NUMBER": node.data.PART_NUMBER,
                            "BASELINE_NUM": cmm.baslineNum,
                            "LEVEL_PREFERNCE":(node.data[d.replace("P","L")] == undefined ||  node.data[d.replace("P","L")].BASICCOST == undefined ||  node.data[d.replace("P","L")].BASICCOST.TOOLMAKER)?"":node.data[d.replace("P","L")].BASICCOST.TOOLMAKER,
                          //  "TOOLMAKER":node.data[d.replace("P","L")].BASICCOST.TOOLMAKER,
                            //"LEVEL_PREFERNCE": d.ToolmakerPref[d3.replace("L", "P")].TOOLMAKER,
                            "TOOLMAKER_PREFERNCE": node.data.ToolmakerPref[d],
                            "PREFERENCE_NUM":d,
                            "JUSTIFICATION": node.data.JUSTIFICATION,
                            "CATEGORY":cmm.label

                        }
                    }
                };

                if(node.data.SeqPref!= undefined && node.data.SeqPref[d] != undefined && node.data.SeqPref[d] != ""){
                    temp.old =  {
                        ERFQ_COMPARISON_PREFERENCE: {
                            "PREFERENCE_SEQ": node.data.SeqPref[d]
                        }
                    };
                }
                arr.push(temp);

              })
             })
             console.log("req=>",arr);
             $.cordys.ajax({
                 method: "UpdateErfqComparisonPreference",
                 namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                 dataType: "* json",
                 parameters: {
                     "tuple": arr
                 },
                 success: function(data) {
 
                     console.log("success");
                 },
                 error: function error(jqXHR, textStatus, errorThrown) {
                     console.log("error");
                 }
             });
        
        }
        $scope.xl =function(){
            var params ={"skipHeader":false,"columnGroups":true,"skipFooters":false,"skipGroups":false,"skipPinnedTop":false,"skipPinnedBottom":false,"allColumns":false,"onlySelected":false,"suppressQuotes":false,"fileName":"","columnSeparator":""};
            $scope.gridOptions.api.exportDataAsCsv(params);
            //var arr = [];
            //$scope.gridOptions.api.forEachNode(function(node,i){
            //     var z = {};
            //     $scope.gridOptions.columnDefs.forEach(function(d2){
            //         if(d2.children == undefined){
            //             var k = d2.field;
            //             z[k] = _.at(node.data,d2.field)[0];
            //         }
            //         else{
            //             d2.children.forEach(function(d3){
            //             var k = d3.field;
            //             z[k] = _.at(node.data,d3.field)[0];
            //             })
            //         }
                    
            //     })
            //     arr.push(z);

           //  })
        }
        $scope.gridOptions = {
      
            columnDefs:[
                {
                    headerName: "PART_NUMBER",
                    field: "PART_NUMBER"
                }
            ],
            components:{
                moodEditor: DropDownTemplate,
               //medalCellRenderer: MedalCellRenderer
            },
            rowData: null
            // ,onGridReady: function() {

            //     $scope.gridOptions.api.addGlobalListener(function(type, event) {
            //         if (type.indexOf('column') >= 0) {
            //             console.log('Got column event: ', event);
            //         }
            //     });
            // }

        };
        $scope.data ={};
        $scope.cmm = cmm;
        $scope.cmm.label = 'A';
        console.log(cmm);
        $scope.changePrj = function(projectCode, panelGroup, bNum) {
            if(cmm.baslineNum == undefined){
                cmm.baslineNum ="";
            }else{
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
                    "partNum": "",
                    "decimalPlace": "5",
                    "preferences": "",
                    "ComparePref": "LandedCost",
                    "toolmakersRequired": '',
                    "panelGrouping": ''
                },
                success: function(data) {
                    
                    var temp = $.cordys.json.findObjects(data, "COMPARISON");
                   
                    if (temp.length > 0) {
                        $scope.gridOptions.columnDefs = [
                            {
                                headerName: "PART_NUMBER",
                                field: "PART_NUMBER"
                            }
                        ];
                      //  $scope.gridOptions.data = zz.initPro(temp);
                    temp =   zz.initPro(temp);
                        $scope.gridOptions.columnDefs.push(zz.addTm(temp));
                        
                       console.log("$scope.gridOptions.columnDefs=>",$scope.gridOptions.columnDefs);
                        

                        $scope.gridOptions.columnDefs.push(
                            {
                                headerName: "Justification",
                                field: "JUSTIFICATION",
                                editable: true

                            }
                        );
                        $scope.gridOptions.columnDefs = _.concat($scope.gridOptions.columnDefs,zz.addAuto(temp));

                        $scope.gridOptions.api.setColumnDefs($scope.gridOptions.columnDefs);
                        console.log("show data=>",temp);
                        $scope.gridOptions.api.setRowData(temp);
                        
                        
                     

                        //console.log($scope.gridOptions.data);
             
                        $scope.$apply();
                    } else {
                        console.log("no data on base line ");
                        // 
                    //    $scope.tableDataGet();
                        // 
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {

                }
            });

        }
        $scope.binit = function(d) {

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
                    $.cordys.json.findObjects(data, "ERFQ_BASELINE_MAIN").forEach(function(d) {
                        if (d.BASELINE_STATUS == "Submitted")
                            $scope.baseLineLead.ch.push({
                                "key": d.BASELINE_NUM,
                                value: true,
                                status: d.BASELINE_STATUS,
                                name: d.BASELINE_NAME
                            });
                        else
                            $scope.baseLineLead.ch.push({
                                "key": d.BASELINE_NUM,
                                value: false,
                                status: d.BASELINE_STATUS,
                                name: d.BASELINE_NAME
                            });
                            $scope.$apply();
                    });
                    if (d != undefined) {
                        $(d).modal("show")
                    }
                },
                error: function error(jqXHR, textStatus, errorThrown) {}
            });
        }
        $scope.baselineLeadSave = function() {
            console.log("$scope.baseLineLead=>", $scope.baseLineLead);

            $scope.baseLineLead.ch.filter(function(d) {
                return d.value == true;
            }).forEach(function(d2) {


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

            })

        }

		$scope.hideAll = function(countPTm,countLCols) {
			for(i=1;i<=countPTm;i++) {
				$scope.gridOptions.columnApi.setColumnVisible(['ToolmakerPref.P'+i+''], false);
			}
			for(j=1;j<=countLCols;j++) {
				$scope.gridOptions.columnApi.setColumnVisible(['L'+j+'.BASICCOST.VALUE'], false);
				$scope.gridOptions.columnApi.setColumnVisible(['L'+j+'.LANDEDCOST.VALUE'], false);
				$scope.gridOptions.columnApi.setColumnVisible(['L'+j+'.NOOFDIES.VALUE'], false);
				$scope.gridOptions.columnApi.setColumnVisible(['L'+j+'.DIEWEIGHT.VALUE'], false);
				$scope.gridOptions.columnApi.setColumnVisible(['L'+j+'.COSTPERTON.VALUE'], false);
			}
		}

        $scope.$watchCollection('cmm', function(newValue, oldValue) {
            $scope.data.dynamicCnt = 1;
            if(newValue != undefined && !_.isEqual(oldValue, newValue))
                $scope.changePrj(newValue.projectCode, newValue.label, cmm.baslineNum);
        }, true);
   

        if ((cmm.projectCode == undefined))
        toastr.warning("Select ProjectCode");
            else
        $scope.changePrj(cmm.projectCode, cmm.label, cmm.baslineNum);
    });
