class InExRender{
    init(params){
      this.eGui = document.createElement('span');
      this.eGui.innerHTML = JSON.stringify(params);
  }
    getGui(){
      return this.eGui;
      
    }
  }