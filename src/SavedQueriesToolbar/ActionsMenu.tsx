/** @jsxImportSource theme-ui */

import {
  FontSize,
  Icon,
  NewGDSButton as Button,
  NewGDSDropdown as Dropdown,
  Spacing,
} from "@edgeandnode/components";

import { smallDropdownMenuItemStyle } from "./styles";

export interface Action {
  id: string;
  name: string;
}

export interface ActionsMenuProps<TAction> {
  actions: TAction[];
  onSelect: (selected: TAction) => void;
}

export function ActionsMenu<TAction extends string>(
  props: ActionsMenuProps<TAction>
) {
  return (
    <Dropdown type="menu">
      <Dropdown.Button asChild>
        <Button
          size="medium"
          variant="secondary"
          sx={{ "> button": { px: Spacing["8px"] } }}
        >
          <Icon.Options title="Open actions menu" sx={{ display: "flex" }} />
        </Button>
      </Dropdown.Button>
      <Dropdown.Menu align="end">
        {props.actions.map((action, i) => (
          <Dropdown.Menu.Item
            key={i}
            onClick={() => props.onSelect(action)}
            sx={smallDropdownMenuItemStyle}
          >
            {action}
          </Dropdown.Menu.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
