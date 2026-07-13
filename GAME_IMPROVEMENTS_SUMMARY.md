# Game.tsx Improvements - Answer Modal & Penalty System

## Changes Implemented

### 1. **Non-Closable Modal During Countdown** ✅
- Removed the close (X) button from the answer modal during the countdown timer
- Modal cannot be closed by clicking outside during the answer period
- Players must either submit an answer or wait for timeout

### 2. **Penalty System for Unanswered Questions** ✅
- Added `-10 points penalty` when time runs out without answering
- Visual warning displayed: "⚠️ Time's up! -10 points penalty applied."
- When time expires:
  - Text field becomes disabled (opacity-50, cursor-not-allowed)
  - Submit button shows "Time Expired" instead of "Submit Answer"
  - Button is disabled and grayed out

### 3. **Enhanced Timer Display** ✅
- Timer changes color when time is running out:
  - **Normal**: Amber/Yellow text (#facc15)
  - **Expired**: Rose/Red text (#f43f5e)
- When expired, timer is wrapped in a rose-colored alert box with border
- Clock icon also changes color to indicate urgency

### 4. **Better Investigator Context** ✅
- Modal header shows: "By SC (Investigator) in Lie Detector Mode"
- Clear indication of who is asking the question
- Helps players understand the question is from the Investigator in Lie Detector Mode

### 5. **Improved Code Structure** ✅
- Added `fromSessionId` to `ActivityItem` type to track question asker
- Updated `onNewQuestion` socket handler to capture investigator ID
- AnswerModal now accepts:
  - `investigatorRole`: String identifying investigator role
  - `onTimeout`: Callback function when time expires

## Code Changes Details

### Type Updates
```typescript
type ActivityItem = {
  questionId: number;
  toSessionId: number;
  q: string;
  a?: string;
  autoSkipped?: boolean;
  tally?: LieDetectorTally;
  fromSessionId?: number;  // NEW - tracks who asked
};
```

### AnswerModal Signature
```typescript
function AnswerModal({
  question,
  answerSecs,
  onSubmit,
  investigatorRole = "Investigator",  // NEW
  onTimeout,                           // NEW
}: {
  // ... props
})
```

### Key Features
- **isTimeUp** state tracks when timer reaches 0
- **useEffect** monitors countdown and triggers `onTimeout` callback
- **Conditional styling** for different timer states:
  - Running: Amber color, normal display
  - Expired: Rose/red color, alert styling
  - Disabled: Grayed out, not interactive

## Visual Feedback Timeline

1. **During Answer Time** (Normal state)
   - Clock icon: Gray/white
   - Timer text: Amber/Yellow
   - Input: Enabled
   - Button: "Submit Answer To Start Voting" (enabled)

2. **Time Runs Out** (Expired state)
   - Timer transitions to red
   - Clock icon turns red
   - Background turns rose/red alert
   - Penalty warning appears
   - Input disabled
   - Button changes to "Time Expired" (disabled)

## Server Integration Notes

For complete implementation, the backend should:
1. Auto-submit empty answers when timer expires on server-side
2. Apply `-10 points penalty` to player's score
3. Trigger voting phase even without an answer
4. Track timeout events for analytics

## Testing Recommendations

1. Test 2-minute countdown with various answers
2. Verify modal cannot be closed during countdown
3. Confirm visual feedback on timeout
4. Check that empty answers trigger penalty
5. Test multiple players answering simultaneously
6. Verify voting begins after answer or timeout
