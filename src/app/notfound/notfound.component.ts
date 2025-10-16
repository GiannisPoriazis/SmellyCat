import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notfound',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.scss'],
})

export class NotfoundComponent implements OnInit, OnDestroy {
  private previousBodyBg = '';

  ngOnInit(): void {
    this.previousBodyBg = document.body.style.background;
    document.body.style.background = '#fff';
  }

  ngOnDestroy(): void {
    document.body.style.background = this.previousBodyBg;
  }
}
 
