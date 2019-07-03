'use strict';

angular.module('App.main', ['ui.router', 'ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ngTable']).config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise("main");
    $stateProvider.state('main', {
        url: '/main',
        templateUrl: 'app/main/app.main.html',
        controller: 'App.mainCtrl as vm'
    });
}).controller('App.mainCtrl', function($scope) {
    var vm = this;
    vm.a1 = 123;
    delete localStorage.projectCode;
  /*  vm.navigation = [{
        "label": "Create",
        "route": "mainApp.ProjectRequirement",
        "icon": "fas fa-plus-square"
    }, {
        "label": "Search",
        "route": "search",
        "icon": "fas fa-search"
    }, {
        "label": "Inbox",
        "route": "erfqInbox",
        "icon": "fas fa-envelope"
    }, {
        "label": "My eRFQ",
        "route": "erfq",
        "icon": "fas fa-list"
    }, {
        "label": "Quote Comparision",
        "route": "quoteComparisionCtrl",
        "icon": "fas fa-adjust"
    }, {
        "label": "Toolmaker Summary",
        "route": "mainApp.create",
        "icon": "fas fa-clipboard-list"
    }, {
        "label": "Finalize Toolmaker",
        "route": "finalize",
        "icon": "check_box"
    }, {
        "label": "Toolmaker Register",
        "route": "toolmaker_register",
        "icon": "fas fa-user-plus"
    }]; */
 
 $.cordys.ajax({

        method: "GetRoles", //GetListOfActiveUser
        namespace: "http://schemas.cordys.com/1.0/ldap",
        parameters: {
            dn: "",
            depth: ""
        },
        dataType: "* json",
        async: false,
        success: function success(e) {
            console.log(e);
            // $scope.roles1 = $.cordys.json.findObjects(e, "user");
            // for (var i = 0; i < $scope.roles1[0].role.length; i++) {
            //     $scope.CordysRole = $scope.CordysRole + "," + $scope.roles1[0].role[i].description;
            // }
            if(localStorage.user){
                $scope.CordysRole = JSON.parse(localStorage.user).USER_ROLE;
            }else{
                $scope.CordysRole = "notARole";
                console.log("not a role");
            }
            
            if ($scope.CordysRole.includes("MSIE")) {
                $scope.roles = "MSIE";
localStorage.role = "MSIE";
vm.navigation = [{
        "label": "Create",
        "route": "mainApp.ProjectRequirement",
        "icon": "fas fa-plus-square",
"display":"true"
    }, {
        "label": "Search",
        "route": "search",
        "icon": "fas fa-search",
"display":"true"
    }, {
        "label": "Inbox",
        "route": "erfqInbox",
        "icon": "fas fa-envelope",
"display":"true"
    }, {
        "label": "My eRFQ",
        "route": "erfq",
        "icon": "fas fa-list",
"display":"true"
    }, {
        "label": "Quote Comparision",
        "route": "quoteComparisionCtrl",
        "icon": "fas fa-adjust",
"display":"true"
    }, {
        "label": "Toolmaker Summary",
        "route": "mainApp.create",
        "icon": "fas fa-clipboard-list",
"display":"true"
    }, {
        "label": "Finalize Toolmaker",
        "route": "finalize",
        "icon": "check_box",
"display":"false"
    }, {
        "label": "Toolmaker Register",
        "route": "toolmaker_register",
        "icon": "fas fa-user-plus",
"display":"true"
    }];
            }
            if ($scope.CordysRole.includes("TOOLMAKER")) {
                $scope.roles = "TOOLMAKER";
vm.navigation = [{
        "label": "Create",
        "route": "mainApp.ProjectRequirement",
        "icon": "fas fa-plus-square",
"display":"false"
    }, {
        "label": "Search",
        "route": "search",
        "icon": "fas fa-search",
"display":"false"
    }, {
        "label": "Inbox",
        "route": "erfqInbox",
        "icon": "fas fa-envelope",
"display":"true"
    }, {
        "label": "My eRFQ",
        "route": "erfq",
        "icon": "fas fa-list",
"display":"true"
    }, {
        "label": "Quote Comparision",
        "route": "quoteComparisionCtrl",
        "icon": "fas fa-adjust",
"display":"false"
    }, {
        "label": "Toolmaker Summary",
        "route": "mainApp.create",
        "icon": "fas fa-clipboard-list",
"display":"false"
    }, {
        "label": "Finalize Toolmaker",
        "route": "finalize",
        "icon": "check_box",
"display":"false"
    }, {
        "label": "Toolmaker Register",
        "route": "toolmaker_register",
        "icon": "fas fa-user-plus",
"display":"false"
    }];
            }
            if ($scope.CordysRole.includes("ASSET MANAGER")) {
                $scope.roles = "ASSET MANAGER";
vm.navigation = [{
        "label": "Create",
        "route": "mainApp.ProjectRequirement",
        "icon": "fas fa-plus-square",
"display":"false"
    }, {
        "label": "Search",
        "route": "search",
        "icon": "fas fa-search",
"display":"true"
    }, {
        "label": "Inbox",
        "route": "erfqInbox",
        "icon": "fas fa-envelope",
"display":"true"
    }, {
        "label": "My eRFQ",
        "route": "erfq",
        "icon": "fas fa-list",
"display":"true"
    }, {
        "label": "Quote Comparision",
        "route": "quoteComparisionCtrl",
        "icon": "fas fa-adjust",
"display":"false" 
    }, {
        "label": "Toolmaker Summary",
        "route": "mainApp.create",
        "icon": "fas fa-clipboard-list",
"display":"false"
    }, {
        "label": "Finalize Toolmaker",
        "route": "finalize",
        "icon": "check_box",
"display":"true"
    }, {
        "label": "Toolmaker Register",
        "route": "toolmaker_register",
        "icon": "fas fa-user-plus",
"display":"true"
    }];                
            }
            if($scope.CordysRole.includes("STAMPING LEAD")){
                $scope.roles = "STAMPING LEAD";
vm.navigation = [{
        "label": "Create",
        "route": "mainApp.ProjectRequirement",
        "icon": "fas fa-plus-square",
"display":"false"
    }, {
        "label": "Search",
        "route": "search",
        "icon": "fas fa-search",
"display":"true"
    }, {
        "label": "Inbox",
        "route": "erfqInbox",
        "icon": "fas fa-envelope",
"display":"true"
    }, {
        "label": "My eRFQ",
        "route": "erfq",
        "icon": "fas fa-list",
"display":"false"
    }, {
        "label": "Quote Comparision",
        "route": "quoteComparisionCtrl",
        "icon": "fas fa-adjust",
"display":"false" 
    }, {
        "label": "Toolmaker Summary",
        "route": "mainApp.create",
        "icon": "fas fa-clipboard-list",
"display":"false"
    }, {
        "label": "Finalize Toolmaker",
        "route": "finalize",
        "icon": "check_box",
"display":"false"
    },{
        "label": "Toolmaker Register",
        "route": "toolmaker_register",
        "icon": "fas fa-user-plus",
"display":"false"
    }];
            }
},
        error: function error(jqXHR, textStatus, errorThrown) {
            //debugger;
            alert("Error in loading data");
        }
    });



});

angular.module('App.plugins', ['ngTouch', 'ngAnimate', 'ngFileUpload', 'ngSanitize', 'ui.bootstrap']).directive('dbNav', function() {
    return {
        template: '<section id="dbnav">\n    <img src="assets/images/msPrintImage.png" alt="" style="float:left;">\n    <nav class="navbar navbar-expand-lg navbar-light bg-danger">\n        <div class="collapse navbar-collapse show" id="navbarSupportedContent">\n            <ul class="navbar-nav mr-auto">\n                <li class="topNav">\n                    <a style="margin-right: 100px;color: white;">CME Stamping </a>\n                </li>\n                <li class="nav-item">\n                    <a style="color: white;" class="nav-link" ui-sref="main"> Home </a>\n                </li>\n                <li class="topNav">\n                    <a style="color: white;"> | </a>\n                </li>\n                <li class="nav-item">\n                    <a style="color: white;" class="nav-link" ui-sref="main"> Sitemap </a>\n                </li>\n                <li class="topNav">\n                    <a style="color: white;"> | </a>\n                </li>\n                <li class="nav-item">\n                    <a style="color: white;" class="nav-link" ui-sref="main"> Contact Us </a>\n                </li>\n                <li class="topNav">\n                    <a style="color: white;"> | </a>\n                </li>\n                <li class="nav-item">\n                    <a style="color: white;" class="nav-link" ui-sref="main"> Feedback </a>\n                </li>\n\n            </ul>\n            <a style="margin-left: 400px;color: white;"> {{username}} </a>\n        </div>\n    </nav>\n</section>'
    };
}).directive('dbSide', function() {
    return {
        template: '<nav id="sidebar">\n    <div class="sidebar-header">\n        <h3>eRFQ</h3>\n    </div>\n\n    <ul class="ml-2 list-unstyled border components">\n        <li class="active" ng-repeat="d in vm.data">\n\n            <a ng-If="d.state==undefined" role="button" data-toggle="collapse" data-target="#{{d.id}}" aria-expanded="true" aria-controls="collapseExample" ng-click="d.flag=!d.flag">\n    {{d.name}} <i class="float-right fas" ng-click="d.flag=!d.flag" ng-class="{\'fa-chevron-right\':d.flag==false,\'fa-angle-down\':d.flag==true}"></i>\n  </a>\n            <a ng-If="d.state!=undefined" role="button" data-toggle="collapse" ui-sref="{{d.state}}" ui-sref-active="bg-light" aria-expanded="false" aria-controls="collapseExample">\n    {{d.name}}\n  </a>\n\n            <ul class="collapse show list-unstyled" ng-if="d.child.length > 0" id="{{d.id}}">\n                <li ng-repeat="x in d.child">\n                    <a ui-sref="{{x.state}}" ui-sref-active="bg-light" style="color:#000;"><i class="fas fa-arrow-right"></i>  {{x.name}}</a>\n                </li>\n            </ul>\n        </li>\n\n    </ul>\n</nav>'
    };
});