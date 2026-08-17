function clockOffsetMs(schedule, receivedAtMs) {
  if (!schedule?.server_time) return 0;
  const serverMs = new Date(schedule.server_time).getTime();
  if (Number.isNaN(serverMs)) return 0;
  return serverMs - receivedAtMs;
}
export {
  clockOffsetMs as c
};
