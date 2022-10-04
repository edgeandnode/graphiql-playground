/** @jsxImportSource theme-ui */

import {
  BorderRadius,
  Flex,
  Icon,
  NewGDSButton as Button,
  NewGDSDropdown as Dropdown,
  NewGDSInput as Input,
  Spacing,
} from '@edgeandnode/components'

import { DefaultQueryChip } from './DefaultQueryChip'
import { smallDropdownMenuItemStyle } from './styles'
import { SavedQuery } from './types'

export interface SavedQuerySelectProps {
  queries: readonly SavedQuery[]
  currentQueryId: SavedQuery['id'] | null
  onMenuItemClick: (value: SavedQuery['id']) => void
  currentQueryName: string
  onChangeQueryName: (newName: string) => void
}

export function SavedQuerySelect(props: SavedQuerySelectProps) {
  const isCurrentDefault = props.queries.find((q) => q.id === props.currentQueryId)?.isDefault

  return (
    <Dropdown<SavedQuery['id']>
      type="select"
      value={props.currentQueryId ?? undefined}
      onValueChange={(queryId) => {
        if (queryId != null) props.onMenuItemClick(queryId)
      }}
    >
      <Flex
        direction="row"
        sx={{
          bg: 'White4',
          borderRadius: BorderRadius.S,
          flexGrow: 0,
        }}
      >
        <Flex as="label" align="center" sx={{ pr: Spacing['8px'] }}>
          <Input
            name="query-name"
            autoComplete="off"
            value={props.currentQueryName}
            onClick={(e) => e.stopPropagation()}
            onChange={(event) => props.onChangeQueryName(event.target.value)}
            placeholder="Untitled Query"
            sx={{
              '> div > div': {
                py: 0,
                border: 'none',
                background: 'none',
                pr: 0,
              },
              input: {
                height: '48px',
                width: '220px',
                textIndent: '0.5em',
              },
            }}
          />
          <DefaultQueryChip visible={!!isCurrentDefault} />
        </Flex>
        <Dropdown.Button asChild disabled={props.queries.length === 0}>
          <Button variant="tertiary" sx={{ '> button': { width: '48px', height: '48px', px: 0 }, flexShrink: 0 }}>
            <Icon.CaretDown sx={{ transform: 'translateY(-4px)', opacity: props.queries.length ? 1 : 0 }} />
          </Button>
        </Dropdown.Button>
      </Flex>
      {/* TODO: Carl's redesign for better multichoice menu */}
      <Dropdown.Menu align="end">
        {props.queries.map((query) => {
          return (
            <Dropdown.Menu.Item key={query.id} value={query.id} sx={smallDropdownMenuItemStyle}>
              {query.name}
            </Dropdown.Menu.Item>
          )
        })}
      </Dropdown.Menu>
    </Dropdown>
  )
}
