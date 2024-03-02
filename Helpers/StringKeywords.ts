export default class StringKeywords {
  static generateContainsXPathForCsv(textCsvToFind: string): string {
    const textValues: string[] = textCsvToFind.split(",");
    let containsTextsCondition: string = "";

    // Constructing the format for each text to look for
    for (const text of textValues) {
      if (containsTextsCondition !== "") {
        containsTextsCondition += " and ";
      }
      containsTextsCondition += `contains(., '${text}')`;
    }

    return `//*[descendant::text()[${containsTextsCondition}]]`;
  }
}