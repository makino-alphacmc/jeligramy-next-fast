import Link from "next/link";

type Item = { label: string; href?: string };
// 意味: href が無い = 現在のページなのでリンクにしない。ある = クリックでそのパスへ遷移する。

export function Breadcrumb({ items }: { items: Item[] }) {
  return (
    <div className="flex h-9 items-center gap-1 px-6 text-xs text-muted-foreground">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-[#71717a]">/</span>}
          {/* 意味: 2 項目目以降の前に / を表示。色は仕様の #71717a。 */}
          {item.href != null ? (
            <Link href={item.href} className="hover:text-foreground">{item.label}</Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
            {/* 意味: 現在ページはリンクにせず、前景色で表示する。 */}
          )}
        </span>
      ))}
    </div>
  );
}