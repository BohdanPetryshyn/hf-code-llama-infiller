# Hugging Face Code Llama Infiller 🦙

This library allows you to infill (fill-in-the-middle) code with Code Llama hosted on Hugging Face Inference Endpoints platform.

## How to use

1. Install the library

```bash
npm install hf-code-llama-infiller
```

2. Use the library

```javascript
import { HfCodeLlamaInfiller } from "hf-code-llama-infiller";

const infiller = new HfCodeLlamaInfiller({
  hfEndpoint: "<your hugging face endpoint>",
  hfAccessToken: "<your hugging face access token>",
  modelId: "codellama/CodeLlama-7b-hf",
  promptBuilderId: "naive-asymmetrical",
  resultEmbedderId: "prevent-overfilling",
});

infiller
  .infill(
    "def get_sum(a, b)", // Prefix
    "\n", // Suffix
    512 // Max context size
  )
  .then(console.log); // Full infilled result
```
