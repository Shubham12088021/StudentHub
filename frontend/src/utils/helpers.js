export const formatDistanceToNow = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export const formatDuration = (minutes) => {
  if (!minutes) return '0h 0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
};

export const truncate = (str, n = 100) => str?.length > n ? str.slice(0, n) + '...' : str;

export const getInitials = (name = '') => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const CATEGORIES = [
  'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
  'DevOps', 'Cybersecurity', 'UI/UX Design', 'Digital Marketing',
  'Business', 'Photography', 'Music', 'Health & Fitness', 'Language', 'Other',
];

export const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
