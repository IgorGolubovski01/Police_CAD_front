import axios from "axios";
import { LoginModel } from "../models/login.model";

const client = axios.create({
    baseURL: 'http://localhost:8080/user',
    headers: {
        'Accept': 'application/json'
    }
})

export class UserService {
    private static credentials: { username: string; password: string } | null = null;

    static initializeCredentials() {
        // Load credentials from sessionStorage on app init
        const stored = sessionStorage.getItem('auth_credentials');
        if (stored) {
            this.credentials = JSON.parse(stored);
        }
    }

    static async login(loginModel: LoginModel): Promise<any> {
        try {
            const response = await client.post('/login', loginModel)
            const user = response.data
            
            // Store credentials in memory and sessionStorage for Basic Auth
            this.credentials = {
                username: loginModel.username,
                password: loginModel.password
            };
            sessionStorage.setItem('auth_credentials', JSON.stringify(this.credentials));
            
            localStorage.setItem('active', JSON.stringify(user))
            return user
        } catch (error: any) {
            return null;
        }
    }

    static checkActive(): any {
        const active = localStorage.getItem('active')
        return active ? JSON.parse(active) : null
    }

    static getBasicAuthHeader(): string | null {
        if (!this.credentials) {
            return null;
        }
        const encoded = btoa(`${this.credentials.username}:${this.credentials.password}`);
        return `Basic ${encoded}`;
    }
}