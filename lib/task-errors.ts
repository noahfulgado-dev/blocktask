export function friendlyTaskError(message: string) {
  if (/row-level security/i.test(message)) {
    return "You are not allowed to do that in this class.";
  }
  if (/Assigned members can only change the task status/i.test(message)) {
    return "As the assigned member, you can only change the task status.";
  }
  if (/tasks_title_check|char_length/i.test(message)) {
    return "Task title must be between 1 and 200 characters.";
  }
  return message;
}
