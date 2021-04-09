import { Action, createReducer, on } from '@ngrx/store';
import { navapiActions } from './navapi.actions';

export interface Channel {
    toParent?: any;
    toChild: any;
    forwardTo?: number;
}

export interface Channels {
    [key: number]: Channel;
}

const initialState: Channels = {};

const reducer = createReducer(
    initialState,
    on(navapiActions.initChannel, (state, { id }) => ({ ...state, [id]: { toParent: null, toChild: null } })),
    on(navapiActions.forwardChannel, (state, { id, forwardTo }) => ({
        ...state,
        [id]: { toChild: null, forwardTo },
    })),
    on(navapiActions.sendResponse, (state, action) => {
        function recursiveForward(a: typeof action): typeof state {
            const forwardId = state[a.id].forwardTo;
            return forwardId !== undefined
                ? recursiveForward(navapiActions.sendResponse({ id: forwardId, data: a.data }))
                : {
                      ...state,
                      [a.id]: { ...state[a.id], toParent: a.data },
                  };
        }
        return recursiveForward(action);
    }),
    on(navapiActions.cleanChannel, (state, { id }) => {
        const skippedIds = [id];
        function recursiveSearch(id: number) {
            const forwardIds = Object.keys(state)
                .map((k) => +k)
                .filter((k) => state[k].forwardTo === id);
            skippedIds.push(...forwardIds);
            forwardIds.forEach((id) => recursiveSearch(id));
        }
        recursiveSearch(id);
        const state2 = Object.keys(state)
            .map((k) => +k)
            .reduce((s, k) => (skippedIds.includes(k) ? s : { ...s, [k]: state[k] }), {});
        return state2;
    })
);

export function navapiReducer(state: Channels | undefined, action: Action) {
    return reducer(state, action);
}
