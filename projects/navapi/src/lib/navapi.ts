import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, Event, NavigationExtras } from '@angular/router';
import { createFeatureSelector, createSelector, select, Selector, Store } from '@ngrx/store';
import { from, Observable, OperatorFunction, ReplaySubject } from 'rxjs';
import { pipeFromArray } from 'rxjs/internal/util/pipe';
import { catchError, concatMap, filter, map, mapTo, retry, skip, take, takeWhile, tap } from 'rxjs/operators';
import { cleanChannel, initChannel, forwardChannel, sendResponse, sendErrorToChild } from './navapi.actions';
import { NavApiConfiguration, NAVAPI_CONFIG } from './navapi.config';
import { Channels } from './navapi.reducer';
import { isDefined } from './navapi.utils';

function isNavigationEnd(e: Event): e is NavigationEnd {
    return e instanceof NavigationEnd;
}

type NavigationExtras2 = Omit<NavigationExtras, 'relativeTo'> & {
    relative?: boolean;
};

interface MyPipe<T> {
    pipe(): Observable<T>;
    pipe<A>(op1: OperatorFunction<T, A>): Observable<A>;
    pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
    pipe<A, B, C>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): Observable<C>;
    pipe<A, B, C, D>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>): Observable<D>;
    pipe<A, B, C, D, E>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>): Observable<E>;
    pipe<A, B, C, D, E, F>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>): Observable<F>;
    pipe<A, B, C, D, E, F, G>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>): Observable<G>;
    pipe<A, B, C, D, E, F, G, H>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>): Observable<H>;
    pipe<A, B, C, D, E, F, G, H, I>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>, op9: OperatorFunction<H, I>): Observable<I>;
}

@Injectable()
export class NavApi implements ActivatedRoute {
    returnId: number | undefined;
    selector: Selector<any, Channels>;

    children = this.route.children;
    component = this.route.component;
    data = this.route.data;
    firstChild = this.route.firstChild;
    fragment = this.route.fragment;
    outlet = this.route.outlet;
    paramMap = this.route.paramMap;
    params = this.route.params;
    parent = this.route.parent;
    pathFromRoot = this.route.pathFromRoot;
    queryParamMap = this.route.queryParamMap;
    queryParams = this.route.queryParams;
    root = this.route.root;
    routeConfig = this.route.routeConfig;
    snapshot = this.route.snapshot;
    url = this.route.url;

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

    close<T>(responseData: T) {
        if (this.returnId !== undefined) {
            this.store.dispatch(sendResponse({ id: this.returnId, data: responseData }));
        } else {
            throw new Error('returnId undefined');
        }
    }

    private startNavigate(commands: any[], extras2: NavigationExtras2 = {}) {
        const returnUrl = this.router.url;
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
        return {
            returnUrl,
            navId: navigation.id,
            channel: this.store.pipe(
                select(selector),
                skip(1),
                takeWhile(isDefined),
            ),
        };
    }

    navigate<T>(commands: any[], extras2: NavigationExtras2 = {}): Observable<T> {
        const x = this.startNavigate(commands, extras2);
        const response = new ReplaySubject<T>(1);
        x.channel.pipe(
            map(channel => channel.toParent),
            take(1),
            tap(() => this.store.dispatch(cleanChannel({ id: x.navId }))),
            concatMap(result => from(this.router.navigateByUrl(x.returnUrl)).pipe(mapTo(result))),
        ).subscribe(response);
        return response;
    }

    with<T>(commands: any[], extras2: NavigationExtras2 = {}): MyPipe<T> {
        const x = this.startNavigate(commands, extras2);
        const that = this;
        return {
            pipe(...ops: OperatorFunction<any, any>[]) {
                const response = new ReplaySubject<T>(1);
                x.channel.pipe(
                    map(channel => channel.toParent),
                    pipeFromArray(ops),
                    catchError((err, obs) => {
                        that.store.dispatch(sendErrorToChild({ id: x.navId, data: err }));
                        return obs.pipe(retry(10));
                    }),
                    take(1),
                    concatMap(result => from(that.router.navigateByUrl(x.returnUrl)).pipe(mapTo(result))),
                ).subscribe(response);
                return response;
            }
        };
    }
}
