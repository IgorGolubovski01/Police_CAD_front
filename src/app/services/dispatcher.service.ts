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

}