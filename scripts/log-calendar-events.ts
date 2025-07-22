import * as dotenv from 'dotenv';
dotenv.config();

import { google } from 'googleapis';
import { getAuthenticatedClient, getRefreshedToken } from '../lib/google.js';
import { getLatestToken, storeToken } from '../lib/db.js';
import { Clockify } from '../clockify.js';
import { program } from 'commander';
import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Project {
  id: string;
  name: string;
}

async function getLocalProjects(): Promise<Project[]> {
  const dataDir = path.join(__dirname, '../../data');
  const localProjectsPath = path.join(dataDir, 'local-projects.json');
  try {
    await fs.promises.mkdir(dataDir, { recursive: true });
    try {
      await fs.promises.access(localProjectsPath, fs.constants.F_OK);
    } catch {
      await fs.promises.writeFile(localProjectsPath, '[]', 'utf8');
    }
    const data = await fs.promises.readFile(localProjectsPath, 'utf8');
    return JSON.parse(data);
  } catch (_error: unknown) {
    return [];
  }
}

program
  .option('-s, --start-date <startDate>', 'Start date for fetching calendar events')
  .option('-e, --end-date <endDate>', 'End date for fetching calendar events')
  .option('-p, --project-id <projectId>', 'Clockify project ID')
  .parse(process.argv);

const { startDate, endDate } = program.opts();
let { projectId } = program.opts();

if (!startDate || !endDate) {
  console.error('Please provide both a start and end date.');
  process.exit(1);
}

async function main() {
  const clockify = new Clockify();
  const user = await clockify.getUser();

  if (!user) {
    console.error('Could not get Clockify user. Please check your API key.');
    return;
  }

  if (!projectId) {
    let projects = await clockify.getProjects(user.activeWorkspace);
    const localProjects = await getLocalProjects();

    if (localProjects.length > 0) {
      const localProjectIds = localProjects.map((p) => p.id);
      projects = projects.filter((p) => localProjectIds.includes(p.id));
    }

    const { selectedProjectId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedProjectId',
        message: 'Which project do you want to log these events to?',
        choices: projects.map((p) => ({ name: p.name, value: p.id })),
      },
    ]);
    projectId = selectedProjectId;
  }

  let token = await getLatestToken();
  if (!token) {
    console.error('Please authenticate with Google first.');
    return;
  }

  const oAuth2Client = getAuthenticatedClient();
  oAuth2Client.setCredentials(token);

  if (new Date(token.expiry_date) < new Date()) {
    console.log('Token expired, refreshing...');
    token = await getRefreshedToken(token);
    storeToken(token);
    oAuth2Client.setCredentials(token);
  }

  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  try {
    const timeMin = new Date(startDate).toISOString();
    const endOfDay = new Date(endDate);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const timeMax = endOfDay.toISOString();

    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = res.data.items;
    console.log(`Checking for events between ${startDate} and ${endDate}...`);
    if (events && events.length) {
      for (const event of events) {
        if (event.start && event.start.date) {
          console.log(`Skipping all-day event: "${event.summary}" on ${event.start.date}`);
          continue;
        }
        if (event.start && event.start.dateTime && event.end && event.end.dateTime && event.summary) {
          console.log(`Logging "${event.summary}" to Clockify...`);
          await clockify.logTime(
            user.activeWorkspace,
            projectId,
            event.start.dateTime,
            event.end.dateTime,
            event.summary,
          );
        }
      }
      console.log('Done!');
    } else {
      console.log('No upcoming events found for the specified date range.');
    }
  } catch (error) {
    console.error('The API returned an error: ' + error);
  }
}

main();
