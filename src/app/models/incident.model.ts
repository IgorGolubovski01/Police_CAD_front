export interface IncidentType {
    id: number;
    incident_type: string;
}

export interface IncidentModel {
    description: string;
    address: string;
    incident_type: IncidentType;
}