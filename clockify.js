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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clockify = void 0;
var http_client_1 = require("./lib/http-client");
var Clockify = /** @class */ (function () {
    function Clockify() {
        this.httpClient = (new http_client_1.HttpClient()).getClient();
    }
    Clockify.prototype.getUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.httpClient.get('/user')];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Could not connect to Clockify. Please check your API key.');
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Clockify.prototype.getProjects = function (workspaceId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.httpClient.get("/workspaces/".concat(workspaceId, "/projects"))];
                    case 1:
                        response = _c.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_2 = _c.sent();
                        console.error('Error fetching projects:', ((_b = (_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error_2.message);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Clockify.prototype.startTimer = function (workspaceId_1, projectId_1) {
        return __awaiter(this, arguments, void 0, function (workspaceId, projectId, description) {
            var response, error_3;
            var _a, _b;
            if (description === void 0) { description = 'Working on a task...'; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.httpClient.post("/workspaces/".concat(workspaceId, "/time-entries"), {
                                projectId: projectId,
                                description: description,
                                start: new Date().toISOString(),
                            })];
                    case 1:
                        response = _c.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_3 = _c.sent();
                        console.error('Error starting timer:', ((_b = (_a = error_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error_3.message);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Clockify.prototype.stopTimer = function (workspaceId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_4;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.httpClient.patch("/workspaces/".concat(workspaceId, "/user/").concat(userId, "/time-entries"), {
                                end: new Date().toISOString(),
                            })];
                    case 1:
                        response = _c.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_4 = _c.sent();
                        console.error('Error stopping timer:', ((_b = (_a = error_4.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error_4.message);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Clockify.prototype.getActiveTimer = function (workspaceId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_5;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.httpClient.get("/workspaces/".concat(workspaceId, "/user/").concat(userId, "/time-entries?in-progress=true"))];
                    case 1:
                        response = _c.sent();
                        return [2 /*return*/, response.data[0]];
                    case 2:
                        error_5 = _c.sent();
                        console.error('Error fetching active timer:', ((_b = (_a = error_5.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error_5.message);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return Clockify;
}());
exports.Clockify = Clockify;
