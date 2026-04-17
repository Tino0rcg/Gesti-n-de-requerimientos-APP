"use server"

import { renderToBuffer } from "@react-pdf/renderer";
import nodemailer from "nodemailer";
import { TicketPDF } from "@/components/pdf/ticket-pdf";
import { tickets, users, notes as globalNotes } from "@/lib/data";

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.BREVO_SMTP_LOGIN || 'test',
        pass: process.env.BREVO_SMTP_KEY || 'test',
    }
});

export async function sendTicketNotification(ticketId: string, actionType: string) {
    try {
        // 1. Recopilar info
        const ticket = tickets.find(t => t.id === ticketId);
        if (!ticket) return { success: false, error: 'Ticket no encontrado' };
        
        const notes = globalNotes.filter(n => n.ticketId === ticketId);
        const submitter = users.find(u => u.id === ticket.submitterId);
        const assignee = users.find(u => u.id === ticket.assigneeId);

        // 2. Renderizar PDF estructurado
        const element = TicketPDF({ 
            ticket, 
            notes, 
            submitterName: submitter?.name || 'Cliente', 
            assigneeName: assignee?.name || 'Soporte' 
        });

        const pdfBuffer = await renderToBuffer(element as any);

        // 3. Evaluar si las credenciales de entorno existen (si no, simular por consol)
        if (!process.env.BREVO_SMTP_KEY) {
            console.log("\n================ [ ENTORNO LOCAL ] ================");
            console.log(`📡 BREVO MOCK EMAIL TRIGGER -> ${actionType}`);
            console.log(`📩 Destino: ${submitter?.email}`);
            console.log(`📎 Adjunto PDF Listo: ReporteOperativo_${ticket.id}.pdf (${(pdfBuffer.length / 1024).toFixed(2)} KB)`);
            console.log(`⚠️ Para activar envíos reales, declara BREVO_SMTP_KEY en .env.local y reinicia.`);
            console.log("===================================================\n");
            return { success: true, simulated: true };
        }

        // 4. Despacho real con Brevo SMTP
        await transporter.sendMail({
            from: `"Soporte Vanguardia" <${process.env.BREVO_EMAIL}>`, // Cambia esto por tu dominio verificado
            to: process.env.BREVO_EMAIL, // SE ENVÍA A TI MISMO PARA PRUEBAS (En vez de a un correo de submitter falso)
            subject: `[Ticket ${ticket.id}] Actualización: ${actionType}`,
            html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #09090b;">Hola ${submitter?.name},</h2>
                    <p>El ticket <strong>${ticket.subject}</strong> acaba de registrar actividad en la plataforma.</p>
                    <p style="padding: 12px; background: #f4f4f5; border-left: 4px solid #3b82f6; border-radius: 4px;">
                        <strong>Evento Operativo:</strong> ${actionType}
                    </p>
                    <p>Por políticas de trazabilidad y transparencia corporativa, hemos adjuntado a este correo un reporte en formato PDF que contiene el estado del Semáforo SLA y la bitácora íntegra de conversación e hitos de sistema.</p>
                    <p style="margin-top: 30px; font-size: 12px; color: #71717a;">Este es un correo puramente automatizado.</p>
                </div>
            `,
            attachments: [
                {
                    filename: `Trazabilidad_${ticket.id}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                }
            ]
        });

        return { success: true };
    } catch (error) {
        console.error("Error al procesar la notificación Brevo PDF:", error);
        return { success: false, error: String(error) };
    }
}
