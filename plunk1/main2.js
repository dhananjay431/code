agGrid.initialiseAgGridWithAngular1(angular);

angular.module("example", ["agGrid"])
    .controller("exampleCtrl", function($scope) {
        $scope.dis = "adsfkjklsadjfkljasd";

        $scope.gridOptions = {
            rowData: null,
            angularCompileRows: true,
            columnDefs: [{
                    headerName: "color",
                    field: "color",
                    editable: true
                    // cellEditorSelector:function (params){
                    //     debugger;
                    //     var temp =  {
                    //         //component: 'agRichSelectCellEditor',
                    //     //    component: 'moodEditor',
                    //         params: {values: params.data.drop }
                    //     };
                    //     return temp;
                    // }
                },
                {
                    headerName: "department",
                    field: "department"
                },
                {
                    headerName: "price",
                    field: "price"
                },
                {
                    headerName: "productAdjective",
                    field: "productAdjective"
                }
            ],
            rowData: null


        };
        $scope.showdis = function() {

            console.log("$scope.gridOptions=>", $scope.gridOptions);
        }



        fetch("https://jsonresp.herokuapp.com/datatable/10", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "color": {
                    "_": "color"
                },
                // "drop": [{
                //     "_": "color"
                // }, {
                //     "_": "color"
                // }, {
                //     "_": "color"
                // }, {
                //     "_": "color"
                // }, {
                //     "_": "color"
                // }, {
                //     "_": "color"
                // }],
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
        })




    });