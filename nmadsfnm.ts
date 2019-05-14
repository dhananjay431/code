var angular:any;
angular.module('App.quoteComparisionCtrl')
	.controller('targetCostCtrl', function ($scope, Upload, $window, $log, $state, NgTableParams, cmm) {
        class al{
            str:string;
            constructor(str)
            {
         this.str = str;
            }
            show()
            {
                console.log("this.show=>",this.str);
            }
        }
        class b1 extends al{
            str:string;
            constructor(str){
                super(str);
                this.str = str + "b1";
            }
            dis(){
                console.log("show=>",this.str);
            }
        }
	})
    
    