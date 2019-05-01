import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormat'
})
export class NumberFormatPipe implements PipeTransform {

  transform(value: number, args?: any): any {
    
    let formattedNo = ""; 
    var precision = localStorage.getItem("DecimalPrecision");
    var decSeperator = localStorage.getItem("DecimalSeparator");
    var thSeperator = localStorage.getItem("ThousandSeparator");
    var dateFormat = localStorage.getItem("DATEFORMAT");
    if(value == null && value == undefined && value.toString() ==""){
      return value;
    }
    var arr = value.toString().trim().split(decSeperator);
    formattedNo = this.addDigitSeperatorToNo(arr[0], thSeperator);
    //logic to add . and ifs after place digit manage.
    if (arr != null && arr != undefined && arr[1] != undefined && arr[1] != null) {
      var noOfDigitsAfterDesimal = arr[1].length
      formattedNo = this.addDecimalDigitsToNo(formattedNo, value.toString(), decSeperator);
    } else {
      // case when no has no decimal then directly add precision zeros.
      formattedNo = formattedNo + decSeperator;
      for (var i = 0; i < Number(precision); i++) {
        formattedNo = formattedNo + "0";
      }
    }
    console.log("case when no. not has desimal:", formattedNo);
    return formattedNo;
  }

  addDigitSeperatorToNo(numberStringBeforeDesimal: string, seperator: string): string {
    var newNo = "";
    if (numberStringBeforeDesimal.length > 3 && numberStringBeforeDesimal.length < 7) {
      newNo = numberStringBeforeDesimal.substring(0, numberStringBeforeDesimal.length - 3) + seperator + numberStringBeforeDesimal.substring(numberStringBeforeDesimal.length - 3, numberStringBeforeDesimal.length);
    } else
      if (numberStringBeforeDesimal.length > 6 && numberStringBeforeDesimal.length < 10) {
        newNo = numberStringBeforeDesimal.substring(0, numberStringBeforeDesimal.length - 6) + seperator + numberStringBeforeDesimal.substring(numberStringBeforeDesimal.length - 6, numberStringBeforeDesimal.length - 3)
          + seperator + numberStringBeforeDesimal.substring(numberStringBeforeDesimal.length - 3, numberStringBeforeDesimal.length);
      } else
        if (numberStringBeforeDesimal.length > 9 && numberStringBeforeDesimal.length < 13) {
          newNo = numberStringBeforeDesimal.substring(0, numberStringBeforeDesimal.length - 9) + seperator +
            numberStringBeforeDesimal.substring(numberStringBeforeDesimal.length - 9, numberStringBeforeDesimal.length - 6) + seperator + numberStringBeforeDesimal.substring(numberStringBeforeDesimal.length - 6, numberStringBeforeDesimal.length - 3)
            + seperator + numberStringBeforeDesimal.substring(numberStringBeforeDesimal.length - 3, numberStringBeforeDesimal.length);
        } else {
          newNo = numberStringBeforeDesimal;
        }
    return newNo;
  }
  addDecimalDigitsToNo(formattedString: string, no: string, DecimalSeparator: string): string {
    var noOfDigitsAfterDesimal = no.toString().split(DecimalSeparator)[1].length;
    var precision = 4;//localStorage.getItem("DecimalPrecision");
    if (noOfDigitsAfterDesimal == 0) {
      formattedString = formattedString + DecimalSeparator;
      for (var i = 0; i < Number(precision); i++) {
        formattedString = formattedString + "0";
      }
    } else {
      formattedString = formattedString + DecimalSeparator + no.toString().split(DecimalSeparator)[1];
      var zeroCount = 0;
      if (noOfDigitsAfterDesimal < Number(precision)) {
        zeroCount = Number(precision) - noOfDigitsAfterDesimal;
      }
      for (var i = 0; i < zeroCount; i++) {
        formattedString = formattedString + "0";
      }
    }
    return formattedString;
  }
}
