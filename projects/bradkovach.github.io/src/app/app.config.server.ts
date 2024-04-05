import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { STORAGE } from './routes/choice-gas/pages/explorer/localStorageSignal';

class MemoryStorage implements Storage {
  private store = new Map<string, any>();
  [name: string]: any;
  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] || null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    { provide: STORAGE, useClass: MemoryStorage },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
