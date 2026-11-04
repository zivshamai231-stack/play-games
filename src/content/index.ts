import type { EventContent } from "./types";
// "@event-content" points at src/content/<EVENT>.ts (vite.config.ts), so a build carries one party's content and nothing else
import content from "@event-content";

export const EVENT: EventContent = content;
export type * from "./types";
