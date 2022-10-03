/** @jsxImportSource theme-ui */

import { BorderRadius, Chip, FontSize, FontWeight, Spacing } from '@edgeandnode/components'

export interface DefaultQueryChipProps {
  visible: boolean
}
export function DefaultQueryChip({ visible }: DefaultQueryChipProps) {
  // We want to preserve the space for the chip even when it's not visible.
  if (!visible) {
    return <div sx={{ width: '56px' }} />
  }

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
