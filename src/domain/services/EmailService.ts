export interface EmailService {
    sendCredentials(to: string, username: string, temporaryPassword: string, recipientName: string): Promise<boolean>;
}
