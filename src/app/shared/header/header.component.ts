import { Component, HostListener } from '@angular/core';
import { Router, Route, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  navLinks: Array<{ path: string; label: string }> = [];
  menuOpen = false;

  constructor(private router: Router) {
    const routes: Route[] = this.router.config || [];

    this.navLinks = routes
      .filter(r => r.path !== '**')
      .map(r => ({
        path: r.path === '' || r.path === undefined ? '/' : `/${r.path}`,
        label: (r.data && (r.data as any).label) ? (r.data as any).label : this.createLabel(r.path || '')
      }));

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.menuOpen = false;
      }
    });
  }

  private createLabel(path: string) {
    if (!path) return 'Home';
    return path.replace(/[-_/]+/g, ' ').replace(/\b\w/g, s => s.toUpperCase());
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenuOnNav() {
    this.menuOpen = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    const width = (event.target as Window).innerWidth;
    if (width >= 768 && this.menuOpen) {
      this.menuOpen = false;
    }
  }

}
