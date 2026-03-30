import { jsPDF } from 'jspdf';
import { uploadFile } from './firebaseService';

const isPlaceholderValue = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    return !normalized || ['not specified', 'n/a', 'unknown company', 'unknown'].includes(normalized);
};

const getPreferredBidIdentity = (bid) => {
    const company = isPlaceholderValue(bid?.companyName) ? '' : String(bid.companyName).trim();
    const vendor = isPlaceholderValue(bid?.vendorName) ? '' : String(bid.vendorName).trim();

    return {
        companyOrVendor: company || vendor || 'Vendor',
        vendor: vendor || company || null
    };
};

/**
 * Generate Approval PDF Blob
 */
export const generateApprovalPdfBlob = (bid) => {
    const doc = new jsPDF();
    const identity = getPreferredBidIdentity(bid);
    // Professional Header
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('BID AWARD CERTIFICATE', 105, 25, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Certificate body
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('AI Bid Evaluation Platform', 105, 55, { align: 'center' });

    // Border
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 65, 170, 140);

    // Content
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('This verifies that the bid submitted by:', 105, 85, { align: 'center' });

    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text(identity.companyOrVendor, 105, 105, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text('has been officially approved and awarded.', 105, 120, { align: 'center' });

    const contentStart = 140;
    const lineHeight = 12;

    doc.setFontSize(11);
    doc.text(`Vendor Name: ${identity.vendor || 'Vendor'}`, 105, contentStart, { align: 'center' });
    doc.text(`Bid Reference ID: ${bid.id}`, 105, contentStart + lineHeight, { align: 'center' });
    doc.text(`Submission Date: ${new Date(bid.submittedAt?.seconds * 1000).toLocaleDateString()}`, 105, contentStart + lineHeight * 2, { align: 'center' });
    doc.text(`Award Date: ${bid.evaluatedAt ? new Date(bid.evaluatedAt).toLocaleDateString() : new Date().toLocaleDateString()}`, 105, contentStart + lineHeight * 3, { align: 'center' });

    // Seal
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(2);
    doc.circle(105, 235, 20);
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235);
    doc.text('OFFICIAL', 105, 233, { align: 'center' });
    doc.text('AWARD', 105, 238, { align: 'center' });

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('This is an electronically generated document. Valid without signature.', 105, 280, { align: 'center' });

    return doc.output('blob');
};

/**
 * Generate Rejection PDF Blob
 */
export const generateRejectionPdfBlob = (bid, rejectionReason, evaluatorName) => {
    const doc = new jsPDF();
    const identity = getPreferredBidIdentity(bid);
    // Add red header
    doc.setFillColor(234, 67, 53); // Google Red
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('BID REJECTION NOTICE', 105, 18, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Body
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('AI Bid Evaluation Platform', 105, 45, { align: 'center' });

    // Border
    doc.setLineWidth(0.5);
    doc.rect(15, 55, 180, 120);

    // Content
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Dear Vendor,', 20, 70);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    const content = [
        { label: 'Company Name:', value: identity.companyOrVendor },
        { label: 'Vendor:', value: identity.vendor },
        { label: 'Bid ID:', value: bid.id.slice(0, 12) },
        { label: 'Submission Date:', value: new Date(bid.submittedAt?.seconds * 1000).toLocaleDateString() },
        { label: 'Evaluation Date:', value: new Date().toLocaleDateString() },
        { label: 'Evaluated By:', value: isPlaceholderValue(evaluatorName) ? null : evaluatorName },
        { label: 'Status:', value: 'REJECTED ✗' }
    ].filter((item) => !isPlaceholderValue(item.value));

    let yPos = 85;
    content.forEach(item => {
        doc.setFont('helvetica', 'bold');
        doc.text(item.label, 25, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(item.value, 80, yPos);
        yPos += 10;
    });

    // Rejection reason
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Rejection Reason:', 20, yPos + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const splitReason = doc.splitTextToSize(rejectionReason || 'No reason provided', 160);
    doc.text(splitReason, 25, yPos + 20);

    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('This is an electronically generated document', 105, 270, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 277, { align: 'center' });

    return doc.output('blob');
};

/**
 * Upload PDF to Storage
 */
export const uploadPdf = async (blob, folder, filename) => {
    try {
        const path = `${folder}/${filename}`;
        const downloadUrl = await uploadFile(blob, path);
        return downloadUrl;
    } catch (error) {
        console.error('Error uploading PDF:', error);
        throw error;
    }
};

/**
 * Helper to download blob directly (for fallback/immediate feedback)
 */
export const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};
