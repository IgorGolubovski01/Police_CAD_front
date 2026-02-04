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
  showDeployOfficersForm = false;
  showAssignUnitModal = false;
  availableOfficers: any[] = [];
  unitOfficers: any[] = [];
  unitOfficerCounts: Map<number, number> = new Map();
  unitsOfficersMap: Map<number, any[]> = new Map();
  unitIncidentMap: Map<number, number> = new Map();
  selectedUnitForDeploy: any = null;
  selectedIncidentForAssign: any = null;
  availableUnitsForAssign: any[] = [];
  assignedUnitsForIncident: any[] = [];
  isLoadingOfficers = false;
  isLoadingUnitOfficers = false;
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
    await this.loadIncidentUnitRelations();
    await this.loadInActionUnitsOfficers();

    // Refresh IN ACTION units officers and incident relations every 6 seconds
    setInterval(async () => {
      await this.loadInActionUnitsOfficers();
      await this.loadIncidentUnitRelations();
      this.updateMapMarkers();
    }, 6000);

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

    this.updateMapMarkers();
  }

  updateMapMarkers() {
    if (!this.map) {
      return;
    }

    // Clear all layers except the tile layer
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });

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
      const incidentId = this.unitIncidentMap.get(unit.id);
      const tooltipText = incidentId 
        ? `[INC-${incidentId}] ${unit.callSign}`
        : `${unit.callSign}`;
      marker.bindTooltip(tooltipText, { permanent: true, direction: 'top', className: statusClass });
      
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
      marker.bindTooltip(`INC-${incident.id} ${incident.incidentType}`, { permanent: true, direction: 'top' });
      marker.on('click', () => {
        this.openAssignUnitModal(incident);
      });
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
        // Refresh incident-unit relations
        await this.loadIncidentUnitRelations();
        // Refresh the map with new incident
        this.updateMapMarkers();
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

  async loadInActionUnitsOfficers() {
    const inActionUnits = this.getInActionUnits();
    try {
      const promises = inActionUnits.map(unit =>
        DispatcherService.getUnitOfficers(unit.id)
          .then(officers => {
            this.unitsOfficersMap.set(unit.id, officers);
          })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error loading IN ACTION units officers:', error);
    }
  }

  getUnitOfficers(uId: number): any[] {
    return this.unitsOfficersMap.get(uId) || [];
  }

  async openAssignUnitModal(incident: any) {
    this.selectedIncidentForAssign = incident;
    this.showAssignUnitModal = true;
    try {
      // Ensure officer counts are loaded
      await this.loadAllUnitOfficerCounts();
      
      // Fetch units assigned to this incident from backend
      this.assignedUnitsForIncident = await DispatcherService.getIncidentAssignedUnits(incident.id);
      
      // Filter available units (SAFE status with officers)
      this.availableUnitsForAssign = this.units.filter(unit => 
        unit.status === 'SAFE' && this.getUnitOfficerCount(unit.id) > 0
      );
    } catch (error) {
      console.error('Error loading available units:', error);
    }
  }

  closeAssignUnitModal() {
    this.showAssignUnitModal = false;
    this.selectedIncidentForAssign = null;
    this.availableUnitsForAssign = [];
    this.assignedUnitsForIncident = [];
  }

  async assignUnitToIncident(unit: any) {
    if (!this.selectedIncidentForAssign) {
      alert('No incident selected');
      return;
    }

    try {
      await DispatcherService.assignUnitToIncident(unit.id, this.selectedIncidentForAssign.id);
      alert('Unit assigned to incident');
      
      // Refresh incidents and units
      this.incidents = await DispatcherService.getAllIncidents();
      this.units = await UnitService.getAllUnits();
      
      // Reload officer counts for all units
      await this.loadAllUnitOfficerCounts();
      
      // Refresh assigned units from backend
      this.assignedUnitsForIncident = await DispatcherService.getIncidentAssignedUnits(this.selectedIncidentForAssign.id);
      
      // Refresh available units list
      this.availableUnitsForAssign = this.units.filter(unit => 
        unit.status === 'SAFE' && this.getUnitOfficerCount(unit.id) > 0
      );
      
      // Refresh incident-unit relations to update tooltips
      await this.loadIncidentUnitRelations();
      this.updateMapMarkers();
      await this.loadInActionUnitsOfficers();
    } catch (error) {
      alert('Failed to assign unit to incident');
    }
  }

  openDeployOfficersForm() {
    this.showDeployOfficersForm = true;
    this.availableOfficers = [];
    this.unitOfficers = [];
    this.selectedUnitForDeploy = null;
    this.loadAllUnitOfficerCounts();
  }

  closeDeployOfficersForm() {
    this.showDeployOfficersForm = false;
    this.availableOfficers = [];
    this.unitOfficers = [];
    this.selectedUnitForDeploy = null;
  }

  async selectUnitForDeploy(unit: any) {
    this.selectedUnitForDeploy = unit;
    this.isLoadingUnitOfficers = true;
    this.isLoadingOfficers = true;
    try {
      const [unitOfficers, availableOfficers] = await Promise.all([
        DispatcherService.getUnitOfficers(unit.id),
        DispatcherService.getAvailableOfficers()
      ]);
      this.unitOfficers = unitOfficers;
      this.availableOfficers = availableOfficers;
    } finally {
      this.isLoadingUnitOfficers = false;
      this.isLoadingOfficers = false;
    }
  }

  async assignOfficerToUnit(officer: any) {
    if (!this.selectedUnitForDeploy) {
      alert('Select a unit first');
      return;
    }

    try {
      await DispatcherService.assignOfficerToUnit(officer.id, this.selectedUnitForDeploy.id);
      this.availableOfficers = this.availableOfficers.filter(o => o.id !== officer.id);
      this.unitOfficers = await DispatcherService.getUnitOfficers(this.selectedUnitForDeploy.id);
      this.unitOfficerCounts.set(this.selectedUnitForDeploy.id, this.unitOfficers.length);
    } catch (error) {
      alert('Failed to assign officer');
    }
  }

  async disengageOfficer(officer: any) {
    if (!this.selectedUnitForDeploy) {
      alert('Select a unit first');
      return;
    }

    try {
      await DispatcherService.disengageOfficer(officer.id);
      this.unitOfficers = await DispatcherService.getUnitOfficers(this.selectedUnitForDeploy.id);
      this.availableOfficers = await DispatcherService.getAvailableOfficers();
      this.unitOfficerCounts.set(this.selectedUnitForDeploy.id, this.unitOfficers.length);
      alert('Officer disengaged');
    } catch (error) {
      alert('Failed to disengage officer');
    }
  }

  getUnitOfficerCount(uId: number): number {
    return this.unitOfficerCounts.get(uId) || 0;
  }

  async loadAllUnitOfficerCounts() {
    try {
      const promises = this.units.map(unit => 
        DispatcherService.getUnitOfficers(unit.id)
          .then(officers => {
            this.unitOfficerCounts.set(unit.id, officers.length);
          })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error loading officer counts:', error);
    }
  }

  async loadIncidentUnitRelations() {
    try {
      const relations = await DispatcherService.getAllIncidentUnitRels();
      this.unitIncidentMap.clear();
      relations.forEach((rel: any) => {
        // Only map active incident-unit relationships (if active field exists and is true, or if active field doesn't exist assume it's active)
        if (rel.active !== false) {
          // Handle both flat structure (unitId, incidentId) and nested structure (unit.id, incident.id)
          const unitId = rel.unitId || rel.unit?.id;
          const incidentId = rel.incidentId || rel.incident?.id;
          if (unitId && incidentId) {
            this.unitIncidentMap.set(unitId, incidentId);
          }
        }
      });
    } catch (error) {
      console.error('Error loading incident-unit relations:', error);
    }
  }
}
