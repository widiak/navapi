import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    template: `
        <button (click)="navClients()">Persons</button>
        <button (click)="navFamilies()">Families</button>
        <hr />
        <router-outlet></router-outlet>
    `,
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    title = 'navapi-example-app';

    constructor(protected router: Router) {}
    navClients() {
        this.router.navigate(['/clients']);
    }
    navFamilies() {
        this.router.navigate(['/families']);
    }
}
