/** @jsxImportSource theme-ui */

import { BorderRadius, Chip, FontSize, FontWeight, Spacing } from '@edgeandnode/components'

export function DefaultQueryChip() {
  return (
    <Chip
      sx={{
        fontSize: FontSize['12px'],
        py: Spacing['4px'],
        px: Spacing['8px'],
        pointerEvents: 'none',
        userSelect: 'none',
        fontWeight: FontWeight['LIGHT'],
        borderRadius: BorderRadius['S'],
      }}
    >
      Default
    </Chip>
  )
}
