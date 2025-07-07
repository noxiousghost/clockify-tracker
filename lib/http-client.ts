import axios, { AxiosInstance } from "axios";
import appConfig from '../config/app';
import clockifyConfig from '../config/clockify';

export class HttpClient {
    private readonly client: AxiosInstance;

    constructor() {
        try {
            this.client = axios.create({
                baseURL: appConfig.appBaseUrl,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${clockifyConfig.clockifyApiKey}`
                }
            })
        } catch (err: unknown) {
            console.error('Could not connect to Clockify. Please check your API key.');
        }
    }

    getClient() {
        return this.client;
    }
}
