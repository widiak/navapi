import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { NavApi } from 'navapi';
import { Person, PersonsResource } from '../data/resource';
import { map } from 'rxjs/operators';
import { findStringIn } from './utils';

@Component({
    providers: [NavApi],
    template: `<h3>Persons</h3>
        <input type="text" placeholder="Search" (input)="search($event)" />
        <ul *ngIf="persons$ | async as persons">
            <li *ngFor="let item of persons">
                {{ item.id }} - {{ item.name }}
                <button (click)="navDetail(item.id)">Detail</button>
            </li>
        </ul>`,
})
export class ClientsComponent implements OnDestroy {
    searchString = new BehaviorSubject('');
    persons$ = combineLatest([PersonsResource.getPersons(), this.searchString]).pipe(
        map(([ps, ss]) => ps.filter((p) => findStringIn(ss, `${p.name}`)))
    );
    constructor(protected navApi: NavApi) {}
    ngOnInit() {}
    navDetail(clientId: number) {
        this.navApi.navigate([clientId], { relative: true });
    }
    search(event$: Event) {
        this.searchString.next((event$.target as HTMLInputElement).value);
    }
    ngOnDestroy() {
        console.log('onDestroy:', this);
    }
}
