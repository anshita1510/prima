import dotenv from 'dotenv';
import { sendEmail } from './src/shared/utils/sendEmail';

dotenv.config();

async function debugEmailFlow() {
    console.log('\n🔍 EMAIL CONFIGURATION DEBUG\n');
    console.log('='.repeat(50));

    // Check environment variables
    console.log('\n1️⃣  Environment Variables:');
    console.log('   SMTP_HOST:', process.env.SMTP_HOST || '❌ MISSING');
    console.log('   SMTP_PORT:', process.env.SMTP_PORT || '❌ MISSING');
    console.log('   SMTP_USER:', process.env.SMTP_USER || '❌ MISSING');
    console.log('   SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set (length: ' + process.env.SMTP_PASS.length + ')' : '❌ MISSING');

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('\n❌ Email configuration is incomplete!');
        console.log('   Please check your .env file');
        process.exit(1);
    }

    // Get test email from command line or use SMTP_USER
    const testEmail = process.argv[2] || process.env.SMTP_USER;

    console.log('\n2️⃣  Test Email Details:');
    console.log('   Sending to:', testEmail);
    console.log('   From:', process.env.SMTP_USER);

    // Test email sending
    console.log('\n3️⃣  Sending Test Email...\n');
    console.log('-'.repeat(50));

    try {
        const testOTP = '123456';
        const result = await sendEmail(
            testEmail!,
            'Test OTP - PRIMA Password Reset',
            `Hello,\n\nThis is a TEST email.\n\nYour OTP is: ${testOTP}\n\nThis OTP will expire in 5 minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nPRIMA Team`
        );

        console.log('-'.repeat(50));
        console.log('\n✅ SUCCESS! Email sent successfully!');
        console.log('   Message ID:', result.messageId);
        console.log('   Response:', result.response);

        console.log('\n4️⃣  Next Steps:');
        console.log('   1. Check your email inbox: ' + testEmail);
        console.log('   2. Check your SPAM/JUNK folder');
        console.log('   3. Wait 1-2 minutes for delivery');
        console.log('   4. If still not received, check Gmail settings');

        console.log('\n5️⃣  Troubleshooting:');
        console.log('   • Gmail may filter automated emails to spam');
        console.log('   • Check if App Password is still valid');
        console.log('   • Verify 2-Step Verification is enabled on Gmail');
        console.log('   • Try sending to a different email address');

    } catch (error: any) {
        console.log('-'.repeat(50));
        console.log('\n❌ FAILED! Email could not be sent');
        console.log('   Error:', error.message);

        if (error.code === 'EAUTH') {
            console.log('\n   🔧 Authentication Error:');
            console.log('      • Your Gmail App Password may be invalid');
            console.log('      • Generate a new one at: https://myaccount.google.com/apppasswords');
            console.log('      • Update SMTP_PASS in .env file');
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
            console.log('\n   🔧 Connection Error:');
            console.log('      • Check your internet connection');
            console.log('      • Verify port 587 is not blocked by firewall');
            console.log('      • Try again in a few moments');
        } else {
            console.log('\n   🔧 Unknown Error:');
            console.log('      Full error:', error);
        }
    }

    console.log('\n' + '='.repeat(50) + '\n');
}

debugEmailFlow();
