export class DTC {
  public strFontFamily:string = 'Playpen Sans';

  public truncateString(str: string, nChars: number): string {
    var result = "";
    var suffix = "...";

    if (str.length <= nChars) {
      result = str;
    } else {
      var strTruncated = str.substring(0, nChars - suffix.length);
      result = strTruncated + suffix;
    }

    return result;
  }

  public doubleDigit(n: number): string {
    var strResult = "";

    if (n < 100 && n > 0) {
      if (n < 10) strResult = "0" + n;
      else strResult = n.toString();
    }

    return strResult;
  }

  public tripleDigit(n: number): string {
    var strResult = "";

    if (n > 0 && n < 1000) {
      if (n < 10) strResult = "00" + n;
      else if (n < 100) strResult = "0" + n;
      else strResult = n.toString();
    }

    return strResult;
  }

  public isSoundOn(): boolean {
    if (localStorage.getItem("isSoundOn") == "ON") {
      return true;
    } else {
      return false;
    }
  }
}
