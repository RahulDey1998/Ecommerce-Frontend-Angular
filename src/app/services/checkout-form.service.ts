import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Country } from '../common/country';
import { map } from 'rxjs/operators';
import { State } from '../common/state';
import { Purchase } from '../common/purchase';

@Injectable({
  providedIn: 'root'
})
export class CheckoutFormService {
 
  private countryUrl = "http://localhost:8080/api/countries";
  private stateUrl = "http://localhost:8080/api/states";
  private stateUrlWithCountryCode = "http://localhost:8080/api/states/search/findByCountryCode?code=";

  constructor(private httpClient: HttpClient) { }

  getCountries(): Observable<Country[]> {
    return this.httpClient.get<GetResponseCountries>(this.countryUrl).pipe(
      map(response => response._embedded.countries)
    );
 }

  getStates(code: string): Observable<State[]> {
    const stateSearchUrl = `${this.stateUrl}/search/findByCountryCode?code=${code}`;
                               
    return this.httpClient.get<GetResponseStates>(stateSearchUrl).pipe(
      map(response => response._embedded.states)
    );
  }
  getCreditCardMonths(startMonth: number): Observable<number[]> {
    let data: number[] = [];

    //build an array of month
    //starting in current month and loop untill last
    for(let month = startMonth; month <= 12; month++) {
      console.log(month);
      data.push(month);
    }
    //wrapping the return object as Observable
    return of(data);
  }

  getCreditCardYears(): Observable<number[]> {
    let data: number[] = [];

    const startYear: number = new Date().getFullYear();
    const lastYear = startYear + 10;

    for(let year = startYear; year <= lastYear; year++) {
      data.push(year);
    }
    return of(data);
  }

}



interface GetResponseCountries {
  _embedded: {
    countries: Country[]
  }
}

interface GetResponseStates {
  _embedded: {
    states: State[]
  }
}
