# Zoventro Game Logic & Flow Documentation

This document outlines the core business logic, state transitions, and scoring systems for the Zoventro platform.

---

## 1. Group Formation Logic
**Strict Requirement**: Exactly 5 players per group.
- **Lobby Entry**: Participants join a lobby associated with an `organizer_code`.
- **Auto-Grouping Strategy**:
    1. Search for an existing group with `status: waiting` and `player_count < 5`.
    2. If found, add the participant and increment `player_count`.
    3. If not found, create a new group and add the participant.
- **Game Gating**: The game **cannot** transition to `active` until `player_count == 5`.
- **UI State**: HR Dashboard shows "Group Not Formed Yet" and the count of pending users.

---

## 2. Role Assignment Logic
Triggered automatically when a group hits 5 players.
- **Roles**:
    1. **Investigator**: Lead, asks questions, submits final verdict.
    2. **Hidden Culprit**: The target, wins if not identified.
    3. **Key Suspect**: Red herring, wins if the Culprit is not identified.
    4. **Witness**: Has secret information, wins if Culprit is identified.
    5. **Participant**: General player, wins if Culprit is identified.
- **Distribution**: Uses a randomized shuffle (Fisher-Yates) to map the 5 participants to the 5 roles.

---

## 3. Game Phase Transitions (Timers)
All timers are persistent and stored in the database.

| Phase | Duration | Logic |
|-------|----------|-------|
| **Lobby** | Variable | Waits for 5 players. |
| **Case Summary** | 5 Minutes | Visible to all. Investigator can reopen **once** for +5 mins. |
| **Questioning** | 20 Minutes | Investigator asks questions. Suspects answer. |
| **Clue Room** | Auto-Unlock | Opens 10 minutes from game start. |
| **Lie Detector** | 7 Minutes | Investigator selects 1 suspect. 3 questions max. |
| **Final Verdict** | No Timer | Investigator submits the identified culprit. |

---

## 4. Questioning & Scoring System
- **Question Limit**: Investigator can ask a total of **5 questions** (total for the group, not per user).
- **Point Bonus**: Investigator gets **+10 points** for every question asked.
- **Answer Timeout**: Suspects must answer within **2 minutes**.
- **Penalty**: If an answer is submitted after 2 minutes, the suspect receives a **-10 point penalty**.
- **Visibility**: Questions and answers are broadcast in real-time to all group members.

---

## 5. Lie Detector Mechanics
- **Activation**: Investigator selects one suspect to put under the lie detector.
- **Limits**: Maximum **3 questions** can be asked during this phase.
- **Voting**: Other players vote on each answer: `Believable` or `Suspicious`.
- **Persistence**: The round ends after 7 minutes or when all questions/votes are complete.

---

## 6. Witness Passcard
- **Secret Use**: The Witness can activate their passcard **one time**.
- **Notification**: Only the Investigator receives a notification/socket event.
- **Role Confidentiality**: Other players are **not** notified, preserving the Witness's identity.

---

## 7. Result & Winning Logic
The outcome is determined by the Investigator's final submission.

- **Scenario A: Correct Identification**
    - **Winners**: Investigator, Witness, Participant.
    - **Losers**: Hidden Culprit, Key Suspect.
- **Scenario B: Incorrect Identification**
    - **Winners**: Hidden Culprit, Key Suspect.
    - **Losers**: Investigator, Witness, Participant.

---

## 8. Security & Edge Cases
- **Role Privacy**: Role data is never sent in the general `getGameState` unless it belongs to the requesting user.
- **Reconnection**: Timers and state are fetched from the DB upon reconnection to ensure sync.
- **Access Expiry**: Game links expire based on the `expires_at` timestamp configured by the Admin/Organizer.
- **Incomplete Groups**: If a session expires with < 5 players, the group is cancelled and results are not processed.
