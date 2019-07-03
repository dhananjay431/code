angular.module('App.mainApp')
.controller('app.ProjectRequirementCtrl', function($scope, Upload,$window,$log,$state,NgTableParams) {
//Date Function
 $(function() { 
$('body').on('focus',".datepicker", function()
{ 
$(this).datepicker({ dateFormat: 'yy-mm-dd' ,
onSelect: function(dateText) {
      console.log(dateText);
	  console.log($(this).data('id'));
	  var id=$(this).data('id')
	  var d=dateText;
	  d = new Date(d);
	  let year = d.getFullYear();
	  let month = (1 + d.getMonth()).toString();
	   let day = d.getDate();
	  $scope.changedData[id].EVENT_DATE = year + "-" + month + "-" + day;
      console.log($scope.changedData);
     if(document.getElementById("PList")!=null){
         document.getElementById("some-submit-element").disabled=false;
         document.getElementById("nextbtn").disabled=true;
         }
} }); 

});
 });
if(localStorage.role !='MSIE')
{
 $state.go('main');
}
	

	var vm = this;
   
	var data=[];
	
	/*vm.data = {};*/
	if(localStorage.projectCode != undefined ){
   $scope.pass = JSON.parse(localStorage.projectCode);
   if(JSON.parse(localStorage.projectCode).ProjectCode!=undefined){
	$scope.Plist=JSON.parse(localStorage.projectCode).ProjectCode;
	//---------------
	
		$scope.MSIE=null;
		$scope.StampingLead=null;
		$scope.Total_Vol = null;
		$scope.Total_Prod = null;
		$scope.Total_Duration = null;
		$scope.Total_Waranty = null;
		
		$scope.FileArray=[];
		
		
		$.cordys.ajax({
                method: "GetERFQProjectMembers",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				parameters:{
					"projectCode" : JSON.parse(localStorage.projectCode).ProjectCode,
					
				},
                success: function(data) {
                   
				
				$scope.Incharges= $.cordys.json.findObjects(data, "AFS_PROJ_MEMBERS");
				for(var i=0;i<$scope.Incharges.length;i++){
					if($scope.Incharges[i].AFSPM_MEMBER_ROLE=="MSIE"){
						$scope.MSIE = $scope.Incharges[i].AFSPM_MEMBER_NAME;
						
					}
					if($scope.Incharges[i].AFSPM_MEMBER_ROLE=="Stamping Lead"){
						
						$scope.StampingLead = $scope.Incharges[i].AFSPM_MEMBER_NAME;
						
					}

					
	
				}
                    $scope.$apply();  
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    //debugger;
                   toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });

		
			//get Data for particular projectCode
			
			$.cordys.ajax({
                method: "GetERFQ_PROJECT_REQObject",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				parameters:{
					"PROJECT_CODE": JSON.parse(localStorage.projectCode).ProjectCode
				},
                success: function(data) {
                    //debugger;
                    //console.log(data);
                 if($.cordys.json.findObjects(data, "ERFQ_PROJECT_REQ").length!=0)
				 {				 
                   $scope.LoadData= $.cordys.json.findObjects(data, "ERFQ_PROJECT_REQ");
                    $scope.Total_Vol = $scope.LoadData[0].TOTAL_VALUE;
					$scope.Total_Prod = $scope.LoadData[0].TOTAL_PRODUCTION;
					$scope.Total_Duration = $scope.LoadData[0].DURABILITY_YEARS;
					$scope.Total_Waranty = $scope.LoadData[0].WARRANTY_YEARS;
					
					if($scope.LoadData[0].BUILD_QUALITY=="M&M"){
						$scope.selectOne=true;
						$scope.selectTwo=false;
					}
					else{
						$scope.selectTwo=true;
						$scope.selectOne=false;
					}
					$scope.$apply();
				 }
				 else{
					 
				 }
				 
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    //debugger;
                   toastr.error("Unable to load data. Please try refreshing the page.");
                }
		
	});
   //--------------------------------
   	$.cordys.ajax({
                method: "GetERFQAllUploadedDoc",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				parameters:{
					"projectCode" : JSON.parse(localStorage.projectCode).ProjectCode,
					"documentType" : "ProjectReq"
				},
                success: function(data) {
                   
                 
			$scope.FileArray= $.cordys.json.findObjects(data, "ERFQ_UPLOADED_DOCUMENT_HISTORY");
                    $scope.$apply();  
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    //debugger;
                    toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });
			
			
			$.cordys.ajax({
			         method: "GetEventsforProject",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				parameters:{
					"ProjectCode" : JSON.parse(localStorage.projectCode).ProjectCode,
				},
                success: function(data) {

				 $scope.PannelSupplyIdsArray=[];
				$scope.tableDetails= $.cordys.json.findObjects(data, "erfq_pannel_supply");
				 
				 if($scope.tableDetails.length!=0){
				$scope.checkDetails=$scope.tableDetails;
				 $scope.tableArray=[];
				 
				 }
				 else{
					 $scope.getTableDataInitial();
				 }
                   $scope.tableArray= $.cordys.json.findObjects(data, "erfq_pannel_supply");
				   for(var i=0;i<$scope.tableArray.length;i++){
					 if($scope.tableArray[i].PANNEL_SUPPLY_ID!="" && $scope.tableArray[i].PANNEL_SUPPLY_ID!=null && $scope.tableArray[i].PANNEL_SUPPLY_ID!=undefined){
					   $scope.PannelSupplyIdsArray.push(parseInt($scope.tableArray[i].PANNEL_SUPPLY_ID));
					   }  
				   }
				   
				  /* $scope.tableArray = $scope.tableArray.map(function(d){
					   
					   delete d.PANNEL_SUPPLY_ID;
					   d.EVENT1 = JSON.stringify(d);
					   return d;
				   });*/
				   
					$scope.tableArray = $scope.tableArray.map(function(d){
					   
					   d.DATA_FLAG = "E";
					   return d;
				   });
                     data = angular.copy($scope.tableArray);
					 $scope.changedData = data;
					$scope.dataCallFunction(data);
					$scope.PassValue={};
					if($scope.tableArray.length!=0){
					$scope.PassValue.SendDate= $scope.tableArray[0].EVENT_DATE;
                                        $scope.PassValue.dataFlag = $scope.tableArray[0].DATA_FLAG;
					}
					$scope.PassValue.MSIE=$scope.MSIE;
					$scope.PassValue.StampingLead=$scope.StampingLead;
					
					if($scope.label1==undefined && localStorage.projectCode == undefined)
					{
					$scope.PassValue.ProjectCode = null;
					}
					else if($scope.label1==undefined && localStorage.projectCode != undefined && JSON.parse(localStorage.projectCode).ProjectCode!=undefined){
					$scope.PassValue.ProjectCode = JSON.parse(localStorage.projectCode).ProjectCode;
					}
					else if($scope.label1!=undefined){
						$scope.PassValue.ProjectCode=$scope.label1
					}
					localStorage.projectCode = JSON.stringify($scope.PassValue);
                                       document.getElementById("UploadButton").disabled = false;
					$scope.$apply();	
					return;
                },
                error: function(jqXHR, textStatus, errorThrown) {
                 
                   toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });
			
   
   
	}
	}
	

			
			$scope.arr=[];
			$scope.DFileArray=[];
			
			$.cordys.ajax({
               method: "GetXMLObject",
					namespace: "http://schemas.cordys.com/1.0/xmlstore",
					parameters: {
						key: "com/Mahindra/Mahindra_eRFQ/FixedDocuments.xml"
					},
					dataType: "* json",
					async: false,
                success: function(data) {

					  $scope.FileSizeLimit= $.cordys.json.findObjects(data, "Documents");
					  $scope.Size = parseInt($scope.FileSizeLimit[0].FileSize);
					  
					  $scope.DObj11= $.cordys.json.findObjects(data, "ProjectReqDoc");
                      for(var i=0;i<$scope.DObj11.length;i++){
						  
                      	var p = $scope.DObj11[i];
                      	var filename = p.replace(/^.*[\\\/]/, '');
						var DownloadFile = {
							  "DOCUMENT_NAME" : filename,
							  "DOCUMENT_PATH" : p,
						  }
						
                      	 $scope.DFileArray.push(DownloadFile);
                      	 }
			              //$scope.$apply();
					
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    //debugger;
                   toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });
			
			
	
	//get Date
	

	$scope.getDate=function(){
	//get Date from server
	$.cordys.ajax({
                method: "GetERFQServerDate",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				parameters:{
					
				},
                success: function(data) {
                    //debugger;
                    //////console.log(data);
                 $scope.disDate = $.cordys.json.findObjects(data, "GetERFQServerDate");
				 var a = $scope.disDate[0].GetERFQServerDate;
				 var b = a.split(" ");
				 var StringDate = b[1]+" "+b[2]+" "+b[5];
				 
				 var d = new Date(StringDate);
			

				  let year = d.getFullYear();
   				  let month = (1 + d.getMonth()).toString();
   				  let day = d.getDate().toString();  
                                  if (/^\d$/.test(month)){month = String("0" + month)}
   				  if (/^\d$/.test(day)){day = String("0" + day)}
 
                                 var final =  day + '/' + month + '/'  + year;
                                $scope.tmkSumDiv1 = final;







                          //---------------------------------------------------------------------

				 /*var mapp = new Map();
				 mapp[1]="Jan";
				 mapp[2]="Feb";
				 mapp[3]="Mar";
				 mapp[4]="Apr";
				 mapp[5]="May";
				 mapp[6]="Jun";
				 mapp[7]="Jul";
				 mapp[8]="Aug";
				 mapp[9]="Sep";
				 mapp[10]="Oct";
				 mapp[11]="Nov";
				 mapp[12]="Dec";
				 var monthIndex = Object.values(mapp).indexOf(b[1]);
				 $scope.tmkSumDiv1 = b[2]+"/"+monthIndex +"/"+b[5];*/
				 
                  
                    $scope.$apply();  
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    //debugger;
                   toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });
	
	
}
	
		// get Project Codes
			$.cordys.ajax({
                method: "GetERFQProjectCodes",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				parameters:{
					
				},
                 success: function(data) {
                  
					
					$scope.PrjMembers = $.cordys.json.findObjects(data, "AFS_PROJ_MEMBERS");
                	var  PrjArray = $.cordys.json.findObjects(data, "AFS_PROJ_MEMBERS");
				
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    //debugger;
                    toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });
			
			$scope.checkValueT=function(){
                   // alert("Hi");
                     $scope.MSIE=null;
		$scope.StampingLead=null;
		$scope.Total_Vol = null;
		$scope.Total_Prod = null;
		$scope.Total_Duration = null;
		$scope.Total_Waranty = null;
                $scope.FileArray=[];
              // $scope.getTableDataInitial();
                 $scope.toolmakerInit();
                localStorage.clear();

                    }
			
			
			$scope.UpdateUD_InsertUDH=function(Docid){
	//alert("called");
	$scope.pass = JSON.parse(localStorage.projectCode);
	//Update UD
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
													//check once
													 
													"DOCUMENT_ID": Docid,
                                                    "PROJECT_CODE": JSON.parse(localStorage.projectCode).ProjectCode,
													"DOCUMENT_NAME":$scope.DOCUMENT_NAME1,
													"DOCUMENT_PATH":$scope.ServerFilePath,
													"DOCUMENT_TYPE": "ProjectReq",//as per the screen
													//"UPLOADED_BY":"Priyanka",//we will get from login
													//"UPLOADED_ON":$scope.TodayDate,
													//UPDATED_BY":"",//we will get from login
														//"UPDATED_ON":$scope.TodayDate,
														"DOCUMENT_DESC": $scope.DOCUMENT_DESC1

                                                    }
                                                }
                                            }

                                        },
                success: function(data) {
                 $scope.FileArray[$scope.FileArray.length-1].DOCUMENT_PATH=$scope.ServerFilePath;
				 toastr.success("Uploaded successfully!");
				 $scope.getALLUploadedDocAfterSave()
				 $scope.DOCUMENT_NAME1=null;
				 $scope.DOCUMENT_DESC1=null;
				 
				 
				 
                   //$scope.eventList= $.cordys.json.findObjects(data, "ERFQ_EVENT_MASTER");
                    //$scope.$apply();  
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    //debugger;
                   toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });
			
			//Insert in UDH
			//Insert in UDH happens automatically from backend when record is updated in UD
			
			//------
	
}

$scope.InsertUD_InsertUDH=function(){

	$scope.pass = JSON.parse(localStorage.projectCode);
	//insert in ERFQ Upload Documents
									 $.cordys.ajax({
									  method: "UpdateErfqUploadedDocument",
									  namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
									  dataType: '* json',  
									  parameters: {
										tuple:
										{
											"new" : 
											{
												"ERFQ_UPLOADED_DOCUMENT" :
												{
													"PROJECT_CODE": JSON.parse(localStorage.projectCode).ProjectCode,
													"DOCUMENT_NAME":$scope.DOCUMENT_NAME1,
													"DOCUMENT_PATH":$scope.ServerFilePath,
													"DOCUMENT_TYPE": "ProjectReq",//as per the screen
													//"UPLOADED_BY":"Priyanka",//we will get from login
													//"UPLOADED_ON":$scope.TodayDate,
													//"UPDATED_BY":"",//we will get from login
													//"UPDATED_ON":$scope.TodayDate,
													"DOCUMENT_DESC": $scope.DOCUMENT_DESC1
												}
											}
										}
									  },
									  success: function(e) {
										//console.log(e);
										$.cordys.json.findObjects(e, "ERFQ_UPLOADED_DOCUMENT")[0].DOCUMENT_ID;
										$scope.FileArray[$scope.FileArray.length-1].DOCUMENT_PATH=$scope.ServerFilePath;
										 $scope.getALLUploadedDocAfterSave();
										 $scope.DOCUMENT_NAME1=null;
										$scope.DOCUMENT_DESC1=null;
										$scope.$apply();
									  },
									  error: function(jqXHR, textStatus, errorThrown){
										//debugger;
										toastr.error("Unable to load data. Please try refreshing the page.");
									  }
									});
								//insert Upload Document History	
									//inserts in UDH Automatically as inserted in UD
	
}
			
							$scope.browseAndAddRow = function(){
				//debugger;
				if($scope.FileObject!=null){
					$scope.fileName=$scope.FileObject.name;
					if($scope.fileName.split('.')[1]=='pdf' || $scope.fileName.split('.')[1]=='jpg' || 
					$scope.fileName.split('.')[1]=='png' || $scope.fileName.split('.')[1]=='jpeg' || 
					$scope.fileName.split('.')[1]=='docx' || $scope.fileName.split('.')[1]=='doc'  ){
						
					}
					//-----------$scope.attachment.DOCUMENT_NAME=$scope.fileName;
					extension = $scope.FileObject.name.substr($scope.FileObject.name.lastIndexOf(".") + 1);
					if ("dll" != extension.toLowerCase() && "exe" != extension.toLowerCase() ) {
							  var fileReader = new FileReader;
							  fileReader.onload = function(fileLoadedEvent) {
								  //try {parent.uploadStart()} catch (err) {//console.log("parent.uploadStart() is not present")}
								  $scope.uploadFile(fileLoadedEvent.target.result, fileLoadedEvent.target.filename);
							  }
							  fileReader.filename = $scope.FileObject.name;
							  $scope.fileNow = $scope.FileObject.name
							  fileReader.readAsDataURL($scope.FileObject);
						}
					else{
						alert('Unable to Read File');
					}
					
					$scope.uploadFile=function(file,name){
					//debugger;
						if(!(file == "data:" || file == null))
						{
							file = file.split("base64,")[1];
							$.cordys.ajax({
							  method: "UploadERFQDoc",
							  namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
							  dataType: '* json',  
							  parameters: {
								  FileName:$scope.fileNow,
								  FileContent:file
							  },
							  success: function(e) {
								//console.log(e);
								$scope.ServerFilePath=$.cordys.json.findObjects(e, "uploadERFQDoc")[0].uploadERFQDoc;
								//temperoray change 2
								var FileNameObj = {
											"DOCUMENT_NAME" : $scope.fileNow,
											"DOCUMENT_DESC" : $scope.DOCUMENT_DESC1,
	                                        
											};
								$scope.FileArray.push(FileNameObj);
                                 $scope.DOCUMENT_NAME=$scope.fileNow;
								 $scope.FileArray[$scope.FileArray.length-1].DOCUMENT_NAME = FileNameObj.DOCUMENT_NAME;
								 $scope.FileArray[$scope.FileArray.length-1].DOCUMENT_DESC = FileNameObj.DOCUMENT_DESC;
																 //$scope.DOCUMENT_NAME1=name;
								$scope.$apply();
								//debugger;
								
								//check whether the file already exist in table ERFQ Uploaded Document
								$.cordys.ajax({
                method: "GetERFQDocsbyProjCode",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				 parameters: {
                               "projectCode": JSON.parse(localStorage.projectCode).ProjectCode,
                               "documentType": "ProjectReq"
														
					
                                        },
                success: function(data) {
                    //debugger;
                    //console.log(data);
				// if	($.cordys.json.findObjects(data, "ERFQ_UPLOADED_DOCUMENT").length!=0) --update in UploadDocument and insert in UploadDocumentHistory
                 //else insert in UD and insert in UDH
				 if	($.cordys.json.findObjects(data, "ERFQ_UPLOADED_DOCUMENT").length!=0){
					 $scope.DocId=$.cordys.json.findObjects(data, "ERFQ_UPLOADED_DOCUMENT")[0].DOCUMENT_ID;
					 $scope.UpdateUD_InsertUDH($scope.DocId);
					}
					else{
						$scope.InsertUD_InsertUDH();
					}
				 
                 
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    //debugger;
                    toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });
								
								
								//attachmentIndex++;
										//temporary 
										//Note:- here we will get the File name and object from Upload Document History.
										//for now we are taking from above.
								
								//-------------------------
								
								
							  },
							  error: function(jqXHR, textStatus, errorThrown){
								//debugger;
								toastr.error("Unable to load data. Please try refreshing the page.");
							  }
							});
						}
						else
					  {
						alert("Sorry file is empty, Pls upload other file");
					  }
					}
				}
				else{
					
				}
			}
			$scope.contentTypeForImage=function(ext){
				//debugger;
				if(ext=='jpg')
					return 'image/jpg';
				else if(ext=='png')
					return 'image/png';
				else if(ext=='jpeg')
					return 'image/jpeg';
				else if(ext=='docx')
					return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
				else if(ext=='doc')
					return 'application/msword';
				else if(ext=='txt')
					return 'text/plain';
				else if(ext=='pdf')
					return 'application/pdf';
				else if(ext=='xls' || ext=='xlsx')
					return 'application/vnd.ms-excel';
			}
			
		$scope.ViewFileName=function(fileObj){
	if(fileObj!=null){
		var fsize = fileObj.size; 
		var iConvert = (fsize / 1048576).toFixed(2);
		if(iConvert <= $scope.Size){
		$scope.FileObject=fileObj;
					$scope.fileName=fileObj.name;
					if($scope.fileName.split('.')[1]=='pdf' || $scope.fileName.split('.')[1]=='jpg' || 
					$scope.fileName.split('.')[1]=='png' || $scope.fileName.split('.')[1]=='jpeg' || 
					$scope.fileName.split('.')[1]=='docx' || $scope.fileName.split('.')[1]=='doc'  ){
						
					}
					//-----------$scope.attachment.DOCUMENT_NAME=$scope.fileName;
					extension = fileObj.name.substr(fileObj.name.lastIndexOf(".") + 1);
					if ("dll" != extension.toLowerCase() && "exe" != extension.toLowerCase() ) 

						{
							  var fileReader = new FileReader;
							  fileReader.onload = function(fileLoadedEvent) {
								  
								 
							  }
							  fileReader.filename = fileObj.name;
							  fileReader.readAsDataURL(fileObj);
							  $scope.DOCUMENT_NAME1=fileObj.name;
						}
						else{
							alert("Unable to read File");
							//return false;
						}
						}
						else{
							//alert("Select file smaller than "+$scope.Size+" MB");
							toastr.error("Select file smaller than "+$scope.Size+" MB");
							return false;
						}
	}
					else{
						
					}
					}
					
	
						
			
			$scope.getALLUploadedDocAfterSave=function(){
			
			$.cordys.ajax({
                method: "GetERFQAllUploadedDoc",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				parameters:{
					"projectCode" : JSON.parse(localStorage.projectCode).ProjectCode,
					"documentType" : "ProjectReq"
				},
                success: function(data) {
                    //debugger;
                    //console.log(data);
                 
			$scope.FileArray= $.cordys.json.findObjects(data, "ERFQ_UPLOADED_DOCUMENT_HISTORY");
                    $scope.$apply();  
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    //debugger;
                    alert("Error in loading data");
                }
            });
			
				}
			
		$scope.dataCallFunction=function(data){
			$scope.tableParams = new NgTableParams({}, {
			filterDelay: 0,
			dataset: data
			});
		}		
		$scope.toolmakerInit = function() {
			
			 $scope.tableArray=[]; 
					$scope.FileArray=[];
					//$scope.DFileArray=[];
					$scope.PanelSupplyObj={};
					$scope.InsertPanelSupplyArray = [];
					$scope.tableDetails = [];
			$scope.UpdatePanelSupplyArray=[];
				$scope.tupleIndex = [];
  				$scope.albumNameArray = [];
				$scope.DeletFromMapTable=[];
				
				$scope.getDate();
  				$scope.FiletupleIndex = [];
 				 $scope.FileNameArray = [];
  
  
			//document.getElementById("Plist").setAttribute("autocomplete","off");
                $scope.selectOne=true;
			if(document.getElementById("some-submit-element")){
					 document.getElementById("some-submit-element").disabled = true;
	 
				 }
  
				document.getElementById("UploadButton").disabled = true;
			$scope.arrayToDeleteFromBackend=[];
			
			//get Event List
			
			$.cordys.ajax({
                method: "GetAllEvents",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				parameters:{
					
				},
                success: function(data) {
                    //debugger;
                 //console.log(data);
                 
                   $scope.eventList = $.cordys.json.findObjects(data, "ERFQ_EVENT_MASTER");
				   
				   $scope.eventList= $scope.eventList.map(function(d1){
					   
					   d1.DATA_FLAG = "I";
					   return d1;
				   });
				   
					$scope.CurrentEventList = $.cordys.json.findObjects(data, "ERFQ_EVENT_MASTER");
                    $scope.$apply();  
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    //debugger;
                    alert("Error in loading data");
                }
            });
			
			
			//table data Initial
			if($scope.checkDetails== undefined ){
			$scope.getTableDataInitial();
			}
			else{
				
			}
		}
		//-----------
	
		$scope.getTableDataInitial=function(){
		$.cordys.ajax({
                method: "GetEventsforProject",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				parameters:{
					"ProjectCode" : "",
				},
                success: function(data) {
                    debugger;
                    //console.log(data);
					if($scope.checkDetails==undefined || $scope.checkDetails.length==0 ){
				 $scope.tableArray=[];
					$scope.PannelSupplyIdsArray=[];
				 
                   $scope.tableArray= $.cordys.json.findObjects(data, "ERFQ_EVENT_MASTER");
				   
				   
				   for(var i=0;i<$scope.tableArray.length;i++){
		if($scope.tableArray[i].PANNEL_SUPPLY_ID!="" && $scope.tableArray[i].PANNEL_SUPPLY_ID!=null && $scope.tableArray[i].PANNEL_SUPPLY_ID!=undefined){
					   $scope.PannelSupplyIdsArray.push($scope.tableArray[i].PANNEL_SUPPLY_ID);
					   }  
					   
				   }
				   
				   $scope.tableArray = $scope.tableArray.map(function(dd){
					   
					    delete dd.PANNEL_SUPPLY_ID;
					    //dd.EVENT1 = JSON.stringify(dd);
					   return dd;
				   });
				   
				   $scope.tableArray = $scope.tableArray.map(function(d){
					   
					   d.DATA_FLAG = "I";
					   return d;
				   });
				   
					data = angular.copy($scope.tableArray);
					$scope.changedData = data;
					$scope.dataCallFunction(data);
					$scope.PassValue={};
					if($scope.tableArray.length!=0){
					$scope.PassValue.SendDate= $scope.tableArray[0].EVENT_DATE;
                                        $scope.PassValue.dataFlag = $scope.tableArray[0].DATA_FLAG;
					}
					$scope.PassValue.MSIE=$scope.MSIE;
					$scope.PassValue.StampingLead=$scope.StampingLead;
					
					if($scope.label1==undefined && localStorage.projectCode == undefined)
					{
					$scope.PassValue.ProjectCode = null;
					}
					else if($scope.label1==undefined && localStorage.projectCode != undefined && JSON.parse(localStorage.projectCode).ProjectCode!=undefined){
					$scope.PassValue.ProjectCode = JSON.parse(localStorage.projectCode).ProjectCode;
					}
					else if($scope.label1!=undefined){
						$scope.PassValue.ProjectCode=$scope.label1
					}
					localStorage.projectCode = JSON.stringify($scope.PassValue);
                    $scope.$apply();  
					
					}
                },
                error: function(jqXHR, textStatus, errorThrown) {
                 
                    toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });
		}
		
		//----------------------
		
			$scope.addRow= function() {


				$scope.obj1 = {
				"selected1" : false,
				"EVENT" : "",
				"EVENT_DATE" : "",
				"PANEL_QUALITY" : "",
				"PIST_LEVEL" : "",
				"PANEL_CONDITIONS" : "",
				"DELIVERY_ADDRESS" : "",
	              "DATA_FLAG" :"I"
				};
				
				$scope.tableArray.push($scope.obj1);
				data = angular.copy($scope.tableArray);
				$scope.changedData = data;
              $scope.dataCallFunction(data);
           //   $('table tr').last().find('td').first().focus();
					}
			
			
			$scope.getUploadedDocForProject=function(){
			$.cordys.ajax({
                method: "GetERFQAllUploadedDoc",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				parameters:{
					"projectCode" : ($scope.abc1!= undefined) ? $scope.abc1.AFSPM_POJ_CODE : JSON.parse(localStorage.projectCode).ProjectCode,
					"documentType" : "ProjectReq"
				},
                success: function(data) {
                   
                 
			$scope.FileArray= $.cordys.json.findObjects(data, "ERFQ_UPLOADED_DOCUMENT_HISTORY");
                    $scope.$apply();  
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    //debugger;
                  toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });
			}
			
			$scope.passProjectCode = function(item,abc,label) {
				
				debugger;
				$scope.PassValue={};
                    if(label!=undefined){
                     document.getElementById("test").maxLength=label.length;
                    }
                    if(localStorage!=undefined && localStorage.projectCode!=undefined && JSON.parse(localStorage.projectCode).ProjectCode!=undefined){
                    document.getElementById("test").maxLength=JSON.parse(localStorage.projectCode).ProjectCode.length;
                    }
				
        $scope.item1=item;
		$scope.abc1=abc;
		$scope.label1=label;
               if(document.getElementById("some-submit-element")){
					 document.getElementById("some-submit-element").disabled = false;
	 
				 }
		//get Details of MSIE and Stamping Lead!


         //  document.getElementById("label1").style.padding-bottom= "2%";
			//clear the data of previous Project code
			if(abc!=null || abc!=undefined || JSON.parse(localStorage.projectCode).ProjectCode!=undefined){
		
		//set all the values to null which are already there of previous Project Codes
		document.getElementById("UploadButton").disabled = false;
		$scope.MSIE=null;
		$scope.StampingLead=null;
		$scope.Total_Vol = null;
		$scope.Total_Prod = null;
		$scope.Total_Duration = null;
		$scope.Total_Waranty = null;
		
		$scope.FileArray=[];
		
		
		 $.cordys.ajax({
      method: "GetERFQListofEbomRev",
      namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
      dataType: "* json",
      parameters: {
        ProjectCode: (abc!= undefined) ? abc.AFSPM_POJ_CODE : JSON.parse(localStorage.projectCode).ProjectCode
      },
      success: function success(data) {
		 vm.arr = $.cordys.json.findObjects(data, "getERFQListofEbomRev")[0].getERFQListofEbomRev;
        
        vm.arr = vm.arr.split(",")[vm.arr.split(",").length-1]; 
		
		$scope.PassValue.E_BOM_Rev = vm.arr;
	  }
		 });
		
		
		
		
		$.cordys.ajax({
                method: "GetERFQProjectMembers",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				parameters:{
					"projectCode" : (abc!= undefined) ? abc.AFSPM_POJ_CODE : JSON.parse(localStorage.projectCode).ProjectCode
					
					
				},
                success: function(data) {
                   
                           var flagtest=1;
				
				$scope.Incharges= $.cordys.json.findObjects(data, "AFS_PROJ_MEMBERS");
				for(var i=0;i<$scope.Incharges.length;i++){
					if($scope.Incharges[i].AFSPM_MEMBER_ROLE=="MSIE"){
						$scope.MSIE = $scope.Incharges[i].AFSPM_MEMBER_NAME;
						$scope.PassValue.MSIE=$scope.MSIE;
					}
					if($scope.Incharges[i].AFSPM_MEMBER_ROLE=="Stamping Lead"){
						
						$scope.StampingLead = $scope.Incharges[i].AFSPM_MEMBER_NAME;
						$scope.PassValue.StampingLead=$scope.StampingLead;
					}
					
					if($scope.tableArray.length!=0){
					$scope.PassValue.SendDate= $scope.tableArray[0].EVENT_DATE;
                                        $scope.PassValue.dataFlag = $scope.tableArray[0].DATA_FLAG;
					}
					$scope.PassValue.MSIE=$scope.MSIE;
					$scope.PassValue.StampingLead=$scope.StampingLead;
					
						if($scope.label1==undefined && localStorage.projectCode == undefined)
					{
					$scope.PassValue.ProjectCode = null;
					}
					else if($scope.label1==undefined && localStorage.projectCode != undefined && JSON.parse(localStorage.projectCode).ProjectCode!=undefined){
					$scope.PassValue.ProjectCode = JSON.parse(localStorage.projectCode).ProjectCode;
					}
					else if($scope.label1!=undefined){
						$scope.PassValue.ProjectCode=$scope.label1
					}
					
					localStorage.projectCode = JSON.stringify($scope.PassValue);
					
					
					
				}
                    $scope.$apply();  
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    //debugger;
                    toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });
			
			
		
 
			
			//get Data for particular projectCode
			
			$.cordys.ajax({
                method: "GetERFQ_PROJECT_REQObject",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				parameters:{
					"PROJECT_CODE": (abc != undefined) ? abc.AFSPM_POJ_CODE : JSON.parse(localStorage.projectCode).ProjectCode
				},
                success: function(data) {
                    //debugger;
                    //console.log(data);
                 if($.cordys.json.findObjects(data, "ERFQ_PROJECT_REQ").length!=0)
				 {
					 
                   $scope.LoadData= $.cordys.json.findObjects(data, "ERFQ_PROJECT_REQ");
                    $scope.Total_Vol = $scope.LoadData[0].TOTAL_VALUE;
					$scope.Total_Prod = $scope.LoadData[0].TOTAL_PRODUCTION;
					$scope.Total_Duration = $scope.LoadData[0].DURABILITY_YEARS;
					$scope.Total_Waranty = $scope.LoadData[0].WARRANTY_YEARS;
					
					if($scope.LoadData[0].BUILD_QUALITY=="M&M"){
						$scope.selectOne=true;
						$scope.selectTwo=false;
					}
					else{
						$scope.selectTwo=true;
						$scope.selectOne=false;
					}
					$scope.$apply();
				 }
				 else{
					 
				 }
				 
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    //debugger;
                  toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });
			
			
			//get uploaded doc data
			$scope.getUploadedDocForProject();
			
			//get table data
			
			$.cordys.ajax({
                method: "GetEventsforProject",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				parameters:{
					"ProjectCode" : (abc != undefined) ? abc.AFSPM_POJ_CODE : JSON.parse(localStorage.projectCode).ProjectCode
				},
                success: function(data) {
                   
				
				 $scope.PannelSupplyIdsArray=[];
				  $scope.tableDetails= $.cordys.json.findObjects(data, "erfq_pannel_supply");
				 if($scope.tableDetails.length!=0){
					 $scope.checkDetails=$scope.tableDetails;
					  $scope.tableArray=[];
					 $scope.tableArray = $.cordys.json.findObjects(data, "erfq_pannel_supply");
					 $scope.tableArray = $scope.tableArray.map(function(d){
					   
					   d.DATA_FLAG = "E";
					   return d;
				   });
				   
                     data = angular.copy($scope.tableArray);
					 $scope.changedData = data;
					$scope.dataCallFunction(data);
				
				 }
				 else{
					 $scope.checkDetails=[];
					 $scope.getTableDataInitial();
				 }
				 
				 
                  // $scope.tableArray= $.cordys.json.findObjects(data, "erfq_pannel_supply");
				   for(var i=0;i<$scope.tableArray.length;i++){
		if($scope.tableArray[i].PANNEL_SUPPLY_ID!="" && $scope.tableArray[i].PANNEL_SUPPLY_ID!=null && $scope.tableArray[i].PANNEL_SUPPLY_ID!=undefined){
					   $scope.PannelSupplyIdsArray.push(parseInt($scope.tableArray[i].PANNEL_SUPPLY_ID));
					   }  
					   
				   }
				   
				  /* $scope.tableArray = $scope.tableArray.map(function(d){
					   
					   delete d.PANNEL_SUPPLY_ID;
					   d.EVENT1 = JSON.stringify(d);
					   return d;
				   });*/
				   
					
					
					$scope.$apply();
					if($scope.tableArray.length!=0){
					$scope.PassValue.SendDate= $scope.tableArray[0].EVENT_DATE;
                                        $scope.PassValue.dataFlag = $scope.tableArray[0].DATA_FLAG;
					}
					$scope.PassValue.MSIE=$scope.MSIE;
					$scope.PassValue.StampingLead=$scope.StampingLead;
					
					if($scope.label1==undefined && localStorage.projectCode == undefined)
					{
					$scope.PassValue.ProjectCode = null;
					}
					else if($scope.label1==undefined && localStorage.projectCode != undefined && JSON.parse(localStorage.projectCode).ProjectCode!=undefined){
					$scope.PassValue.ProjectCode = JSON.parse(localStorage.projectCode).ProjectCode;
					}
					else if($scope.label1!=undefined){
						$scope.PassValue.ProjectCode=$scope.label1
					}

					localStorage.projectCode = JSON.stringify($scope.PassValue);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                 
                   toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });
			
	}

        }
			

   
   $scope.deleteFileFrom_UDH=function(DeleteFile){
	deletObj={};
	deletObj=$scope.DFFileArr;
	
	$.cordys.ajax({
									  method: "UpdateErfqUploadedDocumentHistory",
									  namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
									  dataType: '* json',  
									  parameters: {"tuple":deletObj},
									  success: function(e) {
									
									toastr.success("File is deleted!");
										//toastr.success("File is deleted!");
									  },
									  error: function(jqXHR, textStatus, errorThrown){
										//debugger;
										toastr.error("Unable to load data. Please try refreshing the page.");
									  }
									});
	

							}
							
			$scope.tupleIndex = [];
			$scope.albumNameArray = [];
  
			$scope.FiletupleIndex = [];
			$scope.FileNameArray = [];		
			
				$scope.CreateDeleteArray=function(obj,tid){
		  
				$scope.pass = JSON.parse(localStorage.projectCode);
				//debugger;
				if ($scope.tupleIndex.indexOf(tid)<=-1 && (obj!=undefined || obj!="") )
	  
				//make the object for update
				{
					$scope.albumNameArray.push(obj);
				$scope.tupleIndex.push(tid);
				if($scope.PannelSupplyIdsArray[tid]!=null && $scope.PannelSupplyIdsArray[tid]!=undefined){	
                               document.getElementById("nextbtn").disabled = true;
				PanelSupplyDelObj = {
										"old": 		{
                                                    "ERFQ_PANNEL_SUPPLY": {
														
                                                       /* "PROJECT_CODE": JSON.parse(localStorage.projectCode).ProjectCode,*/
                                                        "PANNEL_SUPPLY_ID": parseInt($scope.PannelSupplyIdsArray[tid])
															

													}
													}
									}
				$scope.DeletFromMapTable.push(PanelSupplyDelObj);
				}
				}
				else if($scope.tupleIndex.indexOf(tid)>-1&& (obj!=undefined || obj!=""))
				{
                               document.getElementById("nextbtn").disabled = false;
				var indxOfObj=$scope.albumNameArray.indexOf(obj);
				var tuplIndxOfObj=$scope.tupleIndex.indexOf(tid);
				$scope.albumNameArray.splice(indxOfObj, 1);
				$scope.tupleIndex.splice(tuplIndxOfObj,1);		
				$scope.DeletFromMapTable.splice(tuplIndxOfObj,1);
			}
	
		}
		
		
		
		$scope.CreateDeleteFileArray=function(obj,tid){
		  
		  //debugger;
		if ($scope.FiletupleIndex.indexOf(tid)<=-1 && (obj!=undefined || obj!="") )
	  
	  
	  {
	    $scope.FileNameArray.push(obj);
		$scope.FiletupleIndex.push(tid);						
	  }
	  else if($scope.FiletupleIndex.indexOf(tid)>-1&& (obj!=undefined || obj!=""))
	{
		var indxOfObj=$scope.FileNameArray.indexOf(obj);
		var tuplIndxOfObj1=$scope.FiletupleIndex.indexOf(tid);
	    $scope.FileNameArray.splice(indxOfObj, 1);
		$scope.FiletupleIndex.splice(tuplIndxOfObj1,1);						
	  }
	
	}
	
	
					$scope.FormTupleForPannelSupply=function(){
		$scope.pass = JSON.parse(localStorage.projectCode);

	for(var i=0;i<$scope.tableArray.length;i++){
		
		//To insert new tuple
		if($scope.tableArray[i].DATA_FLAG=="I")
			{
			var PanelSupplyObj = {
										"new": {
														 "ERFQ_PANNEL_SUPPLY": {
														"PROJECT_CODE": JSON.parse(localStorage.projectCode).ProjectCode,
														"EVENT_ID": parseInt($scope.tableArray[i].EVENT_ID),
														"EVENT_DATE" : $scope.changedData[i].EVENT_DATE,
														"PANEL_QUALITY" : $scope.changedData[i].PANEL_QUALITY,
														"PIST_LEVEL" : $scope.changedData[i].PIST_LEVEL,
														"PANEL_CONDITIONS": $scope.changedData[i].PANEL_CONDITIONS,
														"DELIVERY_ADDRESS": $scope.changedData[i].DELIVERY_ADDRESS,
														"EVENT": $scope.changedData[i].EVENT
																			}
												}
								}
									$scope.InsertPanelSupplyArray.push(PanelSupplyObj);
		  
			}
		
		if($scope.tableArray[i].DATA_FLAG=="U")
					{
		var 	PanelSupplyObj1 = {
				
							"old": {
                                    "ERFQ_PANNEL_SUPPLY": {
									"PANNEL_SUPPLY_ID": parseInt($scope.tableArray[i].PANEL_SUPPLY_ID),
														}
										},
								"new": {
                                    "ERFQ_PANNEL_SUPPLY": {
									"PANNEL_SUPPLY_ID": parseInt($scope.tableArray[i].PANEL_SUPPLY_ID),
                                    "EVENT_ID": parseInt($scope.tableArray[i].EVENT_ID),
									"EVENT_DATE" : $scope.changedData[i].EVENT_DATE,
									"PANEL_QUALITY" : $scope.changedData[i].PANEL_QUALITY,
									"PIST_LEVEL" : $scope.changedData[i].PIST_LEVEL,
									"PANEL_CONDITIONS": $scope.changedData[i].PANEL_CONDITIONS,
									"DELIVERY_ADDRESS": $scope.changedData[i].DELIVERY_ADDRESS,
									"EVENT": $scope.changedData[i].EVENT
																	
																	}
										}
							}
							
								$scope.UpdatePanelSupplyArray.push(PanelSupplyObj1);
	  
					}
					//added 17/4/2019
						if($scope.tableArray[i].DATA_FLAG=="E")
					{
			     var    PanelSupplyObj1 = {
				
							"old": {
                                    "ERFQ_PANNEL_SUPPLY": {
									"PANNEL_SUPPLY_ID": parseInt($scope.changedData[i].PANNEL_SUPPLY_ID),
														}
										},
								"new": {
                                    "ERFQ_PANNEL_SUPPLY": {
									"PANNEL_SUPPLY_ID": parseInt($scope.changedData[i].PANNEL_SUPPLY_ID),
                                    "EVENT_ID": parseInt($scope.tableArray[i].EVENT_ID),
									"EVENT_DATE" : $scope.changedData[i].EVENT_DATE,
									"PANEL_QUALITY" : $scope.changedData[i].PANEL_QUALITY,
									"PIST_LEVEL" : $scope.changedData[i].PIST_LEVEL,
									"PANEL_CONDITIONS": $scope.changedData[i].PANEL_CONDITIONS,
									"DELIVERY_ADDRESS": $scope.changedData[i].DELIVERY_ADDRESS,
									"EVENT": $scope.changedData[i].EVENT
																	
																	}
										}
							}
							
								$scope.UpdatePanelSupplyArray.push(PanelSupplyObj1);
	  
					}
							}
			}
	
	
	
	
	//delete krenge fir insert karenge
	$scope.SubmitProjectRequirement=function(){
		
		$scope.pass = JSON.parse(localStorage.projectCode);
		
		//Notify the user to delete the blank row
			for(var i=0;i<$scope.tableArray.length;i++){
				
				if($scope.tableArray[i].EVENT==null ||$scope.tableArray[i].EVENT==""){
					//alert("Please remove the blank event Rows");
					toastr.error("Please remove the blank event rows.");
					//executeFlag=1;
					return;
				}	
			}
		
		//if user deleted any object which for saved in backend need to be deleted --------- $scope.arrayToDeleteFromBackend
		if($scope.DeletFromMapTable.length!=0){
         
		 var reqObj1={}
			reqObj1 = $scope.DeletFromMapTable;
			
		$.cordys.ajax({
                method: "UpdateErfqPannelSupply",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				 parameters: {"tuple":reqObj1},
                success: function(data) {
				 toastr.success("Events updated!");
				 $scope.DeletFromMapTable=[];
				$scope.SaveDetailsAfterCheck();
				 //Find if the array items exist in the backend table
				$.cordys.ajax({
                method: "GetEventsforProject",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				parameters:{
					"ProjectCode" : (abc != undefined) ? abc.AFSPM_POJ_CODE : JSON.parse(localStorage.projectCode).ProjectCode
				},
                success: function(data) {
                   
				
				 $scope.PannelSupplyIdsArray=[];
				  $scope.tableDetails= $.cordys.json.findObjects(data, "erfq_pannel_supply");
				 if($scope.tableDetails.length!=0){
					 $scope.checkDetails=$scope.tableDetails;
					  $scope.tableArray=[];
					 $scope.tableArray = $.cordys.json.findObjects(data, "erfq_pannel_supply");
					 $scope.tableArray = $scope.tableArray.map(function(d){
					   
					   d.DATA_FLAG = "E";
					   return d;
				   });
				   
                     data = angular.copy($scope.tableArray);
					 $scope.changedData = data;
					$scope.dataCallFunction(data);
				
				 }
				 else{
					 $scope.checkDetails=[];
					 $scope.getTableDataInitial();
				 }
				 
				 
                  // $scope.tableArray= $.cordys.json.findObjects(data, "erfq_pannel_supply");
				   for(var i=0;i<$scope.tableArray.length;i++){
		if($scope.tableArray[i].PANNEL_SUPPLY_ID!="" && $scope.tableArray[i].PANNEL_SUPPLY_ID!=null && $scope.tableArray[i].PANNEL_SUPPLY_ID!=undefined){
					   $scope.PannelSupplyIdsArray.push(parseInt($scope.tableArray[i].PANNEL_SUPPLY_ID));
					   }  
					   
				   }
				   
				  /* $scope.tableArray = $scope.tableArray.map(function(d){
					   
					   delete d.PANNEL_SUPPLY_ID;
					   d.EVENT1 = JSON.stringify(d);
					   return d;
				   });*/
				   
					
					
					$scope.$apply();
					if($scope.tableArray.length!=0){
					$scope.PassValue.SendDate= $scope.tableArray[0].EVENT_DATE;
                                        $scope.PassValue.dataFlag = $scope.tableArray[0].DATA_FLAG;
					}
					$scope.PassValue.MSIE=$scope.MSIE;
					$scope.PassValue.StampingLead=$scope.StampingLead;
					
					if($scope.label1==undefined && localStorage.projectCode == undefined)
					{
					$scope.PassValue.ProjectCode = null;
					}
					else if($scope.label1==undefined && localStorage.projectCode != undefined && JSON.parse(localStorage.projectCode).ProjectCode!=undefined){
					$scope.PassValue.ProjectCode = JSON.parse(localStorage.projectCode).ProjectCode;
					}
					else if($scope.label1!=undefined){
						$scope.PassValue.ProjectCode=$scope.label1
					}

					localStorage.projectCode = JSON.stringify($scope.PassValue);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                 
                   toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });
 
                },
                error: function(jqXHR, textStatus, errorThrown) {
                
                    toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });

		}
		else{
				
				//Save details above table in ERFQ_PROJECT_REQ
				$scope.SaveDetailsAfterCheck();
				
			
		}
		window.scrollTo(0, 0);
	
		//--------------------------------
		
			
}
	$scope.SaveDetailsAfterCheck=function(){
		
		
		$scope.pass = JSON.parse(localStorage.projectCode);
		
		//-----------------------------
			if($scope.tableArray.length!=0){
			$scope.FormTupleForPannelSupply();
			//Save dtails in Pannel_Supply
			var reqObj={}
			reqObj = $scope.InsertPanelSupplyArray;
			
			$.cordys.ajax({
                method: "UpdateErfqPannelSupply",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				 parameters: {"tuple":reqObj},
                success: function(data) {
				// toastr.success("Updated successfully!");
				 $scope.InsertPanelSupplyArray=[];
				
                },
                error: function(jqXHR, textStatus, errorThrown) {
                
                    toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });
			var UpdatereqObj={}
			UpdatereqObj = $scope.UpdatePanelSupplyArray;
			
			$.cordys.ajax({
                method: "UpdateErfqPannelSupply",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				 parameters: {"tuple":UpdatereqObj},
                success: function(data) {
				// toastr.success("Updated successfully!");
				 $scope.UpdatePanelSupplyArray=[];
				
                },
                error: function(jqXHR, textStatus, errorThrown) {
                
                    toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });
			
			}
		
		
		
		
		
		//------------------------------
		
			$.cordys.ajax({
                method: "GetErfqProjectReqObject",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				 parameters: {
                                           
							"PROJECT_CODE": JSON.parse(localStorage.projectCode).ProjectCode
                                        },
                success: function(data) {
                
                 $scope.ReqObj= $.cordys.json.findObjects(data, "ERFQ_PROJECT_REQ");
				 
				 if($scope.selectOne==true){
					 $scope.BuildChoice="M&M"
				 }
				 else{
					  $scope.BuildChoice="DieMaker"
				 }
					 
				 
				 if($scope.ReqObj.length>0){
					 
					 $scope.UpdateInProjectReq();
				 }
				 else{
					 $scope.InsertInProjectReq();
					 
				 }
                  
                },
                error: function(jqXHR, textStatus, errorThrown) {
                   toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });
			
			
			

		
	}
	
	$scope.checkIfProceed=function(){
		//alert("check Proceed");
               if(localStorage!=undefined && localStorage.projectCode!=undefined){
               $.cordys.ajax({
                method: "GetEventsforProject",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				parameters:{
					"ProjectCode" : JSON.parse(localStorage.projectCode).ProjectCode
				},
                success: function(data) {
                   $scope.tableDetails= $.cordys.json.findObjects(data, "erfq_pannel_supply");
			if($scope.tableDetails.length<=0){
					       toastr.error("Please save the details and then proceed.");
                                              
				   }
				   else{
					   var redirect2 = window.location.href;
						redirect2 = redirect2.replace("ProjectRequirement", "panelGrouping");
						window.location.href = redirect2;
				   }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                 
                   toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });

          }
		else{
			toastr.error("Please select Project Code and then proceed.");
		}
//============================


	}
	
	//Update in project Req

$scope.UpdateInProjectReq=function(){
	
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
													//check once
                                                        "PROJECT_CODE": JSON.parse(localStorage.projectCode).ProjectCode,
                                                        "TOTAL_VALUE": $scope.Total_Vol,
														"TOTAL_PRODUCTION": $scope.Total_Prod,
														"DURABILITY_YEARS" :$scope.Total_Duration,
														"WARRANTY_YEARS" :$scope.Total_Waranty,
														"BUILD_QUALITY" :$scope.BuildChoice,
														"CREATED_BY" :"",
														"CREATION_ON" :"",  
														"STATUS" :"ProjectReq",

                                                    }
                                                }
                                            }

                                        },
                success: function(data) {
                    //debugger;
                    //console.log(data);
                 //alert("Data is updated");
				 toastr.success("Data is updated!");
                                 document.getElementById("nextbtn").disabled = false;
				 $scope.passProjectCode($scope.item1,$scope.abc1,$scope.label1);
				 
                  // $state.reload('mainApp.ProjectRequirement');
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    //debugger;
                  toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });

}

//insert in ProjectReq
$scope.InsertInProjectReq=function(){
	
	$scope.pass = JSON.parse(localStorage.projectCode);
	
	$.cordys.ajax({
                method: "UpdateErfqProjectReq",
                namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
                dataType: "* json",
				 parameters: {
                                            "tuple": {
                                                
                                                "new": {
                                                    "ERFQ_PROJECT_REQ": {
													//check once
                                                        "PROJECT_CODE": JSON.parse(localStorage.projectCode).ProjectCode,
                                                        "TOTAL_VALUE": $scope.Total_Vol,
														"TOTAL_PRODUCTION": $scope.Total_Prod,
														"DURABILITY_YEARS" :$scope.Total_Duration,
														"WARRANTY_YEARS" :$scope.Total_Waranty,
														"BUILD_QUALITY" :$scope.BuildChoice,
														"CREATED_BY" :"",
														"CREATION_ON" :"",  
														"STATUS" :"ProjectReq",

                                                    }
                                                }
                                            }

                                        },
                success: function(data) {
                   toastr.success("Data is updated!");
                                 document.getElementById("nextbtn").disabled = false;
				 $scope.passProjectCode($scope.item1,$scope.abc1,$scope.label1);
                  
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    //debugger;
                   toastr.error("Unable to load data. Please try refreshing the page.");
                }
            });
	
}
	
	
	
	
	
	
	
	$scope.deleteRow= function() {

      $scope.arrayToDeleteFromBackend=[];
		$scope.tupleIndex = $scope.tupleIndex.sort(function(a, b){return b-a});
		//$scope.PannelSupplyIdsArray = $scope.PannelSupplyIdsArray.sort(function(a, b){return b-a});
		
		//console.log("PanelSupplyId is",$scope.PannelSupplyIdsArray);
		
		if($scope.tupleIndex.length!=0){
		// check if the selected tuple exist in the table in backend
		
		
		for(var i=0;i<$scope.tupleIndex.length;i++){
	 
		$scope.tableArray.splice($scope.tupleIndex[i],1);
		 data = angular.copy($scope.tableArray);
		 $scope.changedData = data;
              $scope.dataCallFunction(data);
		}
              //enable save
             if(document.getElementById("some-submit-element")){
	document.getElementById("some-submit-element").disabled = false;
		}
 
	}
		$scope.tupleIndex.length=0;
		$scope.tupleIndex=[];


		}
          $scope.enableSave = function(){
		document.getElementById("some-submit-element").disabled=false;
		document.getElementById("nextbtn").disabled=true;
	}

      
	$scope.refOpenFile=function(attachFile,index){
				//debugger;
			debugger;
				$scope.attachObj=attachFile;
				
					//var anchorTagId=choice+parseInt(index+2);
					abcd =window.location.href.split("com")[0]+attachFile.DOCUMENT_PATH.split("shared\\")[1];
					//window.open(attachFile.DOCUMENT_PATH);
					
					var aaaa = document.createElement("A")
					aaaa.href=abcd;
					//aaaa.download=abcd.substr(abcd.lastIndexOf('/')+1);
					aaaa.download=abcd.replace(/^.*[\\\/]/, '');
					document.body.appendChild(aaaa);
					aaaa.click()
					document.body.removeChild(aaaa);
			
			}
	//---------------
	$scope.openFile=function(attachFile,index){
				//debugger;
			debugger;
				$scope.attachObj=attachFile;
				
					//var anchorTagId=choice+parseInt(index+2);
					abcd =window.location.href.split("com")[0]+attachFile.DOCUMENT_PATH.split("shared\\")[1];
					//window.open(attachFile.DOCUMENT_PATH);
					
					var aaaa = document.createElement("A")
					aaaa.href=abcd;
					//aaaa.download=abcd.substr(abcd.lastIndexOf('/')+1);
					aaaa.download=abcd.replace(/^.*[\\\/]/, '');
					document.body.appendChild(aaaa);
					aaaa.click()
					document.body.removeChild(aaaa);

			}

	
	
	$scope.CreateBuildChoice=function(CheckValue){
		
		if(CheckValue=="M&M"){
			$scope.selectOne=true;
			$scope.selectTwo=false;	
		}
		else{
			$scope.selectOne=false;
			$scope.selectTwo=true;	
		}
		
	}
	$scope.clearPopUpData = function(){
		
		$scope.DOCUMENT_NAME1=null;
		$scope.DOCUMENT_DESC1=null;
	}
	$scope.FiledeleteRow= function() {


		$scope.FiletupleIndex = $scope.FiletupleIndex.sort(function(a, b){return b-a});
		if($scope.FiletupleIndex.length!=0){
		
			
			//delete File from UDH table
			$scope.DFFileArr=[];
			for(var i=0;i<$scope.FiletupleIndex.length;i++){
										DFObj={"old" : 
											{
												"ERFQ_UPLOADED_DOCUMENT_HISTORY" :
												{
													"DOCUMENT_HISTORY_SEQID": parseInt($scope.FileArray[$scope.FiletupleIndex[i]].DOCUMENT_HISTORY_SEQID),
													
												}
											}
											}
											$scope.DFFileArr.push(DFObj);
											
											$scope.FileArray.splice($scope.FiletupleIndex[i],1);
											}
			
			//$scope.DeleteDoc(); for deleting doc from server
			$scope.deleteFileFrom_UDH();
			$scope.DFFileArr=[];
			/*$scope.getUploadedDocForProject();*/
		
		//
		}
		$scope.FiletupleIndex.length=0;
		$scope.FiletupleIndex=[];
		//toastr.success("File is deleted!");
		}
			
			/*$scope.DeleteDoc=function(docIndex){
				for(i=0;i<$scope.DFFileArr.length;i++){
					$.cordys.ajax({
						method: "DeleteERFQDoc",//GetCompMatrixDetails
						namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
						parameters: {
							"docID": $scope.DFFileArr[i].old.ERFQ_UPLOADED_DOCUMENT_HISTORY.DOCUMENT_HISTORY_SEQID
							},
						dataType: "* json",
						async: false,
						success: function(e) {
							debugger;
							//$scope.deleteAttachmentObj = $.cordys.json.findObjects(e, "deleteHomologationDoc");
							//$scope.deleteAttachmentObj.deleteHomologationDoc;
							//$scope.recursiveDeleteDoc(++docIndex);
						},
						error: function(jqXHR, textStatus, errorThrown){
							debugger;
							toastr.error("Unable to load data. Please try refreshing the page.");
						}
					});
			}
				
			}*/
			
			
			$scope.passEventCode = function(rowObject,index1) {
            
					var Flag=0;
				for(var j=0;j<$scope.tableArray.length;j++){
					if(rowObject.EVENT==$scope.tableArray[j].EVENT){
						$scope.tableArray[index1].EVENT=null;
						$scope.tableArray[index1].EVENT_DATE=null;
						$scope.tableArray[index1].PANEL_QUALITY=null;
						$scope.tableArray[index1].PIST_LEVEL=null;
						$scope.tableArray[index1].PANEL_CONDITIONS=null;
						$scope.tableArray[index1].DELIVERY_ADDRESS=null;
						
						//alert("Already exist");
						
                        toastr.error("Event already exists.");
						 Flag=1;
						break;
						
					}
					else{
						
					}
	
				}
				
				if(Flag==1){
				data = angular.copy($scope.tableArray);
				$scope.changedData = data;
              $scope.dataCallFunction(data);	
				return;
				}
				var i = 0;  
                for(var i=0;i<$scope.eventList.length;i++){
                      if($scope.eventList[i].EVENT == rowObject.EVENT){
                        
                        break;
                      }
                  }
				  $scope.eventList[i].DATA_FLAG = rowObject.DATA_FLAG;
				 // if($scope.eventList[i].DATA_FLAG && $scope.eventList[i].DATA_FLAG=="E")
					 if($scope.eventList[i].DATA_FLAG=="E"){
					 $scope.eventList[i].DATA_FLAG = "U"; 
                                         document.getElementById("nextbtn").disabled = true;
                                        }
				  else 
					$scope.eventList[i].DATA_FLAG="I";
                                        document.getElementById("nextbtn").disabled = true;
				        $scope.eventList[i].PANEL_SUPPLY_ID = $scope.tableArray[index1].PANNEL_SUPPLY_ID;
			               $scope.tableArray[index1] = JSON.parse(JSON.stringify($scope.eventList[i]));
			            
                                    if(document.getElementById("some-submit-element")){
						document.getElementById("some-submit-element").disabled = false;
						}
							data = angular.copy($scope.tableArray);
							$scope.changedData = data;         //added 17/4/2019
                                      $scope.dataCallFunction(data);
					
			}
			

});