'use client'

/**
 * Renders Markdown/HTML tables from MDX with the HeroUI `Table` component.
 *
 * next-mdx-remote routes both GFM pipe-tables and literal `<table>` elements
 * through the `table` component override (see components/mdx.tsx). The GFM/HTML
 * output tree is deterministic — `table > thead > tr > th` and
 * `table > tbody > tr > td` — so we walk it and re-emit the HeroUI compound API.
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

export function MdxTable({ children }: WithChildren) {
  const thead = firstOfType(children, 'thead')
  const tbody = firstOfType(children, 'tbody')

  const headerRow = thead ? firstOfType(thead.props.children, 'tr') : undefined
  const columns = headerRow
    ? elementsOfType(headerRow.props.children, 'th')
    : []
  const rows = tbody ? elementsOfType(tbody.props.children, 'tr') : []

  // Fall back to a plain table if the shape is unexpected (e.g. no header).
  if (columns.length === 0) {
    return <table>{children}</table>
  }

  return (
    <Table className="my-6">
      <Table.ScrollContainer>
        <Table.Content aria-label="Data table">
          <Table.Header>
            {columns.map((col, i) => (
              <Table.Column key={i} isRowHeader={i === 0}>
                {col.props.children}
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body>
            {rows.map((row, ri) => (
              <Table.Row key={ri}>
                {elementsOfType(row.props.children, 'td').map((cell, ci) => (
                  <Table.Cell key={ci}>{cell.props.children}</Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
