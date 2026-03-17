import { GoogleGenerativeAI } from '@google/generative-ai'
import { Request, Response } from 'express'
import { config } from '../config/env'
// 1. Initialize Gemini SDK
// Use process.env.GEMINI_API_KEY in production!
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({
	model: 'gemini-2.5-flash-lite',
	generationConfig: {
		responseMimeType: 'application/json',
	},
})

interface BloodTestRequest {
	testName: string
	value: number
	unit: string
}

interface NormalRange {
	min: number
	max: number
	unit: string
}

const normalRanges: Record<string, NormalRange> = {
	hemoglobin: { min: 12.0, max: 17.5, unit: 'g/dL' },
	glucose: { min: 70, max: 100, unit: 'mg/dL' },
	cholesterol: { min: 0, max: 200, unit: 'mg/dL' },
	triglycerides: { min: 0, max: 150, unit: 'mg/dL' },
	hdl: { min: 40, max: 60, unit: 'mg/dL' },
	ldl: { min: 0, max: 100, unit: 'mg/dL' },
	creatinine: { min: 0.6, max: 1.2, unit: 'mg/dL' },
	urea: { min: 7, max: 20, unit: 'mg/dL' },
	sodium: { min: 136, max: 145, unit: 'mEq/L' },
	potassium: { min: 3.5, max: 5.0, unit: 'mEq/L' },
	calcium: { min: 8.5, max: 10.5, unit: 'mg/dL' },
	wbc: { min: 4500, max: 11000, unit: 'cells/mcL' },
	rbc: { min: 4.5, max: 5.5, unit: 'million cells/mcL' },
	platelets: { min: 150000, max: 400000, unit: 'cells/mcL' },
	hematocrit: { min: 36, max: 50, unit: '%' },
}

export const checkBloodTestNormal = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const tests: BloodTestRequest[] = Array.isArray(req.body)
			? req.body
			: [req.body]

		if (!tests.length) {
			res.status(400).json({
				success: false,
				message: 'Please provide at least one blood test',
			})
			return
		}

		// --- Logic to check ranges ---
		const results = tests.map(({ testName, value, unit }) => {
			const normalizedName = testName.toLowerCase().trim()
			const range = normalRanges[normalizedName]

			if (!range)
				return {
					testName,
					value: Number(value),
					unit,
					success: false,
					message: 'Range not found',
				}

			const numericValue = Number(value)
			const status =
				numericValue < range.min ? 'low' : numericValue > range.max ? 'high' : 'normal'
			return {
				testName,
				value: numericValue,
				unit,
				status,
				isNormal: status === 'normal',
				normalRange: `${range.min}-${range.max} ${range.unit}`,
			}
		})

		// --- Gemini AI Integration ---
		const prompt = `
            Analyze these blood test results as a medical data analyst:
            ${JSON.stringify(results)}

            Return a JSON object with this exact structure:
            {
              "summary": "A 2-sentence overview of health status.",
              "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
            }
        `

		// Ensure JSON mode is active in the config
		const aiResult = await model.generateContent(prompt)
		const aiResponseText = aiResult.response.text()

		// Parse the AI output
		const parsedAI = JSON.parse(aiResponseText)

		// --- Final Response with separate fields ---
		res.status(200).json({
			success: true,
			checkedAt: new Date().toISOString(),
			data: results,
			aiSummary: parsedAI.summary, // String
			aiSuggestions: parsedAI.suggestions, // Array of strings
		})
	} catch (error) {
		console.error('Error:', error)
		res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}
