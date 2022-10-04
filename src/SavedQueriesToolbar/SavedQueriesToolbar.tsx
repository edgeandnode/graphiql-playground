/** @jsxImportSource theme-ui */

import { useRef, useState } from 'react'

import { Flex, Spacing } from '@edgeandnode/components'

import { ActionsMenu } from './ActionsMenu'
import { SnackbarMessageType, ToastMessage, toToastMessage } from './messages'
import { SavedQueriesActionButtons, SavedQueriesActionButtonsProps } from './SavedQueriesActionButtons'
import { useSavedQueriesContext } from './SavedQueriesContext'
import { SavedQuerySelect } from './SavedQuerySelect'
import type { SavedQuery } from './types'

const EMPTY_QUERY: SavedQuery = {
  id: '',
  name: '',
  query: '',
}

type QueryAction = 'Set as default' | 'Delete' | 'Share' | 'New query'

export interface SavedQueriesToolbarProps<TQuery extends SavedQuery>
  extends Pick<SavedQueriesActionButtonsProps<TQuery>, 'onSaveAsNewQuery' | 'onUpdateQuery'> {
  onSelectQuery: (queryId: TQuery['id'] | null) => void

  onSetQueryAsDefault: () => Promise<void>
  onDeleteQuery: () => Promise<void>

  showActions: boolean
  isOwner: boolean
  /**
   * TODO: This should be a media query.
   */
  isMobile: boolean
  className?: string
  actionButtonsClassName?: string
  onToast: (message: ToastMessage) => void
}

export function SavedQueriesToolbar<TQuery extends SavedQuery>(props: SavedQueriesToolbarProps<TQuery>) {
  const { currentQueryId, queries, querySource: querySourceDraft, setQuerySource } = useSavedQueriesContext<TQuery>()

  const findSavedQuery = (queryId: TQuery['id'] | null) => {
    // When we're editing a new query, the id is null.
    if (queryId === null) return null
    return queries.find((query) => query.id === queryId) || queries[0] || EMPTY_QUERY
  }
  const currentQuery = findSavedQuery(currentQueryId)

  // potential rename state for existing queries, name for new queries.
  const [queryNameDraft, setQueryNameDraft] = useState(currentQuery ? currentQuery.name : '')

  const isQueryDeletionPending = useRef(false)

  const setSnackbarMessage = (message: SnackbarMessageType) =>
    props.onToast(
      toToastMessage(message, {
        confirmDelete: () => {
          console.log('CONFIRM DELETE')
          if (isQueryDeletionPending.current) void props.onDeleteQuery()
        },
        undoDelete: () => {
          console.log('UNDO DELETE')
          isQueryDeletionPending.current = false
        },
      }),
    )

  const handleActionSelected = async (action: QueryAction) => {
    switch (action) {
      case 'Share': {
        const url = window.location.href
        await navigator.clipboard.writeText(url)
        setSnackbarMessage('success-share')
        return
      }

      case 'Set as default':
        await props.onSetQueryAsDefault().then(() => {
          setSnackbarMessage('success-setDefault')
        })
        return

      case 'Delete':
        // One can't delete a query that wasn't saved yet.
        if (!currentQuery) return
        if (currentQuery.isDefault) {
          setSnackbarMessage('error-deleteDefault')
          return
        }
        isQueryDeletionPending.current = true
        setSnackbarMessage('success-delete')
        return

      case 'New query':
        setQueryNameDraft('New Query')
        props.onSelectQuery(null)
    }
  }

  return (
    <Flex
      direction="row"
      gap={[Spacing['4px'], Spacing['8px']]}
      sx={{
        '*': {
          boxSizing: 'border-box',
        },
        width: '100%',
      }}
      className={props.className}
    >
      <SavedQuerySelect
        queries={queries}
        currentQueryId={currentQueryId}
        currentQueryName={queryNameDraft}
        onMenuItemClick={(queryId) => {
          props.onSelectQuery(queryId)
          const query = findSavedQuery(queryId)

          // We won't render a select option for `null`, so this condition
          // should always be true.
          if (query) setQueryNameDraft(query.name)
        }}
        onChangeQueryName={(value) => setQueryNameDraft(value)}
      />
      {props.isOwner && !props.isMobile && (
        <SavedQueriesActionButtons<TQuery>
          currentQuery={currentQuery}
          queries={queries}
          setSnackbarMessage={setSnackbarMessage}
          queryNameDraft={queryNameDraft}
          onSaveAsNewQuery={props.onSaveAsNewQuery}
          onUpdateQuery={props.onUpdateQuery}
          querySourceDraft={querySourceDraft}
          onResetChanges={() => {
            if (!currentQuery) return
            setQuerySource(currentQuery.query)
            setQueryNameDraft(currentQuery.name)
          }}
          className={props.actionButtonsClassName}
        />
      )}
      <div sx={{ flex: 1, flexBasis: 0 }} />
      {props.isOwner && !props.isMobile && (
        <ActionsMenu>
          <ActionsMenu.Item onClick={() => void handleActionSelected('Share')}>Share</ActionsMenu.Item>
          <ActionsMenu.Item onClick={() => void handleActionSelected('Set as default')}>
            Set as default
          </ActionsMenu.Item>
          <ActionsMenu.Item disabled={currentQueryId == null} onClick={() => void handleActionSelected('Delete')}>
            Delete
          </ActionsMenu.Item>
          <ActionsMenu.Item onClick={() => void handleActionSelected('New query')}>New query</ActionsMenu.Item>
        </ActionsMenu>
      )}
    </Flex>
  )
}
