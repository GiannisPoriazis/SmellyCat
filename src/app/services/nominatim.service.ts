import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NominatimService {
  private apiUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  search(query: string): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      params: {
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '5',
      },
      headers: {
        'Accept-Language': 'en',
      }
    });
  }
}
