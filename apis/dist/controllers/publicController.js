"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGameDetails = exports.getGames = exports.getSettings = exports.getCmsPageBySlug = exports.getCmsPages = exports.getPackages = void 0;
const db_1 = require("../config/db");
const apiResponse_1 = require("../utils/apiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const AppError_1 = require("../utils/AppError");
/**
 * Get all active packages
 */
exports.getPackages = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const [rows] = await (0, db_1.query)('SELECT id, name, slug, price, max_users, total_groups, validity_days, short_description, features, game_access, status FROM packages WHERE status = ? AND deleted_at IS NULL ORDER BY sort_order ASC', ['active']);
    // Parse JSON fields if they are strings
    const packages = rows.map((pkg) => ({
        ...pkg,
        features: typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features,
        game_access: typeof pkg.game_access === 'string' ? JSON.parse(pkg.game_access) : pkg.game_access
    }));
    return (0, apiResponse_1.successResponse)(res, 'Packages retrieved successfully.', packages);
});
/**
 * Get CMS pages (published only)
 */
exports.getCmsPages = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const [rows] = await (0, db_1.query)('SELECT id, page_name, slug, title, content, meta_title, meta_description, meta_keywords, featured_image FROM cms_pages WHERE status = 1 AND deleted_at IS NULL', []);
    return (0, apiResponse_1.successResponse)(res, 'CMS pages retrieved successfully.', rows);
});
/**
 * Get a specific CMS page by slug
 */
exports.getCmsPageBySlug = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { slug } = req.params;
    const [rows] = await (0, db_1.query)('SELECT id, page_name, slug, title, content, meta_title, meta_description, meta_keywords, featured_image FROM cms_pages WHERE slug = ? AND status = 1 AND deleted_at IS NULL', [slug]);
    if (rows.length === 0) {
        throw new AppError_1.AppError('CMS page not found', 404);
    }
    return (0, apiResponse_1.successResponse)(res, 'CMS page retrieved successfully.', rows[0]);
});
/**
 * Get site settings
 */
exports.getSettings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const [rows] = await (0, db_1.query)('SELECT `key`, `value` FROM settings', []);
    // Convert to a more usable object format: { key: value }
    const settings = {};
    rows.forEach((row) => {
        settings[row.key] = row.value;
    });
    return (0, apiResponse_1.successResponse)(res, 'Settings retrieved successfully.', settings);
});
/**
 * Get list of active activities (games)
 */
exports.getGames = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const [rows] = await (0, db_1.query)('SELECT id, title, slug, icon, description, cover_image, status FROM activities WHERE status = ?', ['active']);
    return (0, apiResponse_1.successResponse)(res, 'Games retrieved successfully.', rows);
});
/**
 * Get specific game details with its sub-games/variations
 */
exports.getGameDetails = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const [activityRows] = await (0, db_1.query)('SELECT id, title, slug, description, cover_image, status FROM activities WHERE id = ? AND status = ?', [id, 'active']);
    if (activityRows.length === 0) {
        throw new AppError_1.AppError('Game not found', 404);
    }
    const game = activityRows[0];
    // Fetch sub-games (activity_games)
    const [subGameRows] = await (0, db_1.query)('SELECT id, title, case_summary, tagline, status FROM activity_games WHERE activity_id = ? AND status = ?', [id, 'active']);
    game.sub_games = subGameRows;
    return (0, apiResponse_1.successResponse)(res, 'Game details retrieved successfully.', game);
});
