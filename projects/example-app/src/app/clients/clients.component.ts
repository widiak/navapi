import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NavApi } from 'navapi';
import { Person, PersonsResource } from '../data/resource';

@Component({
    providers: [NavApi],
    template: ` <h3>Clients</h3>
        <ul *ngIf="clients$ | async as clients">
            <li *ngFor="let item of clients">
                {{ item.id }} - {{ item.name }}
                <button (click)="navDetail(item.id)">Detail</button>
            </li>
        </ul>`,
})
export class ClientsComponent implements OnInit, OnDestroy {
    clients$: Observable<Person[]> | undefined;
    constructor(protected navApi: NavApi) {}
    ngOnInit() {
        this.clients$ = PersonsResource.getPersons();
    }
    navDetail(clientId: number) {
        this.navApi.navigate([clientId], { relative: true });
    }
    ngOnDestroy() {
        console.log('onDestroy:', this);
    }
}
