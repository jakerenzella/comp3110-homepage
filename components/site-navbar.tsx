'use client'

import { Navbar } from '@heroui-pro/react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { course } from '@/data/course'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/accelerator', label: 'Accelerator' },
  { href: '/projects', label: 'Projects' },
  { href: '/mentors', label: 'Mentors' },
  { href: '/resources', label: 'Resources' },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteNavbar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <Navbar
      position="sticky"
      maxWidth="full"
      navigate={(href) => router.push(href)}
      className="border-b border-subtle bg-surface"
    >
      <Navbar.Header className="doc-column">
        <Navbar.Brand>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/brand/unsw-portrait.png"
              alt="UNSW Sydney"
              width={614}
              height={641}
              priority
              className="h-10 w-auto"
            />
            <span
              aria-hidden="true"
              className="h-8 w-px bg-subtle"
            />
            <span className="font-heading font-bold text-ink-strong tracking-tight">
              {course.code}
            </span>
          </Link>
        </Navbar.Brand>
        <Navbar.Content className="hidden md:flex gap-6">
          {NAV_LINKS.map((link) => (
            <Navbar.Item
              key={link.href}
              href={link.href}
              isCurrent={isActive(pathname, link.href)}
              className="text-sm font-semibold"
            >
              {link.label}
            </Navbar.Item>
          ))}
        </Navbar.Content>
        <Navbar.MenuToggle className="md:hidden" />
      </Navbar.Header>
      <Navbar.Menu>
        {NAV_LINKS.map((link) => (
          <Navbar.MenuItem
            key={link.href}
            href={link.href}
            isCurrent={isActive(pathname, link.href)}
          >
            {link.label}
          </Navbar.MenuItem>
        ))}
      </Navbar.Menu>
    </Navbar>
  )
}
