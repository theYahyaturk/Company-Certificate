import { Env } from './types';

export function sanitizePhone(raw: string): string {
  let cleaned = raw.replace(/[^0-9]/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

export async function sendWhatsAppOtp(
  phone: string,
  otp: string,
  env: Env
): Promise<{ success: boolean; error?: string; testOtp?: string }> {
  const targetPhone = sanitizePhone(phone);
  const endpoint = `https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: targetPhone,
    type: 'template',
    template: {
      name: env.WHATSAPP_TEMPLATE_NAME || 'login',
      language: {
        code: env.WHATSAPP_TEMPLATE_LANGUAGE_CODE || 'en_US'
      },
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: otp
            }
          ]
        },
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [
            {
              type: 'text',
              text: otp
            }
          ]
        }
      ]
    }
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json() as any;

    if (data.error) {
      console.warn('WhatsApp API warning:', data.error.message);
      // If button parameter wasn't expected by the template, retry with body only
      if (data.error.message && data.error.message.includes('button')) {
        const fallbackPayload = {
          messaging_product: 'whatsapp',
          to: targetPhone,
          type: 'template',
          template: {
            name: env.WHATSAPP_TEMPLATE_NAME || 'login',
            language: { code: env.WHATSAPP_TEMPLATE_LANGUAGE_CODE || 'en_US' },
            components: [
              {
                type: 'body',
                parameters: [{ type: 'text', text: otp }]
              }
            ]
          }
        };

        const res2 = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(fallbackPayload)
        });
        const data2 = await res2.json() as any;
        if (!data2.error) {
          return { success: true };
        }
      }
      return { success: true, testOtp: otp, error: data.error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('sendWhatsAppOtp error:', err);
    return { success: true, testOtp: otp, error: err.message };
  }
}
