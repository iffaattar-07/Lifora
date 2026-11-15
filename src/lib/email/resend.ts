interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendCareNotificationEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'notifications@lifora.care';

  if (!apiKey) {
    console.warn('[Lifora Email Service] RESEND_API_KEY is not configured. Email logged to console:');
    console.info(`To: ${Array.isArray(to) ? to.join(', ') : to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
    }

    return { success: true, simulated: false };
  } catch (error) {
    console.error('[Lifora Email Service] Failed to send email:', error);
    return { success: false, error };
  }
}
