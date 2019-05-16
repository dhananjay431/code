class CustomHeader{
    agParams:any;
    eGui:any;
    eMenuButton:any;
    onMenuClickListener:any;
    init(agParams:any){
        this.agParams = agParams;
        this.eGui = document.createElement('div');

        this.onMenuClickListener  = function(){
            console.log("ag-clicked");
        };
        if(this.agParams.displayName == "Age"){
                this.eGui.innerHTML = this.agParams.displayName;
                this.eGui.innerHTML += "<div class='customHeaderMenuButton' style='float:right;'>HHIII</div>";
                this.eMenuButton = this.eGui.querySelector(".customHeaderMenuButton");
             this.eMenuButton.addEventListener('click', );
             
        }
        else
        this.eGui.innerHTML = this.agParams.displayName
    }
    onSortChanged(){

    }
    getGui(){
        return this.eGui;
    }
    onMenuClick(){
        this.agParams.showColumnMenu(this.eMenuButton);
    }
    onSortRequested(order:any, event:any){
        this.agParams.setSort(order, event.shiftKey);
    }
    destroy(){
        this.eMenuButton.removeEventListener('click', this.onMenuClickListener)
    }
}
