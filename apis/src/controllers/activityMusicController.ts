import { Request, Response } from 'express';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { getActiveTrackForActivity, getActiveTrackForGroup } from '../services/activityMusicService';

/**
 * Active background music for an activity (id or slug). data is null when the
 * activity has no active track — the website then plays nothing.
 */
export const getActivityMusic = asyncHandler(async (req: Request, res: Response) => {
    const track = await getActiveTrackForActivity(req.params.activity);
    return successResponse(res, track ? 'Activity music retrieved.' : 'No active music for this activity.', track);
});

/**
 * Active background music for the activity a participant group is playing
 * (the game pages only know their group). data is null when there is none.
 */
export const getGroupMusic = asyncHandler(async (req: Request, res: Response) => {
    const { group_id } = req.params;
    if (!/^\d+$/.test(String(group_id))) {
        throw new AppError('Invalid group id', 400);
    }
    const track = await getActiveTrackForGroup(group_id);
    return successResponse(res, track ? 'Activity music retrieved.' : 'No active music for this activity.', track);
});
