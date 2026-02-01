export interface IncidentType {
    incident_type: string;
}

export interface IncidentModel {
    description: string;
    address: string;
    incident_type: IncidentType;
}