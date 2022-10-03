/**
 * Based on the GraphiQLInterface component from `graphiql` package.
 * Adapted for The Graph Protocol.
 * @see https://github.com/graphql/graphiql/blob/3aecd74577b8e0f136f2782e378a474d9677c7a2/packages/graphiql/src/components/GraphiQL.tsx
 *
 * GraphiQL playground component exported from the `graphiql` is meant to encompass
 * the whole browser viewport, renders sidebar on the left, and contains elements
 * we don't have screen space for inside of The Graph Explorer and Subgraph Studio.
 *
 * Fortunately, a lot of the moving parts was implemented inside of `@graphiql/react`,
 * so we can cleanly build our own playground using those.
 */

import {
  Button,
  ButtonGroup,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  Dialog,
  ExecuteButton,
  HeaderEditor,
  KeyboardShortcutIcon,
  MergeIcon,
  PrettifyIcon,
  QueryEditor,
  ReloadIcon,
  ResponseEditor,
  Spinner,
  ToolbarButton,
  Tooltip,
  UnStyledButton,
  useCopyQuery,
  useDragResize,
  useEditorContext,
  useExecutionContext,
  UseHeaderEditorArgs,
  useMergeQuery,
  usePluginContext,
  usePrettifyEditors,
  UseQueryEditorArgs,
  UseResponseEditorArgs,
  useSchemaContext,
  useStorageContext,
  useTheme,
  UseVariableEditorArgs,
  VariableEditor,
  WriteableEditorProps,
} from '@graphiql/react'
import React, { ComponentType, PropsWithChildren, ReactNode, useState } from 'react'

export type GraphiQLToolbarConfig = {
  /**
   * This content will be rendered after the built-in buttons of the toolbar.
   * Note that this will not apply if you provide a completely custom toolbar
   * (by passing `GraphiQL.Toolbar` as child to the `GraphiQL` component).
   */
  additionalContent?: React.ReactNode
}

type AddSuffix<Obj extends Record<string, any>, Suffix extends string> = {
  [Key in keyof Obj as `${string & Key}${Suffix}`]: Obj[Key]
}

export type GraphiQLInterfaceProps = WriteableEditorProps &
  AddSuffix<Pick<UseQueryEditorArgs, 'onEdit'>, 'Query'> &
  Pick<UseQueryEditorArgs, 'onCopyQuery'> &
  AddSuffix<Pick<UseVariableEditorArgs, 'onEdit'>, 'Variables'> &
  AddSuffix<Pick<UseHeaderEditorArgs, 'onEdit'>, 'Headers'> &
  Pick<UseResponseEditorArgs, 'responseTooltip'> & {
    children?: ReactNode

    /**
     * Set the default state for the editor tools.
     * - `false` hides the editor tools
     * - `true` shows the editor tools
     * - `'variables'` specifically shows the variables editor
     * - `'headers'` specifically shows the headers editor
     * By default the editor tools are initially shown when at least one of the
     * editors has contents.
     */
    defaultEditorToolsVisibility?: boolean | 'variables' | 'headers'

    /**
     * Toggle if the headers editor should be shown inside the editor tools.
     * @default true
     */
    isHeadersEditorEnabled?: boolean

    /**
     * Toggle if the variables editor should be shown inside the editor tools.
     * @default true
     * @addition { Edge & Node } The Graph apps don't need variables editor.
     */
    isVariablesEditorEnabled?: boolean

    /**
     * Toggle if the variables editor should be shown inside the editor tools.
     * @default true
     * @addition { Edge & Node } GraphiQL
     */
    /**
     * An object that allows configuration of the toolbar next to the query
     * editor.
     */
    toolbar?: GraphiQLToolbarConfig

    /**
     * Slot for SavedQueriesToolbar
     */
    header: ReactNode
  }

export function GraphiQLInterface(props: GraphiQLInterfaceProps) {
  const isHeadersEditorEnabled = props.isHeadersEditorEnabled ?? true
  const isVariablesEditorEnabled = props.isVariablesEditorEnabled ?? true

  const editorContext = useEditorContext({ nonNull: true })
  const executionContext = useExecutionContext({ nonNull: true })
  const schemaContext = useSchemaContext({ nonNull: true })
  const pluginContext = usePluginContext()

  const copy = useCopyQuery({ onCopyQuery: props.onCopyQuery })
  const merge = useMergeQuery()
  const prettify = usePrettifyEditors()

  const PluginContent = pluginContext?.visiblePlugin?.content

  const pluginResize = useDragResize({
    defaultSizeRelation: 3,
    direction: 'horizontal',
    initiallyHidden: pluginContext?.visiblePlugin ? undefined : 'second',
    onHiddenElementChange: (resizableElement) => {
      if (resizableElement === 'second') {
        pluginContext?.setVisiblePlugin(null)
      }
    },
    sizeThresholdSecond: 200,
    storageKey: 'docExplorerFlex',
  })
  const editorResize = useDragResize({
    direction: 'horizontal',
    storageKey: 'editorFlex',
  })
  const editorToolsResize = useDragResize({
    defaultSizeRelation: 3,
    direction: 'vertical',
    initiallyHidden: (() => {
      if (props.defaultEditorToolsVisibility === 'variables' || props.defaultEditorToolsVisibility === 'headers') {
        return undefined
      }

      if (typeof props.defaultEditorToolsVisibility === 'boolean') {
        return props.defaultEditorToolsVisibility ? undefined : 'second'
      }

      return editorContext.initialVariables || editorContext.initialHeaders ? undefined : 'second'
    })(),
    sizeThresholdSecond: 60,
    storageKey: 'secondaryEditorFlex',
  })

  const [activeSecondaryEditor, setActiveSecondaryEditor] = useState<'variables' | 'headers'>(() => {
    if (props.defaultEditorToolsVisibility === 'variables' || props.defaultEditorToolsVisibility === 'headers') {
      return props.defaultEditorToolsVisibility
    }
    return !editorContext.initialVariables && editorContext.initialHeaders && isHeadersEditorEnabled
      ? 'headers'
      : 'variables'
  })
  const [showDialog, setShowDialog] = useState<'short-keys' | null>(null)

  const children = React.Children.toArray(props.children)

  const toolbar = children.find((child) => isChildComponentType(child, GraphiQLToolbar)) || (
    <>
      <ToolbarButton onClick={() => prettify()} label="Prettify query (Shift-Ctrl-P)">
        <PrettifyIcon className="graphiql-toolbar-icon" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton onClick={() => merge()} label="Merge fragments into query (Shift-Ctrl-M)">
        <MergeIcon className="graphiql-toolbar-icon" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton onClick={() => copy()} label="Copy query (Shift-Ctrl-C)">
        <CopyIcon className="graphiql-toolbar-icon" aria-hidden="true" />
      </ToolbarButton>
      {props.toolbar?.additionalContent ? props.toolbar.additionalContent : null}
    </>
  )

  const footer = children.find((child) => isChildComponentType(child, GraphiQLFooter))

  const onClickReference = () => {
    if (pluginResize.hiddenElement === 'first') {
      pluginResize.setHiddenElement(null)
    }
  }

  const modifier =
    window.navigator.platform.toLowerCase().indexOf('mac') === 0 ? (
      <code className="graphiql-key">Cmd</code>
    ) : (
      <code className="graphiql-key">Ctrl</code>
    )

  const editorToolsEnabled = isVariablesEditorEnabled || isHeadersEditorEnabled

  return (
    <div data-testid="graphiql-container" className="graphiql-container">
      <div className="graphiql-main">
        <div ref={pluginResize.firstRef}>
          <div className="graphiql-sessions">
            <div className="graphiql-session-header">
              {props.header}
              {/* <Tabs aria-label="Select active operation">
                {editorContext.tabs.length > 1 ? (
                  <>
                    {editorContext.tabs.map((tab, index) => (
                      <Tab
                        key={tab.id}
                        isActive={index === editorContext.activeTabIndex}
                      >
                        <Tab.Button
                          aria-controls="graphiql-session"
                          id={`graphiql-session-tab-${index}`}
                          onClick={() => {
                            executionContext.stop();
                            editorContext.changeTab(index);
                          }}
                        >
                          {tab.title}
                        </Tab.Button>
                        <Tab.Close
                          onClick={() => {
                            if (editorContext.activeTabIndex === index) {
                              executionContext.stop();
                            }
                            editorContext.closeTab(index);
                          }}
                        />
                      </Tab>
                    ))}
                    <Tooltip label="Add tab">
                      <UnStyledButton
                        type="button"
                        className="graphiql-tab-add"
                        onClick={() => editorContext.addTab()}
                        aria-label="Add tab"
                      >
                        <PlusIcon aria-hidden="true" />
                      </UnStyledButton>
                    </Tooltip>
                  </>
                ) : null}
              </Tabs>
              <div className="graphiql-session-header-right">
                {editorContext.tabs.length === 1 ? (
                  <Tooltip label="Add tab">
                    <UnStyledButton
                      type="button"
                      className="graphiql-tab-add"
                      onClick={() => editorContext.addTab()}
                      aria-label="Add tab"
                    >
                      <PlusIcon aria-hidden="true" />
                    </UnStyledButton>
                  </Tooltip>
                ) : null}
              </div> */}
            </div>
            <div
              role="tabpanel"
              id="graphiql-session"
              className="graphiql-session"
              aria-labelledby={`graphiql-session-tab-${editorContext.activeTabIndex}`}
            >
              <div ref={editorResize.firstRef}>
                <div className={`graphiql-editors${editorContext.tabs.length === 1 ? ' full-height' : ''}`}>
                  <div ref={editorToolsResize.firstRef}>
                    <section
                      className="graphiql-query-editor"
                      aria-label="Query Editor"
                      style={
                        editorToolsEnabled
                          ? {}
                          : {
                              borderBottom: 'none',
                            }
                      }
                    >
                      <div className="graphiql-query-editor-wrapper">
                        <QueryEditor
                          editorTheme={props.editorTheme}
                          keyMap={props.keyMap}
                          onClickReference={onClickReference}
                          onCopyQuery={props.onCopyQuery}
                          onEdit={props.onEditQuery}
                          readOnly={props.readOnly}
                        />
                      </div>
                      <div className="graphiql-toolbar" role="toolbar" aria-label="Editor Commands">
                        <ExecuteButton />
                        {toolbar}
                      </div>
                    </section>
                  </div>
                  {editorToolsEnabled && (
                    <div ref={editorToolsResize.dragBarRef}>
                      <div className="graphiql-editor-tools">
                        <div className="graphiql-editor-tools-tabs">
                          {isHeadersEditorEnabled ? (
                            <UnStyledButton
                              type="button"
                              className={activeSecondaryEditor === 'variables' ? 'active' : ''}
                              onClick={() => {
                                if (editorToolsResize.hiddenElement === 'second') {
                                  editorToolsResize.setHiddenElement(null)
                                }
                                setActiveSecondaryEditor('variables')
                              }}
                            >
                              Variables
                            </UnStyledButton>
                          ) : null}
                          {isHeadersEditorEnabled ? (
                            <UnStyledButton
                              type="button"
                              className={activeSecondaryEditor === 'headers' ? 'active' : ''}
                              onClick={() => {
                                if (editorToolsResize.hiddenElement === 'second') {
                                  editorToolsResize.setHiddenElement(null)
                                }
                                setActiveSecondaryEditor('headers')
                              }}
                            >
                              Headers
                            </UnStyledButton>
                          ) : null}
                        </div>
                        <Tooltip
                          label={
                            editorToolsResize.hiddenElement === 'second' ? 'Show editor tools' : 'Hide editor tools'
                          }
                        >
                          <UnStyledButton
                            type="button"
                            onClick={() => {
                              editorToolsResize.setHiddenElement(
                                editorToolsResize.hiddenElement === 'second' ? null : 'second',
                              )
                            }}
                            aria-label={
                              editorToolsResize.hiddenElement === 'second' ? 'Show editor tools' : 'Hide editor tools'
                            }
                          >
                            {editorToolsResize.hiddenElement === 'second' ? (
                              <ChevronUpIcon className="graphiql-chevron-icon" aria-hidden="true" />
                            ) : (
                              <ChevronDownIcon className="graphiql-chevron-icon" aria-hidden="true" />
                            )}
                          </UnStyledButton>
                        </Tooltip>
                      </div>
                    </div>
                  )}
                  <div ref={editorToolsResize.secondRef}>
                    <section
                      className="graphiql-editor-tool"
                      aria-label={activeSecondaryEditor === 'variables' ? 'Variables' : 'Headers'}
                    >
                      <VariableEditor
                        editorTheme={props.editorTheme}
                        isHidden={activeSecondaryEditor !== 'variables'}
                        keyMap={props.keyMap}
                        onEdit={props.onEditVariables}
                        onClickReference={onClickReference}
                        readOnly={props.readOnly}
                      />
                      {isHeadersEditorEnabled && (
                        <HeaderEditor
                          editorTheme={props.editorTheme}
                          isHidden={activeSecondaryEditor !== 'headers'}
                          keyMap={props.keyMap}
                          onEdit={props.onEditHeaders}
                          readOnly={props.readOnly}
                        />
                      )}
                    </section>
                  </div>
                </div>
              </div>
              <div ref={editorResize.dragBarRef}>
                <div className="graphiql-horizontal-drag-bar" />
              </div>
              <div ref={editorResize.secondRef}>
                <div className="graphiql-response">
                  {executionContext.isFetching ? <Spinner /> : null}
                  <ResponseEditor
                    editorTheme={props.editorTheme}
                    responseTooltip={props.responseTooltip}
                    keyMap={props.keyMap}
                  />
                  {footer}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div ref={pluginResize.dragBarRef}>
          {pluginContext?.visiblePlugin ? <div className="graphiql-horizontal-drag-bar" /> : null}
        </div>
        <div
          ref={pluginResize.secondRef}
          style={{
            // Make sure the container shrinks when containing long
            // non-breaking texts
            minWidth: '200px',
          }}
        >
          <div className="graphiql-plugin">{PluginContent ? <PluginContent /> : null}</div>
        </div>
        <div className="graphiql-sidebar">
          <div>
            {pluginContext
              ? pluginContext?.plugins.map((plugin) => {
                  const isVisible = plugin === pluginContext.visiblePlugin
                  const label = `${isVisible ? 'Hide' : 'Show'} ${plugin.title}`
                  const Icon = plugin.icon
                  return (
                    <Tooltip key={plugin.title} label={label}>
                      <UnStyledButton
                        type="button"
                        className={isVisible ? 'active' : ''}
                        onClick={() => {
                          if (isVisible) {
                            pluginContext.setVisiblePlugin(null)
                            pluginResize.setHiddenElement('second')
                          } else {
                            pluginContext.setVisiblePlugin(plugin)
                            pluginResize.setHiddenElement(null)
                          }
                        }}
                        aria-label={label}
                      >
                        <Icon aria-hidden="true" />
                      </UnStyledButton>
                    </Tooltip>
                  )
                })
              : null}
          </div>
          <div>
            <Tooltip label="Re-fetch GraphQL schema">
              <UnStyledButton
                type="button"
                disabled={schemaContext.isFetching}
                onClick={() => schemaContext.introspect()}
                aria-label="Re-fetch GraphQL schema"
              >
                <ReloadIcon className={schemaContext.isFetching ? 'graphiql-spin' : ''} aria-hidden="true" />
              </UnStyledButton>
            </Tooltip>
            <Tooltip label="Open short keys dialog">
              <UnStyledButton
                type="button"
                onClick={() => setShowDialog('short-keys')}
                aria-label="Open short keys dialog"
              >
                <KeyboardShortcutIcon aria-hidden="true" />
              </UnStyledButton>
            </Tooltip>
          </div>
        </div>
      </div>
      <Dialog isOpen={showDialog === 'short-keys'} onDismiss={() => setShowDialog(null)}>
        <div className="graphiql-dialog-header">
          <div className="graphiql-dialog-title">Short Keys</div>
          <Dialog.Close onClick={() => setShowDialog(null)} />
        </div>
        <div className="graphiql-dialog-section">
          <div>
            <table className="graphiql-table">
              <thead>
                <tr>
                  <th>Short key</th>
                  <th>Function</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {modifier}
                    {' + '}
                    <code className="graphiql-key">F</code>
                  </td>
                  <td>Search in editor</td>
                </tr>
                <tr>
                  <td>
                    {modifier}
                    {' + '}
                    <code className="graphiql-key">K</code>
                  </td>
                  <td>Search in documentation</td>
                </tr>
                <tr>
                  <td>
                    {modifier}
                    {' + '}
                    <code className="graphiql-key">Enter</code>
                  </td>
                  <td>Execute query</td>
                </tr>
                <tr>
                  <td>
                    <code className="graphiql-key">Ctrl</code>
                    {' + '}
                    <code className="graphiql-key">Shift</code>
                    {' + '}
                    <code className="graphiql-key">P</code>
                  </td>
                  <td>Prettify editors</td>
                </tr>
                <tr>
                  <td>
                    <code className="graphiql-key">Ctrl</code>
                    {' + '}
                    <code className="graphiql-key">Shift</code>
                    {' + '}
                    <code className="graphiql-key">M</code>
                  </td>
                  <td>Merge fragments definitions into operation definition</td>
                </tr>
                <tr>
                  <td>
                    <code className="graphiql-key">Ctrl</code>
                    {' + '}
                    <code className="graphiql-key">Shift</code>
                    {' + '}
                    <code className="graphiql-key">C</code>
                  </td>
                  <td>Copy query</td>
                </tr>
                <tr>
                  <td>
                    <code className="graphiql-key">Ctrl</code>
                    {' + '}
                    <code className="graphiql-key">Shift</code>
                    {' + '}
                    <code className="graphiql-key">R</code>
                  </td>
                  <td>Re-fetch schema using introspection</td>
                </tr>
              </tbody>
            </table>
            <p>
              The editors use{' '}
              <a href="https://codemirror.net/5/doc/manual.html#keymaps" target="_blank" rel="noopener noreferrer">
                CodeMirror Key Maps
              </a>{' '}
              that add more short keys. This instance of Graph<em>i</em>QL uses <code>{props.keyMap || 'sublime'}</code>
              .
            </p>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

// Configure the UI by providing this Component as a child of GraphiQL.
export function GraphiQLToolbar<TProps>(props: PropsWithChildren<TProps>) {
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{props.children}</>
}

GraphiQLToolbar.displayName = 'GraphiQLToolbar'

// Configure the UI by providing this Component as a child of GraphiQL.
export function GraphiQLFooter<TProps>(props: PropsWithChildren<TProps>) {
  return <div className="graphiql-footer">{props.children}</div>
}

GraphiQLFooter.displayName = 'GraphiQLFooter'

// Determines if the React child is of the same type of the provided React component
function isChildComponentType<T extends ComponentType>(child: any, component: T): child is T {
  if (child?.type?.displayName && child.type.displayName === component.displayName) {
    return true
  }

  return child.type === component
}

function _UnusedSettingsDialog({
  showDialog,
  setShowDialog,
}: {
  showDialog: string | null
  setShowDialog: (value: null) => void
}) {
  const storageContext = useStorageContext()
  const { theme, setTheme } = useTheme()

  const [clearStorageStatus, setClearStorageStatus] = useState<'success' | 'error' | null>(null)

  return (
    <Dialog
      isOpen={showDialog === 'settings'}
      onDismiss={() => {
        setShowDialog(null)
        setClearStorageStatus(null)
      }}
    >
      <div className="graphiql-dialog-header">
        <div className="graphiql-dialog-title">Settings</div>
        <Dialog.Close
          onClick={() => {
            setShowDialog(null)
            setClearStorageStatus(null)
          }}
        />
      </div>
      <div className="graphiql-dialog-section">
        <div>
          <div className="graphiql-dialog-section-title">Theme</div>
          <div className="graphiql-dialog-section-caption">Adjust how the interface looks like.</div>
        </div>
        <div>
          <ButtonGroup>
            <Button type="button" className={theme === null ? 'active' : ''} onClick={() => setTheme(null)}>
              System
            </Button>
            <Button type="button" className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>
              Light
            </Button>
            <Button type="button" className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>
              Dark
            </Button>
          </ButtonGroup>
        </div>
      </div>
      {storageContext ? (
        <div className="graphiql-dialog-section">
          <div>
            <div className="graphiql-dialog-section-title">Clear storage</div>
            <div className="graphiql-dialog-section-caption">Remove all locally stored data and start fresh.</div>
          </div>
          <div>
            <Button
              type="button"
              state={clearStorageStatus || undefined}
              disabled={clearStorageStatus === 'success'}
              onClick={() => {
                try {
                  storageContext?.clear()
                  setClearStorageStatus('success')
                } catch {
                  setClearStorageStatus('error')
                }
              }}
            >
              {clearStorageStatus === 'success'
                ? 'Cleared data'
                : clearStorageStatus === 'error'
                ? 'Failed'
                : 'Clear data'}
            </Button>
          </div>
        </div>
      ) : null}
    </Dialog>
  )
}
