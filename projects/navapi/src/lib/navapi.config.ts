import { InjectionToken } from '@angular/core';
import { Selector } from '@ngrx/store';
import { Channels } from './navapi.reducer';

export interface NavApiConfiguration {
    stateKey?: string | Selector<any, Channels>;
}

export const NAVAPI_CONFIG = new InjectionToken<any>('navapi configuration');
