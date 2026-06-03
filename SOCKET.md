# Zoventro Real-time Socket.IO Documentation

This document describes all the real-time events used in the Zoventro platform to handle game flow, player interactions, and state synchronization.

---

## 1. Connection & Setup
The Socket.IO server runs on the same port as the Node.js API.
- **Namespace**: `/`
- **Rooms**: 
    - `group_{groupId}`: All participants in a specific game group.
    - `organizer_{organizerId}`: Real-time updates for organizers.

---

## 2. Client-to-Server Events (Listeners)

### `join_game_group`
- **Payload**: `{ "groupId": "1", "participantId": "101" }`
- **Description**: Participant joins their assigned game group. Updates the database with `socket_id` and `is_online: true`.
- **Response**: `joined_group` event sent back to the client.

### `leave_game_group`
- **Payload**: `{ "groupId": "1", "participantId": "101" }`
- **Description**: Participant leaves the group. Updates database with `is_online: false`.

### `send_message`
- **Payload**: `{ "room": "group_1", "message": "Hello!", "sender": "John" }`
- **Description**: Sends a chat message to a specific room.

### `sync_game_state`
- **Payload**: `{ "groupId": "1", "state": { ... } }`
- **Description**: Broadcasts a complete state update to all players in the group.

### `game_action`
- **Payload**: `{ "groupId": "1", "action": "clue_reveal", "payload": { "clueId": 5 } }`
- **Description**: Broadcasts a specific game action to all group members.

---

## 3. Server-to-Client Events (Emitters)

### Game Flow Events
| Event Name | Payload | Trigger |
|------------|---------|---------|
| `phase_changed` | `{ "new_phase": "string", "message": "string" }` | Triggered by Timer Service when a phase expires. |
| `clues_unlocked` | `{ "message": "string" }` | Triggered 10 mins into the game. |
| `game_ended` | `ResultObject` | Triggered when Investigator submits final verdict. |

### Questioning & Answers
| Event Name | Payload | Description |
|------------|---------|-------------|
| `new_question` | `QuestionObject` | Broadcasted when Investigator asks a question. |
| `new_answer` | `AnswerObject` | Broadcasted when a suspect answers a question. |

### Lie Detector
| Event Name | Payload | Description |
|------------|---------|-------------|
| `lie_detector_started` | `RoundObject` | Broadcasted when Investigator starts a round. |
| `new_vote` | `{ "round_id": "1", "vote_count_update": true }` | Broadcasted when any player votes. |
| `lie_detector_ended` | `{ "message": "string" }` | Triggered when the 7-min timer expires. |

### Special Events
| Event Name | Payload | Recipient | Description |
|------------|---------|-----------|-------------|
| `witness_passcard_used` | `{ "message": "string" }` | **Investigator Only** | Sent privately to the Investigator when Witness uses passcard. |
| `case_summary_reopened` | `{ "message": "string" }` | **All** | Broadcasted when Investigator reopens the summary. |

---

## 4. Presence & Status
| Event Name | Payload | Description |
|------------|---------|-------------|
| `player_joined` | `{ "participantId": "101", "socketId": "xyz" }` | Broadcasted to room when a player joins. |
| `player_left` | `{ "participantId": "101" }` | Broadcasted to room when a player leaves. |

---

## 5. Security Notes
- Sockets should be authenticated. (Planned: Handshake with JWT).
- All sensitive events (e.g., `witness_passcard_used`) are targeted using specific `socket_id` from the database to prevent data leakage.
- `role_id` and role-specific data are never broadcasted in generic events.
