import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
    constructor(translate: TranslateService) {
    translate.setFallbackLang('en');
    translate.use('en'); // or detect/set device language
  }
}
