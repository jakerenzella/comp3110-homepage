'use client'

/**
 * Renders Markdown/HTML tables from MDX with the HeroUI `Table` component.
 *
 * next-mdx-remote routes both GFM pipe-tables and literal `<table>` elements
 * through the `table` component override (see components/mdx.tsx). The GFM/HTML
 * output tree is deterministic — `table > thead > tr > th` and
 * `table > tbody > tr > td` — so we walk it into columns + row items and feed
 * HeroUI's dynamic-collection API (https://heroui.com/docs/react/components/table).
 * Stable `id`s keep SSR and client hydration in sync.
 */
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'
import { Table } from '@heroui/react'

type WithChildren = { children?: ReactNode }

function elementsOfType(
  node: ReactNode,
  type: string,
): ReactElement<WithChildren>[] {
  return Children.toArray(node).filter(
    (c): c is ReactElement<WithChildren> =>
      isValidElement(c) && c.type === type,
  )
}

function firstOfType(
  node: ReactNode,
  type: string,
): ReactElement<WithChildren> | undefined {
  return elementsOfType(node, type)[0]
}

type Column = { id: string; header: ReactNode; isRowHeader: boolean }
type Row = { id: string; cells: Record<string, ReactNode> }

export function MdxTable({ children }: WithChildren) {
  const thead = firstOfType(children, 'thead')
  const tbody = firstOfType(children, 'tbody')

  const headerRow = thead ? firstOfType(thead.props.children, 'tr') : undefined
  const columns: Column[] = (
    headerRow ? elementsOfType(headerRow.props.children, 'th') : []
  ).map((col, i) => ({
    id: `col-${i}`,
    header: col.props.children,
    isRowHeader: i === 0,
  }))

  const rows: Row[] = (tbody ? elementsOfType(tbody.props.children, 'tr') : []).map(
    (row, ri) => {
      const cells: Record<string, ReactNode> = {}
      elementsOfType(row.props.children, 'td').forEach((cell, ci) => {
        cells[`col-${ci}`] = cell.props.children
      })
      return { id: `row-${ri}`, cells }
    },
  )

  // Fall back to a plain table if the shape is unexpected (e.g. no header).
  if (columns.length === 0) {
    return <table>{children}</table>
  }

  return (
    <Table className="my-6">
      <Table.ScrollContainer>
        <Table.Content aria-label="Data table">
          <Table.Header columns={columns}>
            {(column) => (
              <Table.Column isRowHeader={column.isRowHeader}>
                {column.header}
              </Table.Column>
            )}
          </Table.Header>
          <Table.Body items={rows}>
            {(row) => (
              <Table.Row>
                <Table.Collection items={columns}>
                  {(column) => <Table.Cell>{row.cells[column.id]}</Table.Cell>}
                </Table.Collection>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
