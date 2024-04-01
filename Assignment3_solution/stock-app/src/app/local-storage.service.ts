import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  symbol: string;
  constructor() {}

  saveData(data: any): void {
    const newData = JSON.stringify(data);
    localStorage.setItem('storedData', newData);
  }

  getData(): any {
    const storedDataString = localStorage.getItem('storedData');
    return JSON.parse(storedDataString);
  }

  printItem(route: string) {
    console.log(route);
  }

  // Set a value in local storage
  setItem(value: string): void {
    localStorage.setItem(this.symbol, value);
  }

  // Get a value from local storage
  getItem(): string | null {
    return localStorage.getItem(this.symbol);
  }

  // Remove a value from local storage
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Clear all items from local storage
  clear(): void {
    localStorage.clear();
  }
}
