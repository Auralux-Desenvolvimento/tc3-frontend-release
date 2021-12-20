export function getCredentials() {
  return localStorage.getItem("hasCredentials") === "true";
}

export function setCredentials(state: boolean) {
  localStorage.setItem("hasCredentials", state ? "true" : "false");
}