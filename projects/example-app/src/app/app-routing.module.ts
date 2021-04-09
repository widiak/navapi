import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddressesComponent } from './clients/addresses.component';
import { ClientDetailComponent } from './clients/client-detail.component';
import { ClientsComponent } from './clients/clients.component';
import { FamiliesComponent } from './clients/families.component';

const routes: Routes = [
    {
        path: 'clients',
        component: ClientsComponent,
    },
    {
        path: 'clients/:id',
        component: ClientDetailComponent,
        children: [
            {
                path: 'addresses',
                component: AddressesComponent,
            },
        ],
    },
    {
        path: 'families',
        component: FamiliesComponent,
    },
    {
        path: 'addresses/:id',
        component: AddressesComponent,
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
