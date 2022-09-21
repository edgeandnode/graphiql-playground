/** @jsxImportSource theme-ui */

import {
  BorderRadius,
  buildBorder,
  Flex,
  NewGDSButton as Button,
  NewGDSDropdown as Dropdown,
  NewGDSInput as Input,
  Spacing,
} from "@edgeandnode/components";

import { DefaultQueryChip } from "./DefaultQueryChip";
import { smallDropdownMenuItemStyle } from "./styles";
import { SavedQuery } from "./types";

export interface SavedQuerySelectProps {
  queries: readonly SavedQuery[];
  currentQueryId: SavedQuery["id"] | null;
  onMenuItemClick: (value: SavedQuery["id"]) => void;
  currentQueryName: string;
  onChangeQueryName: (newName: string) => void;
}

export function SavedQuerySelect(props: SavedQuerySelectProps) {
  const isCurrentDefault = props.queries.find(
    (q) => q.id === props.currentQueryId
  )?.isDefault;

  return (
    <Dropdown<SavedQuery["id"]>
      type="select"
      value={props.currentQueryId ?? undefined}
      onValueChange={(queryId) => {
        console.log({ queryId });

        if (queryId != null) props.onMenuItemClick(queryId);
      }}
    >
      <Flex
        direction="row"
        sx={{ bg: "White4", borderRadius: BorderRadius.S, flexGrow: 0 }}
      >
        <Flex as="label" align="center" sx={{ pr: Spacing["16px"] }}>
          <Input
            name="query-name"
            autoComplete="off"
            value={props.currentQueryName}
            onClick={(e) => e.stopPropagation()}
            onChange={(event) => props.onChangeQueryName(event.target.value)}
            sx={{
              "> div > div": {
                py: 0,
                border: "none",
                background: "none",
                pr: 0,
              },
              input: {
                height: "48px",
                width: "240px",
                textIndent: "0.5em",
              },
            }}
          />
          {isCurrentDefault && <DefaultQueryChip />}
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
      {/* TOOD: Open menu starting from the top — cover the whole input */}
      <Dropdown.Menu align="end">
        {props.queries.map((query) => {
          if (query.id === props.currentQueryId) return null;
          return (
            <Dropdown.Menu.Item
              key={query.id}
              value={query.id}
              sx={smallDropdownMenuItemStyle}
            >
              {query.name}
            </Dropdown.Menu.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
}
