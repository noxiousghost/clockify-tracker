import { AxiosInstance } from 'axios';
import { HttpClient } from './lib/http-client.js';
import { logSessionStart } from './lib/db.js';
import { v4 as uuidv4 } from 'uuid';

interface ClockifyProject {
  id: string;
  name: string;
}

export class Clockify {
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = new HttpClient().getClient();
  }

  async getUser() {
    try {
      const response = await this.httpClient.get('/user');

      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[clockify] Could not connect to Clockify. Please check your API key.', error.message);
      } else {
        console.error('[clockify] An unknown error occurred.');
      }
      return null;
    }
  }

  async getProjects(workspaceId: string): Promise<ClockifyProject[]> {
    try {
      let allProjects: ClockifyProject[] = [];
      let page = 1;
      const pageSize = 50;
      let hasMore = true;

      while (hasMore) {
        const response = await this.httpClient.get(`/workspaces/${workspaceId}/projects`, {
          params: {
            page: page,
            'page-size': pageSize,
            archived: false,
          },
        });

        if (response.data.length > 0) {
          allProjects = allProjects.concat(response.data);
          page++;
        } else {
          hasMore = false;
        }
      }

      return allProjects;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching projects:', error.message);
      } else {
        console.error('Error fetching projects: An unknown error occurred.');
      }
      return [];
    }
  }

  async startTimer(workspaceId: string, projectId: string, description = 'Working on a task...') {
    try {
      const startedAt = new Date().toISOString();
      const sessionId = uuidv4();
      const response = await this.httpClient.post(`/workspaces/${workspaceId}/time-entries`, {
        projectId: projectId,
        description: description,
        start: startedAt,
      });

      // Log session to SQLite
      logSessionStart(sessionId, projectId, description, startedAt);

      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error starting timer:', error.message);
      } else {
        console.error('Error starting timer: An unknown error occurred.');
      }
      return null;
    }
  }

  async stopTimer(workspaceId: string, userId: string) {
    try {
      const response = await this.httpClient.patch(`/workspaces/${workspaceId}/user/${userId}/time-entries`, {
        end: new Date().toISOString(),
      });

      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error stopping timer:', error.message);
      } else {
        console.error('Error stopping timer: An unknown error occurred.');
      }
      return null;
    }
  }

  async getActiveTimer(workspaceId: string, userId: string) {
    try {
      const response = await this.httpClient.get(
        `/workspaces/${workspaceId}/user/${userId}/time-entries?in-progress=true`,
      );
      return response.data[0];
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching active timer:', error.message);
      } else {
        console.error('Error fetching active timer: An unknown error occurred.');
      }
      return null;
    }
  }
}
