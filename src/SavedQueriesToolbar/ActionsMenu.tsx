/** @jsxImportSource theme-ui */

import { ReactNode } from 'react'

import {
  Icon,
  NewGDSButton as Button,
  NewGDSDropdown as Dropdown,
  NewGDSDropdownMenuItemProps,
  Spacing,
} from '@edgeandnode/components'

import { smallDropdownMenuItemStyle } from './styles'

export interface Action {
  id: string
  name: string
}

export interface ActionsMenuProps {
  children: ReactNode
}

export function ActionsMenu({ children }: ActionsMenuProps) {
  return (
    <Dropdown type="menu">
      <Dropdown.Button asChild>
        <Button size="medium" variant="tertiary" sx={{ '> button': { px: Spacing['8px'] } }}>
          <Icon.Options title="Open actions menu" sx={{ display: 'flex' }} />
        </Button>
      </Dropdown.Button>
      <Dropdown.Menu align="end">{children}</Dropdown.Menu>
    </Dropdown>
  )
}

ActionsMenu.Item = (props: NewGDSDropdownMenuItemProps) => {
  return <Dropdown.Menu.Item {...props} sx={smallDropdownMenuItemStyle} />
}
