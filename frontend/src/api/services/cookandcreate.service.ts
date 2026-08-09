import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";
import type {
  CCGameStateResponse,
  CCTemplate,
  CCIngredient,
  CCOtherDish,
  CCAwardsBoard,
} from "../types/cookandcreate";

const noAuth = { auth: "none" as const };

export const cookAndCreateService = {
  getGameState: (groupId: number | string, participantId?: number | string) => {
    const base = API_ENDPOINTS.cookandcreate.state(groupId);
    const qs =
      participantId != null
        ? `?participant_id=${encodeURIComponent(String(participantId))}`
        : "";
    return apiClient.get<CCGameStateResponse>(`${base}${qs}`, noAuth);
  },

  // NOTE: every write endpoint below is validated server-side (see
  // apis/src/routes/cookandcreate/index.ts) on `instance_id`, not `group_id` —
  // these payload shapes must match that contract exactly.

  submitRound1Votes: (payload: {
    instance_id: number | string;
    participant_id: number | string;
    ingredient_ids: number[];
  }) =>
    apiClient.post<{ message: string }>(
      API_ENDPOINTS.cookandcreate.round1Vote,
      payload,
      noAuth
    ),

  finalizeRound1: (payload: { instance_id: number | string }) =>
    apiClient.post<{ message: string }>(
      API_ENDPOINTS.cookandcreate.round1Finalize,
      payload,
      noAuth
    ),

  submitRound2Step: (payload: {
    instance_id: number | string;
    participant_id: number | string;
    step_text: string;
    step_letter: string;
  }) =>
    apiClient.post<{ message: string }>(
      API_ENDPOINTS.cookandcreate.round2SubmitStep,
      payload,
      noAuth
    ),

  submitRound2StepVote: (payload: {
    instance_id: number | string;
    participant_id: number | string;
    step_id: number;
    vote: "keep" | "remove";
  }) =>
    apiClient.post<{ message: string }>(
      API_ENDPOINTS.cookandcreate.round2VoteStep,
      payload,
      noAuth
    ),

  submitDishName: (payload: {
    instance_id: number | string;
    participant_id: number | string;
    dish_name: string;
  }) =>
    apiClient.post<{ message: string }>(
      API_ENDPOINTS.cookandcreate.round2SubmitDishName,
      payload,
      noAuth
    ),

  submitRound3Message: (payload: {
    instance_id: number | string;
    participant_id: number | string;
    message: string;
    is_impostor_private?: boolean;
  }) =>
    apiClient.post<{ message: string }>(
      API_ENDPOINTS.cookandcreate.round3SendMessage,
      payload,
      noAuth
    ),

  startRound3Voting: (payload: { instance_id: number | string }) =>
    apiClient.post<{ message: string }>(
      API_ENDPOINTS.cookandcreate.round3StartVoting,
      payload,
      noAuth
    ),

  submitRound3ImpostorVote: (payload: {
    instance_id: number | string;
    participant_id: number | string;
    voted_for_participant_id: number;
  }) =>
    apiClient.post<{ message: string }>(
      API_ENDPOINTS.cookandcreate.round3VoteImpostor,
      payload,
      noAuth
    ),

  finalizeRound3: (payload: { instance_id: number | string }) =>
    apiClient.post<{ message: string }>(
      API_ENDPOINTS.cookandcreate.round3Finalize,
      payload,
      noAuth
    ),

  getOtherDishes: (groupId: number | string, participantId: number | string) =>
    apiClient.get<{ dishes: CCOtherDish[] }>(
      `${API_ENDPOINTS.cookandcreate.otherDishes(groupId)}?participant_id=${encodeURIComponent(String(participantId))}`,
      noAuth
    ),

  submitRating: (payload: {
    instance_id: number | string;
    participant_id: number | string;
    rated_group_id: number | string;
    category_id: number | string;
  }) =>
    apiClient.post<{ message: string }>(
      API_ENDPOINTS.cookandcreate.rate,
      payload,
      noAuth
    ),

  getAwards: (groupId: number | string) =>
    apiClient.get<CCAwardsBoard>(API_ENDPOINTS.cookandcreate.awards(groupId), noAuth),

  listTemplates: () =>
    apiClient.get<{ templates: CCTemplate[] }>(
      API_ENDPOINTS.cookandcreate.adminTemplates
    ),

  getTemplateDetails: (templateId: number | string) =>
    apiClient.get<{ template: CCTemplate }>(
      API_ENDPOINTS.cookandcreate.adminTemplateDetails(templateId)
    ),

  saveTemplate: (payload: Partial<CCTemplate> & { activity_game_id?: number }) =>
    apiClient.post<{ template: CCTemplate; message: string }>(
      API_ENDPOINTS.cookandcreate.adminTemplates,
      payload
    ),

  listIngredients: () =>
    apiClient.get<{ ingredients: CCIngredient[] }>(
      API_ENDPOINTS.cookandcreate.adminIngredients,
      noAuth
    ),

  saveIngredient: (payload: Partial<CCIngredient>) =>
    apiClient.post<{ ingredient: CCIngredient; message: string }>(
      API_ENDPOINTS.cookandcreate.adminIngredients,
      payload
    ),

  deleteIngredient: (id: number | string) =>
    apiClient.delete<{ message: string }>(
      API_ENDPOINTS.cookandcreate.adminIngredientById(id)
    ),
};
