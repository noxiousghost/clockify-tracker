import axios, { AxiosInstance } from 'axios';
import clockifyConfig from '../config/clockify.js';

export class HttpClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: clockifyConfig.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Api-Key': clockifyConfig.apiKey,
      },
    });
  }

  getClient() {
    return this.client;
  }
}
