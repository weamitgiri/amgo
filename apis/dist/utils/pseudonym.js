"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shortName = shortName;
function shortName(name, id) {
    const inside = name.match(/\(([^)]+)\)/);
    const base = (inside?.[1] || name.split(/\s+/)[0] || 'Player').replace(/\W/g, '').slice(0, 12);
    return `${base}${(id % 70) + 30}`;
}
