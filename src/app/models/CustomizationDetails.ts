export class CustomizationDetails{
    PickTaskLocation:boolean;
    PickTaskItemCode:boolean;
  
    constructor(PickTaskLocation: boolean, PickTaskItemCode: boolean) {
        this.PickTaskLocation = PickTaskLocation;
        this.PickTaskItemCode = PickTaskItemCode;
    }
  }