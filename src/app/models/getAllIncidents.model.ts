export interface GetAllIncidentsDto {
    id: number;
    description: string;
    incidentType: string;
    incidentTime: string;
    address: string;
    lat: string;
    lon: string;
    dispatcher: string;
    units: any[];
    finalReport: string;
}
