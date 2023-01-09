/** @jsxImportSource theme-ui */

import { Flex, NewGDSButton as Button, Spacing, Tooltip } from '@edgeandnode/components'

import { SnackbarMessageType } from './messages'
import { SavedQuery } from './types'
import { validateQuery, ValidationStatus } from './validation'

const disableButtonReasonTooltips = {
  saveAsNew: 'A query already exists with this name.',
  save: 'No unsaved changes.',
  cancel: 'The query must have any changes to cancel them.',
}

export interface SavedQueriesActionButtonsProps<TQuery extends SavedQuery> {
  currentQuery: TQuery | null
  queryNameDraft: string
  querySourceDraft: string
  queries: readonly TQuery[]
  setSnackbarMessage: (validationStatus: SnackbarMessageType) => void
  className?: string

  onResetChanges: () => void

  /**
   * Save the current query to saved queries as new.
   */
  onSaveAsNewQuery: (info: { name: TQuery['name']; query: string }) => Promise<void>

  /**
   * Update the current query in saved queries.
   */
  onUpdateQuery: (info: { name: TQuery['name']; query: string }) => Promise<void>
}

export function SavedQueriesActionButtons<TQuery extends SavedQuery>({
  currentQuery,
  queries,
  setSnackbarMessage,
  queryNameDraft,
  querySourceDraft,
  onResetChanges,
  onSaveAsNewQuery,
  onUpdateQuery,
  className,
}: SavedQueriesActionButtonsProps<TQuery>) {
  const nameChanged = !currentQuery || currentQuery.name !== queryNameDraft
  const sourceChanged = !currentQuery || currentQuery.query !== querySourceDraft
  const anythingChanged = nameChanged || sourceChanged

  const handleSaveAsNewClick = async () => {
    const name = queryNameDraft || currentQuery?.name || ''

    const validationStatus: ValidationStatus = validateQuery({
      name,
      queries,
      query: querySourceDraft,
    })

    if (validationStatus !== 'valid') {
      setSnackbarMessage(validationStatus)
      return
    }

    try {
      await onSaveAsNewQuery({
        name,
        query: querySourceDraft,
      })
    } catch (err) {
      setSnackbarMessage('error-create')
      return
    }

    setSnackbarMessage('success-create')
  }

  return (
    <Flex
      align="center"
      gap={Spacing['2px']}
      sx={{
        flexWrap: 'nowrap',
        justifyContent: 'space-around',
        flexShrink: 0,
      }}
      className={className}
    >
      {currentQuery && (
        <Tooltip content={anythingChanged ? null : disableButtonReasonTooltips.save}>
          <span>
            <Button
              size="medium"
              variant="tertiary"
              disabled={!anythingChanged}
              onClick={() => {
                const name = queryNameDraft || currentQuery.name

                const validationStatus: ValidationStatus = validateQuery({
                  name,
                  updatedId: currentQuery.id,
                  queries: queries,
                  query: querySourceDraft,
                })

                if (validationStatus !== 'valid') {
                  setSnackbarMessage(validationStatus)
                  return
                }

                void onUpdateQuery({
                  name,
                  query: querySourceDraft,
                })
                  .then(() => {
                    setSnackbarMessage('success-update')
                  })
                  .catch(() => {
                    setSnackbarMessage('error-update')
                  })
              }}
            >
              Save
            </Button>
          </span>
        </Tooltip>
      )}
      <Tooltip content={nameChanged ? null : disableButtonReasonTooltips.saveAsNew}>
        <span>
          <Button size="medium" variant="tertiary" onClick={() => void handleSaveAsNewClick()} disabled={!nameChanged}>
            Save as new
          </Button>
        </span>
      </Tooltip>
      <Tooltip content={anythingChanged ? null : disableButtonReasonTooltips.cancel}>
        <span>
          <Button size="medium" variant="tertiary" onClick={onResetChanges} disabled={!anythingChanged}>
            {/* Reset changes */}
            Cancel
          </Button>
        </span>
      </Tooltip>
    </Flex>
  )
}
