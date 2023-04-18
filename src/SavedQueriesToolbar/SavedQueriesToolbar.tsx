/** @jsxImportSource theme-ui */

import { useEditorContext, useQueryEditor } from '@graphiql/react'
import { useDebugValue, useEffect, useRef, useState } from 'react'

import { Flex, Spacing } from '@edgeandnode/gds'

import { ActionsMenu } from './ActionsMenu'
import { SnackbarMessageType, ToastMessage, toToastMessage } from './messages'
import { createQuerySharingURL } from './queryInSearchParams'
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
  onDeleteQuery: (queryId: TQuery['id']) => Promise<void>

  /**
   * @deprecated kept for backcompat
   */
  showActions?: boolean
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
  const { currentQueryId, queries, setQuerySource } = useSavedQueriesContext<TQuery>()

  const querySourceDraft = useQuerySourceDraft()

  const findSavedQuery = (queryId: TQuery['id'] | null) => {
    // When we're editing a new query, the id is null.
    if (queryId === null) return null
    return queries.find((query) => query.id === queryId) || queries[0] || EMPTY_QUERY
  }
  const currentQuery = findSavedQuery(currentQueryId)

  const currentQueryName = currentQuery?.name || ''
  // potential rename state for existing queries, name for new queries.
  const [queryNameDraft, setQueryNameDraft] = useState(currentQueryName)
  useEffect(() => setQueryNameDraft(currentQueryName), [currentQueryName])

  const pendingQueryDeletion = useRef<TQuery | undefined>()
  const confirmPendingDelete = () => {
    const query = pendingQueryDeletion.current
    if (query) {
      void props.onDeleteQuery(query.id)
    }
  }

  const setSnackbarMessage = (message: SnackbarMessageType) =>
    props.onToast(
      toToastMessage(message, {
        confirmDelete: confirmPendingDelete,
        undoDelete: () => {
          pendingQueryDeletion.current = undefined
        },
      }),
    )

  const handleActionSelected = async (action: QueryAction) => {
    switch (action) {
      case 'Share': {
        if (currentQueryId == null) return

        const url = createQuerySharingURL(currentQueryId)
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
        // This is the first part of two-part action with confirmation
        pendingQueryDeletion.current = currentQuery
        const otherQueries = queries.filter((x) => x.id !== currentQueryId)
        // We select another query optimistically, even before the old one is removed.
        props.onSelectQuery(otherQueries[0]?.id || null)
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
          confirmPendingDelete()
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

function useQuerySourceDraft() {
  const { queryEditor } = useEditorContext()!
  const [querySourceDraft, setQuerySourceDraft] = useState(queryEditor?.getValue() || '')

  useEffect(() => {
    if (queryEditor) {
      queryEditor.on('change', (editor) => setQuerySourceDraft(editor.getValue()))
    }
  }, [queryEditor])

  return querySourceDraft
}
