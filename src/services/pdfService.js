import { jsPDF } from 'jspdf';
import { getBidById, getTenderById } from './firebaseService';

const SAVE_PDF_API = '/api/save-pdf';

/**
 * Generate a PDF report for an evaluation and save it to MongoDB
 * @param {Object} evaluation - The evaluation object
 * @param {Object} tender - Optional tender object (if not in evaluation)
 * @param {Object} bid - Optional bid object (if not in evaluation)
 * @returns {Promise<Object>} - Result of the operation
 */
export const generateAndSavePDF = async (evaluation, tender = null, bid = null) => {
    try {
        // 1. Fetch details if missing
        const tenderData = tender || evaluation.tender || await getTenderById(evaluation.tenderId);
        const bidData = bid || evaluation.bid || await getBidById(evaluation.bidId);

        // 2. Generate PDF
        const doc = new jsPDF();

        // Title
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("Bid Evaluation Report", 20, 20);

        // Meta info
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
        doc.text(`Tender: ${tenderData?.title || 'N/A'}`, 20, 40);
        doc.text(`Bidder: ${bidData?.companyName || 'N/A'}`, 20, 48);

        // Score
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Score: ${evaluation.totalScore}/100`, 20, 65);

        doc.setFontSize(14);
        const recommendationColor = evaluation.recommendation === 'APPROVE' ? [0, 128, 0] : [200, 0, 0];
        doc.setTextColor(...recommendationColor);
        doc.text(`Recommendation: ${evaluation.recommendation}`, 20, 75);

        // Content
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text("Evaluation Comments:", 20, 90);

        const splitText = doc.splitTextToSize(evaluation.comments || "No comments provided.", 170);
        doc.text(splitText, 20, 100);

        // Get Base64
        const pdfBase64 = doc.output('datauristring');
        // Remove prefix "data:application/pdf;base64," if present, usually output('datauristring') includes it.
        // We might want just the base64 part for some DBs, but standard is keep it or just payload.
        // Let's keep it complete for easy display.

        // 3. Send to API
        const response = await fetch(SAVE_PDF_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pdfBase64,
                tenderId: tenderData.id,
                evaluatorId: evaluation.evaluatorId,
                timestamp: new Date().toISOString(),
                metadata: {
                    tenderName: tenderData.title,
                    vendorName: bidData.companyName,
                    score: evaluation.totalScore
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to save PDF: ${response.statusText}`);
        }

        const result = await response.json();
        return { success: true, ...result };

    } catch (error) {
        console.error("Error in generateAndSavePDF:", error);
        return { success: false, error: error.message };
    }
};
