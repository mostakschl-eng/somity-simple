export const BENGALI_MONTHS = [
  { name: 'জানুয়ারি', number: 1 },
  { name: 'ফেব্রুয়ারি', number: 2 },
  { name: 'মার্চ', number: 3 },
  { name: 'এপ্রিল', number: 4 },
  { name: 'মে', number: 5 },
  { name: 'জুন', number: 6 },
  { name: 'জুলাই', number: 7 },
  { name: 'আগস্ট', number: 8 },
  { name: 'সেপ্টেম্বর', number: 9 },
  { name: 'অক্টোবর', number: 10 },
  { name: 'নভেম্বর', number: 11 },
  { name: 'ডিসেম্বর', number: 12 },
];

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '৳০.০০';
  return '৳' + Number(amount).toLocaleString('bn-BD', { minimumFractionDigits: 2 });
}

export function formatDate(date: string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('bn-BD');
}
