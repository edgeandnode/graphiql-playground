import {
  Icon,
  NewGDSButton as Button,
  NewGDSDropdown as Dropdown,
} from "@edgeandnode/components";

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
        <Button>
          <Icon.Menu />
        </Button>
      </Dropdown.Button>
      <Dropdown.Menu align="start">
        {props.actions.map((action, i) => (
          <Dropdown.Menu.Item key={i} onClick={() => props.onSelect(action)}>
            {action}
          </Dropdown.Menu.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
