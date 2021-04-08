import { ModuleWithProviders, NgModule } from '@angular/core';
import { NavApiConfiguration, NAVAPI_CONFIG } from './navapi.config';

@NgModule()
export class NavApiModule {
    static forRoot(config: NavApiConfiguration): ModuleWithProviders<NavApiModule> {
        return {
            ngModule: NavApiModule,
            providers: [{ provide: NAVAPI_CONFIG, useValue: config }],
        };
    }
}
