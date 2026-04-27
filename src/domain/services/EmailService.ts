export interface EmailService {
    sendCredentials(to: string, username: string, temporaryPassword: string, recipientName: string): Promise<boolean>;
    sendPasswordReseted(to: string, resetedPassword: string, names: string): Promise<boolean>;
}
