<?php

namespace App\Http\Controllers\API;

use App\Models\Activity;
use App\Models\ActivityGame;
use App\Models\Package;
use App\Http\Resources\API\ActivityGameResource;
use App\Http\Resources\API\PackageResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ActivityController extends BaseController
{
    /**
     * Get all active games with their parent activity details
     */
    public function getGames()
    {
        try {
            $games = ActivityGame::with('activity')
                ->where('status', 'active')
                ->latest()
                ->get();
                
            return $this->successResponse($games->map(function($game) {
                return [
                    'id' => $game->id,
                    'title' => $game->title,
                    'activity_id' => $game->activity_id,
                    'activity_title' => $game->activity->title,
                    'status' => $game->status,
                    'created_at' => $game->created_at->toDateTimeString(),
                ];
            }), 'Games fetched successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch games', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get full game details by slug including inherited settings
     */
    public function getGameDetails($slug)
    {
        try {
            // In the new structure, we might want to find by game title slug or id
            // Assuming we still want to find by a slug (using title for now)
            $game = ActivityGame::with(['activity', 'roles.strategyCards', 'investigatorCards', 'photos', 'clues', 'rules', 'fullStory'])
                ->where('status', 'active')
                ->where('title', 'LIKE', str_replace('-', ' ', $slug)) // Simple slug match for now
                ->first();
            
            if (!$game) return $this->errorResponse('Game not found', [], 404);
            
            return $this->successResponse([
                'game' => new ActivityGameResource($game),
                'time_settings' => $game->getTimeSettings()
            ], 'Game details fetched successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch game details', ['error' => $e->getMessage()]);
        }
    }

    public function getPackages()
    {
        try {
            $packages = Cache::remember('api_packages', 3600, function () {
                return Package::where('status', 'active')->get();
            });
            return $this->successResponse(PackageResource::collection($packages), 'Packages fetched successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch packages', ['error' => $e->getMessage()]);
        }
    }
}
