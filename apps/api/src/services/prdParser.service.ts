// TODO V2: Implement Notion OAuth integration for private page access
// For now, users should paste PRD text directly

export const prdParserService = {
  /**
   * Performs light normalization on incoming PRD requirements.
   * Collapses excess blank lines and standardizes newlines without stripping
   * brackets, backticks, or code punctuation needed for technical specifications.
   */
  normalizeText(text: string): string {
    if (!text || typeof text !== "string") {
      throw new Error("Input requirements text cannot be empty");
    }

    const normalized = text
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!normalized) {
      throw new Error("Input requirements text cannot be empty");
    }

    if (normalized.length > 25000) {
      return normalized.substring(0, 25000); // Guardrail for LLM prompt context
    }

    return normalized;
  },
};
