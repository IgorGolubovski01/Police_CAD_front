import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  
  static getCurrentLocation(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position.coords),
        (error) => reject(error)
      );
    });
  }

  static watchLocation(callback: (coords: GeolocationCoordinates) => void): number {
    return navigator.geolocation.watchPosition(
      (position) => callback(position.coords),
      (error) => console.error('Watch location error:', error)
    );
  }

  static clearWatch(watchId: number): void {
    navigator.geolocation.clearWatch(watchId);
  }
}