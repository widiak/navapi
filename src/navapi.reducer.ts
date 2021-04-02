import { createReducer, on } from '@ngrx/store';
import { cleanChannel, initChannel, forwardChannel, sendResponse } from './navapi.actions';

export interface Channels {
    [key: number]: {
        toParent?: any;
        toChild: any;
        forwardId?: number;
    };
}

export const navapiReducer = createReducer<Channels>(
    {},
    on(initChannel, (state, action) => ({
        ...state,
        [action.id]: { toParent: null, toChild: null },
    })),
    on(forwardChannel, (state, action) => ({
        ...state,
        [action.id]: { toChild: null, forwardId: action.forwardTo },
    })),
    on(sendResponse, (state, action) => {
        function recursiveForward(a: typeof action): typeof state {
            const forwardId = state[a.id].forwardId;
            return forwardId !== undefined
                ? recursiveForward(sendResponse({ id: forwardId, data: a.data }))
                : {
                      ...state,
                      [a.id]: { ...state[a.id], toParent: a.data },
                  };
        }
        return recursiveForward(action);
    }),
    on(cleanChannel, (state, action) => {
        const skippedIds = [action.id];
        function recursiveSearch(id: number) {
            const forwardIds = Object.keys(state)
                .map(k => +k)
                .filter(k => state[k].forwardId === id);
            skippedIds.push(...forwardIds);
            forwardIds.forEach(id => recursiveSearch(id));
        }
        recursiveSearch(action.id);
        const state2 = Object.keys(state)
            .map(k => +k)
            .reduce((s, k) => (skippedIds.includes(k) ? s : { ...s, [k]: state[k] }), {});
        return state2;
    })
);
