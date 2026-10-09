export const T = {
  green: '#0B6B3A', green2: '#138A43', mint: '#E3F6EA', mint2: '#BFEBD0', bg: '#F4F5FB', card: '#FFFFFF',
  ink: '#101828', mute: '#667085', line: '#E7E9F2', lav: '#E8EAF9', red: '#E11D48', redBg: '#FFE4E6',
  amber: '#B45309', amberBg: '#FEF3C7', amberLine: '#F5D58A', slate: '#475467',
};
export const shadow = { shadowColor: '#1B2559', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 };
export const money = (n: number) => `LKR ${n.toLocaleString('en-US')}`;

export function emojiFor(category = '', name = '') {
  const s = `${category} ${name}`.toLowerCase();
  if (/dairy|milk|chilled|yogh|cheese|egg/.test(s)) return '🥛';
  if (/onion|produce|veg|fresh|carrot|potato/.test(s)) return '🧅';
  if (/pulse|dhal|lentil|bean/.test(s)) return '🫘';
  if (/grain|rice|flour|staple/.test(s)) return '🌾';
  if (/biscuit|snack|cracker|cookie/.test(s)) return '🍪';
  if (/fruit|apple|banana|mango/.test(s)) return '🍎';
  if (/bread|bak/.test(s)) return '🍞';
  if (/drink|beverage|juice|tea|coffee/.test(s)) return '🥤';
  if (/fish|meat|chicken/.test(s)) return '🐟';
  return '🛒';
}

export function timeAgo(iso?: string) {
  if (!iso) return '';
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}
