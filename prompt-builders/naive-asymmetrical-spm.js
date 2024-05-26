import { truncateToTokenLength } from "../tokenizer.js";

export function buildPrompt({ prefix, suffix, maxTokens }) {
  const maxPrefixTokens = Math.floor(maxTokens * 0.5);
  const maxSuffixTokens = Math.floor(maxTokens * 0.5);

  const { text: promptPrefix } = truncateToTokenLength(
    prefix,
    maxPrefixTokens,
    "left"
  );
  const { text: promptSuffix } = truncateToTokenLength(
    suffix,
    maxSuffixTokens,
    "right"
  );

  return `<PRE> <SUF>${promptSuffix} <MID> ${promptPrefix}`;
}
