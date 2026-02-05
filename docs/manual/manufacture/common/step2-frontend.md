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

- Step 1 が完了し、バックエンドを起動すると GET /api/auth/me が返ること（動作確認時）
- フロントエンドは Next.js（App Router）。`frontend/` で作業する
- UI の寸法・色は `docs/low-level-design/COMMON.md` に合わせ、CSS 変数（`globals.css`）で揃える

### コードのつながり（Step 2 の流れ）

```
layout.tsx        → 全ページのルート。CommonLayout で children を包む
CommonLayout      → Sidebar / Header / Breadcrumb / MainContent / Footer を並べる。children は MainContent へ
  ├─ Header       → fetchMe() で Step1 の GET /api/auth/me を呼び、username を表示
  ├─ Sidebar      → Logout クリックで fetchLogout() → Step1 の POST /api/auth/logout
  ├─ Breadcrumb   → CommonLayout から渡された items を表示
  ├─ MainContent  → children（= 各ページの内容。/ なら page.tsx）
  └─ Footer       → 静的表示のみ

lib/api.ts        → fetchMe / fetchLogout。Header と Sidebar から利用
page.tsx          → トップページの内容。layout の children として MainContent に渡る
```

---

## 2-2. 環境変数

**手順**

1. `frontend/.env.local` を作成する（存在しなければ）。

```env
# なぜ必要: フロントからバックエンドの API を呼ぶとき、どの URL に fetch するかを決めるため。
# 意味: NEXT_PUBLIC_ が付いた変数はビルド時にクライアントに埋め込まれ、lib/api.ts の BASE で参照される。
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

2. 本番や別環境ではこの値を差し替える。

---

## 2-3. API 呼び出し用ユーティリティ

**手順**

1. `frontend/src/lib/api.ts` を作成する。

```ts
// frontend/src/lib/api.ts
// なぜ必要: ヘッダーとサイドメニューがバックエンドの API を呼ぶ処理を一箇所にまとめ、URL やオプションを揃えるため。
// なんのため: Header が「今のユーザー」を表示するために fetchMe を、Sidebar の Logout がログアウトするために fetchLogout を呼ぶ。

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
// 意味: .env.local の NEXT_PUBLIC_API_BASE_URL（例: http://localhost:8000）。無ければ空文字。fetch のベース URL になる。

export async function fetchMe(): Promise<{ id: string; username: string; avatar_url: string | null } | null> {
  // なぜ必要: ヘッダーに表示する「今ログインしているユーザー」をバックエンドから取得するため。
  const res = await fetch(`${BASE}/api/auth/me`, { credentials: "include" });
  // 意味: GET で /api/auth/me を呼ぶ。credentials: "include" で Cookie があれば送る（将来のセッション用）。
  if (!res.ok) return null;  // 意味: 401 など失敗時は null。Header は null のときアイコンのみ表示する。
  return res.json();        // 意味: レスポンス body を JSON として解釈し、{ id, username, avatar_url } の形で返す。
}

export async function fetchLogout(): Promise<void> {
  // なぜ必要: ユーザーが Logout を押したときに、サーバー側でセッションを無効にする意図を伝えるため。
  await fetch(`${BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
  // 意味: POST で /api/auth/logout を呼ぶ。戻り値は使わない。本番ではここで Cookie が削除される想定。
}
```

---

## 2-4. 共通レイアウト用コンポーネント

**手順**

1. `frontend/src/components/layout/` ディレクトリを作成する。

2. **Header** — `frontend/src/components/layout/Header.tsx`

```tsx
// Header.tsx
// なぜ必要: 全画面の上にサイト名と「今のユーザー」を表示するため。CommonLayout から使われる。
// なんのため: ユーザーが今誰でログインしているか一目で分かるようにし、クリックでメニュー（将来）を開けるようにする。

"use client";
// 意味: このコンポーネントはクライアントで動く。useEffect や useState を使うのでサーバーでは実行できない。

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchMe } from "@/lib/api";  // 意味: GET /api/auth/me を呼ぶ関数。戻り値でユーザー名を表示する。

export function Header() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  // 意味: 取得したユーザーを保持。null のあいだはアイコンだけ表示する。
  useEffect(() => {
    fetchMe().then(setUser);  // なんのため: マウント時に 1 回だけ API を呼び、取れたら user にセットして表示を更新する。
  }, []);  // 意味: 依存配列が空なので、初回表示時にだけ実行する。

  return (
    <header className="flex h-14 items-center justify-between rounded-lg border border-border bg-card px-6">
      <Link href="/" className="text-lg font-semibold text-foreground">jeligramy</Link>
      <div className="flex h-8 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
        {user ? <span className="text-xs font-medium">{user.username}</span> : "👤"}
        {/* 意味: user があればバックエンドから返った username を表示、なければアイコンのみ。 */}
      </div>
    </header>
  );
}
```

3. **Sidebar** — `frontend/src/components/layout/Sidebar.tsx`

```tsx
// Sidebar.tsx
// なぜ必要: 全画面の左にナビ（Home, New post など）と Logout を置き、画面遷移とログアウトをできるようにするため。
// なんのため: CommonLayout の左カラムとして表示され、Logout クリックで fetchLogout を呼んでからトップへ飛ばす。

"use client";
// 意味: onClick で fetchLogout を呼ぶため、クライアントコンポーネントにする。

import Link from "next/link";
import { fetchLogout } from "@/lib/api";  // 意味: POST /api/auth/logout を呼ぶ。Logout ボタンで使用。

const items = [
  // 意味: ナビに並べる項目。label が表示名、href が遷移先。未実装のパスは 404 になってもよい。
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
            await fetchLogout();   // なんのため: サーバーにログアウトを伝え、本番ではセッションを削除する。
            window.location.href = "/";  // 意味: その後トップへ遷移。本番ではログイン画面などに飛ばす想定。
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

```tsx
// Breadcrumb.tsx
// なぜ必要: 「今どのページにいるか」を Home / Posts のように階層で表示し、上位へ戻るリンクを提供するため。
// なんのため: CommonLayout から items を渡され、href がある項目はリンク、ない項目は現在ページとして表示する。

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
```

5. **MainContent** — `frontend/src/components/layout/MainContent.tsx`

```tsx
// MainContent.tsx
// なぜ必要: 各ページの内容（例: トップなら投稿一覧）を入れる「枠」を共通で用意するため。
// なんのため: CommonLayout が children（= そのページの JSX）をここに渡し、スクロール可能なエリアとして表示する。

export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-0 flex-1 overflow-auto rounded-lg border border-border bg-card">
      {/* 意味: min-h-0 で flex 子がはみ出さないようにし、flex-1 で残り幅を取り、overflow-auto でスクロール可能にする。 */}
      {children}
    </main>
  );
}
```

6. **Footer** — `frontend/src/components/layout/Footer.tsx`

```tsx
// Footer.tsx
// なぜ必要: 全画面の一番下にコピーライトと利用規約リンクを表示するため。API は使わず静的。
// なんのため: CommonLayout の最下部に全幅で置き、デザイン仕様（黒背景・中央・11px）に合わせる。

import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex h-9 w-full flex-col items-center justify-center bg-black text-center text-[11px]">
      <div className="text-[#71717a]">© 2026 jeligramy</div>
      <div>
        <Link href="/terms" className="text-[#a1a1aa] hover:text-foreground">Terms</Link>
        <span className="text-[#71717a]"> | </span>
        <Link href="/privacy" className="text-[#a1a1aa] hover:text-foreground">Privacy</Link>
      </div>
    </footer>
  );
}
```

7. **CommonLayout** — `frontend/src/components/layout/CommonLayout.tsx`

```tsx
// CommonLayout.tsx
// なぜ必要: 全ページで同じ「サイド＋ヘッダー＋パンくず＋メイン＋フッター」の並びにするため。layout.tsx から 1 回だけ使う。
// なんのため: children に各ページの内容（/ なら page.tsx）が渡り、それを MainContent の中に表示する。

import { Breadcrumb } from "./Breadcrumb";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MainContent } from "./MainContent";
import { Sidebar } from "./Sidebar";

type BreadcrumbItem = { label: string; href?: string };
// 意味: パンくずの項目。ページごとに違うリストを渡せる。省略時は Home / Posts。

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
          {/* 意味: children は layout が渡す「そのページの内容」。トップなら page.tsx の JSX。 */}
        </div>
      </div>
      <Footer />
    </div>
  );
}
```

---

## 2-5. ルートレイアウトの適用

**手順**

1. `frontend/src/app/layout.tsx` を修正する。

```tsx
// layout.tsx（ルートレイアウト）
// なぜ必要: すべてのページで共通のレイアウト（CommonLayout）とフォント・ダークテーマを適用するため。Next が全ページでこの layout を包む。
// なんのため: children には「今表示するページ」（/ なら page.tsx）が渡り、それを CommonLayout の MainContent に渡して表示する。

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CommonLayout } from "@/components/layout/CommonLayout";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// 意味: フォントを読み込み、CSS 変数として body に渡す。サブセットで日本語など必要な文字だけ読み込む。

export const metadata: Metadata = {
  title: "jeligramy",
  description: "jeligramy",
};
// 意味: ブラウザのタブや SEO 用のタイトル・説明。

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
        {/* 意味: dark クラスで globals.css の .dark が効き、背景や文字色がダークテーマになる。 */}
        <CommonLayout>{children}</CommonLayout>
        {/* 意味: children = 現在のルートのページ（/ なら page.tsx）。CommonLayout が Header 等と一緒にこれを MainContent に渡す。 */}
      </body>
    </html>
  );
}
```

2. `frontend/src/app/page.tsx` で、メインエリアに仮コンテンツを表示する。

```tsx
// page.tsx（トップページ /）
// なぜ必要: ルート / にアクセスしたときに表示する内容を定義するため。Next は app/page.tsx を「/」のページとして扱う。
// なんのため: layout の children として CommonLayout に渡り、MainContent の中にこの JSX が表示される。今は仮コンテンツで、後で投稿一覧に差し替える。

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
3. サイドメニュー・ヘッダー・パンくず・メインエリア・フッターが表示され、ダークテーマになっていることを確認する。
4. バックエンドが動いていれば、ヘッダーにモックユーザー名（jeli）が表示される。
5. Logout をクリックすると POST /api/auth/logout が呼ばれることを確認する。

---

## 2-7. 単体テスト（フロントエンド）

**手順**

1. 依存関係を追加する。

```bash
cd frontend
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @types/jest
```

2. `frontend/jest.config.ts` を作成する。

```ts
// jest.config.ts
// なぜ必要: npm test で Jest を実行するとき、どのようにテストファイルを解釈するかを決めるため。
// なんのため: @/ を src/ に解決し、Next 用の変換（next/jest）をかけて、DOM がある環境（jsdom）で React をテストする。

import type { Config } from "jest";
import nextJest from "next/jest";  // 意味: Next の設定（alias など）を Jest に合わせるラッパー。

const createJestConfig = nextJest({ dir: "./" });
const config: Config = {
  testEnvironment: "jsdom",   // 意味: ブラウザの代わりに jsdom で document などを用意し、React の render が動くようにする。
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],  // 意味: 各テストファイルの前に jest.setup.ts を実行する。toBeInTheDocument などを使えるようにする。
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },  // 意味: import "@/lib/api" を src/lib/api に解決する。tsconfig の paths と揃える。
};
export default createJestConfig(config);
```

3. `frontend/jest.setup.ts` を作成する。

```ts
// jest.setup.ts
// なぜ必要: expect(...).toBeInTheDocument() など、Testing Library の matcher を Jest で使えるようにするため。
// 意味: このファイルが各テストの前に読み込まれ、jest-dom の拡張が有効になる。
import "@testing-library/jest-dom";
```

4. `package.json` の `scripts` に `"test": "jest"` を追加する。

5. `frontend/src/lib/api.test.ts` を作成する。

```ts
// api.test.ts
// なぜ必要: fetchMe と fetchLogout が「正しい URL とオプションで fetch し、レスポンスを正しく返すか」を自動で確かめるため。バックエンドは起動せず fetch をモックする。
// なんのため: 実装を変えたときに、Header や Sidebar が期待する形とずれていないことを保証する。

import { fetchLogout, fetchMe } from "./api";

const BASE = "http://localhost:8000";
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv, NEXT_PUBLIC_API_BASE_URL: BASE };
});
// 意味: 各テストの前に API のベース URL をセットする。fetchMe が BASE を参照するため。
afterAll(() => { process.env = originalEnv; });

describe("fetchMe", () => {
  it("returns user when response is 200", async () => {
    const user = { id: "1", username: "jeli", avatar_url: null };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(user) });
    // 意味: 本当の fetch の代わりに「ok: true と user を返す関数」を置く。サーバーを立てなくてよい。
    const result = await fetchMe();
    expect(result).toEqual(user);
    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/auth/me`, { credentials: "include" });
    // なんのため: Header が呼ぶときの URL とオプションが仕様どおりか確認する。
  });
  it("returns null when response is not ok", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    const result = await fetchMe();
    expect(result).toBeNull();
    // 意味: 401 などで res.ok が false のとき、fetchMe は null を返す。Header はそのときアイコンのみ表示する。
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
    // なんのため: Sidebar の Logout が正しいメソッドとパスで呼ぶことを確認する。
  });
});
```

6. `frontend/src/components/layout/Breadcrumb.test.tsx` を作成する。

```tsx
// Breadcrumb.test.tsx
// なぜ必要: Breadcrumb が items を受け取り、リンクと現在ページを正しく出し分けることを自動で確かめるため。
// なんのため: CommonLayout から渡す items の形（href あり/なし）で表示が変わるので、その挙動が壊れていないことを保証する。

import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "./Breadcrumb";

describe("Breadcrumb", () => {
  it("renders links and current page", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },  // 意味: リンクになるので href がある。
          { label: "Posts" },             // 意味: 現在ページなので href なし。リンクにしない。
        ]}
      />
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    // 意味: 「Home」という名前のリンクが存在し、href が / であること。
    expect(screen.getByText("Posts")).toBeInTheDocument();
    // 意味: 「Posts」というテキストが画面に存在すること。リンクではない。
  });
});
```

7. `npm test` でテストを実行し、すべて PASS することを確認する。

---

## 2-8. トラブルシュート

| 現象 | 確認すること |
|------|----------------|
| アバターにユーザーが表示されない | バックエンドが起動しているか。NEXT_PUBLIC_API_BASE_URL が正しいか。CORS で 3000 が許可されているか。 |
| Logout でエラー | Sidebar が "use client" か。 |
| スタイルが効かない | layout の body に `dark` クラスが付いているか。 |
| Jest でモジュール解決エラー | jest.config.ts の moduleNameMapper で `@/` が `src/` に向いているか。 |

以上（2-7 の単体テスト含む）が完了したら **Step 3（結合・確認）** に進む。
