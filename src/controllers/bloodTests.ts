import { Request, Response } from 'express';

interface BloodTestRequest {
    testName: string;
    value: number;
    unit: string;
}

interface NormalRange {
    min: number;
    max: number;
    unit: string;
}

const normalRanges: Record<string, NormalRange> = {
    'hemoglobin': { min: 12.0, max: 17.5, unit: 'g/dL' },
    'glucose': { min: 70, max: 100, unit: 'mg/dL' },
    'cholesterol': { min: 0, max: 200, unit: 'mg/dL' },
    'triglycerides': { min: 0, max: 150, unit: 'mg/dL' },
    'hdl': { min: 40, max: 60, unit: 'mg/dL' },
    'ldl': { min: 0, max: 100, unit: 'mg/dL' },
    'creatinine': { min: 0.6, max: 1.2, unit: 'mg/dL' },
    'urea': { min: 7, max: 20, unit: 'mg/dL' },
    'sodium': { min: 136, max: 145, unit: 'mEq/L' },
    'potassium': { min: 3.5, max: 5.0, unit: 'mEq/L' },
    'calcium': { min: 8.5, max: 10.5, unit: 'mg/dL' },
    'wbc': { min: 4500, max: 11000, unit: 'cells/mcL' },
    'rbc': { min: 4.5, max: 5.5, unit: 'million cells/mcL' },
    'platelets': { min: 150000, max: 400000, unit: 'cells/mcL' },
    'hematocrit': { min: 36, max: 50, unit: '%' },
};

export const checkBloodTestNormal = async (req: Request, res: Response): Promise<void> => {
    try {
        const { testName, value, unit }: BloodTestRequest = req.body;

        if (!testName || value === undefined || !unit) {
            res.status(400).json({
                success: false,
                message: 'Please provide testName, value, and unit',
            });
            return;
        }

        const normalizedTestName = testName.toLowerCase().trim();
        const range = normalRanges[normalizedTestName];

        if (!range) {
            res.status(404).json({
                success: false,
                message: `Normal range for '${testName}' not found in database, please check the test name and try again.`,
            });
            return;
        }

        if (range.unit.toLowerCase() !== unit.toLowerCase()) {
            res.status(400).json({
                success: false,
                message: `Unit mismatch. Expected '${range.unit}', but received '${unit}'`,
            });
            return;
        }

        const isNormal = value >= range.min && value <= range.max;
        let status: 'normal' | 'low' | 'high';

        if (value < range.min) {
            status = 'low';
        } else if (value > range.max) {
            status = 'high';
        } else {
            status = 'normal';
        }

        res.status(200).json({
            success: true,
            data: {
                checkedAt: new Date().toISOString(),
                testName,
                value,
                unit,
                isNormal,
                status,
                normalRange: {
                    min: range.min,
                    max: range.max,
                },
                message: isNormal
                    ? `Your ${testName} level is within normal range.`
                    : `Your ${testName} level is ${status}. Normal range is ${range.min}-${range.max} ${range.unit}.`,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while checking blood test',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};