import axios from "axios";
import { UserService } from './user.service';
    
const client = axios.create({
    baseURL: 'http://localhost:8080/dispatcher',
    headers: {
        'Accept': 'application/json'
    }
})

export class DispatcherService {

    static async createIncident(incidentData: any): Promise<any> {
        try {
            const authHeader = UserService.getBasicAuthHeader();
            const response = await client.post('/createIncident', incidentData, {
                headers: authHeader ? { 'Authorization': authHeader } : {}
            });
            return response.data;
        } catch (error: any) {
            throw new Error('Error creating incident');
        }
    }

    static async getAllIncidents(): Promise<any[]> {
        try {
            const authHeader = UserService.getBasicAuthHeader();
            const response = await client.get('/getAllIncidents', {
                headers: authHeader ? { 'Authorization': authHeader } : {}
            });
            return response.data;
        } catch (error: any) {
            return [];
        }
    }

    static async sendRecord(uId: number, rId: number): Promise<any> {
        try {
            const authHeader = UserService.getBasicAuthHeader();
            const response = await client.post(`/unit/${uId}/record/${rId}`, {}, {
                headers: authHeader ? { 'Authorization': authHeader } : {}
            });
            return response.data;
        } catch (error: any) {
            throw new Error('Error sending record');
        }
    }

    static async getAllRecords(): Promise<any[]> {
        try {
            const authHeader = UserService.getBasicAuthHeader();
            const response = await client.get('/getAllRecords', {
                headers: authHeader ? { 'Authorization': authHeader } : {}
            });
            return response.data;
        } catch (error: any) {
            return [];
        }
    }

    static async getAvailableOfficers(): Promise<any[]>{
        try {
            const authHeader = UserService.getBasicAuthHeader();
            const response = await client.get('/getAvailableOfficers', {
                headers: authHeader ? { 'Authorization': authHeader } : {}
            });
            return response.data;
        } catch (error: any) {
            return [];
        }

    }

    static async assignOfficerToUnit(oId: number, uId: number): Promise<any> {
        try {
            const authHeader = UserService.getBasicAuthHeader();
            const response = await client.post(`/unit/${uId}/officer/${oId}`, {}, {
                headers: authHeader ? { 'Authorization': authHeader } : {}
            });
            return response.data;
        } catch (error: any) {
            throw new Error('Error assigning officer to unit');
        }
    }

    static async getUnitOfficers(uId: number): Promise<any[]> {
        try {
            const authHeader = UserService.getBasicAuthHeader();
            const response = await client.get(`/getUnitOfficers/${uId}`, {
                headers: authHeader ? { 'Authorization': authHeader } : {}
            });
            return response.data;
        } catch (error: any) {
            return [];
        }
    }

    static async disengageOfficer(oId: number): Promise<any> {
        try {
            const authHeader = UserService.getBasicAuthHeader();
            const response = await client.delete(`/disengageOfficer/${oId}`, {
                headers: authHeader ? { 'Authorization': authHeader } : {}
            });
            return response.data;
        } catch (error: any) {
            throw new Error('Error disengaging officer');
        }
    }

    static async assignUnitToIncident(uId: number, iId: number): Promise<any> {
        try {
            const authHeader = UserService.getBasicAuthHeader();
            const response = await client.post(`/unit/${uId}/incident/${iId}`, {}, {
                headers: authHeader ? { 'Authorization': authHeader } : {}
            });
            return response.data;   
        } catch (error: any) {
            throw new Error('Error assigning unit to incident');
        }
    }

    static async getIncidentAssignedUnits(iId: number): Promise<any[]> {
        try {
            const authHeader = UserService.getBasicAuthHeader();
            const response = await client.get(`/getIncidentAssignedUnits/incident/${iId}`, {
                headers: authHeader ? { 'Authorization': authHeader } : {}
            });
            return response.data;
        } catch (error: any) {
            return [];
        }
    }
}