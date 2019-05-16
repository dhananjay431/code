var CustomHeader = (function () {
    function CustomHeader() {
    }
    CustomHeader.prototype.init = function (agParams) {
        this.agParams = agParams;
        this.eGui = document.createElement('div');
        this.onMenuClickListener = function () {
            console.log("ag-clicked");
        };
        if (this.agParams.displayName == "Age") {
            this.eGui.innerHTML = this.agParams.displayName;
            this.eGui.innerHTML += "<div class='customHeaderMenuButton' style='float:right;'>HHIII</div>";
            this.eMenuButton = this.eGui.querySelector(".customHeaderMenuButton");
            this.eMenuButton.addEventListener('click');
        }
        else
            this.eGui.innerHTML = this.agParams.displayName;
    };
    CustomHeader.prototype.onSortChanged = function () {
    };
    CustomHeader.prototype.getGui = function () {
        return this.eGui;
    };
    CustomHeader.prototype.onMenuClick = function () {
        this.agParams.showColumnMenu(this.eMenuButton);
    };
    CustomHeader.prototype.onSortRequested = function (order, event) {
        this.agParams.setSort(order, event.shiftKey);
    };
    CustomHeader.prototype.destroy = function () {
        this.eMenuButton.removeEventListener('click', this.onMenuClickListener);
    };
    return CustomHeader;
}());
