import dotenv from 'dotenv';
import { sendEmail } from './src/shared/utils/sendEmail';

dotenv.config();

async function testEmail() {
    console.log('🧪 Testing email configuration...\n');

    console.log('Environment variables:');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✓ Set' : '✗ Missing');
    console.log('');

    const testEmail = process.env.SMTP_USER || 'test@example.com';

    try {
        console.log(`📧 Sending test email to: ${testEmail}`);
        await sendEmail(
            testEmail,
            'Test Email - PRIMA',
            'This is a test email to verify SMTP configuration is working correctly.'
        );
        console.log('\n✅ Email sent successfully!');
    } catch (error: any) {
        console.error('\n❌ Email test failed:', error.message);
        console.error('Full error:', error);
    }
}

testEmail();
