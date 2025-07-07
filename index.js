#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require("commander");
var inquirer_1 = __importDefault(require("inquirer"));
var chalk_1 = __importDefault(require("chalk"));
var clockify_1 = require("./clockify");
var program = new commander_1.Command();
var clockify = new clockify_1.Clockify();
function getWorkspaceAndUser() {
    return __awaiter(this, void 0, void 0, function () {
        var user, workspaceId, userId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, clockify.getUser()];
                case 1:
                    user = _a.sent();
                    if (!user) {
                        console.log(chalk_1.default.red('Could not connect to Clockify. Please check your API key.'));
                        process.exit(1);
                    }
                    workspaceId = user.defaultWorkspace;
                    userId = user.id;
                    return [2 /*return*/, {
                            workspaceId: workspaceId,
                            userId: userId
                        }];
            }
        });
    });
}
program
    .name('tracker')
    .description('A CLI to track your time in Clockify')
    .version('1.0.0');
program
    .command('start')
    .description('Start a new time entry. Select a project interactively.')
    .action(function () { return __awaiter(void 0, void 0, void 0, function () {
    var workspaceId, projects, selectedProjectId, entry, projectName;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getWorkspaceAndUser()];
            case 1:
                workspaceId = (_a.sent()).workspaceId;
                return [4 /*yield*/, clockify.getProjects(workspaceId)];
            case 2:
                projects = _a.sent();
                if (!projects || projects.length === 0) {
                    console.log(chalk_1.default.yellow('No projects found in your workspace.'));
                    return [2 /*return*/];
                }
                return [4 /*yield*/, inquirer_1.default.prompt([
                        {
                            type: 'list',
                            name: 'selectedProjectId',
                            message: 'Which project do you want to work on?',
                            choices: projects.map(function (p) { return ({ name: p.name, value: p.id }); }),
                        },
                    ])];
            case 3:
                selectedProjectId = (_a.sent()).selectedProjectId;
                return [4 /*yield*/, clockify.startTimer(workspaceId, selectedProjectId)];
            case 4:
                entry = _a.sent();
                if (entry) {
                    projectName = projects.find(function (p) { return p.id === selectedProjectId; }).name;
                    console.log(chalk_1.default.green("Timer started for project: ".concat(chalk_1.default.bold(projectName))));
                }
                return [2 /*return*/];
        }
    });
}); });
program
    .command('stop')
    .description('Stop the currently running time entry.')
    .action(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, workspaceId, userId, stoppedEntry;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, getWorkspaceAndUser()];
            case 1:
                _a = _b.sent(), workspaceId = _a.workspaceId, userId = _a.userId;
                return [4 /*yield*/, clockify.stopTimer(workspaceId, userId)];
            case 2:
                stoppedEntry = _b.sent();
                if (stoppedEntry) {
                    console.log(chalk_1.default.red('Timer stopped.'));
                }
                else {
                    console.log(chalk_1.default.yellow('No timer was running.'));
                }
                return [2 /*return*/];
        }
    });
}); });
program
    .command('status')
    .description('Check the status of the current timer.')
    .action(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, workspaceId, userId, activeEntry, startTime, duration, hours, minutes;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, getWorkspaceAndUser()];
            case 1:
                _a = _b.sent(), workspaceId = _a.workspaceId, userId = _a.userId;
                return [4 /*yield*/, clockify.getActiveTimer(workspaceId, userId)];
            case 2:
                activeEntry = _b.sent();
                if (activeEntry) {
                    startTime = new Date(activeEntry.timeInterval.start);
                    duration = (new Date() - startTime) / 1000;
                    hours = Math.floor(duration / 3600);
                    minutes = Math.floor((duration % 3600) / 60);
                    console.log(chalk_1.default.green('🕒 A timer is currently running.'));
                    console.log("   - ".concat(chalk_1.default.bold('Project:'), " ").concat(activeEntry.project.name));
                    console.log("   - ".concat(chalk_1.default.bold('Running for:'), " ").concat(hours, "h ").concat(minutes, "m"));
                }
                else {
                    console.log(chalk_1.default.yellow('No timer is currently running.'));
                }
                return [2 /*return*/];
        }
    });
}); });
program.parse(process.argv);
