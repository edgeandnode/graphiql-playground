/** @jsxImportSource theme-ui */

import { BorderRadius, Chip, FontSize, FontWeight, Spacing } from '@edgeandnode/gds'

export interface DefaultQueryChipProps {
  visible: boolean
}
export function DefaultQueryChip({ visible }: DefaultQueryChipProps) {
  return (
    /* We want to preserve the space for the chip even when it's not visible,
       and we can't pass `sx.width` to Chip because of the tooltip, thus
       we have this container div. */
    <div sx={{ width: '56px', flexShrink: 0 }}>
      {!!visible && (
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
      )}
    </div>
  )
}
