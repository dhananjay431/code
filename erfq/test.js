class CellRender{
    init(params){
      this.eGui = document.createElement('span');
      let getData = params.params2.filter(d=>{
        return d.key == params.value;
      })
      if(getData.length > 0 )
      this.eGui.innerHTML = getData[0].value; 
      else
      this.eGui.innerHTML ="-";

  }
    getGui(){
      return this.eGui;
      
    }
  }
  class CellText{
    init(){
      this.html = document.createElement('input');
      this.html.value = params.value;  
    }
    getGui(){
      return this.html;
    }
    afterGuiAttached(){
      this.html.focus();
      this.html.select();
    }
    getValue(){
      return this.html.value;  
    }
    destroy(){

    }
    isPopup(){
      return false;
    }
  }
class CellSelect{
  constructor(){
    this.selected()
  }
  init(params){
    this.div = document.createElement('div');
    this.div.style.width = '100%';
    this.div.style.height = '100%';
    this.gui = document.createElement('select');
    this.gui.style.width = '100%';
    this.gui.style.height = '100%';
    for(var i=0;i<params.values.length;i++){
      let op =  document.createElement('option');
      op.text = params.values[i].text;
      op.value = params.values[i].value;
      this.gui.add(op);
    }
    this.div.appendChild(this.gui);
    let that = this;
    this.gui.addEventListener('change', function (event) {
      params.value =  params.values[event.target.selectedIndex].value;
        if(params.value != undefined){
          that.selected(params.value);
        }
    }); 
  }
  selected(value){
    this.seledtedValue =  value;
  }
  getGui() {
    return this.div;
  }
  getValue(){
    return this.seledtedValue;
  }
  afterGuiAttached(){
    this.div.focus();
  }
}

class CellSelectCb{
  init(cb){
    cb();
  }
  selected(value){
    this.seledtedValue =  value;
  }
  getGui() {
    return this.div;
  }
  getValue(){
    return this.gui.options[e.selectedIndex].value;
  }
  afterGuiAttached(){
    this.gui.focus();
  }
}