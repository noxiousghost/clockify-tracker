"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
var axios_1 = __importDefault(require("axios"));
var app_1 = __importDefault(require("../config/app"));
var clockify_1 = __importDefault(require("../config/clockify"));
var HttpClient = /** @class */ (function () {
    function HttpClient() {
        try {
            this.client = axios_1.default.create({
                baseURL: app_1.default.appBaseUrl,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': "Bearer ".concat(clockify_1.default.clockifyApiKey)
                }
            });
        }
        catch (err) {
            console.error('Could not connect to Clockify. Please check your API key.');
        }
    }
    HttpClient.prototype.getClient = function () {
        return this.client;
    };
    return HttpClient;
}());
exports.HttpClient = HttpClient;
