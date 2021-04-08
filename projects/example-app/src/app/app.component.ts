import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    title = 'navapi-example-app';

    constructor(protected router: Router) {}
    navClients() {
        this.router.navigate(['/clients']);
    }
}
