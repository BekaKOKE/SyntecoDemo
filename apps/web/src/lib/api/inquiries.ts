export type PublicInquiryItem = {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type PublicInquiryPayload = {
  companyName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  priority?: 'high' | 'normal' | 'low';
  notes?: string;
  items?: PublicInquiryItem[];
};

export async function submitPublicInquiry(payload: PublicInquiryPayload) {
  const csrfRes = await fetch('/api/v1/csrf-token', { cache: 'no-store' });
  if (!csrfRes.ok) {
    throw new Error('Не удалось подготовить защищенную отправку заявки');
  }

  const csrfData = await csrfRes.json() as { token?: string };
  const csrfToken = csrfData.token;
  if (!csrfToken) {
    throw new Error('Не удалось получить токен отправки заявки');
  }

  const res = await fetch('/api/v1/admin/inquiries/public', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Не удалось отправить заявку');
  }

  return res.json();
}
