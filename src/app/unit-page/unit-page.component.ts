import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { LocationService } from '../services/location.service';
import { UnitService } from '../services/unit.service';
import { DispatcherService } from '../services/dispatcher.service';
import { LatLonModel } from '../models/latlon.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-unit-page',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './unit-page.component.html',
  styleUrl: './unit-page.component.css'
})
export class UnitPageComponent implements OnDestroy, AfterViewInit {
  private locationUpdateInterval: any;
  units: any[] = [];
  incidents: any[] = [];
  unitRecords: any[] = [];
  map: any;
  private mapInitialized: boolean = false;
  private markersLayer: any;
  selectedIncident: any = null;
  showIncidentForm: boolean = false;
  finalReport: string = '';
  isSubmitting: boolean = false;

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

    // Updating location (6s)
    this.locationUpdateInterval = setInterval(async () => {
      this.updateLocation(user.id);
      const records = await UnitService.getUnitRecords(user.id);
      this.unitRecords = this.sortRecordsByTime(records);
      // Refresh units and incidents
      this.units = await UnitService.getAllUnits();
      this.incidents = await DispatcherService.getAllIncidents();
      this.updateMapMarkers();
    }, 6000);

    this.units = await UnitService.getAllUnits();
    this.incidents = await DispatcherService.getAllIncidents();
    const records = await UnitService.getUnitRecords(user.id);
    this.unitRecords = this.sortRecordsByTime(records);

    setTimeout(() => {
      this.initializeMap();
    }, 300);
  }

  private initializeMap() {
    if (this.mapInitialized) {
      return;
    }

    this.map = L.map('map').setView([44.810, 20.466], 13);
    this.map.invalidateSize();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.mapInitialized = true;

    this.updateMapMarkers();
  }

  private updateMapMarkers() {
    if (!this.mapInitialized || !this.markersLayer) {
      return;
    }

    // Clear existing markers
    this.markersLayer.clearLayers();

    // Unit marker
    const carIcon = L.icon({
      iconUrl: 'car.png',
      iconSize: [36, 36],
      iconAnchor: [18, 1],
      popupAnchor: [0, -36],
      className: 'custom-car-icon'
    });

    this.units.forEach(unit => {
      const statusClass = unit.status === 'SAFE' ? 'unit-status-safe' : 'unit-status-action';
      const marker = L.marker([unit.lat, unit.lon], { icon: carIcon }).addTo(this.markersLayer);
      marker.bindPopup(`<b>${unit.callSign}</b><br>ID: ${unit.id}<br>Status: ${unit.status}`);
      marker.bindTooltip(unit.callSign, { permanent: true, direction: 'top', className: statusClass });
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
      const marker = L.marker([parseFloat(incident.lat), parseFloat(incident.lon)], { icon: incidentIcon }).addTo(this.markersLayer);
      marker.bindPopup(`<b>${incident.incidentType}</b><br>Description: ${incident.description}<br>Address: ${incident.address}`);
      marker.bindTooltip(incident.incidentType, { permanent: true, direction: 'top' });
      marker.on('click', () => {
        this.openIncidentForm(incident);
      });
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

  private sortRecordsByTime(records: any[]): any[] {
    return records.sort((a, b) => {
      const dateA = new Date(a.dateTime).getTime();
      const dateB = new Date(b.dateTime).getTime();
      return dateA - dateB; // Oldest first, newest last
    });
  }

  openIncidentForm(incident: any) {
    this.selectedIncident = incident;
    this.finalReport = '';
    this.showIncidentForm = true;
  }

  closeIncidentForm() {
    this.showIncidentForm = false;
    this.selectedIncident = null;
    this.finalReport = '';
  }

  async submitIncidentForm() {
    if (!this.finalReport.trim()) {
      alert('Please enter a final report');
      return;
    }

    this.isSubmitting = true;
    try {
      const user = UserService.checkActive();
      const dto = {
        finalReport: this.finalReport
      };
      await UnitService.resolveIncident(this.selectedIncident.id, user.id, dto);
      alert('Incident resolved successfully!');
      this.closeIncidentForm();
      // Refresh incidents
      this.incidents = await DispatcherService.getAllIncidents();
      this.initializeMap();
    } catch (error) {
      console.error('Error resolving incident:', error);
      alert('Failed to resolve incident');
    } finally {
      this.isSubmitting = false;
    }
  }

  ngOnDestroy() {
    // Clear interval when component is destroyed
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
    }
  }
}
