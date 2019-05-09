agGrid.initialiseAgGridWithAngular1(angular);

var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope) {

    var columnDefs = [
        {headerName: "Make", field: "make"},
        {headerName: "Model", field: "model"},
        {headerName: "Price", field: "price"}
    ];


    $scope.gridOptions = {
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
    }
    $scope.addCol=function(){
        var d = $scope.gridOptions.columnDefs.filter(function(d){ return d.headerName == "added"})[0];
        $scope.gridOptions.columnDefs.push({headerName: "product",field: "product"});

        $scope.gridOptions.api.setColumnDefs($scope.gridOptions.columnDefs);
        console.log($scope.gridOptions);
    }
});