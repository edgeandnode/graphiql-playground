import { useEditorContext } from '@graphiql/react'
import { useEffect, useRef, useState } from 'react'

/**
 * We don't want to rerender the whole component every time the query changes,
 * because it leads to bugs like: https://github.com/edgeandnode/graphiql-playground/pull/15
 */
export function useQuerySource() {
  const { queryEditor } = useEditorContext()!
  const [state, setState] = useState(queryEditor?.getValue() || '')

  useEffect(() => {
    if (queryEditor) {
      queryEditor.on('change', (editor) => setState(editor.getValue()))
    }
  }, [queryEditor])

  return state
}
