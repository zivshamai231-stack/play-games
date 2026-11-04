import type { EventContent } from "./types";
import itay from "./itay";
import birthday from "./birthday-demo";

/* Which party this build runs. Pick with EVENT=<id> when building or running dev; the default is the birthday demo. */
const EVENTS: Record<string, EventContent> = { [itay.id]: itay, [birthday.id]: birthday };

export const EVENT: EventContent = EVENTS[__EVENT__] ?? birthday;
export type * from "./types";
