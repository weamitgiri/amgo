const API_ENDPOINTS = {
  public: {
    packages: "/v1/public/packages",
    cms: "/v1/public/cms",
    cmsBySlug: (slug) => `/v1/public/cms/${slug}`,
    settings: "/v1/public/settings",
    games: "/v1/public/games",
    gameById: (id) => `/v1/public/games/${id}`
  },
  participant: {
    joinLink: (linkToken) => `/v1/participant/join-links/${linkToken}`,
    join: "/v1/participant/join",
    verifyOtp: "/v1/participant/verify-otp",
    lobby: (groupId) => `/v1/participant/lobby/${groupId}`,
    gameSummary: (groupId) => `/v1/participant/game-summary/${groupId}`
  },
  game: {
    state: (groupId) => `/v1/game/state/${groupId}`,
    askQuestion: "/v1/game/ask-question",
    answerQuestion: "/v1/game/answer-question",
    startLieDetector: "/v1/game/start-lie-detector",
    voteLieDetector: "/v1/game/vote-lie-detector",
    lieDetectorTally: (roundId) => `/v1/game/lie-detector/${roundId}/tally`,
    endLieDetector: "/v1/game/end-lie-detector",
    usePasscard: "/v1/game/use-passcard",
    reopenCaseSummary: "/v1/game/reopen-case-summary",
    submitAccusation: "/v1/game/submit-accusation"
  },
  results: {
    get: (groupId) => `/v1/results/${groupId}`,
    pdf: (groupId) => `/v1/results/${groupId}/pdf`
  },
  organizer: {
    register: "/v1/organizer/register",
    verifyOtp: "/v1/organizer/verify-otp",
    resendOtp: "/v1/organizer/resend-otp",
    login: "/v1/organizer/login",
    verifyLogin: "/v1/organizer/verify-login",
    dashboard: "/v1/organizer/dashboard",
    profile: "/v1/organizer/profile",
    profileBilling: "/v1/organizer/profile/billing",
    eventStats: (bookingId) => `/v1/organizer/event-stats/${bookingId}`,
    notifications: (bookingId) => `/v1/organizer/notifications/${bookingId}`,
    notificationsReadAll: (bookingId) => `/v1/organizer/notifications/${bookingId}/read-all`,
    createBooking: "/v1/organizer/create-booking",
    booking: (bookingId) => `/v1/organizer/booking/${bookingId}`,
    completeBooking: "/v1/organizer/complete-booking",
    updateSession: "/v1/organizer/update-session",
    results: "/v1/organizer/results",
    deleteAccount: "/v1/organizer/account/delete"
  }
};
export {
  API_ENDPOINTS as A
};
