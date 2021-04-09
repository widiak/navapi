import { NgModule, OnDestroy } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AddressesComponent } from './clients/addresses.component';
import { ClientDetailComponent } from './clients/client-detail.component';
import { ClientsComponent } from './clients/clients.component';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { navapiReducer, NavApiModule } from 'navapi';
import { FamiliesComponent } from './clients/families.component';

@NgModule({
    declarations: [AppComponent, ClientsComponent, ClientDetailComponent, AddressesComponent, FamiliesComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        StoreModule.forRoot({
            navapi: navapiReducer,
        }),
        NavApiModule.forRoot({}),
        StoreDevtoolsModule.instrument({
            maxAge: 25, // Retains last 25 states
            logOnly: environment.production, // Restrict extension to log-only mode
        }),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule implements OnDestroy {
    ngOnDestroy() {}
}
