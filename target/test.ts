
import {IHeaderComp ,IHeaderCompParams } from './IHeaderComp';
class Dis implements IHeaderComp{
    params:IHeaderCompParams;
    constructor(){

    }
    init(params:IHeaderCompParams){

    }
    getGui(){
      return HTMLElement;
    }
    destroy(){

    }
}