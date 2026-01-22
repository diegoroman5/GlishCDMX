/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GOOGLE APPS SCRIPT - GLISH LEAD CAPTURE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * INSTRUCCIONES DE CONFIGURACIÓN:
 * 
 * 1. Crea una nueva Google Sheet
 * 2. Añade estos encabezados en la primera fila:
 *    A1: Timestamp | B1: Nombre | C1: WhatsApp | D1: Horario | E1: Fuente
 * 
 * 3. Ve a Extensiones > Apps Script
 * 4. Borra el código existente y pega este archivo completo
 * 5. Guarda (Ctrl+S)
 * 
 * 6. Despliega como aplicación web:
 *    - Click en "Implementar" > "Nueva implementación"
 *    - Tipo: Aplicación web
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquiera
 *    - Click en "Implementar"
 * 
 * 7. Copia la URL de la aplicación web
 * 8. Pega la URL en main.js donde dice GOOGLE_SHEETS_URL
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Handle POST requests from the landing page
function doPost(e) {
    try {
        // Parse the incoming data
        const data = JSON.parse(e.postData.contents);

        // Get the active spreadsheet
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

        // Append new row with the lead data
        sheet.appendRow([
            data.timestamp || new Date().toLocaleString('es-MX'),
            data.name,
            data.whatsapp,
            data.schedule,
            data.source || 'Landing Page'
        ]);

        // Return success response
        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'success', 'row': sheet.getLastRow() }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        // Return error response
        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// Handle GET requests (for testing)
function doGet(e) {
    return ContentService
        .createTextOutput(JSON.stringify({ 'status': 'Glish Lead Capture Script is running!' }))
        .setMimeType(ContentService.MimeType.JSON);
}

// Optional: Send email notification for each new lead
function sendEmailNotification(data) {
    const recipient = 'tu-email@glish.com'; // Cambia esto por tu email
    const subject = '🎯 Nuevo Lead: ' + data.name;
    const body = `
    Nuevo lead desde la landing page de Glish:
    
    Nombre: ${data.name}
    WhatsApp: ${data.whatsapp}
    Horario preferido: ${data.schedule}
    Fecha/Hora: ${data.timestamp}
    Fuente: ${data.source}
    
    ¡Contacta al prospecto pronto!
  `;

    MailApp.sendEmail(recipient, subject, body);
}
