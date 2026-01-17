/**
 * ==========================================
 * 📄 EXPORT UTILITIES
 * ==========================================
 * Export sessions to PDF and TXT formats
 */

import jsPDF from 'jspdf';
import { Message, Session, SessionAnalysis } from '@/types';
import { techniques } from '@/data/techniques';

/**
 * Export session to PDF
 */
export async function exportSessionToPDF(
  session: Session,
  messages: Message[],
  analysis?: SessionAnalysis
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper to add new page if needed
  const checkNewPage = (heightNeeded: number) => {
    if (yPosition + heightNeeded > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper to add text with wrapping
  const addText = (
    text: string,
    x: number,
    fontSize: number = 12,
    style: 'normal' | 'bold' = 'normal',
    align: 'left' | 'center' | 'right' = 'left'
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', style);

    const lines = doc.splitTextToSize(text, contentWidth - x + margin);
    const textHeight = lines.length * fontSize * 0.5;

    checkNewPage(textHeight);

    if (align === 'center') {
      doc.text(lines, pageWidth / 2, yPosition, { align: 'center' });
    } else if (align === 'right') {
      doc.text(lines, pageWidth - margin, yPosition, { align: 'right' });
    } else {
      doc.text(lines, x, yPosition);
    }

    yPosition += textHeight + 3;
  };

  // ===== HEADER =====
  doc.setFillColor(5, 5, 8); // Deep Obsidian
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(201, 162, 39); // Gold
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('NEGO', pageWidth / 2, 20, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('Session Report', pageWidth / 2, 30, { align: 'center' });

  yPosition = 50;

  // ===== SESSION INFO =====
  doc.setTextColor(0, 0, 0);
  addText('Session Information', margin, 16, 'bold');
  doc.setLineWidth(0.5);
  doc.setDrawColor(201, 162, 39);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  addText(`Date: ${session.startedAt.toLocaleDateString('he-IL')}`, margin);
  addText(`Time: ${session.startedAt.toLocaleTimeString('he-IL')}`, margin);
  addText(`Duration: ${calculateDuration(session)}`, margin);
  addText(`Difficulty: ${session.difficulty}/8`, margin);
  addText(`Scenario: ${session.scenario.title}`, margin);
  addText(`Your Role: ${session.scenario.userRole}`, margin);
  addText(`AI Role: ${session.scenario.aiRole}`, margin);
  yPosition += 5;

  // ===== ANALYSIS =====
  if (analysis) {
    checkNewPage(50);
    addText('Session Analysis', margin, 16, 'bold');
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    addText(`Score: ${analysis.score}/100`, margin, 14, 'bold');

    // Techniques Used
    if (analysis.techniquesUsed.length > 0) {
      addText('Techniques Used:', margin, 12, 'bold');
      analysis.techniquesUsed.forEach((tech) => {
        const technique = techniques.find((t) => t.code === tech.code);
        addText(
          `• ${technique?.name || tech.code} - Effectiveness: ${tech.effectiveness}/5`,
          margin + 5,
          10
        );
      });
    }

    // Strengths
    if (analysis.strengths.length > 0) {
      yPosition += 3;
      addText('Strengths:', margin, 12, 'bold');
      analysis.strengths.forEach((strength) => {
        addText(`✓ ${strength}`, margin + 5, 10);
      });
    }

    // Improvements
    if (analysis.improvements.length > 0) {
      yPosition += 3;
      addText('Areas for Improvement:', margin, 12, 'bold');
      analysis.improvements.forEach((improvement) => {
        addText(`→ ${improvement}`, margin + 5, 10);
      });
    }

    // Recommendations
    if (analysis.recommendations.length > 0) {
      yPosition += 3;
      addText('Recommendations:', margin, 12, 'bold');
      analysis.recommendations.forEach((rec) => {
        addText(`• ${rec}`, margin + 5, 10);
      });
    }

    // Deal Summary
    if (analysis.dealSummary) {
      yPosition += 3;
      addText('Deal Summary:', margin, 12, 'bold');
      addText(analysis.dealSummary, margin + 5, 10);
    }

    yPosition += 10;
  }

  // ===== CONVERSATION =====
  checkNewPage(40);
  addText('Conversation Transcript', margin, 16, 'bold');
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  messages.forEach((message, index) => {
    checkNewPage(30);

    const isUser = message.role === 'user';
    const speaker = isUser ? 'You' : 'AI Negotiator';
    const timestamp = message.timestamp.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Speaker header
    doc.setFillColor(isUser ? 201 : 100, isUser ? 162 : 100, isUser ? 39 : 100);
    doc.rect(margin, yPosition, contentWidth, 8, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${speaker} [${timestamp}]`, margin + 2, yPosition + 5);

    yPosition += 10;

    // Message content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const lines = doc.splitTextToSize(message.content, contentWidth - 4);
    const textHeight = lines.length * 5;

    checkNewPage(textHeight + 5);

    doc.text(lines, margin + 2, yPosition);
    yPosition += textHeight + 8;

    // Techniques detected
    if (message.techniquesDetected && message.techniquesDetected.length > 0) {
      checkNewPage(10);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Techniques: ${message.techniquesDetected.join(', ')}`,
        margin + 2,
        yPosition
      );
      yPosition += 5;
    }
  });

  // ===== FOOTER =====
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'Generated by NEGO - Professional Negotiation Training',
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  // Save PDF
  const fileName = `NEGO_Session_${session.id}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

/**
 * Export session to TXT
 */
export function exportSessionToTXT(
  session: Session,
  messages: Message[],
  analysis?: SessionAnalysis
): void {
  let content = '';

  // Header
  content += '='.repeat(60) + '\n';
  content += 'NEGO - PROFESSIONAL NEGOTIATION TRAINING\n';
  content += 'Session Report\n';
  content += '='.repeat(60) + '\n\n';

  // Session Info
  content += 'SESSION INFORMATION\n';
  content += '-'.repeat(60) + '\n';
  content += `Date: ${session.startedAt.toLocaleDateString('he-IL')}\n`;
  content += `Time: ${session.startedAt.toLocaleTimeString('he-IL')}\n`;
  content += `Duration: ${calculateDuration(session)}\n`;
  content += `Difficulty: ${session.difficulty}/8\n`;
  content += `Scenario: ${session.scenario.title}\n`;
  content += `Your Role: ${session.scenario.userRole}\n`;
  content += `AI Role: ${session.scenario.aiRole}\n`;
  content += `Goal: ${session.scenario.goal}\n\n`;

  // Analysis
  if (analysis) {
    content += 'SESSION ANALYSIS\n';
    content += '-'.repeat(60) + '\n';
    content += `Score: ${analysis.score}/100\n\n`;

    if (analysis.techniquesUsed.length > 0) {
      content += 'Techniques Used:\n';
      analysis.techniquesUsed.forEach((tech) => {
        const technique = techniques.find((t) => t.code === tech.code);
        content += `  • ${technique?.name || tech.code} - Effectiveness: ${tech.effectiveness}/5\n`;
      });
      content += '\n';
    }

    if (analysis.strengths.length > 0) {
      content += 'Strengths:\n';
      analysis.strengths.forEach((strength) => {
        content += `  ✓ ${strength}\n`;
      });
      content += '\n';
    }

    if (analysis.improvements.length > 0) {
      content += 'Areas for Improvement:\n';
      analysis.improvements.forEach((improvement) => {
        content += `  → ${improvement}\n`;
      });
      content += '\n';
    }

    if (analysis.recommendations.length > 0) {
      content += 'Recommendations:\n';
      analysis.recommendations.forEach((rec) => {
        content += `  • ${rec}\n`;
      });
      content += '\n';
    }

    if (analysis.dealSummary) {
      content += 'Deal Summary:\n';
      content += `  ${analysis.dealSummary}\n\n`;
    }
  }

  // Conversation
  content += 'CONVERSATION TRANSCRIPT\n';
  content += '-'.repeat(60) + '\n\n';

  messages.forEach((message) => {
    const isUser = message.role === 'user';
    const speaker = isUser ? 'YOU' : 'AI NEGOTIATOR';
    const timestamp = message.timestamp.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
    });

    content += `[${timestamp}] ${speaker}:\n`;
    content += `${message.content}\n`;

    if (message.techniquesDetected && message.techniquesDetected.length > 0) {
      content += `  (Techniques: ${message.techniquesDetected.join(', ')})\n`;
    }

    content += '\n';
  });

  // Footer
  content += '\n' + '='.repeat(60) + '\n';
  content += 'Generated by NEGO - Professional Negotiation Training\n';
  content += `Export Date: ${new Date().toLocaleString('he-IL')}\n`;
  content += '='.repeat(60) + '\n';

  // Download
  const fileName = `NEGO_Session_${session.id}_${new Date().toISOString().split('T')[0]}.txt`;
  downloadTextFile(content, fileName);
}

/**
 * Calculate session duration
 */
function calculateDuration(session: Session): string {
  const end = session.completedAt || new Date();
  const start = session.startedAt;
  const durationMs = end.getTime() - start.getTime();
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Download text file
 */
function downloadTextFile(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export summary statistics to PDF
 */
export async function exportStatsToPDF(stats: any): Promise<void> {
  // TODO: Implement stats export
  console.log('Stats export coming soon', stats);
}
