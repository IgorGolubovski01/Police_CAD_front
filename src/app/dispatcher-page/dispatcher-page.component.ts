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
  incidents: any[] = [];
  showIncidentForm = false;
    showSendRecordForm = false;
  map: any;
  incidentTypes: IncidentType[] = [
    { incident_type: 'BURGLARY' },
    { incident_type: 'ROBBERY' },
    { incident_type: 'DOMESTIC_VIOLENCE' },
    { incident_type: 'ASSAULT' },
    { incident_type: 'HOMICIDE' },
    { incident_type: 'HARRASMENT' },
    { incident_type: 'EMERGENCY_ALARM' }
  ];
  incident: IncidentModel = {
    description: '',
    address: '',
    incident_type: this.incidentTypes[0]
  };
  sendRecord = {
    selectedUnit: null as any,
    selectedRecord: null as any,
    searchQuery: '',
    allRecords: [] as any[],
    filteredRecords: [] as any[]
  };

  constructor(private router: Router) { }

  async ngAfterViewInit() {
    const user = UserService.checkActive();
    if (user == null || user.role !== 'ROLE_DISPATCHER') {
      window.location.href = '/home';
      return;
    }

    // Fetch units and incidents
    this.units = await UnitService.getAllUnits();
    this.incidents = await DispatcherService.getAllIncidents();

    setTimeout(() => {
      this.initializeMap();
    }, 300);
  }

  initializeMap() {
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

    // Add unit markers to the map
    const carIcon = L.icon({
      iconUrl: 'car.png',
      iconSize: [36, 36],
      iconAnchor: [18, 1],
      popupAnchor: [0, -36],
      className: 'custom-car-icon'
    });

    this.units.forEach(unit => {
      const statusClass = unit.status === 'SAFE' ? 'unit-status-safe' : 'unit-status-action';
      const marker = L.marker([unit.lat, unit.lon], { icon: carIcon }).addTo(this.map);
      marker.bindPopup(`<b>${unit.callSign}</b>`);
      marker.bindTooltip(unit.callSign + ' ' + unit.status, { permanent: true, direction: 'top', className: statusClass });
      
    });

    // Add incident markers to the map
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
      .then(async response => {
        alert('Incident created successfully!');
        this.incident = {
          description: '',
          address: '',
          incident_type: this.incidentTypes[0]
        };
        // Refresh incidents from backend
        this.incidents = await DispatcherService.getAllIncidents();
        // Refresh the map with new incident
        this.initializeMap();
      })
      .catch(error => {
        alert('Address not found.');
      });
    this.closeIncidentForm();
  }

  async openSendRecordForm() {
    this.showSendRecordForm = true;
    this.sendRecord.searchQuery = '';
    this.sendRecord.selectedRecord = null;
    this.sendRecord.selectedUnit = null;
    
    // Fetch all records from backend
    this.sendRecord.allRecords = await DispatcherService.getAllRecords();
    this.sendRecord.filteredRecords = [];
  }

  closeSendRecordForm() {
    this.showSendRecordForm = false;
  }

  searchRecords(query: string) {
    this.sendRecord.searchQuery = query;
    if (query.trim() === '') {
      this.sendRecord.filteredRecords = [];
      return;
    }
    
    // Filter records locally based on search query
    const lowerQuery = query.toLowerCase();
    this.sendRecord.filteredRecords = this.sendRecord.allRecords.filter(record =>
      record.fullName.toLowerCase().includes(lowerQuery) ||
      record.address.toLowerCase().includes(lowerQuery)
    );
  }

  submitSendRecord() {
    if (!this.sendRecord.selectedUnit || !this.sendRecord.selectedRecord) {
      alert('Please select both unit and record');
      return;
    }

    DispatcherService.sendRecord(
      this.sendRecord.selectedUnit.id,
      this.sendRecord.selectedRecord.id
    )
      .then(response => {
        alert('Record sent successfully!');
        this.closeSendRecordForm();
        this.sendRecord.selectedUnit = null;
        this.sendRecord.selectedRecord = null;
        this.sendRecord.searchQuery = '';
      })
      .catch(error => {
        alert('Error sending record');
      });
  }

  getInActionUnits() {
    return this.units.filter(unit => unit.status === 'IN_ACTION');
  }
}
