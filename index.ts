#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config();
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { Clockify } from './clockify';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();
const clockify = new Clockify();

async function getLocalProjects(): Promise<{ id: string; name: string }[]> {
    const localProjectsPath = path.join(__dirname, '../config/local-projects.json');
    try {
        const data = fs.readFileSync(localProjectsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
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
        userId
    };
}


program
    .name('tracker')
    .description('A CLI to track your time in Clockify')
    .version('1.0.0');

program
    .command('start')
    .description('Start a new time entry. Select a project interactively.')
    .action(async () => {
        const { workspaceId } = await getWorkspaceAndUser();

        let projects = await clockify.getProjects(workspaceId);
        let localProjects = await getLocalProjects();

        if (localProjects.length === 0) {
            // If local-projects.json is empty or doesn't exist, populate it with all project IDs and names
            const allProjects = projects.map((p: any) => ({ id: p.id, name: p.name }));
            const localProjectsPath = path.join(__dirname, '../data/local-projects.json');
            fs.writeFileSync(localProjectsPath, JSON.stringify(allProjects, null, 2), 'utf8');
            console.log(chalk.green('All projects have been saved to data/local-projects.json. Please edit this file to select your preferred projects.'));
            localProjects = allProjects;
        }

        if (localProjects.length > 0) {
            const localProjectIds = localProjects.map(p => p.id);
            projects = projects.filter((p: any) => localProjectIds.includes(p.id));
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
                choices: projects.map((p: any) => ({ name: p.name, value: p.id })),
            },
        ]);

        const entry = await clockify.startTimer(workspaceId, selectedProjectId);
        if (entry) {
            const projectName = projects.find((p: any) => p.id === selectedProjectId).name;
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


program.parse(process.argv);
