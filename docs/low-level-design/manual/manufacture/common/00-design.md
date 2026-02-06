# 共通パーツ 詳細設計

共通パーツ（ヘッダー・サイドメニュー・パンくず・フッター・メインコンテンツエリア）および共通 API の実装に必要な詳細設計。  
参照: [基本設計](../../../high-level-design/common/basic-design/COMMON.md) / [API 一覧](../../../high-level-design/common/api/COMMON.md) / [低レベル設計 COMMON](../../../low-level-design/COMMON.md)

---

## 1. 実装範囲

単体テストは**全機能のあと**ではなく**機能ごと**（Step 1 実装直後にバックエンド、Step 2 実装直後にフロントエンド）で追加・実行する。

| 区分 | 内容 |
|------|------|
| バックエンド | GET /api/auth/me、POST /api/auth/logout の 2 本。認証は「モック」または簡易セッションで先行実装可能。 |
| フロントエンド | 共通レイアウト（サイドメニュー・ヘッダー・パンくず・メインエリア・フッター）、ダークテーマ適用、共通 API 呼び出し。 |
| 本手順で扱わないもの | 投稿カード・トップ画面の API/UI、ログイン画面、実際の DB 認証（必要なら別 Step で追加）。 |

---

## 2. API 詳細設計

### 2.1 GET /api/auth/me

| 項目 | 内容 |
|------|------|
| 用途 | ヘッダーアバター・メニュー表示用の現在ユーザー取得 |
| メソッド | GET |
| パス | `/api/auth/me` |
| 認証 | 未認証時は 401 または 200 で body を null / 未ログイン表現。認証時は Cookie または Authorization ヘッダーで識別。 |
| レスポンス 200 | `{ "id": string, "username": string, "avatar_url": string \| null }` |
| レスポンス 401 | 未ログイン（任意で `{ "detail": "Unauthorized" }`） |

### 2.2 POST /api/auth/logout

| 項目 | 内容 |
|------|------|
| 用途 | ログアウト（セッション無効化） |
| メソッド | POST |
| パス | `/api/auth/logout` |
| 認証 | 不要（呼べばセッション削除） |
| レスポンス 200 | `{ "ok": true }` など。Cookie のセッションを削除する場合は Set-Cookie で破棄。 |

---

## 3. バックエンド ファイル構成（想定）

```
backend/
├── main.py              # FastAPI アプリ、CORS、ルート登録
├── requirements.txt     # fastapi, uvicorn 等
├── routers/
│   └── auth.py          # GET /api/auth/me, POST /api/auth/logout
└── (任意) schemas/
    └── user.py          # レスポンス用 Pydantic モデル（UserMe）
```

- 認証は初回実装では「リクエストヘッダーに特定の値があればユーザーを返すモック」でも可。後で Cookie/セッションに差し替え。

---

## 4. フロントエンド ファイル構成（想定）

```
frontend/src/
├── app/
│   ├── layout.tsx       # ルートレイアウト（body に .dark、共通レイアウトを配置）
│   ├── page.tsx         # トップページ（メインエリアに仮コンテンツで OK）
│   └── globals.css      # 既存。.dark の CSS 変数は low-level-design に合わせる
├── components/
│   ├── layout/
│   │   ├── Header.tsx       # サイト名 + アバター
│   │   ├── Sidebar.tsx      # Home / New post / Profile / Drafts / Settings / Logout
│   │   ├── Breadcrumb.tsx   # 階層表示（例: Home / Posts）
│   │   ├── MainContent.tsx  # 子要素を包むスクロール可能エリア
│   │   └── Footer.tsx       # コピーライト・Terms | Privacy
│   └── (任意) ui/       # shadcn 等を使う場合
└── lib/
    └── api.ts           # fetch ラッパー、NEXT_PUBLIC_API_BASE_URL 使用
```

- レイアウト構造: `Sidebar` | `div（ヘッダー・パンくず・MainContent）`、その下に `Footer` を全幅で配置。

---

## 5. 画面・コンポーネント仕様（要点）

| コンポーネント | 仕様要点（low-level-design 準拠） |
|----------------|-----------------------------------|
| Header | 高さ 56px、背景 --card、角丸 10px。左: 「jeligramy」 18px font-weight 600。右: アバター 40×32px 角丸 8px、背景 --primary。未ログイン時はアイコンのみでも可。 |
| Sidebar | 幅 PC 200〜300px、背景 --sidebar、角丸 10px。項目高さ 48px。Home / New post / Profile / Drafts / Settings、区切り線、Logout。アクティブ --foreground、非アクティブ --muted-foreground、hover --foreground。 |
| Breadcrumb | 高さ 36px、12px、セパレータ `/`、リンク --muted-foreground、現在ページ --foreground。 |
| MainContent | 背景 --card、角丸 10px、ボーダー 0.5px --border。子を overflow-auto でスクロール可能に。 |
| Footer | 画面全幅、背景 #000、高さ 36px、中央揃え。1 行目 コピーライト 11px #71717a、2 行目 Terms \| Privacy 11px リンク #a1a1aa。 |

---

## 6. 環境変数

| 変数 | 置き場所 | 用途 |
|------|----------|------|
| NEXT_PUBLIC_API_BASE_URL | frontend .env.local | バックエンド API のベース URL（例: http://localhost:8000） |

---

## 7. 完了イメージ（共通パーツ実装完了時）

- バックエンド: `GET /api/auth/me` でユーザー情報（モック可）が返る。`POST /api/auth/logout` で 200 が返る。
- フロントエンド: 全画面でサイドメニュー・ヘッダー・パンくず・メインエリア・フッターが表示され、ダークテーマが適用されている。ヘッダーアバターで /api/auth/me を呼んで表示（未認証時は非表示またはアイコンのみ）。サイドメニューの Logout で /api/auth/logout を呼ぶ。
- メインコンテンツはトップでは仮表示でよい（投稿一覧は別マニュアルで実装）。
