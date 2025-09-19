import { Injectable } from '@angular/core';

function _window(): any {
  return window;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  
  getItem(key: string): string | null {
    if (typeof this.window !== 'undefined' && this.window.localStorage) {
      return this.window.localStorage.getItem(key);
    }
    return null;
  }

  setItem(key: string, value: string): void {
    if (typeof this.window !== 'undefined' && this.window.localStorage) {
      this.window.localStorage.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    if (typeof this.window !== 'undefined' && this.window.localStorage) {
      this.window.localStorage.removeItem(key);
    }
  }

  get window(): any {
    return _window();
  }
}