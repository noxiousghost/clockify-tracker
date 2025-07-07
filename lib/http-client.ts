import axios, { AxiosInstance } from "axios";
import appConfig from '../config/app';
import clockifyConfig from '../config/clockify';

export class HttpClient {
    private readonly client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: appConfig.appBaseUrl,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${clockifyConfig.clockifyApiKey}`
            }
        });
    }

    getClient() {
        return this.client;
    }
}
