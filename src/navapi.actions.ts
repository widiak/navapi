import { createAction, props } from '@ngrx/store';

export const initChannel = createAction('[NavApi] initChannel', props<{ id: number; parent?: number }>());
export const forwardChannel = createAction('[NavApi] forwardChannel', props<{ id: number; forwardTo: number }>());
export const sendResponse = createAction('[NavApi] sendResponse', props<{ id: number; data: any }>());
export const cleanChannel = createAction('[NavApi] cleanChannel', props<{ id: number }>());
