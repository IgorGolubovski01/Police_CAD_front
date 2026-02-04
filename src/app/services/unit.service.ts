import axios from "axios";
import { UserService } from './user.service';
import { LatLonModel } from '../models/latlon.model';

const client = axios.create({
    baseURL: 'http://localhost:8080/unit',
    headers: {
        'Accept': 'application/json'
    }
})

export class UnitService {

    static async getAllUnits(): Promise<any[]> {
        try {
            const authHeader = UserService.getBasicAuthHeader();
            const response = await client.get('/getAllUnits', {
                headers: authHeader ? { 'Authorization': authHeader } : {}
            })
            return response.data;
        } catch (error: any) {
            return [];
        }
    }

    static async updateLocation(latLon: LatLonModel): Promise<any> {
        try {
            const authHeader = UserService.getBasicAuthHeader();
            const response = await client.post('/getUnitLocation', latLon, {
                headers: authHeader ? { 'Authorization': authHeader } : {}
            })
            return response.data;
        } catch (error: any) {
            console.error('Error updating location:', error);
            throw error;
        }
    }

    static async getUnitRecords(uId: number): Promise<any[]> {
        try {
            const authHeader = UserService.getBasicAuthHeader();
            const response = await client.get(`/getUnitRecords/${uId}`, {
                headers: authHeader ? { 'Authorization': authHeader } : {}
            });
            return response.data;
        } catch (error: any) {
            return [];
        }
    }

    static async resolveIncident(incidentId: number,unitId: number, dto: any): Promise<any> {
        try {
            const authHeader = UserService.getBasicAuthHeader();
            const response = await client.post(`/resolveIncident/${incidentId}/${unitId}`, dto, {
                headers: authHeader ? { 'Authorization': authHeader } : {}
            });
            return response.data;
        } catch (error: any) {
            throw new Error('Error resolving incident');
        }
    }


}