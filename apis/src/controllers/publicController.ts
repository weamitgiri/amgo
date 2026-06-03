import { Request, Response } from 'express';
import { query } from '../config/db';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

/**
 * Get all active packages
 */
export const getPackages = asyncHandler(async (req: Request, res: Response) => {
    const [rows] = await query(
        'SELECT id, name, slug, price, max_users, total_groups, validity_days, short_description, features, game_access, status FROM packages WHERE status = ? AND deleted_at IS NULL ORDER BY sort_order ASC',
        ['active']
    );
    
    // Parse JSON fields if they are strings
    const packages = rows.map((pkg: any) => ({
        ...pkg,
        features: typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features,
        game_access: typeof pkg.game_access === 'string' ? JSON.parse(pkg.game_access) : pkg.game_access
    }));

    return successResponse(res, 'Packages retrieved successfully.', packages);
});

/**
 * Get CMS pages (published only)
 */
export const getCmsPages = asyncHandler(async (req: Request, res: Response) => {
    const [rows] = await query(
        'SELECT id, page_name, slug, title, content, meta_title, meta_description, meta_keywords, featured_image FROM cms_pages WHERE status = 1 AND deleted_at IS NULL',
        []
    );
    return successResponse(res, 'CMS pages retrieved successfully.', rows);
});

/**
 * Get a specific CMS page by slug
 */
export const getCmsPageBySlug = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const [rows] = await query(
        'SELECT id, page_name, slug, title, content, meta_title, meta_description, meta_keywords, featured_image FROM cms_pages WHERE slug = ? AND status = 1 AND deleted_at IS NULL',
        [slug]
    );

    if (rows.length === 0) {
        throw new AppError('CMS page not found', 404);
    }

    return successResponse(res, 'CMS page retrieved successfully.', rows[0]);
});

/**
 * Get site settings
 */
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
    const [rows] = await query(
        'SELECT `key`, `value` FROM settings',
        []
    );
    
    // Convert to a more usable object format: { key: value }
    const settings: { [key: string]: any } = {};
    rows.forEach((row: any) => {
        settings[row.key] = row.value;
    });

    return successResponse(res, 'Settings retrieved successfully.', settings);
});

/**
 * Get list of active activities (games)
 */
export const getGames = asyncHandler(async (req: Request, res: Response) => {
    const [rows] = await query(
        'SELECT id, title, slug, icon, description, cover_image, status FROM activities WHERE status = ?',
        ['active']
    );
    return successResponse(res, 'Games retrieved successfully.', rows);
});

/**
 * Get specific game details with its sub-games/variations
 */
export const getGameDetails = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const [activityRows] = await query(
        'SELECT id, title, slug, description, cover_image, status FROM activities WHERE id = ? AND status = ?',
        [id, 'active']
    );

    if (activityRows.length === 0) {
        throw new AppError('Game not found', 404);
    }

    const game = activityRows[0];

    // Fetch sub-games (activity_games)
    const [subGameRows] = await query(
        'SELECT id, title, case_summary, tagline, status FROM activity_games WHERE activity_id = ? AND status = ?',
        [id, 'active']
    );

    game.sub_games = subGameRows;

    return successResponse(res, 'Game details retrieved successfully.', game);
});
