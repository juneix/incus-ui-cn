declare const __UI_VERSION__: string;

export const RECENT_MAJOR_SERVER_VERSION = 5;
export const UI_VERSION =
  typeof __UI_VERSION__ !== "undefined" ? __UI_VERSION__ : "0.21.7";
