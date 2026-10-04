chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action !== 'fill_forms') return;

  const fields = Array.isArray(msg.data) ? msg.data : [];

  fields.forEach((field) => {
    const label = String(field.label || '').trim().toLowerCase();
    const value = field.value || '';

    if (!label || !value) return;

    document.querySelectorAll('input, textarea').forEach((input) => {
      const name = (input.name || '').toLowerCase();
      const id = (input.id || '').toLowerCase();
      const placeholder = (input.placeholder || '').toLowerCase();
      const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();

      if (
        name.includes(label) ||
        id.includes(label) ||
        placeholder.includes(label) ||
        ariaLabel.includes(label)
      ) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });
});
