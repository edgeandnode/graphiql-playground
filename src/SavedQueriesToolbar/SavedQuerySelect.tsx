import {
  NewGDSInput as Input,
  NewGDSDropdown as Dropdown,
  Flex,
  Chip,
  FontSize,
} from "@edgeandnode/components";
import { SavedQuery } from "./types";

export interface SavedQuerySelectProps {
  queries: SavedQuery[];
  selectedQueryName: string;
  isDefaultQuery: boolean | undefined;
  onMenuItemClick: (value: SavedQuery) => void;
  onChangeQueryName: (newName: string) => void;
}

export function SavedQuerySelect(props: SavedQuerySelectProps) {
  return (
    <Dropdown type="menu">
      <Dropdown.Button>
        <Flex direction="row">
          <Input
            name="query-name"
            autoComplete="off"
            value={props.selectedQueryName}
            onChange={(event) => props.onChangeQueryName(event.target.value)}
          />
          {props.isDefaultQuery && (
            <Chip sx={{ fontSize: FontSize["12px"] }}>Default</Chip>
          )}
        </Flex>
      </Dropdown.Button>
      <Dropdown.Menu align="start">
        {props.queries.map((query) => (
          <Dropdown.Menu.Item onClick={() => props.onMenuItemClick(query)}>
            {query.name}
          </Dropdown.Menu.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
