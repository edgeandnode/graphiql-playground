import { Text, ToastProps } from '@edgeandnode/gds'

import { ValidationError } from './validation'

export type SnackbarMessageType =
  | ValidationError
  | 'success-create'
  | 'success-update'
  | 'success-setDefault'
  | 'success-share'
  | 'success-delete'
  | 'error-create'
  | 'error-update'
  | 'error-default'
  | 'error-deleteDefault'

const snackbarMessages: Record<SnackbarMessageType, string> = {
  'success-update': 'Query updated',
  'success-create': 'Query created',
  'success-setDefault': 'Default query set',
  'success-share': 'URL copied to clipboard',
  'success-delete': 'Query successfully deleted',
  'error-nameEmpty': "Name can't be empty",
  'error-nameTaken': 'Name is already taken',
  'error-queryEmpty': "Query can't be empty",
  'error-queryInvalid': 'Query is invalid',
  'error-create': 'Unable to create query (duplicate)',
  'error-update': 'Unable to update query (duplicate)',
  'error-default': 'Unable to set the default query',
  'error-deleteDefault': "Default query can't be deleted",
}

export type ToastMessage = Pick<ToastProps, 'severity' | 'action' | 'description' | 'title' | 'onClose' | 'duration'>

export const toToastMessage = (
  message: SnackbarMessageType,
  callbacks: {
    undoDelete: () => void
    confirmDelete: () => void
  },
): ToastMessage => {
  const title = snackbarMessages[message]
  const severity = message.startsWith('error') ? 'error' : 'success'

  let res: ToastMessage = { title, severity }

  if (message === 'success-delete') {
    res = {
      ...res,
      action: {
        altText: 'Undo',
        children: <Text.P12>Undo</Text.P12>,
        onClick: callbacks.undoDelete,
      },
      onClose: callbacks.confirmDelete,
      duration: 5000,
    }
  }

  return res
}
