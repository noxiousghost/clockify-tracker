#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { Clockify } from './clockify.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { completeLatestSession, getLatestSession } from './lib/db.js';

interface Project {
  id: string;
  name: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();
const clockify = new Clockify();

async function getLocalProjects(): Promise<Project[]> {
  const dataDir = path.join(__dirname, '../data');
  const localProjectsPath = path.join(dataDir, 'local-projects.json');
  try {
    // Ensure the data directory exists
    await fs.promises.mkdir(dataDir, { recursive: true });
    // If the file does not exist, create it with an empty array
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

async function getWorkspaceAndUser() {
  const user = await clockify.getUser();

  if (!user) {
    console.log(chalk.red('[index] Could not connect to Clockify. Please check your API key.'));

    process.exit(1);
  }

  const workspaceId = user.defaultWorkspace;
  const userId = user.id;

  return {
    workspaceId,
    userId,
  };
}

program.name('tracker').description('A CLI to track your time in Clockify').version('1.0.0');

program
  .command('start')
  .description('Start a new time entry. Select a project interactively.')
  .argument('[message]', 'Description for the time entry')
  .action(async (message) => {
    const { workspaceId } = await getWorkspaceAndUser();

    let projects: Project[] = await clockify.getProjects(workspaceId);
    let localProjects = await getLocalProjects();

    if (localProjects.length === 0) {
      // If local-projects.json is empty or doesn't exist, populate it with all project IDs and names
      const allProjects = projects.map((p) => ({ id: p.id, name: p.name }));
      const localProjectsPath = path.join(__dirname, '../data/local-projects.json');
      fs.writeFileSync(localProjectsPath, JSON.stringify(allProjects, null, 2), 'utf8');
      console.log(
        chalk.green(
          'All projects have been saved to data/local-projects.json. Please edit this file to select your preferred projects.',
        ),
      );
      localProjects = allProjects;
    }

    if (localProjects.length > 0) {
      const localProjectIds = localProjects.map((p) => p.id);
      projects = projects.filter((p) => localProjectIds.includes(p.id));
    }

    if (!projects || projects.length === 0) {
      console.log(chalk.yellow('No projects found in your workspace.'));

      return;
    }

    const { selectedProjectId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedProjectId',
        message: 'Which project do you want to work on?',
        choices: projects.map((p: { name: string; id: string }) => ({ name: p.name, value: p.id })),
      },
    ]);

    const entry = await clockify.startTimer(workspaceId, selectedProjectId, message);
    if (entry) {
      const projectName = projects.find((p: { name: string; id: string }) => p.id === selectedProjectId)?.name;
      console.log(chalk.green(`Timer started for project: ${chalk.bold(projectName)}`));
    }
  });

program
  .command('stop')
  .description('Stop the currently running time entry.')
  .action(async () => {
    const { workspaceId, userId } = await getWorkspaceAndUser();
    const stoppedEntry = await clockify.stopTimer(workspaceId, userId);
    if (stoppedEntry) {
      console.log(chalk.red('Timer stopped.'));
    } else {
      console.log(chalk.yellow('No timer was running.'));
    }
  });

program
  .command('status')
  .description('Check the status of the current timer.')
  .action(async () => {
    const { workspaceId, userId } = await getWorkspaceAndUser();
    const activeEntry = await clockify.getActiveTimer(workspaceId, userId);

    if (activeEntry) {
      const startTime = new Date(activeEntry.timeInterval.start);
      const duration = (new Date().getTime() - startTime.getTime()) / 1000; // in seconds
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);

      console.log(chalk.green('🕒 A timer is currently running.'));
      console.log(`   - ${chalk.bold('Project:')} ${activeEntry.project.name}`);
      console.log(`   - ${chalk.bold('Running for:')} ${hours}h ${minutes}m`);
    } else {
      console.log(chalk.yellow('No timer is currently running.'));
    }
  });

program
  .command('monitor')
  .description('Monitor system idle time and stop the Clockify timer if idle.')
  .action(async () => {
    const { workspaceId, userId } = await getWorkspaceAndUser();
    const IDLE_THRESHOLD_SECONDS = 300; // 5 minutes

    console.log(chalk.blue('Monitoring system idle time...'));

    let lastIdle = false;

    setInterval(async () => {
      const idleModule = await import('desktop-idle');
      const idleTime = idleModule.default.getIdleTime();

      if (idleTime >= IDLE_THRESHOLD_SECONDS) {
        lastIdle = true;
        const activeEntry = await clockify.getActiveTimer(workspaceId, userId);
        if (activeEntry) {
          const completedAt = new Date().toISOString();
          console.log(chalk.yellow(`System idle for ${Math.floor(idleTime)} seconds. Stopping timer...`));

          const stoppedEntry = await clockify.stopTimer(workspaceId, userId);
          if (stoppedEntry) {
            completeLatestSession(completedAt, true);
            console.log(chalk.red('Timer stopped due to idle activity.'));
          }
        }
      } else {
        // User is active
        if (lastIdle) {
          // Check if the latest session was autoCompleted, if yes, start new timer
          const latestSession = getLatestSession();
          if (latestSession && latestSession.isAutoCompleted && latestSession.completedAt) {
            const activeEntry = await clockify.getActiveTimer(workspaceId, userId);
            if (!activeEntry) {
              await clockify.startTimer(workspaceId, latestSession.projectId, latestSession.description);
              console.log(chalk.green('User is active again. Timer restarted for the last used project.'));
            }
          }
        }
        lastIdle = false;
      }
    }, 5000); // Check every 5 seconds
  });

program.parse(process.argv);
