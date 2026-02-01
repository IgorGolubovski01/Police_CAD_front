import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { LocationService } from '../services/location.service';
import { UnitService } from '../services/unit.service';
import { DispatcherService } from '../services/dispatcher.service';
import { LatLonModel } from '../models/latlon.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-unit-page',
  imports: [],
  templateUrl: './unit-page.component.html',
  styleUrl: './unit-page.component.css'
})
export class UnitPageComponent implements OnDestroy, AfterViewInit {
  private locationUpdateInterval: any;
  units: any[] = [];
  incidents: any[] = [];
  map: any;

  ngAfterViewInit() {
    const user = UserService.checkActive();
    if (user == null || user.role !== 'ROLE_UNIT') {
      window.location.href = '/home';
      return;
    }

    this.initializePageAfterDelay();
  }

  private async initializePageAfterDelay() {
    // Update location on init
    const user = UserService.checkActive();
    this.updateLocation(user.id);

    // Updating location (60s)
    this.locationUpdateInterval = setInterval(() => {
      this.updateLocation(user.id);
    }, 60000);

    this.units = await UnitService.getAllUnits();
    this.incidents = await DispatcherService.getAllIncidents();

    setTimeout(() => {
      this.initializeMap();
    }, 300);
  }

  private initializeMap() {
    // Clear existing map if it exists
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map').setView([44.810, 20.466], 13);
    this.map.invalidateSize();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Unit marker
    const carIcon = L.icon({
      iconUrl: 'car.png',
      iconSize: [36, 36],
      iconAnchor: [18, 1],
      popupAnchor: [0, -36],
      className: 'custom-car-icon'
    });

    this.units.forEach(unit => {
      const marker = L.marker([unit.lat, unit.lon], { icon: carIcon }).addTo(this.map);
      marker.bindPopup(`<b>${unit.callSign}</b><br>ID: ${unit.id}`);
      marker.bindTooltip(unit.callSign, { permanent: true, direction: 'top' });
    });

    // Incident marker
    const incidentIcon = L.icon({
      iconUrl: 'red.png',
      iconSize: [36, 28],
      iconAnchor: [18, 1],
      popupAnchor: [0, -36],
      className: 'custom-incident-icon'
    });

    this.incidents.forEach(incident => {
      const marker = L.marker([parseFloat(incident.lat), parseFloat(incident.lon)], { icon: incidentIcon }).addTo(this.map);
      marker.bindPopup(`<b>${incident.incidentType}</b><br>Description: ${incident.description}<br>Address: ${incident.address}`);
      marker.bindTooltip(incident.incidentType, { permanent: true, direction: 'top' });
    });
  }

  private async updateLocation(userId: number) {
    try {
      const coords = await LocationService.getCurrentLocation();
      console.log(`Current location: ${coords.latitude}, ${coords.longitude}`);

      const locationData: LatLonModel = {
        uId: userId,
        lat: coords.latitude,
        lon: coords.longitude
      };

      await UnitService.updateLocation(locationData);
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  }

  ngOnDestroy() {
    // Clear interval when component is destroyed
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
    }
  }
}
