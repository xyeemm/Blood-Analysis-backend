"use strict";
// import { GoogleGenerativeAI } from "@google/generative-ai";
Object.defineProperty(exports, "__esModule", { value: true });
// // Initialize the API with your key
// // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// const genAI = new GoogleGenerativeAI("AIzaSyA5h8Kx3O54bgBFUHEMdFnSQK2uMQVxuKE");
// const generateAISummary = async (tests: any[]): Promise<AIPrompt> => {
//   // Use gemini-1.5-flash for fast, cost-effective summaries
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//   const prompt = `
//     You are a helpful medical assistant. Analyze the following blood tests and provide a response in JSON format.
//     Format:
//     {
//       "summary": "short summary text",
//       "suggestions": ["suggestion 1", "suggestion 2"]
//     }
//     Blood tests:
//     ${tests.map(t => `${t.testName}: ${t.value} ${t.unit} (Normal: ${t.normalRange.min}-${t.normalRange.max})`).join('\n')}
//   `;
//   try {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();
//     // Parse the JSON output from Gemini
//     const cleanJson = text.replace(/```json|```/g, "").trim();
//     return JSON.parse(cleanJson) as AIPrompt;
//   } catch (err) {
//     console.error('Gemini AI error:', err);
//     return {
//       summary: 'Unable to generate AI summary at this time.',
//       suggestions: [],
//     };
//   }
// };
