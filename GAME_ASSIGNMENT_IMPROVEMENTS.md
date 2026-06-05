# Game Assignment Logic Improvements

## Current State
- Games are currently assigned at the **booking level** - all participants in a booking play the same game
- Groups are created to organize participants (max 5 per group)
- All groups in a booking share the same game

## Requested Feature
- Assign **different games to different groups** within the same booking
- Support for: "if I have 2 groups, assign different games to each group"
- If only 1 game available, assign it to all groups

## Implementation Plan

### 1. Database Schema Changes

Add `game_id` column to `game_groups` table:
```sql
ALTER TABLE game_groups ADD COLUMN game_id BIGINT UNSIGNED DEFAULT NULL;
ALTER TABLE game_groups ADD FOREIGN KEY (game_id) REFERENCES activity_games(id);
```

### 2. Backend Changes

#### Update participantController.ts
- Modify game_id retrieval to check group-level assignment first:
  ```typescript
  const game_id = group_game_id || booking_game_id;
  ```

#### Update participantGroupService.ts
- Add function `assignGameToGroup(groupId, gameId)`
- Modify group assignment logic to consider game availability

#### Update gameSummaryService.ts
- When fetching game summary, use the group's assigned game_id
- Query: `SELECT game FROM activity_games WHERE id = (SELECT game_id FROM game_groups WHERE id = ?)`

### 3. Frontend Changes

No immediate changes needed to game.tsx. The flow already handles:
- ✅ Card images display (FIXED)
- ✅ Timer persistence across refresh (FIXED)
- ✅ Activity and questions state restoration (FIXED)

### 4. Admin Interface Requirements

Need to add UI for:
- Viewing available games for a booking
- Assigning games to specific groups
- Bulk assignment options (e.g., "auto-assign different games")

### 5. API Endpoints Needed

```
POST /api/groups/:groupId/assign-game
{
  "game_id": 1
}

GET /api/bookings/:bookingId/groups/game-assignments
Response: {
  groups: [
    { id: 1, name: "Group 1", game_id: 1 },
    { id: 2, name: "Group 2", game_id: 2 }
  ]
}
```

### 6. Logic for Auto-Assignment

```javascript
function assignGamesToGroups(bookingId, numGames, groups) {
  if (numGames === 1) {
    // Assign the single game to all groups
    groups.forEach(group => assignGameToGroup(group.id, gameList[0].id));
  } else if (numGames >= groups.length) {
    // Assign different games to each group (round-robin if more games than groups)
    groups.forEach((group, index) => {
      assignGameToGroup(group.id, gameList[index % gameList.length].id);
    });
  } else {
    // More groups than games: repeat games
    groups.forEach((group, index) => {
      assignGameToGroup(group.id, gameList[index % numGames].id);
    });
  }
}
```

## Testing Checklist

- [ ] Single game, multiple groups → all groups get same game
- [ ] Multiple games, multiple groups → each group gets unique game
- [ ] Game assignment persists after page refresh
- [ ] Participants fetch correct game for their group
- [ ] Timers work correctly for different groups with different games

## Related Issue Fixed
- ✅ Key People cards now display actual role images (was showing Eye icon placeholder)
- ✅ Card images maintain consistent sizing
- ✅ Header timer persists across page refresh (uses sessionStorage)
- ✅ Activity log and questions state restored after refresh
