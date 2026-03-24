"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBloodTestNormal = void 0;
const generative_ai_1 = require("@google/generative-ai");
const env_1 = require("../config/env");
// 1. Initialize Gemini SDK
// Use process.env.GEMINI_API_KEY in production!
const genAI = new generative_ai_1.GoogleGenerativeAI(env_1.config.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
        responseMimeType: 'application/json',
    },
});
const normalRanges = {
    hemoglobin: { min: 12.0, max: 17.5, unit: 'g/dL' }, // Combined range
    glucose: { min: 70, max: 100, unit: 'mg/dL' }, // Fasting range
    cholesterol: { min: 125, max: 200, unit: 'mg/dL' }, // Min 0 is okay, but 125+ is typical for adults
    triglycerides: { min: 0, max: 150, unit: 'mg/dL' },
    hdl: { min: 40, max: 60, unit: 'mg/dL' }, // 60+ is considered "optimal"
    ldl: { min: 0, max: 100, unit: 'mg/dL' },
    creatinine: { min: 0.6, max: 1.3, unit: 'mg/dL' }, // Slightly higher max (1.3) is common
    urea: { min: 7, max: 20, unit: 'mg/dL' }, // Also known as BUN
    sodium: { min: 135, max: 145, unit: 'mEq/L' }, // 135 is the standard floor
    potassium: { min: 3.5, max: 5.1, unit: 'mEq/L' },
    calcium: { min: 8.5, max: 10.5, unit: 'mg/dL' },
    wbc: { min: 4500, max: 11000, unit: 'cells/mcL' },
    rbc: { min: 4.2, max: 5.9, unit: 'million cells/mcL' }, // Widened for gender inclusivity
    platelets: { min: 150000, max: 450000, unit: 'cells/mcL' }, // 450k is a common upper limit
    hematocrit: { min: 36, max: 50, unit: '%' }, // Simplified unit to percentage
};
const checkBloodTestNormal = async (req, res) => {
    try {
        const tests = Array.isArray(req.body)
            ? req.body
            : [req.body];
        if (!tests.length) {
            res.status(400).json({
                success: false,
                message: 'Please provide at least one blood test',
            });
            return;
        }
        // --- Logic to check ranges ---
        const results = tests.map(({ testName, value, unit }) => {
            const normalizedName = testName.toLowerCase().trim();
            const range = normalRanges[normalizedName];
            if (!range)
                return {
                    testName,
                    value: Number(value),
                    unit,
                    success: false,
                    message: 'Range not found',
                };
            const numericValue = Number(value);
            const status = numericValue < range.min
                ? 'low'
                : numericValue > range.max
                    ? 'high'
                    : 'normal';
            return {
                testName,
                value: numericValue,
                unit,
                status,
                isNormal: status === 'normal',
                normalRange: `${range.min}-${range.max} ${range.unit}`,
            };
        });
        // --- Gemini AI Integration ---
        const prompt = `
            Analyze these blood test results as a medical data analyst also suggest some treatment options from lifestyle changes, diet recomendations and medication if you are sure enough:
            ${JSON.stringify(results)}

            Return a JSON object with this exact structure:
            {
              "summary": "A 5-7 sentence overview of health status and suggest lifestyle changes and diet recommendations like a doctor.",
              "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4", "suggestion 5"]
            }
        `;
        // Ensure JSON mode is active in the config
        const aiResult = await model.generateContent(prompt);
        const aiResponseText = aiResult.response.text();
        // Parse the AI output
        const parsedAI = JSON.parse(aiResponseText);
        // --- Final Response with separate fields ---
        res.status(200).json({
            success: true,
            checkedAt: new Date().toISOString(),
            data: results,
            aiSummary: parsedAI.summary, // String
            aiSuggestions: parsedAI.suggestions, // Array of strings
        });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.checkBloodTestNormal = checkBloodTestNormal;
