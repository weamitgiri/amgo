"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeData = void 0;
const serializeData = (data) => {
    return JSON.parse(JSON.stringify(data, (key, value) => typeof value === 'bigint' ? value.toString() : value));
};
exports.serializeData = serializeData;
