import nodemailer from 'nodemailer';
import { EmailService } from '../../domain/services/EmailService';
import { getWelcomeEmailTemplate } from './templates/WelcomeEmailTemplate';

export class NodemailerEmailService implements EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
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
            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }
}
