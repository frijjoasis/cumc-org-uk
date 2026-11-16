const pad = (n: number) => String(n).padStart(2, '0');

/** A date as a `<input type="datetime-local">` value, in the viewer's time. */
export function toLocalInput(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/** e.g. "17 Nov 2026 @ 7:30pm" */
export function formatShowtime(date: Date | string): string {
  const d = new Date(date);
  const day = d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = d
    .toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(' ', '');
  return `${day} @ ${time}`;
}

export const formatPrice = (price: number) => `£${price.toFixed(2)}`;

/** e.g. "123-456". The server makes its own if this one is taken. */
export function newTicketCode(): string {
  const part = () => Math.floor(Math.random() * 900) + 100;
  return `${part()}-${part()}`;
}
