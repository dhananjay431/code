
angular.module('App.quoteComparisionCtrl')
.controller('proSelectionCtrl' , function($scope, Upload, $window, $log, $state, NgTableParams, cmm ) {
    console.log("cmm=>", cmm);
    $scope.data = {};
    $scope.cmm = cmm;
    $scope.PanelGrpDrpdwn = [];
    $scope.cmm.label = 'A';
    var selectedPart=[];
    $scope.cmm.selectedPartNumber ={};
    
    //to set label.
    $scope.setLab = function (d) {
        $scope.cmm.label = d;
        $scope.PartCombinationSelectionFun(d);
    };
    //calling Init function.
    var isInitialized;
    $scope.PartCombinationSelectionFunInit = function (panelGroup, projectCode, baslineNum,selectedPart,PARTNUM,partNumIndex,rowIndex) {
        isInitialized = false;
        $scope.PartCombinationSelectionFun('B');		
    }



    //getting part combination data from here 
    $scope.PartCombinationSelectionFun = function (panelGroup, projectCode, baslineNum) {
        
        $scope.data = {};
        $scope.panelGroup = panelGroup;
        
        if ($scope.cmm.projectCode != undefined) {
            if (panelGroup == 'A') {
                document.getElementById('buttonPanelGrpB').classList.remove('active')
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
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage" ,
                dataType: "* json",
                parameters:{
                    "projectCode":cmm.projectCode,
                    "panelGroup":$scope.selected,
                },
                success: function(data,rowIndex) {
                    $scope.PartCombinationSelection=$.cordys.json.findObjects(data,'PARTCOMBINATION');
                    console.log("PartCombinationSelection:",$scope.PartCombinationSelection);
                    //onChange 
                    $scope.changePart($scope.PartCombinationSelection[0].PARTS);

                    $scope.$apply();
                },
                
                error: function(jqXHR, textStatus, errorThrown) {
                    toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });	
        }
    }
    $scope.PartCombinationSelectionFunInit();
    
/*to freezed selected part here*/





$scope.changePart =function(data){
    
    data = _.map(data,function(d){
        if(_.isArray(d.PARTDETAIL.PART) && d.PARTDETAIL.PART[0].length > 1){
            d.selected = d.PARTDETAIL.PART[0];
            d.isDisabled = false;
        }else{
            d.PARTDETAIL.PART = [d.PARTDETAIL.PART];
            d.selected = d.PARTDETAIL.PART[0];
            //added by me from here
            var selectedPart=[];
            selectedPart=[];
            for(var i=0;i<$scope.PartCombinationSelection[0].PARTS.length;i++){
                selectedPart.push(d.selected);
            }
            console.log("selectedpart:",selectedPart);
            var dlabel = $scope.cmm.label;
            $scope.cmm.selectedPartNumber[dlabel]=selectedPart.join(",");
            //end here.
            d.isDisabled = false;
        }
         return d;
    }).map(function(dd){
            if(dd.isDisabled == true) return dd;
            dd.selected.split(";").forEach(function(ddd){
                if(ddd != dd.PARTNUM ){
                    var freez = _.find(data,{"PARTNUM":ddd});
                    freez.isDisabled = true;
                }
            });
        return dd;
    });
    console.log("part:",$scope.PartCombinationSelection[0].PARTS);
}


/*Onclick of Next button redirect to revise panel tab*/
$scope.sendToRevPanel=function(){
    //generateSelectedPart($scope.cmm.label);
    console.log("selected part Number:", $scope.cmm.selectedPartNumber);			
    $state.go('quoteComparisionCtrl.revisePanel');
}	
/*
var splitArr=[];
var	generateSelectedPart = function(panelGroup,PARTNUM,partNumIndex,){
    var part=[];
    var temp = JSON.parse(JSON.stringify($scope.PartCombinationSelection));
    for(var i=0;i< temp[0].PARTS.length;i++){
        part.push(temp[0].PARTS[i].selectedPart)	
    }
    
    var finalSelected= part.join(",");
    console.log("finalSelected:",finalSelected);
    
    //start of row freezed function.
    if(finalSelected != null && finalSelected != '' && finalSelected != undefined){
        /*var finalArray=[];
        var semicolonSeperated = finalSelected.split(";");
        for(var i=0;i<semicolonSeperated.length;i++){
            finalArray.push(semicolonSeperated[i].split(","));
        }
        
        splitArr=finalArray.join().split(",");
        console.log("splitArr:",splitArr);
        
        var partNumIndex = splitArr.indexOf(PARTNUM);
        if(partNumIndex>-1){
            splitArr.splice(partNumIndex,1)
        }
        
        for(i=0;i<splitArr.length;i++){
            for(var j=0;j<$scope.PartCombinationSelection[0].PARTS.length;j++){
                if($scope.PartCombinationSelection[0].PARTS[j].PARTNUM == splitArr[i] &&  i!== j){
                    $scope.PartCombinationSelection[0].PARTS[j].isDisabled=true;
                    $scope.PartCombinationSelection[0].PARTS[j].selectedPart="";	
                    break;
                }
                    part.push(temp[0].PARTS[j].selectedPart)
            }
        }
        //end of row freezed.
        if(panelGroup=='A'){
            $scope.cmm.selectedPartNumber.A = finalSelected.replace(/^,|,$/g, "");
        }
        else if(panelGroup=='B'){
            $scope.cmm.selectedPartNumber.B = finalSelected.replace(/^,|,$/g, "");
        }
    }
}*/
var passData =[
    {
            "projectCode":cmm.projectCode,
            "panelGroup":"A",
    },
    {
            "projectCode":cmm.projectCode,
            "panelGroup":"B"
    }
]; 
function storeCmm(pass,cnt,cb){
    if(cnt <= -1) { cb(pass); return;}
    $.cordys.ajax({
        method: "GetERFQPartCombinationSelection ",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage" ,
        dataType: "* json",
        parameters:pass[cnt],
        success: function(data,rowIndex) {

            var _ev = $.cordys.json.findObjects(data, 'PARTCOMBINATION');
            pass[cnt].data = _ev[0].PARTS.map(function (d) {
                return d.PARTDETAIL.PART;
              }).join(",");
          storeCmm(pass,cnt-1,cb);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            toastr.error("Unable to load data. Please try refreshing the page.");
        }
    });	
}
storeCmm(passData,1,function(data){
    $scope.cmm.selectedPartNumber = {};
    data.forEach(function(d){
        $scope.cmm.selectedPartNumber[d.panelGroup] = d.data;
    })
});

})