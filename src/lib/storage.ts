import type { FormField } from '../types';

export const STORAGE_KEY = 'auto_fill_assistant_fields_v2';

export const defaultFields: FormField[] = [
  { id: 'full-name', label: 'Full Name', value: '', isDefault: true },
  { id: 'email', label: 'Email', value: '', isDefault: true },
  { id: 'password', label: 'Password', value: '', isDefault: true },
];

function readChromeStorage(): Promise<Record<string, any>> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return Promise.resolve({});
  }

  return chrome.storage.sync.get(STORAGE_KEY);
}

function readChromeLocalStorage(): Promise<Record<string, any>> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return Promise.resolve({});
  }

  return chrome.storage.local.get(STORAGE_KEY);
}

export async function loadFields(): Promise<FormField[]> {
  const syncData = await readChromeStorage();
  const syncFields = Array.isArray(syncData[STORAGE_KEY]) ? syncData[STORAGE_KEY] : [];

  if (syncFields.length > 0) {
    return syncFields;
  }

  const localData = await readChromeLocalStorage();
  const localFields = Array.isArray(localData[STORAGE_KEY]) ? localData[STORAGE_KEY] : [];

  return localFields.length > 0 ? localFields : defaultFields;
}

export async function saveFields(fields: FormField[]) {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return;
  }

  const payload = { [STORAGE_KEY]: fields };

  try {
    await chrome.storage.sync.set(payload);
  } catch {
    await chrome.storage.local.set(payload);
  }
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportFields(fields: FormField[]) {
  downloadJson('auto-fill-assistant-backup.json', { exportedAt: new Date().toISOString(), fields });
}

export function parseImportedFields(rawText: string): FormField[] {
  const parsed = JSON.parse(rawText) as { fields?: FormField[] };
  const fields = Array.isArray(parsed.fields) ? parsed.fields : [];

  if (!fields.length) {
    throw new Error('The backup file does not contain any fields.');
  }

  return fields.map((field) => ({
    id: field.id || `field-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    label: field.label || 'Custom',
    value: field.value || '',
    isDefault: Boolean(field.isDefault),
  }));
}
