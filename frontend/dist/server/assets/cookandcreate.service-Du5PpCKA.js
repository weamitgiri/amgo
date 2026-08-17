import { jsxs, jsx } from "react/jsx-runtime";
import { a as apiClient } from "./router-BvkvNwFV.js";
import { A as API_ENDPOINTS } from "./config-OQZNPa_v.js";
const decorLeft = "/assets/decor-left-CtCSr_DC.png";
const decorRight = "/assets/decor-right-2uVypCio.png";
function CookCreateLayout({ children, breadcrumb }) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "relative min-h-screen overflow-hidden",
      style: { backgroundColor: "#FFF8F0" },
      children: [
        /* @__PURE__ */ jsx("div", { className: "px-6 pt-4 pb-2", children: /* @__PURE__ */ jsx(
          "span",
          {
            className: "text-sm font-semibold",
            style: { color: "#8B7355" },
            children: breadcrumb
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "relative z-10 mx-auto max-w-6xl px-6 pb-16", children }),
        /* @__PURE__ */ jsx(
          "img",
          {
            src: decorLeft,
            alt: "",
            className: "pointer-events-none fixed bottom-0 left-0 w-44 md:w-56 opacity-90 z-0 select-none"
          }
        ),
        /* @__PURE__ */ jsx(
          "img",
          {
            src: decorRight,
            alt: "",
            className: "pointer-events-none fixed bottom-0 right-0 w-52 md:w-64 opacity-90 z-0 select-none"
          }
        )
      ]
    }
  );
}
const noAuth = { auth: "none" };
const cookAndCreateService = {
  getGameState: (groupId, participantId) => {
    const base = API_ENDPOINTS.cookandcreate.state(groupId);
    const qs = participantId != null ? `?participant_id=${encodeURIComponent(String(participantId))}` : "";
    return apiClient.get(`${base}${qs}`, noAuth);
  },
  // NOTE: every write endpoint below is validated server-side (see
  // apis/src/routes/cookandcreate/index.ts) on `instance_id`, not `group_id` —
  // these payload shapes must match that contract exactly.
  submitRound1Votes: (payload) => apiClient.post(
    API_ENDPOINTS.cookandcreate.round1Vote,
    payload,
    noAuth
  ),
  finalizeRound1: (payload) => apiClient.post(
    API_ENDPOINTS.cookandcreate.round1Finalize,
    payload,
    noAuth
  ),
  // step_letter is assigned server-side from the submitter's Round-2 turn.
  submitRound2Step: (payload) => apiClient.post(
    API_ENDPOINTS.cookandcreate.round2SubmitStep,
    payload,
    noAuth
  ),
  submitRound2StepVote: (payload) => apiClient.post(
    API_ENDPOINTS.cookandcreate.round2VoteStep,
    payload,
    noAuth
  ),
  submitDishName: (payload) => apiClient.post(
    API_ENDPOINTS.cookandcreate.round2SubmitDishName,
    payload,
    noAuth
  ),
  submitRound3Message: (payload) => apiClient.post(
    API_ENDPOINTS.cookandcreate.round3SendMessage,
    payload,
    noAuth
  ),
  startRound3Voting: (payload) => apiClient.post(
    API_ENDPOINTS.cookandcreate.round3StartVoting,
    payload,
    noAuth
  ),
  respondToDoubleDown: (payload) => apiClient.post(
    API_ENDPOINTS.cookandcreate.round3DoubleDown,
    payload,
    noAuth
  ),
  submitRound3ImpostorVote: (payload) => apiClient.post(
    API_ENDPOINTS.cookandcreate.round3VoteImpostor,
    payload,
    noAuth
  ),
  finalizeRound3: (payload) => apiClient.post(
    API_ENDPOINTS.cookandcreate.round3Finalize,
    payload,
    noAuth
  ),
  getOtherDishes: (groupId, participantId) => apiClient.get(
    `${API_ENDPOINTS.cookandcreate.otherDishes(groupId)}?participant_id=${encodeURIComponent(String(participantId))}`,
    noAuth
  ),
  submitRating: (payload) => apiClient.post(
    API_ENDPOINTS.cookandcreate.rate,
    payload,
    noAuth
  ),
  getAwards: (groupId) => apiClient.get(API_ENDPOINTS.cookandcreate.awards(groupId), noAuth),
  listTemplates: () => apiClient.get(
    API_ENDPOINTS.cookandcreate.adminTemplates
  ),
  getTemplateDetails: (templateId) => apiClient.get(
    API_ENDPOINTS.cookandcreate.adminTemplateDetails(templateId)
  ),
  saveTemplate: (payload) => apiClient.post(
    API_ENDPOINTS.cookandcreate.adminTemplates,
    payload
  ),
  listIngredients: () => apiClient.get(
    API_ENDPOINTS.cookandcreate.adminIngredients,
    noAuth
  ),
  saveIngredient: (payload) => apiClient.post(
    API_ENDPOINTS.cookandcreate.adminIngredients,
    payload
  ),
  deleteIngredient: (id) => apiClient.delete(
    API_ENDPOINTS.cookandcreate.adminIngredientById(id)
  )
};
export {
  CookCreateLayout as C,
  decorRight as a,
  cookAndCreateService as c,
  decorLeft as d
};
