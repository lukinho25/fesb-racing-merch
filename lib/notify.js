/**
 * Obavijest adminu o novoj narudžbi.
 *
 * Šalje se preko Resend REST API-ja (bez dodatnog paketa) i samo ako su
 * RESEND_API_KEY i ADMIN_EMAIL postavljeni. Bez njih narudžba svejedno
 * prolazi - admin je vidi na /admin/narudzbe.
 */
export async function notifyNewOrder(order) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  if (!apiKey || !to) return { sent: false, reason: 'nije konfigurirano' };

  const lines = order.items.map(
    (item) =>
      `- ${item.name}${item.size ? ` (${item.size})` : ''} x${item.quantity} = ${(
        item.price * item.quantity
      ).toFixed(2)} €`
  );

  const text = [
    `Nova narudžba od: ${order.firstName} ${order.lastName}`,
    `E-mail: ${order.email}`,
    order.phone ? `Telefon: ${order.phone}` : null,
    '',
    ...lines,
    '',
    `Ukupno: ${order.total.toFixed(2)} €`,
    order.note ? `\nNapomena: ${order.note}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? 'FESB Racing Merch <onboarding@resend.dev>',
        to: [to],
        reply_to: order.email,
        subject: `Nova narudžba: ${order.firstName} ${order.lastName} (${order.total.toFixed(2)} €)`,
        text,
      }),
    });

    if (!response.ok) {
      console.error('Resend odbio poruku:', response.status, await response.text());
      return { sent: false, reason: `HTTP ${response.status}` };
    }

    return { sent: true };
  } catch (err) {
    // Narudžba je već spremljena; neuspjeli mail ne smije srušiti checkout.
    console.error('Slanje obavijesti nije uspjelo:', err);
    return { sent: false, reason: 'greška pri slanju' };
  }
}
