agGrid.initialiseAgGridWithAngular1(angular);

var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope) {

    var columnDefs = [
        {headerName: "Make", field: "make"},
        {headerName: "Model", field: "model"},
        {headerName: "Price", field: "price"}
    ];


    $scope.gridOptions = {
        getRowStyle :function(params) {
            if (params.node.rowIndex % 2 === 0) {
                return { background: '#FFF' }
            }
        },
        columnDefs: [
            {
                headerName: "color",
                field: "color",
                editable: true,
                 cellEditorSelector:function (params){
                        return {
                            component: 'moodEditor',
                            params: {values: params.data.drop }
                        };
                    }
            },
            {
                headerName: 'Athlete Details',
                children:[
                    {
                        headerName: "department",
                        field: "department"
                    },
                    {
                        headerName: "price",
                        field: "price"
                    }
                ]
            },
            {
         
                headerName: "productAdjective",
                field: "productAdjective"
            },
            {
         
                headerName: "first Name",
                field: "name.first"
            },
            {
                headerName: "middl Name",
                field: "name.middl"
            },
            {
                headerName: "last Name",
                field: "name.last"
            }
        ],
        rowData: null,
        components:{
            
            moodEditor: DropDownTemplate
        }
    };

    fetch("https://jsonresp.herokuapp.com/datatable/100", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "color": {
                "_": "color"
            },
            "drop": [{
                "_": "color"
            }, {
                "_": "color"
            }, {
                "_": "color"
            }, {
                "_": "color"
            }, {
                "_": "color"
            }, {
                "_": "color"
            }],
            "department": {
                "_": "department"
            },
            "productName": {
                "_": "productName"
            },
            "price": {
                "_": "price"
            },
            "productAdjective": {
                "_": "productAdjective"
            },
            "productMaterial": {
                "_": "productMaterial"
            },
            "product": {
                "_": "product"
            },
            "name":{
                "first":{"_":"firstName"},
                "middl":{"_":"firstName"},
                "last":{"_":"lastName"}
            }
        })
    }).then(json => json.json())
    .then(json => {
           $scope.gridOptions.api.setRowData(json.data);
          //$scope.gridOptions.rowData = json.data;
          $scope.$apply();

    })
    ////
    $scope.show= function(){
        debugger;
        var t= {
            getFirstDisplayedRow:$scope.gridOptions.api.getFirstDisplayedRow(),
            getModel: $scope.gridOptions.api.getModel(),
            s:$scope.gridOptions.api.getModel().data
        };
        console.log($scope.gridOptions.api.getModel())
        $scope.gridOptions.api.forEachNode(function(d,i){
            console.log(d.data);
        })
        console.log("getRowData=>",$scope.gridOptions.api.getRowData());
    }
    $scope.addCol=function(){
        var d = $scope.gridOptions.columnDefs.filter(function(d){ return d.headerName == "added"})[0];
        $scope.gridOptions.columnDefs.push({headerName: "product",field: "product"});

        $scope.gridOptions.api.setColumnDefs($scope.gridOptions.columnDefs);
        console.log($scope.gridOptions);
    }
    function getBooleanValue(cssSelector) {
        return document.querySelector(cssSelector).checked === true;
    }
    $scope.getXlsx = function(){
        var params = {
            color: "asdfasddsafds"
            // fileName: document.querySelector('#fileName').value,
            // sheetName: document.querySelector('#sheetName').value,
            // exportMode: document.querySelector('input[name="mode"]:checked').value
        };
        $scope.gridOptions.api.exportDataAsExcel(params);
    }
});