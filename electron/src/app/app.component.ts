import { Component, OnInit } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import LocalConfigJson from '../../default_configs.json'

let app = require('electron').remote.app

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit {
    config = {
        "PORT": 0,
        "PASSWORD": "",
        "ROOT": ""
    }

    constructor(private readonly http: HttpClient) {
        console.log('Start index')
    }

    ngOnInit() {
        this.config.PORT = LocalConfigJson.PORT
        this.config.PASSWORD = LocalConfigJson.PASSWORD
        this.config.ROOT = LocalConfigJson.BASE_PATH
        console.log(this.config)
    }

    saveSettings(PORT: number, PASSWORD: string, ROOT: string) {
        console.log(PORT + ' ' + PASSWORD + ' ' + ROOT)
        app.hello()
        // find way how to call hello function in main.js
    }
}