import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const provider = process.env.ALERT_PROVIDER || 'console-log';
let twilioClient = null;

if (['twilio-sms', 'twilio-whatsapp'].includes(provider)) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (sid && token) {
    twilioClient = twilio(sid, token);
  } else {
    console.warn('⚠️ Twilio Credentials missing in env. Defaulting alert provider to Console Logger.');
  }
}

export const sendNotification = async (toPhone, message) => {
  const selectedProvider = twilioClient ? provider : 'console-log';
  const fromNum = process.env.TWILIO_FROM_NUMBER || '+14155238886';

  console.log(`[Notification Dispatcher] Initiating message send via provider: ${selectedProvider}`);
  
  if (selectedProvider === 'twilio-sms') {
    try {
      const response = await twilioClient.messages.create({
        body: message,
        from: fromNum,
        to: toPhone
      });
      console.log(`📲 SMS Sent Successfully. SID: ${response.sid}`);
      return response.sid;
    } catch (err) {
      console.error('❌ Twilio SMS dispatch failed:', err.message);
      throw err;
    }
  } else if (selectedProvider === 'twilio-whatsapp') {
    try {
      const response = await twilioClient.messages.create({
        body: message,
        from: fromNum.startsWith('whatsapp:') ? fromNum : `whatsapp:${fromNum}`,
        to: toPhone.startsWith('whatsapp:') ? toPhone : `whatsapp:${toPhone}`
      });
      console.log(`💬 WhatsApp Sent Successfully. SID: ${response.sid}`);
      return response.sid;
    } catch (err) {
      console.error('❌ Twilio WhatsApp dispatch failed:', err.message);
      throw err;
    }
  } else {
    // console-log fallback developer helper
    console.log(`💡 [DEBUG ALERT LOG]
To: ${toPhone}
Body: "${message}"
----------------------------------------`);
    return `log-success-${Date.now()}`;
  }
};
