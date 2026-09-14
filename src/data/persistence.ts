import { generateMockData } from '@/data/generateMockData';
import type { AppData } from '@/types';

const STORAGE_KEY = 'linkiq_data_v1';

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.campaigns && parsed.links) {
        return parsed as AppData;
      }
    }
  } catch {
    // ignore
  }
  const data = generateMockData();
  saveData(data);
  return data;
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function resetData(): AppData {
  const data = generateMockData();
  saveData(data);
  return data;
}

export function clearData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
