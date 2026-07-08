'use client'

/**
 * Team member card built on HeroUI Pro `ItemCard`. When the person has a `url`
 * the ENTIRE card becomes a link via ItemCard's documented `render` prop
 * (https://heroui.pro/docs/react/components/item-card). Client component so the
 * render function stays out of the RSC boundary.
 */
import Link from 'next/link'
import { Avatar } from '@heroui/react'
import { ItemCard } from '@heroui-pro/react'

export type Person = {
  name: string
  role: string
  photo?: string
  url?: string
  lead?: boolean
}

function initials(name: string) {
  const p = name.split(' ').filter(Boolean)
  return ((p[0]?.[0] ?? '') + (p.at(-1)?.[0] ?? '')).toUpperCase()
}

export function PersonCard({ person }: { person: Person }) {
  const { name, role, photo, url, lead } = person
  return (
    <ItemCard
      // Lead tutor / course admin gets an accent edge (no component variant for it).
      className={lead ? 'border-l-2 border-l-accent' : undefined}
      render={
        url ? (props) => <Link href={url} {...props} /> : undefined
      }
    >
      <ItemCard.Icon>
        <Avatar size="md">
          {photo ? <Avatar.Image src={photo} alt="" /> : null}
          <Avatar.Fallback>{initials(name)}</Avatar.Fallback>
        </Avatar>
      </ItemCard.Icon>
      <ItemCard.Content>
        <ItemCard.Title>{name}</ItemCard.Title>
        <ItemCard.Description>{role}</ItemCard.Description>
      </ItemCard.Content>
    </ItemCard>
  )
}
