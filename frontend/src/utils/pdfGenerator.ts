// @ts-ignore
import jsPDF from 'jspdf';
import type { Route } from '../types';

export const generateRoutePDF = (route: Route, driverName: string) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(37, 99, 235); // Blue-600
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('ORDRE DE MISSION', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('TruckManager', 105, 30, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Route Information
  let yPosition = 55;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations de la Route', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  // Route Number
  doc.setFont('helvetica', 'bold');
  doc.text('Numéro de route:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(route.routeNumber || 'N/A', 70, yPosition);
  
  yPosition += 8;
  
  // Date
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  const routeDate = (route as any).scheduledDate || route.createdAt;
  doc.text(routeDate ? new Date(routeDate).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'), 70, yPosition);
  
  yPosition += 8;
  
  // Status
  doc.setFont('helvetica', 'bold');
  doc.text('Statut:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  const statusText = route.status === 'Planned' ? 'Planifiée' : 
                      route.status === 'InProgress' ? 'En cours' : 
                      route.status === 'Completed' ? 'Terminée' : 
                      route.status === 'Cancelled' ? 'Annulée' : route.status;
  doc.text(statusText, 70, yPosition);
  
  yPosition += 15;
  
  // Driver Information
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Chauffeur', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(driverName, 20, yPosition);
  
  yPosition += 15;
  
  // Vehicle Information
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Véhicule', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  if (route.truck) {
    const model = route.truck.model || 'Camion';
    const registration = route.truck.registrationNumber || 'N/A';
    const truckInfo = `${model} - ${registration}`;
    doc.text(truckInfo, 20, yPosition);
    yPosition += 8;
  }
  
  if (route.trailer) {
    const model = route.trailer.model || 'Remorque';
    const registration = route.trailer.registrationNumber || 'N/A';
    const trailerInfo = `Remorque: ${model} - ${registration}`;
    doc.text(trailerInfo, 20, yPosition);
    yPosition += 8;
  }
  
  yPosition += 7;
  
  // Departure Location
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Départ', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  let startAddress = (route as any).departureLocation || route.startLocation?.address || '';
  if (!startAddress && (route as any).departureCoords) {
    const coords = (route as any).departureCoords;
    startAddress = `Coordonnées: ${coords.lat?.toFixed(6) || 'N/A'}, ${coords.lng?.toFixed(6) || 'N/A'}`;
  } else if (!startAddress && route.startLocation?.coordinates) {
    const coords = route.startLocation.coordinates;
    startAddress = `Coordonnées: ${coords.latitude?.toFixed(6) || 'N/A'}, ${coords.longitude?.toFixed(6) || 'N/A'}`;
  }
  if (!startAddress) {
    startAddress = 'Adresse non disponible';
  }
  const startLines = doc.splitTextToSize(startAddress, 170);
  doc.text(startLines, 20, yPosition);
  yPosition += startLines.length * 6 + 5;
  
  // Arrival Location
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Arrivée', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  let endAddress = (route as any).arrivalLocation || route.endLocation?.address || '';
  if (!endAddress && (route as any).arrivalCoords) {
    const coords = (route as any).arrivalCoords;
    endAddress = `Coordonnées: ${coords.lat?.toFixed(6) || 'N/A'}, ${coords.lng?.toFixed(6) || 'N/A'}`;
  } else if (!endAddress && route.endLocation?.coordinates) {
    const coords = route.endLocation.coordinates;
    endAddress = `Coordonnées: ${coords.latitude?.toFixed(6) || 'N/A'}, ${coords.longitude?.toFixed(6) || 'N/A'}`;
  }
  if (!endAddress) {
    endAddress = 'Adresse non disponible';
  }
  const endLines = doc.splitTextToSize(endAddress, 170);
  doc.text(endLines, 20, yPosition);
  yPosition += endLines.length * 6 + 10;
  
  // Distance and Duration
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Distance:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(`${route.distance ? route.distance.toFixed(0) : 0} km`, 50, yPosition);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Durée estimée:', 100, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(`${route.estimatedDuration ? route.estimatedDuration.toFixed(0) : 0} min`, 145, yPosition);
  
  yPosition += 15;
  
  // Cargo Information
  if (route.cargo?.description) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Cargaison', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const cargoLines = doc.splitTextToSize(route.cargo.description, 170);
    doc.text(cargoLines, 20, yPosition);
    yPosition += cargoLines.length * 6;
    
    if (route.cargo.weight) {
      yPosition += 5;
      doc.text(`Poids: ${route.cargo.weight} kg`, 20, yPosition);
    }
    
    yPosition += 10;
  }
  
  // Notes
  if ((route as any).notes) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const notesLines = doc.splitTextToSize((route as any).notes, 170);
    doc.text(notesLines, 20, yPosition);
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
      105,
      285,
      { align: 'center' }
    );
    doc.text(`Page ${i} sur ${pageCount}`, 105, 290, { align: 'center' });
  }
  
  // Save the PDF
  const fileName = `Ordre_Mission_${route.routeNumber || route._id}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
