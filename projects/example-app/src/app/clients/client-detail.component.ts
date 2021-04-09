import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavApi } from 'navapi';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Person, PersonsResource } from '../data/resource';

@Component({
    providers: [NavApi],
    template: ` <div *ngIf="client$ | async as client">
        <h3>Detail: {{ client.name }}</h3>
        <button (click)="close()">Back</button>
        &nbsp; &nbsp;
        <button (click)="showAddresses()">Addresses</button>
        <button (click)="navBoss(1)">Boss</button>
        <router-outlet></router-outlet>
    </div>`,
})
export class ClientDetailComponent implements OnDestroy, OnInit {
    client$: Observable<Person | undefined> | undefined;
    constructor(protected navApi: NavApi) {}
    ngOnInit() {
        this.navApi.params
            .pipe(
                tap((params) => {
                    const clientId = +params['id'];
                    this.client$ = PersonsResource.getPerson(clientId);
                }),
                finalize(() => console.log('uclient-detail: unsubscribed'))
            )
            .subscribe();
    }
    close() {
        this.navApi.close('medved');
    }
    showAddresses() {
        this.navApi.navigate(['/', 'addresses', 1], { replaceUrl: true });
    }
    navBoss(clientId: number) {
        this.navApi.navigate(['../', clientId], {
            relative: true,
            replaceUrl: true,
        });
    }
    ngOnDestroy() {
        console.log('onDestroy:', this);
    }
}
