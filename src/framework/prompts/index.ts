import {
  GameState,
  PromptRequest,
} from "../types";

import { isPromptValid } from "./validate";

export { resolvePrompt } from "./resolve";

export const enqueuePrompt = (
  $: GameState,
  req: PromptRequest,
): void => {
  if (isPromptValid($, req)) {
    $.blockingPrompts.push(req);
  }
};

export const ensurePromptsAreValid = (
  $: GameState,
): void => {
  $.blockingPrompts = $.blockingPrompts.filter(req => isPromptValid($, req));
};
