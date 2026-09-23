export default class StringKeywords {
  static generateContainsXPathForCsv(textCsvToFind: string): string {
    const textValues: string[] = textCsvToFind.split(",");
    let containsTextsCondition: string = "";

    // Constructing the format for each text to look for
    for (const text of textValues) {
      const trimmed = text.trim();
      if (!trimmed) continue;
      if (containsTextsCondition !== "") {
        containsTextsCondition += " and ";
      }
      const delimiter = trimmed.includes("'") ? `"${trimmed}"` : `'${trimmed}'`;
      containsTextsCondition += `contains(., ${delimiter})`;
    }

    return `//*[descendant::text()[${containsTextsCondition}]]`;
  }
}