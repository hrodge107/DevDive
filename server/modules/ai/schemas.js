import { SchemaType } from "@google/generative-ai";

export const evaluationResponseSchema = {
  type: SchemaType.OBJECT,
  description: "Root evaluation structure for a student submission.",
  properties: {
    overallHint: { type: SchemaType.STRING, description: "Comprehensive contextual evaluation advice and troubleshooting hints." },
    codeEvaluation: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          requirement: { type: SchemaType.STRING },
          passed: { type: SchemaType.BOOLEAN }
        },
        required: ["requirement", "passed"]
      }
    },
    visualEvaluation: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          requirement: { type: SchemaType.STRING },
          passed: { type: SchemaType.BOOLEAN }
        },
        required: ["requirement", "passed"]
      }
    }
  },
  required: [
    "overallHint", 
    "codeEvaluation", 
    "visualEvaluation"
  ]
};
