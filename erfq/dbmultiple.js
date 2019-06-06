angular.module('multipleSelect', [])
 .component('dbmultiple',{
  transclude: true,
  template: `<div class="dropdown" ng-transclude>
  <button class="btn border dropdown-toggle" 
  type="button" 
  style="width:100%;"
  id="dropdownMenuButton" 
  data-toggle="dropdown" 
  aria-haspopup="true" 
  aria-expanded="false">
  <div class="float-left">
  </div>
    {{$ctrl.model.length > 2 ? "more than 2":($ctrl.model.length == 0 ? 'Select':$ctrl.model.toString())}}
  </button>
  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
  <span class="dropdown-item" ng-repeat="d in $ctrl.op.op">
      <input type="checkbox" class="m-2" ng-model="d.value" ng-change="$ctrl.change($ctrl.op)">{{d.name}}
    </span>
  </div>
</div>`,
  controller: function() {
    this.change =function(data){
      this.model = data.op.filter(d=>{
        return d.value == true;
      }).map(d=>{
        return d.name;
      });      
    }
  },
  bindings: {
    op: '<',
    model:'='
  }
});