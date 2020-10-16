import {
  ensurePromptsAreValid,
  resolvePrompt,
} from "../prompts";
import {
  GameState,
  PromptResponse,
} from "../types";

export const respondToPrompt = (
  $: GameState,
  idx: number,
  res: PromptResponse,
): void => {
  const req = $.blockingPrompts[idx];
  if (req == null) {
    throw new Error("prompt request not found");
  }
  if (req.type !== res.type) {
    throw new Error("incorrect prompt response type");
  }

  resolvePrompt($, req, res);

  $.blockingPrompts.splice(idx, 1);

  // If multiple prompts were enqueued at once, it's possible that some prompts
  // are no longer valid as a result of resolving this effect.
  ensurePromptsAreValid($);
};
