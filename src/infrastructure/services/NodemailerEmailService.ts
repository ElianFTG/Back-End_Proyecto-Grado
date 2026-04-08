import dns from 'dns';
dns.setDefaultResultOrder('ipv4first')

import { EmailService } from '../../domain/services/EmailService';
import { getWelcomeEmailTemplate } from './templates/WelcomeEmailTemplate';
import nodemailer from 'nodemailer';

export class NodemailerEmailService implements EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Esto funciona mejor en entornos cloud como Railway
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            // Timeouts más generosos para Railway
            connectionTimeout: 30000,
            greetingTimeout: 15000,
            socketTimeout: 30000,
        } as nodemailer.TransportOptions);
    }

    async sendCredentials(to: string, username: string, temporaryPassword: string, recipientName: string): Promise<boolean> {
        const htmlContent = getWelcomeEmailTemplate(recipientName, username, temporaryPassword);

        const mailOptions = {
            from: `"SICME Electrik" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Credenciales de acceso - SICME Electrik',
            html: htmlContent,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Correo enviado exitosamente. ID:', info.messageId);
            return true;
        } catch (error) {
            console.error('Error enviando correo:', error);
            return false;
        }
    }
}
