import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    products = [];

    constructor(private readonly http: HttpClient) {
        console.log('fetching products');
    }

    ngOnInit() {
        this.http.get('http://localhost:3000/').subscribe((data: []) => {
            console.log(data);
            this.products = data;
        });
    }

    saveSettings(PORT: number, PASSWORD: string, ROOT: string) {
        console.log(PORT + ' ' + PASSWORD + ' ' + ROOT)
    }
}
