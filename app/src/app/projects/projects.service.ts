import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MerchantList, ProjectDetails } from './projects';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  constructor(private http: HttpClient) {
  }

  getProjects(): Observable<ProjectDetails[]> {
    return of([ {
      id: 1,
      title: 'Vernieuwing speelplein',
      description: 'Het speelplein is een beetje kapot en moet vernieuwd worden',
      budget: {
        amount: 5000,
        currency: 'EUR',
      },
      start_date: '2019-04-01T00:08:00.000Z',
      end_date: '2019-04-20T20:00:00Z',
      action_count: 15000,
      statistics: {
        total: 1250,
        personal: {
          amount: 5,
          last_entry_date: new Date().toISOString(),
        },
      },
    } ]);
  }

  addParticipation(projectId: number, qrContent: string): Observable<ProjectDetails> {
    // forward qr content to server
    return this.getProjects().pipe(map(projects => {
      const project = projects[ 0 ];
      return ({
        ...project,
        statistics: {
          ...project.statistics,
          personal: {
            amount: project.statistics.personal.amount + Math.random() * 10,
            last_entry_date: project.statistics.personal.last_entry_date,
          },
        },
      });
    }));
  }

  getProjectMerchants(projectId: number, cursor?: string | null): Observable<MerchantList> {
    let params = new HttpParams();
    if (cursor) {
      params = params.set('cursor', cursor);
    }
    const results = [ {
      id: 1,
      place_url: 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id=ChIJN1t_tDeuEmsRUsoyG83frY4',
      place: {
        name: 'Google',
        place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        formatted_address: 'Antwerpsesteenweg 19, Lochrisit, Belgium',
        formatted_phone_number: '(0032) 75 26496 849 4',
        geometry: {
          location: {
            lat: -33.866651,
            lng: 151.195827,
          },
          viewport: {
            northeast: {
              lat: -33.8653881697085,
              lng: 151.1969739802915,
            },
            southwest: {
              lat: -33.86808613029149,
              lng: 151.1942760197085,
            },
          },
        },
        opening_hours: {
          open_now: false,
          periods: [
            { open: { day: 0, time: '0800' }, close: { day: 0, time: '1800' } },
          ],
          weekday_text: [ 'Open 08-18', 'Open 08-18', 'Open 08-18', 'Open 08-18', 'Open 08-16', 'Closed', 'Closed' ],
        },
        icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png',
      },
    }, {
      id: 2,
      place_url: 'https://www.google.com/maps/search/?api=1&query=IDOLA+Business+center&query_place_id=ChIJ2SRAmMB3w0cRUnXM4N_WIt4',
      place: {
        name: 'IDOLA business center',
        place_id: 'ChIJ2SRAmMB3w0cRUnXM4N_WIt4',
        formatted_address: 'Antwerpse Steenweg 19, 9080 Lochristi, Belgium',
        formatted_phone_number: '09 330 20 20',
        geometry: {
          location: {
            lat: 51.0923952,
            lng: 3.8203813,
          },
          viewport: null,
        },
        opening_hours: {
          open_now: true,
          periods: [
            { open: { day: 0, time: '0900' }, close: { day: 0, time: '1700' } },
          ],
          weekday_text: [ 'Open 09-17', 'Open 09-17', 'Open 09-17', 'Open 09-17', 'Open 09-17', 'Closed', 'Closed' ],
        },
        icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png',
      },
    } ];
    return of({
      cursor: 'abc',
      more: true,
      results: [ ...results, ...results, ...results, ...results, ...results ],
    });
  }
}
