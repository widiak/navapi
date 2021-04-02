import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, Event, NavigationExtras } from '@angular/router';
import { createFeatureSelector, createSelector, select, Selector, Store } from '@ngrx/store';
import { from, ReplaySubject } from 'rxjs';
import { concatMap, filter, map, mapTo, skip, take, takeWhile, tap } from 'rxjs/operators';
import { cleanChannel, initChannel, forwardChannel, sendResponse } from './navapi.actions';
import { NavApiConfiguration, NAVAPI_CONFIG } from './navapi.config';
import { Channels } from './navapi.reducer';
import { isDefined } from './navapi.utils';

function isNavigationEnd(e: Event): e is NavigationEnd {
    return e instanceof NavigationEnd;
}

type NavigationExtras2 = Omit<NavigationExtras, 'relativeTo'> & {
    relative?: boolean;
};

@Injectable()
export class NavApi {
    returnId: number | undefined;
    selector: Selector<any, Channels>;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        @Inject(NAVAPI_CONFIG) configuration: NavApiConfiguration,
        private store: Store<any>
    ) {
        this.router.events
            .pipe(
                filter(isNavigationEnd),
                tap(e => (this.returnId = e.id)),
                take(1)
            )
            .subscribe();
        const stateKey = configuration.stateKey || 'navapi';
        this.selector = typeof stateKey === 'string' ? createFeatureSelector<Channels>(stateKey) : stateKey;
    }

    navigate(commands: any[], extras2: NavigationExtras2 = {}) {
        const currentUrl = this.router.url;
        const { relative, ...extras } = extras2;
        this.router.navigate(commands, {
            ...extras,
            relativeTo: relative ? this.route : undefined,
        });
        const navigation = this.router.getCurrentNavigation();
        if (!navigation) { 
            throw new Error('no navigation');
        }
        if (!this.returnId) {
            throw new Error('no returnId');
        }
        const selector = createSelector(this.selector, state => state[navigation.id]);

        this.store.dispatch(extras.replaceUrl
            ? forwardChannel({ id: navigation.id, forwardTo: this.returnId })
            : initChannel({ id: navigation.id })
        );
        const response = new ReplaySubject<any>(1);
        this.store.pipe(
            select(selector),
            skip(1),
            takeWhile(isDefined),
            map(channels => channels.toParent),
            take(1),
            tap(() => this.store.dispatch(cleanChannel({ id: navigation.id }))),
            concatMap(result => from(this.router.navigateByUrl(currentUrl)).pipe(mapTo(result))),
        ).subscribe(response);
        return response;
    }

    close(responseData: any) {
        if (this.returnId !== undefined) {
            this.store.dispatch(sendResponse({ id: this.returnId, data: responseData }));
        } else {
            throw new Error('returnId undefined');
        }
    }
}
