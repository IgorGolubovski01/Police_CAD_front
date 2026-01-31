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

        

}