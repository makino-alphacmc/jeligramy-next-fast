# Step 2: フロントエンド — 共通レイアウト実装

## ゴール（完了条件）

- [ ] 全画面で共通レイアウト（サイドメニュー・ヘッダー・パンくず・メインエリア・フッター）が表示される
- [ ] ダークテーマ（.dark）が適用されている
- [ ] ヘッダーにサイト名「jeligramy」とアバター領域が表示される
- [ ] サイドメニューに Home / New post / Profile / Drafts / Settings / Logout が表示される
- [ ] メインエリアはスクロール可能な枠で、中身は仮コンテンツでよい
- [ ] フッターにコピーライト・Terms | Privacy が表示される
- [ ] （任意）GET /api/auth/me を呼んでアバターにユーザー名 or アイコンを表示、Logout で POST /api/auth/logout を呼ぶ
- [ ] 単体テストが通り、`fetchMe` / `fetchLogout` および共通コンポーネントの表示を検証している

---

## 2-1. 前提

- Step 1 のバックエンドが起動し、GET /api/auth/me が返ること
- フロントエンドは Next.js（App Router）。`frontend/` で作業する
- `docs/low-level-design/COMMON.md` の寸法・色は CSS 変数（globals.css）で揃える

---

## 2-2. 環境変数

**手順**

1. `frontend/.env.local` を作成する（存在しなければ）。

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

2. 本番や別環境ではこの値を差し替える。

---

## 2-3. API 呼び出し用ユーティリティ

**手順**

1. `frontend/src/lib/api.ts` を作成する。

```ts
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function fetchMe(): Promise<{ id: string; username: string; avatar_url: string | null } | null> {
  const res = await fetch(`${BASE}/api/auth/me`, { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchLogout(): Promise<void> {
  await fetch(`${BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
}
```

---

## 2-4. 共通レイアウト用コンポーネント

**手順**

1. `frontend/src/components/layout/` ディレクトリを作成する。

2. **Header** — `frontend/src/components/layout/Header.tsx`

- 高さ 56px、背景 --card、角丸 10px、左右パディング 24px。
- 左: サイト名「jeligramy」、18px font-weight 600、色 --foreground。
- 右: アバター用のボタン（40×32px、角丸 8px、背景 --primary）。未ログイン時はアイコン、ログイン時は /api/auth/me の username 表示やアバター画像を表示する場合は client コンポーネントで fetch。

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchMe } from "@/lib/api";

export function Header() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  useEffect(() => {
    fetchMe().then(setUser);
  }, []);

  return (
    <header className="flex h-14 items-center justify-between rounded-lg border border-border bg-card px-6">
      <Link href="/" className="text-lg font-semibold text-foreground">
        jeligramy
      </Link>
      <div className="flex h-8 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
        {user ? <span className="text-xs font-medium">{user.username}</span> : "👤"}
      </div>
    </header>
  );
}
```

3. **Sidebar** — `frontend/src/components/layout/Sidebar.tsx`

- 幅 200px（PC）、背景 --sidebar、角丸 10px、ボーダー。
- 項目: Home, New post, Profile, Drafts, Settings、区切り線、Logout。
- リンクは Next.js の `Link`、href は暫定で `/` や `/posts/new` 等でよい。Logout はボタンで `fetchLogout` を呼ぶため、Sidebar を `"use client"` にする。

```tsx
"use client";

import Link from "next/link";
import { fetchLogout } from "@/lib/api";

const items = [
  { label: "Home", href: "/" },
  { label: "New post", href: "/posts/new" },
  { label: "Profile", href: "/profile" },
  { label: "Drafts", href: "/drafts" },
  { label: "Settings", href: "/settings" },
];

export function Sidebar() {
  return (
    <aside className="w-[200px] shrink-0 rounded-lg border border-sidebar-border bg-sidebar">
      <nav className="flex flex-col py-2">
        {items.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="flex h-12 items-center px-4 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {label}
          </Link>
        ))}
        <hr className="my-2 border-sidebar-border" />
        <button
          type="button"
          className="flex h-12 w-full items-center px-4 text-left text-sm font-medium text-muted-foreground hover:text-foreground"
          onClick={async () => {
            await fetchLogout();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
```

4. **Breadcrumb** — `frontend/src/components/layout/Breadcrumb.tsx`

- props で `items: { label: string; href?: string }[]` を受け取り、`/` で区切って表示。最後はリンクなし。

```tsx
import Link from "next/link";

type Item = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Item[] }) {
  return (
    <div className="flex h-9 items-center gap-1 px-6 text-xs text-muted-foreground">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-[#71717a]">/</span>}
          {item.href != null ? (
            <Link href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
```

5. **MainContent** — `frontend/src/components/layout/MainContent.tsx`

- 子要素を包み、背景 --card、角丸 10px、ボーダー、overflow-auto でスクロール可能に。

```tsx
export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-0 flex-1 overflow-auto rounded-lg border border-border bg-card">
      {children}
    </main>
  );
}
```

6. **Footer** — `frontend/src/components/layout/Footer.tsx`

- 画面全幅、背景黒、高さ 36px、中央揃え。コピーライトと Terms | Privacy。

```tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex h-9 w-full flex-col items-center justify-center bg-black text-center text-[11px]">
      <div className="text-[#71717a]">© 2026 jeligramy</div>
      <div>
        <Link href="/terms" className="text-[#a1a1aa] hover:text-foreground">
          Terms
        </Link>
        <span className="text-[#71717a]"> | </span>
        <Link href="/privacy" className="text-[#a1a1aa] hover:text-foreground">
          Privacy
        </Link>
      </div>
    </footer>
  );
}
```

7. **CommonLayout** — `frontend/src/components/layout/CommonLayout.tsx`

- サイドバー | 右側（ヘッダー・パンくず・メイン）の 2 カラム、その下にフッター。メインエリアの子は `children`、パンくずは props で渡すか、ルートごとに固定でよい。

```tsx
import { Breadcrumb } from "./Breadcrumb";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MainContent } from "./MainContent";
import { Sidebar } from "./Sidebar";

type BreadcrumbItem = { label: string; href?: string };

export function CommonLayout({
  children,
  breadcrumb = [{ label: "Home", href: "/" }, { label: "Posts" }],
}: {
  children: React.ReactNode;
  breadcrumb?: BreadcrumbItem[];
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex min-h-[calc(100vh-36px)] flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <Breadcrumb items={breadcrumb} />
          <MainContent>{children}</MainContent>
        </div>
      </div>
      <Footer />
    </div>
  );
}
```

- Sidebar は `"use client"`。CommonLayout はサーバーコンポーネントのままでよい。

---

## 2-5. ルートレイアウトの適用

**手順**

1. `frontend/src/app/layout.tsx` を修正する。
   - `body` に `className="dark"` を付与し、共通レイアウトでラップする。
   - metadata の title を "jeligramy" などに変更してよい。

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CommonLayout } from "@/components/layout/CommonLayout";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "jeligramy",
  description: "jeligramy",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
        <CommonLayout>{children}</CommonLayout>
      </body>
    </html>
  );
}
```

2. `frontend/src/app/page.tsx` で、メインエリアに仮コンテンツを表示する。

```tsx
export default function HomePage() {
  return (
    <div className="p-6">
      <p className="text-muted-foreground">Main content area. (Top page will show posts here.)</p>
    </div>
  );
}
```

---

## 2-6. 動作確認

1. フロントを起動する（`frontend/` で `npm run dev`）。
2. http://localhost:3000 を開く。
3. サイドメニュー・ヘッダー（jeligramy + アバター）・パンくず・メインエリア・フッターが表示され、ダークテーマになっていることを確認する。
4. バックエンドが動いていれば、ヘッダーにモックユーザー名（jeli）が表示される。
5. Logout をクリックすると POST /api/auth/logout が呼ばれ、表示が更新される（モックのためセッション変化はなくてもよい）。

---

## 2-7. 単体テスト（フロントエンド）

**手順**

1. 依存関係を追加する。`frontend/` で以下を実行する。

```bash
cd frontend
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @types/jest
```

2. `frontend/jest.config.ts` を作成する（Next.js で Jest を使う場合の例）。

```ts
// frontend/jest.config.ts
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });
const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
};
export default createJestConfig(config);
```

3. `frontend/jest.setup.ts` を作成する。

```ts
// frontend/jest.setup.ts
import "@testing-library/jest-dom";
```

4. `package.json` の `scripts` に `"test": "jest"` を追加する。

5. **API の単体テスト** — `frontend/src/lib/api.test.ts` を作成する。`fetch` をモックし、`fetchMe` が 200 のときユーザーを返すこと・非 200 のとき null を返すこと、`fetchLogout` が POST で呼ばれることを検証する。

```ts
// frontend/src/lib/api.test.ts
import { fetchLogout, fetchMe } from "./api";

const BASE = "http://localhost:8000";
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv, NEXT_PUBLIC_API_BASE_URL: BASE };
});

afterAll(() => {
  process.env = originalEnv;
});

describe("fetchMe", () => {
  it("returns user when response is 200", async () => {
    const user = { id: "1", username: "jeli", avatar_url: null };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(user) });
    const result = await fetchMe();
    expect(result).toEqual(user);
    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/auth/me`, { credentials: "include" });
  });

  it("returns null when response is not ok", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    const result = await fetchMe();
    expect(result).toBeNull();
  });
});

describe("fetchLogout", () => {
  it("calls POST /api/auth/logout", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    await fetchLogout();
    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  });
});
```

6. **コンポーネントの単体テスト（例: Breadcrumb）** — `frontend/src/components/layout/Breadcrumb.test.tsx` を作成する。リンクと現在ページの表示を検証する。

```tsx
// frontend/src/components/layout/Breadcrumb.test.tsx
import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "./Breadcrumb";

describe("Breadcrumb", () => {
  it("renders links and current page", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Posts" },
        ]}
      />
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Posts")).toBeInTheDocument();
  });
});
```

7. テストを実行する。

```bash
cd frontend
npm test
```

8. すべて PASS することを確認する。

---

## 2-8. トラブルシュート

| 現象 | 確認すること |
|------|----------------|
| アバターにユーザーが表示されない | バックエンドが起動しているか。NEXT_PUBLIC_API_BASE_URL が正しいか。CORS で 3000 が許可されているか。 |
| Logout でエラー | Sidebar または LogoutButton が "use client" か。fetchLogout の import が動的でもよい。 |
| スタイルが効かない | layout の body に `dark` クラスが付いているか。tailwind の dark が有効か。 |
| Jest で Next のモジュール解決エラー | jest.config.ts の moduleNameMapper で `@/` が `src/` に向いているか。next/jest を使う場合は createJestConfig でラップする。 |

以上（2-7 の単体テスト含む）が完了したら **Step 3（結合・確認）** に進む。
