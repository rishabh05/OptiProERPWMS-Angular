import { Injectable } from '@angular/core';
import { GridSettings } from '../interface/grid-settings.interface';

@Injectable({
  providedIn: 'root'
})
export class StatePersistingServiceService {

  constructor() { }
  public get<T>(token: string): T {
    const settings = localStorage.getItem(token);
    return settings ? JSON.parse(settings) : settings;
}

public set<T>(token: string, gridConfig: GridSettings): void {
  if(gridConfig==null) localStorage.setItem(token, "");
    localStorage.setItem(token, JSON.stringify(gridConfig));
}
}
