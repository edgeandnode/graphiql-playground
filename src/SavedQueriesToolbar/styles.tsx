// I didn't want to create new components just for these styles.
// We could promote them to component variants if they're needed elsewhere.

import type { ThemeUICSSObject } from "theme-ui";

import { FontSize, Spacing } from "@edgeandnode/components";

export const smallDropdownMenuItemStyle: ThemeUICSSObject = {
  "> div": { fontSize: FontSize["14px"] },
  px: Spacing["24px"],
  py: Spacing["8px"],
  gap: Spacing["8px"],

  // Why is this needed? TODO: Ask Benoit
  ":hover": {
    'span[role="img"]': { opacity: 0.8 },
  },
};
