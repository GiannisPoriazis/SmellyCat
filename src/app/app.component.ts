import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [
      CommonModule,
      RouterOutlet,
      HeaderComponent,
      FooterComponent
    ]
})
export class AppComponent {
  title = 'smelly-cat';
  showHeaderFooter = true;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute.firstChild;
        let hide = false;
        while (route) {
          if (route.snapshot && route.snapshot.data && route.snapshot.data['hideHeaderFooter']) {
            hide = true;
            break;
          }
          route = route.firstChild;
        }
        return !hide;
      })
    ).subscribe(show => this.showHeaderFooter = show);
  }
}
