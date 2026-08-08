import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { TimetableProject } from '../types/timetable';

export function exportProjectToJson(project: TimetableProject): void {
  const updatedProject = {
    ...project,
    updatedAt: new Date().toISOString(),
  };
  const jsonString = JSON.stringify(updatedProject, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  const fileName = `${project.name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.json`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importProjectFromJson(file: File): Promise<TimetableProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const project = JSON.parse(content) as TimetableProject;
        if (!project.teachers || !project.classes || !project.subjects || !project.curriculum) {
          throw new Error('Érvénytelen projekt fájl formátum!');
        }
        resolve(project);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Hiba történt a fájl feldolgozása során!'));
      }
    };
    reader.onerror = () => reject(new Error('Fájl olvasási hiba!'));
    reader.readAsText(file);
  });
}

export async function exportElementToPdf(
  elementId: string,
  fileName: string = 'orarend.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elem nem található: #${elementId}`);
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const targetWidth = pdfWidth - margin * 2;
  const imgHeight = (canvas.height * targetWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', margin, margin, targetWidth, Math.min(imgHeight, pdfHeight - margin * 2));
  pdf.save(fileName);
}
