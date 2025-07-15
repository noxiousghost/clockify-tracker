import axios from 'axios';

const JIRA_API_URL = process.env.ATLASSIAN_URL;
const JIRA_API_TOKEN = process.env.ATLASSIAN_API_TOKEN;
const JIRA_USER_EMAIL = process.env.ATLASSIAN_EMAIL;

async function jiraApiRequest(url: string, method: 'POST' | 'GET', body?: unknown) {
  if (!JIRA_API_URL || !JIRA_API_TOKEN || !JIRA_USER_EMAIL) {
    console.error('Jira environment variables are not set. Please check your .env file.');
    return null;
  }

  const headers = {
    Authorization: `Basic ${Buffer.from(`${JIRA_USER_EMAIL}:${JIRA_API_TOKEN}`).toString('base64')}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios({
      method,
      url,
      data: body,
      headers,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error making Jira API request:', error.message);
    }

    return null;
  }
}

export async function stopJiraTimer(ticketId: string, timeSpentSeconds: number) {
  const url = `${JIRA_API_URL}/issue/${ticketId}/worklog`;
  const body = {
    timeSpentSeconds,
    comment: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Timer stopped from Clockify Tracker',
            },
          ],
        },
      ],
    },
  };
  console.log('Jira request body:', JSON.stringify(body, null, 2));
  return await jiraApiRequest(url, 'POST', body);
}
