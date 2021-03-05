# NavApi

```ts
function NavApiFactory<RFn>(f: RFn) { ... }
export const NavApi = NavApiFactory((<R>r: { data: R, meta: 'submitted' | 'nieco'}) => r);	// mozno to ide spravit aj cez overload ??; default: <R>(r: R | null) => r

class NavApi {
	static forId(fn) => ...,
	constructor(protected store: Store, route: Route, router: Router, injector: Injector) {
	}
	// musim mat, ze co je to za triedu
	getOrCreate(params: { deps: any[] }) {
		// ziskaj ID z activatedRoute
		// hladam podla ID 	-> mam -> overim, ci je to ta moja -> vratim
		//					-> nemam -> vytvorim di
		const di = Injector.create({
			provides: [],
			parent: this.injector,
		})
	}
	route: ExtenedRoute // preklapa id-cko z url na nejake vlastne id-cko a skryje ho (bezpecnost), ponuka parametre/stream volajuceho
	
	open<P, R>(commands: any[], extras: NavigationExtras): Observable<{ data: R | meta: any}>;	// relativeTo -> relativeToSelf, hiddenParam: any; null znamena nič
	open2<P, R>(commands: any[], extras: NavigationExtras): { toParent: Observable<R>, toChild: Subject<P> };	// dvojito
	openModal<P, R>(commands: any[], extras: NavigationExtras): { then: OperatorFunction<R, ?> };	// dvojito
	open<T>(definition): // pekna vlastnost
	close(...): Observable<any>;	// v tomto pripade by sme hneď vedeli, čo posielať do close, lebo protokol
}

class MyService {
	constructor(
		params: { 
			nejakyUrlParam: string, 
			nejakySpecificConstant: string 
		}, 
		uniqueId: string,
		http: HttpClient
	) {
	}
}

@Component({
	provides:[NavApi.forId(id => `{id}-myService`)],	// tu mi asi vznikne vzdy nova NavApi pre dany ActivatedRoute, inak by som si ju musel stvorit v konstruktore sam
})
class MyComponent {
	service?: MyService;
	
	constructor(navApi: NavApi) {
		navApi.route.params.pipe(takeUntil(this.destroySignal)).subscribe(p => {
			this.service = navApi.getOrCreate({ 
				provide: MyService, 
				deps: [HttpClient], 
				useFactory: (uniqueId, ...args) => new MyService({ }, ...args),
			});	
			this.service = navApi.getOrCreate(
				MyService, 
				[HttpClient], 
				(uniqueId, ...args) => new MyService({ nejakyUrlParam: p['nieco'], nejakySpecificConstant: 5 }, ...args)
			);			
		})
	}
}

pipe(
	concatMap(() => navApi.openModal<MojTyp>(
			['chcem', 'ist', 'niekam'],
			{ relativeToSelf: true, param: 7 }
		).then(
			pipe(
				concatMap(r => this.resource.api(r)),
			),
		)
	},
	concatMap(x => navApi.close({ data: x, meta: 'attach' })),
)

// neviem, na aku zmenu url (ci params, ci optional params, ci queryParams) chceme vytvorit novu MyService - to si musi vyriesit programator
```
