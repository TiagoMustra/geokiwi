// Apply the saved palette before React and the stylesheet load.
try {
  const preferences = JSON.parse(localStorage.getItem('geoquest.preferences.v1') || '{}');
  document.documentElement.dataset.theme = preferences?.theme === 'light' ? 'light' : 'dark';
} catch {
  document.documentElement.dataset.theme = 'dark';
}
