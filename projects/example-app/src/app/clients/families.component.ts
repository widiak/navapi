import { Component, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { NavApi } from 'navapi';
import { RelationsResource } from '../data/resource';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { findStringIn } from './utils';

@Component({
    providers: [NavApi],
    template: ` <h3>Families</h3>
        <input type="text" placeholder="Search" (input)="search($event)" />
        <ul *ngIf="formatted$ | async as families">
            <li *ngFor="let f of families">{{ f.man.name }} + {{ f.woman.name }}; {{ f.children }}</li>
        </ul>`,
})
export class FamiliesComponent implements OnDestroy {
    searchString = new BehaviorSubject('');
    families$ = RelationsResource.getFamilies();
    formatted$ = combineLatest([
        this.families$.pipe(
            map((fs) => fs.map((f) => ({ ...f, children: f.children.map((c) => c.name).join(', ') }))),
            distinctUntilChanged()
        ),
        this.searchString,
    ]).pipe(map(([fs, ss]) => fs.filter((f) => findStringIn(ss, `${f.man.name} ${f.woman.name} ${f.children}`))));

    constructor(protected navApi: NavApi) {}
    search(event$: Event) {
        this.searchString.next((event$.target as HTMLInputElement).value);
    }
    ngOnDestroy() {
        console.log('onDestroy:', this);
    }
}
