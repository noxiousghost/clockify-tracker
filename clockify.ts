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
        } catch (error: any) {
            console.error('[clockify] Could not connect to Clockify. Please check your API key.');

            return null;
        }
    }

    async getProjects(workspaceId: string) {
        try {
            let allProjects: any[] = [];
            let page = 1;
            const pageSize = 50;
            let hasMore = true;

            while (hasMore) {
                const response = await this.httpClient.get(`/workspaces/${workspaceId}/projects`, {
                    params: {
                        page: page,
                        'page-size': pageSize
                    }
                });

                if (response.data.length > 0) {
                    allProjects = allProjects.concat(response.data);
                    page++;
                } else {
                    hasMore = false;
                }
            }

            return allProjects;
        } catch (error: any) {
            console.error('Error fetching projects:', error.response?.data?.message || error.message, error);

            return [];
        }
    }

    async startTimer(workspaceId: string, projectId: string, description = 'Working on a task...') {
        try {
            const response = await this.httpClient.post(`/workspaces/${workspaceId}/time-entries`, {
                projectId: projectId,
                description: description,
                start: new Date().toISOString(),
            });

            return response.data;
        } catch (error: any) {
            console.error('Error starting timer:', error.response?.data?.message || error.message);

            return null;
        }
    }

    async stopTimer(workspaceId: string, userId: string) {
        try {
            const response = await this.httpClient.patch(`/workspaces/${workspaceId}/user/${userId}/time-entries`, {
                end: new Date().toISOString(),
            });

            return response.data;
        } catch (error: any) {
            console.error('Error stopping timer:', error.response?.data?.message || error.message);

            return null;
        }
    }

     async getActiveTimer(workspaceId: string , userId: string) {
        try {
            const response = await this.httpClient.get(`/workspaces/${workspaceId}/user/${userId}/time-entries?in-progress=true`);
            return response.data[0];
        } catch (error: any) {
            console.error('Error fetching active timer:', error.response?.data?.message || error.message);

            return null;
        }
    }
}
