import { Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NavApi } from './navapi';
import { StateRegistry } from './state-registry.service';

type Constructor<T> = { new (...args: any[]): T; DEPS: any[] };

// toto by mozno vedel robit aj samotny Router cez resolve, len by som mal duplicitny kod
//  - raz v router configuracii hovorim, akeho typu potrebujem data
//  - raz v komponente hovorim, akeho typu prijimam data
export class StateFactory {
    constructor(private registry: StateRegistry, private route: ActivatedRoute, private injector: Injector) {}

    get<T>(clazz: Constructor<T>): Observable<T> {
        return this.route.params.pipe(
            map(p => {
                const di = Injector.create({
                    providers: [
                        {
                            provide: NavApi,
                        },
                        {
                            provide: clazz,
                            useFactory: (...args: any) => new clazz(...args),
                            deps: clazz.DEPS,
                        },
                    ],
                    parent: this.injector,
                });
                return di.get(clazz);
            })
        );
    }
}
