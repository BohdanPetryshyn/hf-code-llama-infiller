import pRetry from "p-retry";

import { HfInference } from "@huggingface/inference";
import { PROMPT_BUILDERS } from "./prompt-builders/prompt-builders.js";
import { RESULT_EMBEDDERS } from "./result-embedders/result-embedders.js";

const INFILLED_LINES_TOLERANCE = 5;
const INFILLED_CHARACTERS_PER_LINE_TOLERANCE = 500;
export const MASKED_LINES_PER_TEST_CASE = 10;

export class HfCodeLlamaInfiller {
  constructor({
    hfEndpoint,
    hfAccessToken,
    modelId,
    promptBuilderId,
    resultEmbedderId,
  }) {
    this.hf = new HfInference(hfAccessToken);
    this.hf = this.hf.endpoint(hfEndpoint);
    this.modelId = modelId;
    this.promptBuilderId = promptBuilderId;
    this.resultEmbedderId = resultEmbedderId;
    this.promptBuilder = PROMPT_BUILDERS[promptBuilderId];
    this.resultEmbedder = RESULT_EMBEDDERS[resultEmbedderId];
    if (!this.promptBuilder) {
      throw new Error(`Unknown prompt builder: ${promptBuilderId}`);
    }
    if (!this.resultEmbedder) {
      throw new Error(`Unknown result embedder: ${resultEmbedderId}`);
    }
  }

  async infill(prefix, suffix, contextSize) {
    let infilled = "";

    while (true) {
      const inputs = this.promptBuilder({
        prefix,
        suffix,
        maxTokens: contextSize - 10,
      });
      const generatedText = await pRetry(
        async () => {
          const { generated_text } = await this.hf.textGeneration({
            model: this.modelId,
            inputs,
            parameters: {
              max_new_tokens: 250,
              return_full_text: false,
            },
          });
          return generated_text;
        },
        { retries: 1 }
      );

      if (generatedText.length === 0) {
        break;
      }

      const embeddedResult = this.resultEmbedder({
        result: generatedText,
        prefix,
        suffix,
      });

      infilled += embeddedResult.result;
      if (embeddedResult.embedded) {
        break;
      }

      if (
        infilled.split("\n").length >
          MASKED_LINES_PER_TEST_CASE + INFILLED_LINES_TOLERANCE ||
        infilled.length >
          (MASKED_LINES_PER_TEST_CASE + INFILLED_LINES_TOLERANCE) *
            INFILLED_CHARACTERS_PER_LINE_TOLERANCE
      ) {
        break;
      }

      prefix += generatedText;
    }

    return prefix + infilled + suffix;
  }
}
