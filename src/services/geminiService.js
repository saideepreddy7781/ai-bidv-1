// Groq AI Service (replacing Gemini)
import Groq from 'groq-sdk';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const groq = new Groq({ apiKey: API_KEY, dangerouslyAllowBrowser: true });

// Prefer a higher quality default model for procurement-grade analysis.
const MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const safeNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const parseJsonFromText = (text) => {
    const raw = String(text || '').trim();
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch {
        // Continue with extraction from markdown/code-fenced output.
    }

    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced?.[1]) {
        try {
            return JSON.parse(fenced[1]);
        } catch {
            // Continue with brace extraction.
        }
    }

    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        const candidate = raw.slice(firstBrace, lastBrace + 1);
        try {
            return JSON.parse(candidate);
        } catch {
            return null;
        }
    }

    return null;
};

const normalizeReasoning = (reasoning, criteriaMap) => {
    if (!reasoning || typeof reasoning !== 'object') {
        return {};
    }

    return Object.entries(reasoning).reduce((acc, [key, value]) => {
        const criterionName = criteriaMap.get(key.toLowerCase()) || key;
        acc[criterionName] = String(value || '').trim();
        return acc;
    }, {});
};

const buildHeuristicEvaluation = (bidData, criteria) => {
    const proposalText = String(bidData?.bidData?.proposalText || '').toLowerCase();
    const has = (pattern) => pattern.test(proposalText);

    const signalScore = [
        has(/architecture|integration|scalable|security|automation|cloud|api/) ? 1 : 0,
        has(/timeline|milestone|delivery|weeks|months/) ? 1 : 0,
        has(/cost|budget|pricing|total|usd|inr|eur/) ? 1 : 0,
        has(/experience|years|projects|case study|track record/) ? 1 : 0,
        has(/iso|compliance|sla|governance|audit/) ? 1 : 0
    ].reduce((sum, n) => sum + n, 0);

    const baseRatio = clamp(0.45 + signalScore * 0.1, 0.45, 0.9);
    const scores = {};
    criteria.forEach((criterion) => {
        const maxWeight = safeNumber(criterion.weight, 0);
        scores[criterion.name] = Math.round(maxWeight * baseRatio);
    });

    const totalWeight = criteria.reduce((sum, c) => sum + safeNumber(c.weight, 0), 0) || 100;
    const weightedScore = criteria.reduce((sum, c) => sum + safeNumber(scores[c.name], 0), 0);
    const totalScore = Math.round((weightedScore / totalWeight) * 100);

    let overall = 'REQUEST_CLARIFICATION';
    if (totalScore >= 80) overall = 'APPROVE';
    else if (totalScore <= 55) overall = 'REJECT';

    return {
        scores,
        totalScore,
        confidence: 0.55,
        reasoning: {
            note: 'Heuristic fallback generated because AI output was unavailable or unstructured.'
        },
        overall_recommendation: overall,
        key_findings: [
            'Proposal was scored using keyword-and-coverage heuristics.',
            'Manual evaluator validation is still required before final decision.'
        ],
        criteriaWeights: criteria.reduce((acc, c) => {
            acc[c.name] = safeNumber(c.weight, 0);
            return acc;
        }, {})
    };
};

const normalizeEvaluationOutput = (rawOutput, criteria) => {
    const criteriaMap = new Map(criteria.map((c) => [String(c.name).toLowerCase(), c.name]));
    const criteriaWeights = criteria.reduce((acc, c) => {
        acc[c.name] = safeNumber(c.weight, 0);
        return acc;
    }, {});

    const normalizedScores = criteria.reduce((acc, c) => {
        const weight = safeNumber(c.weight, 0);
        const rawScore = rawOutput?.scores?.[c.name] ?? rawOutput?.scores?.[String(c.name).toLowerCase()];
        acc[c.name] = Math.round(clamp(safeNumber(rawScore, weight * 0.6), 0, weight));
        return acc;
    }, {});

    const totalWeight = criteria.reduce((sum, c) => sum + safeNumber(c.weight, 0), 0) || 100;
    const weightedScore = criteria.reduce((sum, c) => sum + safeNumber(normalizedScores[c.name], 0), 0);
    const normalizedTotalScore = Math.round((weightedScore / totalWeight) * 100);

    const recommendationRaw = String(rawOutput?.overall_recommendation || '').toUpperCase().trim();
    let overallRecommendation = recommendationRaw;
    if (!['APPROVE', 'REJECT', 'REQUEST_CLARIFICATION'].includes(overallRecommendation)) {
        if (normalizedTotalScore >= 80) overallRecommendation = 'APPROVE';
        else if (normalizedTotalScore <= 55) overallRecommendation = 'REJECT';
        else overallRecommendation = 'REQUEST_CLARIFICATION';
    }

    const keyFindings = Array.isArray(rawOutput?.key_findings)
        ? rawOutput.key_findings.slice(0, 8).map((item) => String(item))
        : [];

    return {
        scores: normalizedScores,
        totalScore: normalizedTotalScore,
        confidence: clamp(safeNumber(rawOutput?.confidence, 0.65), 0, 1),
        reasoning: normalizeReasoning(rawOutput?.reasoning, criteriaMap),
        overall_recommendation: overallRecommendation,
        key_findings: keyFindings,
        criteriaWeights
    };
};

const isAuthError = (error) => {
    const message = String(error?.message || '').toLowerCase();
    const status = Number(error?.status || error?.response?.status || 0);
    return (
        status === 401 ||
        message.includes('invalid api key') ||
        message.includes('invalid_api_key') ||
        message.includes('incorrect api key') ||
        message.includes('unauthorized')
    );
};

const extractByRegex = (text, pattern) => {
    const match = text.match(pattern);
    return match?.[1]?.trim() || null;
};

const buildFallbackAnalysis = (documentText) => {
    const cost = extractByRegex(documentText, /(cost|budget|price)\s*[:\-]?\s*([^\n]+)/i);
    const timeline = extractByRegex(documentText, /(timeline|duration|completion)\s*[:\-]?\s*([^\n]+)/i);
    const teamSize = extractByRegex(documentText, /(team\s*size|team members?)\s*[:\-]?\s*([^\n]+)/i);
    const certifications = Array.from(documentText.matchAll(/\b(iso\s*\d+|cmmi|pmp|soc\s*2)\b/gi)).map((m) => m[0].toUpperCase());

    return {
        summary: 'AI provider is temporarily unavailable. This is a fallback summary generated from document keywords for demo continuity.',
        proposedCost: cost || 'Not clearly specified',
        timeline: timeline || 'Not clearly specified',
        experience: 'Could not infer reliably in fallback mode',
        keyFeatures: ['Fallback analysis mode enabled', 'Manual evaluator review recommended'],
        technicalApproach: 'Automatic model response unavailable; evaluator should review uploaded document details manually.',
        teamSize: teamSize || 'Not clearly specified',
        certifications: certifications.length ? certifications : [],
        risks: ['External AI API authentication failed during analysis'],
        strengths: ['System preserved workflow by generating non-blocking fallback output'],
        warning: 'AI provider authentication failed (invalid API key). Update VITE_GROQ_API_KEY to restore full analysis.'
    };
};

/**
 * Analyze a bid document and extract key information
 * @param {string} documentText - The text content of the document
 * @returns {Promise<Object>} - Extracted information and analysis
 */
export const analyzeDocument = async (documentText) => {
    try {
        const prompt = `You are an AI assistant analyzing a government bid document. Extract and structure the following information from the document:

Document:
${documentText}

IMPORTANT: Create a comprehensive, professional executive summary that:
- Highlights the vendor's unique value proposition
- Summarizes technical capabilities and approach
- Mentions key qualifications and experience
- Notes financial and timeline commitments
- Should be 3-5 sentences that flow naturally

Please provide a JSON response with the following structure:
{
  "summary": "A comprehensive 3-5 sentence executive summary that professionally describes the vendor's proposal, their approach, qualifications, and value proposition. This should be a well-written narrative, not just a single sentence.",
  "proposedCost": "Extracted cost/budget with currency (if mentioned)",
  "timeline": "Project timeline or duration with units",
  "experience": "Company experience and years in relevant domain",
  "keyFeatures": ["list of main features/offerings from the proposal"],
  "technicalApproach": "Detailed description of the technical approach and technologies",
  "teamSize": "Number of team members (if mentioned)",
  "certifications": ["list of certifications mentioned"],
  "risks": ["potential risks or concerns identified in the proposal"],
  "strengths": ["key competitive strengths of this proposal"]
}

Respond ONLY with valid JSON, no additional text.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: MODEL,
            temperature: 0.7,
            max_tokens: 2500,
        });

        const text = completion.choices[0]?.message?.content || "";

        // Parse JSON response
        try {
            const parsed = JSON.parse(text);

            // Ensure summary is comprehensive
            if (parsed.summary && parsed.summary.length < 100) {
                // If summary is too short, enhance it
                parsed.summary = `${parsed.summary} The vendor brings ${parsed.experience || 'significant'} experience, proposes a ${parsed.timeline || 'defined'} timeline, and offers ${parsed.keyFeatures?.length || 'multiple'} key features including ${parsed.technicalApproach || 'robust technical solutions'}.`;
            }

            return parsed;
        } catch (parseError) {
            console.error('Failed to parse Groq response as JSON:', parseError);
            return {
                summary: text,
                error: 'Failed to parse structured data'
            };
        }
    } catch (error) {
        console.error('Error analyzing document:', error);
        if (isAuthError(error)) {
            return buildFallbackAnalysis(documentText);
        }
        throw new Error('Failed to analyze document: ' + error.message);
    }
};

/**
 * Check bid compliance against tender requirements
 * @param {Object} bidData - The bid information
 * @param {Object} tenderRequirements - Tender requirements and criteria
 * @returns {Promise<Object>} - Compliance check results
 */
export const checkCompliance = async (bidData, tenderRequirements) => {
    try {
        const prompt = `You are an AI compliance checker for government bids. Analyze if the bid meets the tender requirements.

Tender Requirements:
${JSON.stringify(tenderRequirements, null, 2)}

Bid Data:
${JSON.stringify(bidData, null, 2)}

Please provide a JSON response with the following structure:
{
  "passed": true/false,
  "score": 0-100,
  "issues": ["list of compliance issues found, empty if none"],
  "requirements_met": ["list of requirements that are met"],
  "requirements_missing": ["list of requirements that are missing"],
  "recommendations": "Suggestions for improvement"
}

Respond ONLY with valid JSON, no additional text.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: MODEL,
            temperature: 0.5,
            max_tokens: 1500,
        });

        const text = completion.choices[0]?.message?.content || "";

        try {
            return JSON.parse(text);
        } catch (parseError) {
            console.error('Failed to parse compliance check response:', parseError);
            return {
                passed: true,
                score: 70,
                issues: [],
                error: 'Failed to parse structured compliance data'
            };
        }
    } catch (error) {
        console.error('Error checking compliance:', error);
        if (isAuthError(error)) {
            return {
                passed: true,
                score: 65,
                issues: ['AI provider auth failed; compliance generated in fallback mode.'],
                requirements_met: [],
                requirements_missing: [],
                recommendations: 'Review tender requirements manually. Update VITE_GROQ_API_KEY to restore full AI compliance checks.',
                warning: 'Fallback compliance used due to invalid AI API key.'
            };
        }
        throw new Error('Failed to check compliance: ' + error.message);
    }
};

/**
 * Generate a comprehensive bid summary
 * @param {Object} bidData - Complete bid information
 * @returns {Promise<string>} - Executive summary
 */
export const generateBidSummary = async (bidData) => {
    try {
        const prompt = `Create a concise executive summary (2-3 paragraphs) of this government bid:

Bid Information:
${JSON.stringify(bidData, null, 2)}

The summary should highlight:
- Key proposal points
- Financial aspects
- Technical capabilities
- Overall value proposition

Provide a professional, objective summary suitable for procurement officers.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: MODEL,
            temperature: 0.7,
            max_tokens: 1000,
        });

        return completion.choices[0]?.message?.content || "Summary generation failed.";
    } catch (error) {
        console.error('Error generating bid summary:', error);
        if (isAuthError(error)) {
            return 'AI provider authentication failed. This summary is unavailable in fallback mode. Please review the bid details manually.';
        }
        throw new Error('Failed to generate summary: ' + error.message);
    }
};

/**
 * Compare multiple bids and generate analysis
 * @param {Array} bids - Array of bid objects with their details
 * @param {Array} criteria - Evaluation criteria
 * @returns {Promise<Object>} - Comparative analysis
 */
export const compareBids = async (bids, criteria) => {
    try {
        const prompt = `You are analyzing multiple bids for a government tender. Provide a comparative analysis.

Evaluation Criteria:
${JSON.stringify(criteria, null, 2)}

Bids to Compare:
${JSON.stringify(bids, null, 2)}

Please provide a JSON response with the following structure:
{
  "rankings": [
    {
      "bidId": "bid-id",
      "vendorName": "vendor name",
      "rank": 1,
      "score": 85,
      "strengths": ["key strengths"],
      "weaknesses": ["key weaknesses"]
    }
  ],
  "comparison_matrix": {
    "Technical Capability": {
      "bidId1": "assessment",
      "bidId2": "assessment"
    }
  },
  "recommendation": "Overall recommendation with reasoning",
  "key_differentiators": ["What sets top bids apart"]
}

Respond ONLY with valid JSON, no additional text.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: MODEL,
            temperature: 0.6,
            max_tokens: 2500,
        });

        const text = completion.choices[0]?.message?.content || "";

        try {
            return JSON.parse(text);
        } catch (parseError) {
            console.error('Failed to parse comparison response:', parseError);
            return {
                rankings: bids.map((bid, index) => ({
                    bidId: bid.id,
                    vendorName: bid.vendorName || 'Unknown',
                    rank: index + 1,
                    score: 75,
                    strengths: [],
                    weaknesses: []
                })),
                error: 'Failed to parse structured comparison data'
            };
        }
    } catch (error) {
        console.error('Error comparing bids:', error);
        if (isAuthError(error)) {
            return {
                rankings: bids.map((bid, index) => ({
                    bidId: bid.id,
                    vendorName: bid.vendorName || 'Unknown',
                    rank: index + 1,
                    score: 60,
                    strengths: ['Fallback ranking'],
                    weaknesses: ['AI provider authentication failed']
                })),
                comparison_matrix: {},
                recommendation: 'AI comparison unavailable due to API key issue. Perform manual evaluation for final decision.',
                key_differentiators: ['Fallback mode active due to invalid AI API key'],
                warning: 'Fallback comparison used.'
            };
        }
        throw new Error('Failed to compare bids: ' + error.message);
    }
};

/**
 * Extract text content from document URL (placeholder - requires backend)
 * In production, this would call a Cloud Function that handles PDF/DOCX parsing
 * @param {string} documentUrl - URL of the document
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromDocument = async (documentUrl) => {
    console.warn('Document text extraction requires backend implementation', documentUrl);
    return 'Document text extraction pending backend implementation. For demo purposes, use manual input.';
};

/**
 * Generate AI-powered evaluation recommendations
 * @param {Object} bidData - Bid information
 * @param {Array} criteria - Evaluation criteria
 * @returns {Promise<Object>} - AI recommendations with scores
 */
export const generateEvaluationRecommendations = async (bidData, criteria) => {
    try {
                const bidContext = {
                        companyName: bidData?.companyName || bidData?.vendorName || 'Unknown Vendor',
                        vendorName: bidData?.vendorName || 'Unknown Vendor',
                        proposalText: String(bidData?.bidData?.proposalText || '').slice(0, 8000),
                        proposedCost: bidData?.bidData?.proposedCost || null,
                        timeline: bidData?.bidData?.timeline || null,
                        experience: bidData?.bidData?.experience || null,
                        teamSize: bidData?.bidData?.teamSize || null,
                        keyFeatures: bidData?.bidData?.keyFeatures || [],
                        technicalApproach: bidData?.bidData?.technicalApproach || null,
                        complianceCheck: bidData?.complianceCheck || null
                };

                const prompt = `You are a senior procurement evaluator. Score this bid against weighted criteria using evidence from the proposal.

Rules:
- Scores per criterion must be integers and cannot exceed that criterion weight.
- Be strict and evidence-based, avoid generic praise.
- If evidence is missing, reduce score and mention the gap.
- Return only JSON.

Evaluation Criteria (with weights):
${JSON.stringify(criteria, null, 2)}

Bid to Evaluate:
${JSON.stringify(bidContext, null, 2)}

Please provide a JSON response with scoring for each criterion:
{
  "scores": {
    "Technical Capability": 35,
    "Financial Proposal": 25,
    "Experience & Track Record": 18,
    "Compliance": 9
  },
  "totalScore": 87,
  "confidence": 0.85,
  "reasoning": {
    "Technical Capability": "Explanation for this score",
    "Financial Proposal": "Explanation for this score"
  },
  "overall_recommendation": "APPROVE/REJECT/REQUEST_CLARIFICATION",
  "key_findings": ["Important findings that influenced the evaluation"]
}

Respond ONLY with valid JSON.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: MODEL,
            temperature: 0.25,
            max_tokens: 2000,
            response_format: { type: 'json_object' },
        });

        const text = completion.choices[0]?.message?.content || "";
        const parsed = parseJsonFromText(text);
        if (parsed) {
            return normalizeEvaluationOutput(parsed, criteria);
        }

        console.error('Failed to parse evaluation recommendations as JSON.');
        const heuristic = buildHeuristicEvaluation(bidData, criteria);
        return {
            ...heuristic,
            error: 'Failed to parse structured evaluation data'
        };
    } catch (error) {
        console.error('Error generating evaluation recommendations:', error);
        if (isAuthError(error)) {
            const heuristic = buildHeuristicEvaluation(bidData, criteria);
            return {
                ...heuristic,
                confidence: 0.35,
                key_findings: ['AI API key invalid; recommendation generated in fallback mode'],
                warning: 'Fallback recommendations used due to invalid AI API key.'
            };
        }
        throw new Error('Failed to generate recommendations: ' + error.message);
    }
};

export default {
    analyzeDocument,
    checkCompliance,
    generateBidSummary,
    compareBids,
    extractTextFromDocument,
    generateEvaluationRecommendations
};
