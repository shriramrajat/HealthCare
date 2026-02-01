import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ConsultationRecord } from '../types';

export const generatePrescriptionPDF = (record: ConsultationRecord) => {
    const doc = new jsPDF();
    const themeColor = '#2563eb'; // Blue-600

    // --- Header ---
    // Logo placeholder (HealthCare+)
    doc.setTextColor(themeColor);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('HealthCare+', 20, 20);

    doc.setTextColor(100);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Your Trusted Healthcare Partner', 20, 26);

    // Clinic Info (Right aligned)
    doc.setFontSize(10);
    doc.setTextColor(60);
    const clinicInfo = [
        'Digital Prescription Record',
        `Date: ${new Date(record.date).toLocaleDateString()}`,
        `Record ID: #${record.id.substring(0, 8).toUpperCase()}`
    ];
    doc.text(clinicInfo, 190, 20, { align: 'right' });

    // Divider
    doc.setDrawColor(200);
    doc.line(20, 32, 190, 32);

    // --- Doctor & Patient Info ---
    let yPos = 45;

    // Doctor Details
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Doctor Details:', 20, yPos);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(record.doctorName, 20, yPos + 6);
    // doc.text('Cardiologist', 20, yPos + 11); // If we had specialization

    // Patient Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Details:', 120, yPos);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(record.patientName, 120, yPos + 6);
    doc.text(`Patient ID: ${record.patientId?.substring(0, 8).toUpperCase()}`, 120, yPos + 11);

    // --- Vitals Section (if available) ---
    yPos += 25;
    if (record.vitalSigns) {
        const vitals = [];
        if (record.vitalSigns.bloodPressure) vitals.push(['BP', record.vitalSigns.bloodPressure]);
        if (record.vitalSigns.heartRate) vitals.push(['Heart Rate', `${record.vitalSigns.heartRate} bpm`]);
        if (record.vitalSigns.temperature) vitals.push(['Temp', `${record.vitalSigns.temperature}°F`]);
        if (record.vitalSigns.weight) vitals.push(['Weight', `${record.vitalSigns.weight} lbs`]);

        if (vitals.length > 0) {
            doc.setFillColor(243, 244, 246); // gray-100
            doc.roundedRect(20, yPos, 170, 20, 2, 2, 'F');

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Vital Signs:', 25, yPos + 13);

            let xOffset = 60;
            doc.setFont('helvetica', 'normal');
            vitals.forEach(([label, value]) => {
                doc.text(`${label}: ${value}`, xOffset, yPos + 13);
                xOffset += 40;
            });
            yPos += 30;
        }
    }

    // --- Diagnosis & Symptoms ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnosis', 20, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(record.diagnosis || 'Not specified', 20, yPos);

    if (record.symptoms && record.symptoms.length > 0) {
        yPos += 12;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Reported Symptoms', 20, yPos);
        yPos += 7;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(record.symptoms.join(', '), 20, yPos);
    }

    yPos += 15;

    // --- Prescription Table ---
    // Since prescription is just a string currently, we'll try to parse it if it looks like a list,
    // otherwise just display it as text block.
    // Ideally, this should be structured data.

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(themeColor);
    doc.text('Rx / Prescription', 20, yPos);
    yPos += 5;

    // We'll use autoTable for the layout even if it's just one big cell, or split by lines
    const prescriptionLines = record.prescription
        ? record.prescription.split('\n').map(line => [line])
        : [['No prescription recorded.']];

    autoTable(doc, {
        startY: yPos,
        head: [['Medication / Instructions']],
        body: prescriptionLines,
        theme: 'grid',
        headStyles: { fillColor: themeColor },
        styles: { fontSize: 10, cellPadding: 4 },
    });

    // --- Notes / Advice ---
    if (record.notes) {
        const finalY = (doc as any).lastAutoTable.finalY || yPos + 20;
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');
        doc.text('Clinical Notes / Advice:', 20, finalY + 15);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const splitNotes = doc.splitTextToSize(record.notes, 170); // Wrap text
        doc.text(splitNotes, 20, finalY + 22);
    }

    // --- Footer ---
    const pageHeight = doc.internal.pageSize.height;

    // Digital Signature Placeholder
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Digitally signed by ${record.doctorName}`, 190, pageHeight - 30, { align: 'right' });
    doc.line(130, pageHeight - 32, 190, pageHeight - 32); // Signature line

    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This is a digitally generated prescription and does not require a physical signature.', 105, pageHeight - 15, { align: 'center' });

    // Save
    doc.save(`Prescription_${record.date.split('T')[0]}_${record.patientName.replace(/\s+/g, '_')}.pdf`);
};
