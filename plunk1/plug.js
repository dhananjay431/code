function DropDownTemplate() {
    
}
DropDownTemplate.prototype.onKeyDown = function (event) {
    var key = event.which || event.keyCode;
    if (key == 37 ||  
        key == 39) {  
        this.toggleMood();
        event.stopPropagation();
    }
};

DropDownTemplate.prototype.toggleMood = function () {
    this.selectMood(this.mood === 'Happy' ? 'Sad' : 'Happy');
};
DropDownTemplate.prototype.init = function (params) {
     this.container = document.createElement('div');
     this.container.setAttribute("style", "height:100%;width:100%;");    
this.happyImg = document.createElement("select");
this.happyImg.setAttribute("style", "height:100%;width:100%;");
    for(var i=0;i<params.values.length;i++){
        var option = document.createElement("option");
        option.text = params.data.drop[i];
        this.happyImg.add(option);
    }
this.sel =  params[params.colDef.field];
     this.container.appendChild( this.happyImg);
    var that = this;
    this.happyImg.addEventListener('change', function (event) {
        
        params.value = params.data.drop[this.selectedIndex];
        if(params.value != undefined)
        that.selectMood(params.value );
    });
};
DropDownTemplate.prototype.selectMood = function (mood) {
    
    if(mood)
    this.mood = mood;
    else
    this.mood = this.sel;
};
DropDownTemplate.prototype.getGui = function () {
    
    return this.container;
};

DropDownTemplate.prototype.afterGuiAttached = function () {
    
    this.container.focus();
};

DropDownTemplate.prototype.getValue = function () {
    
    return this.mood;
};

// any cleanup we need to be done here
DropDownTemplate.prototype.destroy = function () {
    
};

DropDownTemplate.prototype.isPopup = function () {
    
    return true;
};
DropDownTemplate.prototype.list = function(list) {
    var map = {}, node, roots = [], i;
    for (i = 0; i < list.length; i += 1) {
        map[list[i]._id] = i; // initialize the map
        list[i].children = []; // initialize the children
    }
    for (i = 0; i < list.length; i += 1) {
        node = list[i];
        if (node._parentId !== null) {
            list[map[node._parentId]].children.push(node);
        } else {
            roots.push(node);
        }
    }
    return roots;
}
// var entries = [
//     {
//         "id": "1",
//         "_parentId": null,
//         "text": "Man",
//         "level": "1"
//     },
//     {
//         "id": "2",
//         "_parentId": "1",
//         "text": "Man",
//         "level": "1"
//     },
//     {
//         "id": "3",
//         "_parentId": "2",
//         "text": "Man",
//         "level": "1"
//     },
//     {
//         "id": "4",
//         "_parentId": "2",
//         "text": "Man",
//         "level": "1"
//     }
// ];