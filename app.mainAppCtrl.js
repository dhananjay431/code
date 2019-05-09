angular.module('App.mainApp', [
    'App.plugins',
    'ngTouch',
    'ngAnimate',
    'ui.grid',
      'ui.grid.pinning',
      'ui.grid.pagination',
      'ui.grid.edit',
    'ui.grid.exporter',
    'ui.router',
    'ngFileUpload',
     'ngSanitize', 
     'ui.bootstrap'
    
    ])
    .config(function($stateProvider, $urlRouterProvider,$locationProvider) {
        //  $locationProvider.html5Mode(true);
          // $urlRouterProvider.otherwise("mainApp/create"); 
        $stateProvider.state('mainApp',{
            url: '/mainApp',
            abstract:true,
            templateUrl: 'app/mainApp/app.mainApp.html',
            controller:'App.mainAppCtrl as vm'
        })
        .state('mainApp.create',{
            url: '/create',
            templateUrl: 'app/mainApp/create/app.create.html',
            controller:'App.mainApp.createCtrl as vm'
        })
        .state('mainApp.ProjectRequirement',{
            url: '/ProjectRequirement',
            // templateUrl: 'app/mainApp/ProjectRequirement/app.ProjectRequirement.html',
            controller:'app.ProjectRequirementCtrl as vm',
            templateUrl:"app/mainApp/ProjectRequirement/app.ProjectRequirement.html"
        })
    
    
    /*.state('mainApp.quoteComparisionCtrl',{
            url: '/quoteComparisionCtrl',
            controller:'quoteComparisionCtrl as vm',
            templateUrl:"app/quoteCompare/quoteCompare.tpl.htm"
        })*/
    
        .state('mainApp.toolmakerMapping',{
            url: '/toolmakerMapping',
            templateUrl:"app/mainApp/toolmakerMapping/toolmaker_mapping.tpl.htm",
            controller:'ToolMakerMappingController as vm'
            
        })
        .state('mainApp.panelGrouping',{
            url: '/panelGrouping',
            templateUrl:"app/mainApp/panelGrouping/panelGrouping.tpl.htm",
            controller:'panelGroupingCtrl as vm' 
        })
     .state('mainApp.erfq',{
            url: '/erfq',
            templateUrl:"app/myERFQ/myERFQ.tpl.htm",
            controller:'erfq as vm' 
        })
     .state('mainApp.RFQFloatController',{
            url: '/RFQFloatController',
            templateUrl:"app/RFQFloat/RFQFloat.tpl.htm",
            controller:'RFQFloatController as vm' 
        })
     .state('mainApp.RFQFloatController.RFQFloatController1',{
            url: '/RFQFloatController1',
            templateUrl:"app/RFQFloat/toolmakerDetail.tpl.htm",
            controller:'RFQFloatController as vm' 
        })
    .state('mainApp.RFQFloatController.RFQFloatController2',{
            url: '/RFQFloatController2',
            templateUrl:"app/toolmakerSummary/toolmaker_summary.tpl.htm",
            controller:'ToolMakerSumController as vm'
        })
    //--------------------------------
    
    .state('mainApp.eRFQSentCtrl',{
            url: '/eRFQSentCtrl',
            templateUrl:"app/RFQFloat/eRFQSent.tpl.htm",
            controller:'eRFQSentCtrl as vm' 
        })
    
    //---------------------
    .state('mainApp.ToolMakerSumController',{
            url: '/ToolMakerSumController',
            templateUrl:"app/toolmakerSummary/toolmaker_summary.tpl.htm",
            controller:'ToolMakerSumController as vm'
            
        })
         .state('mainApp.erfqInbox',{
            url: '/erfqInbox',
            templateUrl:"app/erfqInbox/erfqInbox.tpl.htm",
            controller:'erfqInbox as erfqInbox' 
        })
         .state('toolmakerRegister',{
            url: '/toolmakerRegister',
            templateUrl: 'app/toolmakerRegister/toolmaker_register.tpl.htm',
            controller:'toolmakerRegister as vm'
        })
    ;
    
    
        ;
    
    })
    
      .controller('App.mainAppCtrl', function($scope) {
            var vm = this;
            vm.a1 = 123;
    $scope.loggedUserID = [];
    $.cordys.ajax({
        method: "GetLoggedInUserID",
        namespace: "http://schemas.cordys.com/Mahindra_eRFQ_WSAppPackage",
        dataType: "* json",
        async: false,
        success: function(e) {
            console.log(e);
            $scope.loggedUserID = $.cordys.json.findObjects(e, "getLoggedInUserID")[0];
            $scope.username = $scope.loggedUserID.getLoggedInUserID;
        },
        error: function(jqXHR, textStatus, errorThrown) {
            //debugger;
            alert("Error in loading data");
        }
    });
    
            vm.menu =  [
                // {
                //     label:"RFQ Float",
                //     icon:"expand_more",
                //     route:"mainApp.create",
                // },
                {
                    label:"RFQ Float",
                    icon:"expand_more",
                    route:"mainApp.create",
                },
                {
                    label:"Project Requirement",
                    icon:"arrow_right_alt",
                    route:"mainApp.ProjectRequirement"
                },
                {
                    label:"Panel Grouping",
                    icon:"arrow_right_alt",
                    route:"mainApp.panelGrouping"
                },
                {
                    label:"Tool Maker Mapping",
                    icon:"arrow_right_alt",
                    route:"mainApp.toolmakerMapping"
                },
                {
                    label:"RFQ Float",
                    icon:"arrow_right_alt",
                    route:"mainApp.RFQFloatController.RFQFloatController1 "
                },
                {
                    label:"Toolmaker summary",
                    icon:"arrow_right_alt",
                    route:"mainApp.ToolMakerSumController"
                },
                {
                    label:"Process Submission",
                    route:"mainApp.create"
                }
                ,
                {
                    label:"Technical Discussion",
                    route:"mainApp.create"
                }
                ,
                {
                    label:" Quote",
                    route:"mainApp.create"
                }
                ,
                {
                    label:"  Quote Comparison",
                    route:"App.quoteComparisionCtrl"
                }
                ,
                {
                    label:" Shortlisting",
                    route:"mainApp.create"
                }
                ,
                {
                    label:"Quote To Capital Purchase",
                    route:"mainApp.create"
                }
                ];
                   vm.data =[
      {
        "name": "RFQ Float",
        id:"RFQ_Float",
        "child": [
          {
            "name": "Project Requirement",
            "state": "mainApp.ProjectRequirement",
    flag:false
          },
          {
            "name": "Panel Grouping",
            "state": "mainApp.panelGrouping"
          },
          {
            "name": "Tool Maker Mapping",
            "state": "mainApp.toolmakerMapping"
          },
          {
            "name": "RFQ Float",
            "state": "mainApp.RFQFloatController.RFQFloatController1"
          }
        ]
      },
      {
        "name": "Toolmaker summary",
         id:"Toolmaker summary",
        "state": "mainApp.ToolMakerSumController"
      },
      {
        "name": "Process Submission",
         state:"mainApp.create",
        "id": "ProcessSubmission"
      },
      {
        "name": "Technical Discussion",
        "state": "mainApp.create",
         "id": "TechnicalDiscussion"
      },
      {
        "name": "Quote",
        "state": "mainApp.create",
        "id": "Quote"
      },
      {
        "name": "Quote Comparison",
        "state": "App.quoteComparisionCtrl",
        "id": "QuoteComparison"
      },
      {
        "name": "Shortlisting",
        "state": "mainApp.create",
        "id": "Shortlisting"
      },
      {
        "name": "Quote To Capital Purchase",
        "state": "mainApp.create",
        "id":"QuoteToCapitalPurchase"
      }
    ];
        });
    function DropDownTemplate() {
        
    }
    DropDownTemplate.prototype.onKeyDown = function (event) {
        var key = event.which || event.keyCode;
        if (key == 37 ||  
            key == 39) {  
            this.toggleMood();
            event.stopPropagation();
        }
    };
    
    DropDownTemplate.prototype.toggleMood = function () {
        this.selectMood(this.mood === 'Happy' ? 'Sad' : 'Happy');
    };
    DropDownTemplate.prototype.init = function (params) {
         this.container = document.createElement('div');
         this.container.setAttribute("style", "height:100%;width:100%;");    
    this.happyImg = document.createElement("select");
    this.happyImg.setAttribute("style", "height:100%;width:100%;");
        for(var i=0;i<params.values.length;i++){
            var option = document.createElement("option");
            option.text = params.values[i];
            this.happyImg.add(option);
        }
    this.sel =  params[params.colDef.field];
         this.container.appendChild( this.happyImg);
        var that = this;
        this.happyImg.addEventListener('change', function (event) {
            
          params.value = params.values[this.selectedIndex];
            if(params.value != undefined)
            that.selectMood(params.value );
        });
    };
    DropDownTemplate.prototype.selectMood = function (mood) {
        
        if(mood)
        this.mood = mood;
        else
        this.mood = this.sel;
    };
    DropDownTemplate.prototype.getGui = function () {
        
        return this.container;
    };
    
    DropDownTemplate.prototype.afterGuiAttached = function () {
        
        this.container.focus();
    };
    
    DropDownTemplate.prototype.getValue = function () {
        
        return this.mood;
    };
    
    // any cleanup we need to be done here
    DropDownTemplate.prototype.destroy = function () {
        
    };
    
    DropDownTemplate.prototype.isPopup = function () {
        
        return true;
    };
    DropDownTemplate.prototype.list = function(list) {
        var map = {}, node, roots = [], i;
        for (i = 0; i < list.length; i += 1) {
            map[list[i]._id] = i; // initialize the map
            list[i].children = []; // initialize the children
        }
        for (i = 0; i < list.length; i += 1) {
            node = list[i];
            if (node._parentId !== null) {
                list[map[node._parentId]].children.push(node);
            } else {
                roots.push(node);
            }
        }
        return roots;
    }