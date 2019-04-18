import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormat'
})
export class NumberFormatPipe implements PipeTransform {

  transform(value: number, args?: any): any {
    let formattedNo="";
    var precision = 4;//localStorage.getItem("DecimalPrecision");
    var decSeperator = ".";//localStorage.getItem("DecimalSeparator");
    var thSeperator = localStorage.getItem("ThousandSeparator");
    var dateFormat = localStorage.getItem("DATEFORMAT");
    var arr = value.toString().split('.');
    formattedNo =  this.addSingleSeperatorToNo(arr[0]);
    //logic to add . and ifs after place digit manage.
    if(arr!=null && arr != undefined && arr[1]!= undefined && arr[1]!=null){
      var noOfDigitsAfterDesimal = arr[1].length
      console.log("no of digits after desimal: ",noOfDigitsAfterDesimal)
      formattedNo =   this.addDecimalDigitsToNo(formattedNo ,value.toString());
      console.log("case when no has any no. of desimal:",formattedNo);
    }else{
      // case when no has no decimal then directly add precision zeros.
      formattedNo = value + decSeperator;
      for(var i =0;i< Number(precision);i++){
        formattedNo = formattedNo + "0";
      }
      console.log("case when no. not has desimal:",formattedNo);
    }
    
    return formattedNo;
  }
  addSingleSeperatorToNo(numberStringBeforeDesimal:string):string{
    var newNo  = "";
    if(numberStringBeforeDesimal.length >3 && numberStringBeforeDesimal.length < 7){
      newNo = numberStringBeforeDesimal.substring(0,numberStringBeforeDesimal.length-3)+","+numberStringBeforeDesimal.substring(numberStringBeforeDesimal.length-3,numberStringBeforeDesimal.length);
     console.log("4 digit no", newNo);
    }
    return newNo;
  }
  addDecimalDigitsToNo(formattedString: string, no: string): string {
    var noOfDigitsAfterDesimal = no.toString().split('.')[1].length;
    var precision = 4;//localStorage.getItem("DecimalPrecision");
    if (noOfDigitsAfterDesimal == 0) {
      formattedString = formattedString + ".";
      console.log("digit after desimal zero:" + noOfDigitsAfterDesimal);
      for (var i = 0; i < Number(precision); i++) {
        formattedString = formattedString + "0";
      }
      return formattedString;
    } else {
      formattedString = formattedString + "." + no.toString().split('.')[1];
      var zeroCount = 0;
      if (noOfDigitsAfterDesimal < Number(precision)) {
        zeroCount = Number(precision) - noOfDigitsAfterDesimal;
      }
      for (var i = 0; i < zeroCount; i++) {
        formattedString = formattedString + "0";
      }
      return formattedString;
    }
  }
}
