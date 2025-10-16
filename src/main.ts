import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter([
      { path: '', loadComponent: () => import('./app/home/home.component').then(m => m.HomeComponent), data: { label: 'Adopt Kittens' } },
      { path: 'stories', loadComponent: () => import('./app/stories/stories.component').then(m => m.StoriesComponent), data: { label: 'Kitty Stories' } },
      { path: 'about', loadComponent: () => import('./app/about/about.component').then(m => m.AboutComponent), data: { label: 'About Us' } },
      { path: 'blog', loadComponent: () => import('./app/blog/blog.component').then(m => m.BlogComponent), data: { label: 'Blog' } },
      { path: 'contact', loadComponent: () => import('./app/contact/contact.component').then(m => m.ContactComponent), data: { label: 'Contact' } },
      { path: '**', loadComponent: () => import('./app/notfound/notfound.component').then(m => m.NotfoundComponent), pathMatch: 'full', data: { hideHeaderFooter: true } }
    ])
  ]
}).catch(err => console.error(err));
