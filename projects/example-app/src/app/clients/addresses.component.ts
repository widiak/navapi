import { Component, OnDestroy } from '@angular/core';
import { NavApi } from 'navapi';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Address, PersonsResource } from '../data/resource';

@Component({
    providers: [NavApi],
    template: `
        <h3>Addresses</h3>
        <ul *ngIf="addresses$ | async as addresses">
            <li *ngFor="let item of addresses">{{ item.text }}</li>
        </ul>
        <button (click)="close()">Back</button>
    `,
})
export class AddressesComponent implements OnDestroy {
    addresses$: Observable<Address[]> | undefined;
    constructor(private navApi: NavApi) {}
    ngOnInit() {
        this.navApi.params //parent?.params
            .pipe(
                tap((params) => {
                    const clientId = +params['id'];
                    this.addresses$ = PersonsResource.getAddresses(clientId);
                }),
                finalize(() => console.log('uclient-detail: unsubscribed'))
            )
            .subscribe();
    }
    close() {
        this.navApi.close('zajac');
    }
    ngOnDestroy() {
        console.log('onDestroy:', this);
    }
}
