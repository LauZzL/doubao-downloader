import type { ConvMessage } from "@/types";

export const ALL_CONVERSATIONS_FILTER = "-1";
export const AISPACE_FILTER = "aispace";

export function matchesConvScope(message: ConvMessage, selectedScope: string) {
  if (selectedScope === AISPACE_FILTER) return message.source === "aispace";
  if (message.source === "aispace") return false;
  if (selectedScope === ALL_CONVERSATIONS_FILTER) return true;
  return message.conversation_id === selectedScope;
}
