"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SearchIcon, WrenchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  TreeExpander,
  TreeIcon,
  TreeLabel,
  TreeNode,
  TreeNodeContent,
  TreeNodeTrigger,
  TreeProvider,
  TreeView,
} from "@/components/kibo-ui/tree"

export type CatalogItem = {
  id: string
  label: string
  /** When set, clicking the row opens this page (the chevron still expands/collapses). */
  href?: string
  children?: CatalogItem[]
}

function CatalogNode({
  item,
  level,
  isLast,
}: {
  item: CatalogItem
  level: number
  isLast: boolean
}) {
  const router = useRouter()
  const hasChildren = !!item.children?.length

  return (
    <TreeNode nodeId={item.id} level={level} isLast={isLast}>
      <TreeNodeTrigger
        onClick={item.href ? () => router.push(item.href!) : undefined}
      >
        <TreeExpander hasChildren={hasChildren} />
        <TreeIcon
          hasChildren={hasChildren}
          icon={hasChildren ? undefined : <WrenchIcon className="h-4 w-4" />}
        />
        <TreeLabel>{item.label}</TreeLabel>
      </TreeNodeTrigger>
      {hasChildren && (
        <TreeNodeContent hasChildren>
          {item.children?.map((child, index) => (
            <CatalogNode
              key={child.id}
              item={child}
              level={level + 1}
              isLast={index === (item.children?.length ?? 0) - 1}
            />
          ))}
        </TreeNodeContent>
      )}
    </TreeNode>
  )
}

function filterCatalog(items: CatalogItem[], query: string): CatalogItem[] {
  return items.flatMap((item) => {
    if (item.label.toLowerCase().includes(query)) {
      return [item]
    }
    const children = item.children ? filterCatalog(item.children, query) : []
    return children.length > 0 ? [{ ...item, children }] : []
  })
}

function collectParentIds(items: CatalogItem[]): string[] {
  return items.flatMap((item) =>
    item.children ? [item.id, ...collectParentIds(item.children)] : []
  )
}

export function EquipmentCatalogTree({
  catalog,
  defaultExpandedIds = [],
  resetKey,
}: {
  catalog: CatalogItem[]
  defaultExpandedIds?: string[]
  /** Changing this remounts the tree so it opens with `defaultExpandedIds` again. */
  resetKey: string
}) {
  const [search, setSearch] = React.useState("")
  const query = search.trim().toLowerCase()

  const visible = query ? filterCatalog(catalog, query) : catalog
  const expandedIds = query ? collectParentIds(visible) : defaultExpandedIds

  return (
    <div className="flex flex-col gap-2">
      <div className="relative p-2">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search all equipment"
          aria-label="Search all equipment"
          className="pl-9"
        />
      </div>
      <h2 className="px-4 text-sm font-medium">All Equipment</h2>
      {visible.length === 0 ? (
        <p className="px-4 py-2 text-sm text-muted-foreground">
          No equipment found.
        </p>
      ) : (
        <TreeProvider
          key={query ? `${resetKey}:filtered:${expandedIds.join(",")}` : resetKey}
          defaultExpandedIds={expandedIds}
        >
          <TreeView>
            {visible.map((item, index) => (
              <CatalogNode
                key={item.id}
                item={item}
                level={0}
                isLast={index === visible.length - 1}
              />
            ))}
          </TreeView>
        </TreeProvider>
      )}
    </div>
  )
}
