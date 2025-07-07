import { AxiosInstance } from "axios";
import { HttpClient } from './lib/http-client';

export class Clockify {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = (new HttpClient()).getClient();
    }

    async getUser() {
        try {
            const response = await this.httpClient.get('/user');

            return response.data;
        } catch (error) {
            console.error('Could not connect to Clockify. Please check your API key.');
            return null;
        }
    }
}

