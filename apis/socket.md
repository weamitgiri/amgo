# Socket.IO Documentation

This document describes the real-time communication events and their interaction with the APIs in the GTEST project.

## Server Configuration
- **Port**: `5000` (configurable via `PORT` in `.env`)
- **Namespace**: Default `/`
- **Room Logic**: Players are grouped into rooms named `group_{groupId}`.

---

## Socket Events

### 1. Inbound Events (Client to Server)

| Event Name | Data Payload | Description |
| :--- | :--- | :--- |
| `join_game_group` | `{ groupId: string, participantId: string }` | Joins the socket to a room and updates the database (`participant_sessions`) to mark the user as online with their `socket_id`. |
| `leave_game_group` | `{ groupId: string, participantId: string }` | Leaves the room and updates the database to mark the user as offline. |
| `disconnect` | *Auto-triggered* | Automatically marks the participant as offline in the database using their `socket_id`. |

### 2. Outbound Events (Server to Client)

| Event Name | Data Payload | Triggered By | Description |
| :--- | :--- | :--- | :--- |
| `player_joined` | `{ participantId, socketId, timestamp }` | `join_game_group` | Notifies other members in the group that a new player has arrived. |
| `player_left` | `{ participantId, timestamp }` | `leave_game_group` | Notifies others that a player has left the lobby. |
| `new_question` | `SerializedQuestionObject` | `POST /v1/game/ask-question` | Broadcasts a new question from the Investigator to the entire group. |
| `new_answer` | `SerializedAnswerObject` | `POST /v1/game/answer-question` | Broadcasts a suspect's answer to everyone in the room. |
| `lie_detector_started` | `SerializedRoundObject` | `POST /v1/game/start-lie-detector` | Notifies the group that a 7-minute voting round has begun. |
| `new_vote` | `{ round_id, vote_count_update: true }` | `POST /v1/game/vote-lie-detector` | Informs the client that a new vote was cast (to refresh UI). |
| `witness_passcard_used`| `{ message: string }` | `POST /v1/game/use-passcard` | **Secret Event**: Sent *only* to the Investigator's socket. |
| `case_summary_reopened`| `{ message: string }` | `POST /v1/game/reopen-case-summary`| Notifies all members that the summary phase was extended by 5 mins. |
| `game_ended` | `SerializedResultObject` | `POST /v1/game/final-verdict` | Broadcasts the final winners and results to all players. |
| `socket_error` | `{ message: string }` | *Various* | Sent to the client when a socket action fails. |

---

## API & Socket Integration

The game engine relies on a "Hybrid" model where actions are performed via **REST APIs** for validation/persistence and then broadcasted via **Socket.IO** for real-time synchronization.

### Workflow Example: Asking a Question
1.  **Frontend** calls `POST /v1/game/ask-question`.
2.  **Server** validates if the user is the Investigator and if they have questions remaining (< 5).
3.  **Server** saves the question to the `questions` table and awards points.
4.  **Server** uses `io.to('group_123').emit('new_question', ...)` to notify all players instantly.
5.  **Frontend** receives the event and updates the UI without a page refresh.

### Security Note
- **Room Isolation**: Events are always emitted to specific `group_{id}` rooms to prevent data leakage between different game sessions.
- **Secret Communication**: The `witness_passcard_used` event is targeted directly to the Investigator's `socket_id` stored in the database, ensuring other players (Suspects) remain unaware.
