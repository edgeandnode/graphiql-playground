/** @jsxImportSource theme-ui */

import {
  BorderRadius,
  buildBorder,
  Chip,
  Flex,
  FontSize,
  FontWeight,
  NewGDSButton as Button,
  NewGDSDropdown as Dropdown,
  NewGDSInput as Input,
  Spacing,
} from "@edgeandnode/components";

import { smallDropdownMenuItemStyle } from "./styles";
import { SavedQuery } from "./types";

export interface SavedQuerySelectProps {
  queries: SavedQuery[];
  selectedQueryName: string;
  isDefaultQuery: boolean | undefined;
  onMenuItemClick: (value: SavedQuery["id"]) => void;
  onChangeQueryName: (newName: string) => void;
}

export function SavedQuerySelect(props: SavedQuerySelectProps) {
  return (
    <Dropdown<SavedQuery["id"]>
      type="select"
      onValueChange={(queryId) => {
        if (queryId) props.onMenuItemClick(queryId.toString());
      }}
    >
      <Flex direction="row" sx={{ border: buildBorder("White4") }}>
        <Flex
          direction="row"
          as="label"
          align="center"
          sx={{ pr: Spacing["16px"] }}
        >
          <Input
            name="query-name"
            autoComplete="off"
            value={props.selectedQueryName}
            onClick={(e) => e.stopPropagation()}
            onChange={(event) => props.onChangeQueryName(event.target.value)}
            sx={{
              "> div > div": {
                py: 0,
                border: "none",
                background: "none",
              },
              input: { height: "48px" },
            }}
          />
          {props.isDefaultQuery && (
            <Chip
              sx={{
                fontSize: FontSize["12px"],
                py: Spacing["4px"],
                px: Spacing["8px"],
                pointerEvents: "none",
                userSelect: "none",
                fontWeight: FontWeight["LIGHT"],
                borderRadius: BorderRadius["S"],
              }}
            >
              Default
            </Chip>
          )}
        </Flex>
        <Dropdown.Button asChild>
          <Button
            variant="tertiary"
            sx={{ "> button": { px: Spacing["8px"] } }}
          >
            <img
              alt="Open saved queries select"
              src="https://storage.googleapis.com/graph-web/query-selector-icon.svg"
              sx={{ width: Spacing["16px"], height: Spacing["16px"] }}
            />
          </Button>
        </Dropdown.Button>
      </Flex>
      <Dropdown.Menu align="end">
        {props.queries.map((query) => (
          <Dropdown.Menu.Item
            key={query.id}
            value={query.id}
            sx={smallDropdownMenuItemStyle}
          >
            {query.name}
          </Dropdown.Menu.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
