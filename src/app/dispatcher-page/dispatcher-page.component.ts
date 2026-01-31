import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { UnitService } from '../services/unit.service';
import { IncidentModel, IncidentType } from '../models/incident.model';
import { NgIf, NgFor } from '@angular/common';
import { DispatcherService } from '../services/dispatcher.service';

@Component({
  selector: 'app-dispatcher-page',
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './dispatcher-page.component.html',
  styleUrl: './dispatcher-page.component.css'
})
export class DispatcherPageComponent implements AfterViewInit {
  units: any[] = [];
  showIncidentForm = false;
  incidentTypes: IncidentType[] = [
    { id: 1, incident_type: 'BURGLARY' },
    { id: 2, incident_type: 'ROBBERY' },
    { id: 3, incident_type: 'DOMESTIC_VIOLENCE' },
    { id: 3, incident_type: 'ASSAULT' },
    { id: 3, incident_type: 'HOMICIDE' },
    { id: 3, incident_type: 'HARRASMENT' },
    { id: 3, incident_type: 'EMERGENCY_ALARM' }
  ];
  incident: IncidentModel = {
    description: '',
    address: '',
    incident_type: this.incidentTypes[0]
  };

  constructor(private router: Router) {}

  async ngAfterViewInit() {
    const user = UserService.checkActive();
    if (user == null || user.role !== 'ROLE_DISPATCHER') {
      window.location.href = '/home';
      return;
    }

    // Fetch units
    this.units = await UnitService.getAllUnits();

    setTimeout(() => {
      const map = L.map('map').setView([44.810, 20.466], 13);
      map.invalidateSize();

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Add unit markers to the map
      const carIcon = L.icon({
        iconUrl: 'car.png',
        iconSize: [36, 36],
        iconAnchor: [18, 1],
        popupAnchor: [0, -36],
        className: 'custom-car-icon'
      });

      this.units.forEach(unit => {
        const marker = L.marker([unit.lat, unit.lon], { icon: carIcon }).addTo(map);
        marker.bindPopup(`<b>${unit.callSign}</b><br>ID: ${unit.id}`);
        marker.bindTooltip(unit.callSign, { permanent: true, direction: 'top' });
      });
    }, 300);
  }

  openIncidentForm() {
    this.showIncidentForm = true;
  }

  closeIncidentForm() {
    this.showIncidentForm = false;
  }

  submitIncident() {
    const payload = {
      description: this.incident.description,
      address: this.incident.address,
      incidentType: this.incident.incident_type.incident_type
    };
    
    DispatcherService.createIncident(payload)
      .then(response => {
        alert('Incident created successfully!');
        this.incident = {
          description: '',
          address: '',
          incident_type: this.incidentTypes[0]
        };
      })
      .catch(error => {
        alert('Address not found.');
      });
    this.closeIncidentForm();
  }
}
