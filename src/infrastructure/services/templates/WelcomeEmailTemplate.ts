export const getWelcomeEmailTemplate = (recipientName: string, username: string, temporaryPassword: string): string => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #115DD8, #FF641B); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">SICME ELECTRIK</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">¡Bienvenido/a, ${recipientName}!</h2>
            <p style="color: #666; font-size: 16px;">Se ha creado tu cuenta en el sistema SICME Electrik. A continuación encontrarás tus credenciales de acceso:</p>
            
            <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 10px 0;"><strong>Usuario:</strong> <code style="background: #e9e9e9; padding: 4px 8px; border-radius: 4px;">${username}</code></p>
                <p style="margin: 10px 0;"><strong>Contraseña temporal:</strong> <code style="background: #e9e9e9; padding: 4px 8px; border-radius: 4px;">${temporaryPassword}</code></p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="color: #856404; margin: 0;"><strong>⚠️ Importante:</strong> Al iniciar sesión por primera vez, el sistema te pedirá cambiar tu contraseña por una segura.</p>
            </div>
            
            <p style="color: #666; font-size: 14px;">Si no solicitaste esta cuenta, por favor ignora este mensaje.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">Este es un mensaje automático, por favor no responda a este correo.</p>
        </div>
    </div>
    `;
};
