import { Component, AfterViewInit, Input } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  @Input() latitude: number = 40.6345153;
  @Input() longitude: number = 22.9415141;
  @Input() height: string = '400px';
  @Input() width: string = '100%';
  @Input() zoom: number = 17;

  private map!: L.Map;

  ngAfterViewInit(): void {
    this.map = L.map('map', {
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      dragging: false,
      attributionControl: false
    }).setView([this.latitude, this.longitude], this.zoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);
  }
}