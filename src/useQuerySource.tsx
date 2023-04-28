import { useEditorContext } from '@graphiql/react'
import { useEffect, useRef, useState } from 'react'

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
