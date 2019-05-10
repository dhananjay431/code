angular.module('App.quoteComparisionCtrl')
    .controller('prefTmkCompCtrl', function($scope, Upload, $window, $log, $state, cmm) { 
        function cl(){
            this.data = {};
        }
        cl.prototype.gridInit = function(){
            return {
                rowDrag: false,
                columnDefs:[
                    {
                        headerName: "PART_NUMBER",
                        field: "PART_NUMBER"
                    }
                ],
                components:{
                    moodEditor: DropDownTemplate
                }
            };
        }
        cl.prototype.initPro= function(data){
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
                    cellEditorSelector:function (params){
                        debugger;
                           return {
                               component: 'moodEditor',
                               params: {values:  _.map(params.data.TOOLMAKER,'ID') }
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
                            "LEVEL_PREFERNCE": node.data[d.replace("P","L")].BASICCOST.TOOLMAKER,
                          //  "TOOLMAKER":node.data[d.replace("P","L")].BASICCOST.TOOLMAKER,
                            //"LEVEL_PREFERNCE": d.ToolmakerPref[d3.replace("L", "P")].TOOLMAKER,
                            "TOOLMAKER_PREFERNCE": node.data.ToolmakerPref[d],
                            "PREFERENCE_NUM":d,
                            "JUSTIFICATION": node.data.JUSTIFICATION,
                            "CATEGORY":cmm.label

                        }
                    }
                };

                if(node.data.SeqPref!= undefined && node.data.SeqPref[d] != ""){
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
            // })
        }
        $scope.gridOptions = {
            rowDrag: false,
            columnDefs:[
                {
                    headerName: "PART_NUMBER",
                    field: "PART_NUMBER"
                }
            ],
            components:{
                moodEditor: DropDownTemplate
            }
        };
        $scope.data ={};
        $scope.cmm = cmm;
        $scope.cmm.label = 'A';
        console.log(cmm);
        $scope.changePrj = function(projectCode, panelGroup, bNum) {
            $.cordys.ajax({
                method: "GetERFQComparisonData",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
                parameters: {
                    "comparisonType": "Preference",
                    "panelGroup": panelGroup,
                    "projectCode": projectCode,
                    "baselineNum": Number(cmm.baslineNum),
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
                        $scope.gridOptions.data = zz.initPro(temp);
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
                        $scope.gridOptions.api.setRowData(temp);
                        
                        
                     

                        console.log($scope.gridOptions.data);
             
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