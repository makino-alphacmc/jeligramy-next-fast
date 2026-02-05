# Step 3: 結合・動作確認

## ゴール（完了条件）

- [ ] バックエンド（port 8000）とフロントエンド（port 3000）を同時に起動できる
- [ ] ブラウザで http://localhost:3000 を開くと共通レイアウトが表示される
- [ ] ヘッダーにモックユーザー（jeli）が表示される（GET /api/auth/me が動いている）
- [ ] サイドメニューの Logout をクリックすると POST /api/auth/logout が呼ばれ、問題なく動作する
- [ ] パンくず・フッターが仕様どおり表示される

---

## 3-1. 同時起動

**手順**

1. ターミナル 1: バックエンドを起動する。

```bash
# なんのため: フロントが fetch で呼ぶ API を port 8000 で待ち受ける。
cd backend
source .venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# 意味: main の app を起動。--reload でコード変更時に再起動。--host 0.0.0.0 で外から接続可。
```

2. ターミナル 2: フロントエンドを起動する。

```bash
# なんのため: ブラウザで開く画面を port 3000 で配信する。API は .env.local の URL で backend を呼ぶ。
cd frontend
npm run dev
# 意味: Next の開発サーバーを起動。http://localhost:3000 でアクセスできる。
```

3. ブラウザで http://localhost:3000 を開く。

---

## 3-2. 確認チェックリスト

| 確認項目 | 期待 |
|----------|------|
| レイアウト | 左にサイドメニュー、右にヘッダー・パンくず・メインエリア、最下部にフッターが全幅で表示される |
| ダークテーマ | 背景が暗い、文字が明るい |
| ヘッダー | 「jeligramy」が左、右にアバター領域（モックで「jeli」またはアイコン） |
| サイドメニュー | Home, New post, Profile, Drafts, Settings、区切り線、Logout |
| Logout | クリックで POST /api/auth/logout が発火し、エラーにならない |
| パンくず | 例: Home / Posts。Home はリンク、Posts は現在ページでリンクなし |
| フッター | 黒背景、中央に © 2026 jeligramy、Terms \| Privacy |
| メインエリア | 仮コンテンツが表示され、スクロール可能な枠になっている |

---

## 3-3. API 確認（開発者ツール）

1. ブラウザの開発者ツールを開き、Network タブを表示する。
2. ページ読み込み時に `GET .../api/auth/me` が 200 で返っていることを確認する。
3. Logout クリック時に `POST .../api/auth/logout` が 200 で返っていることを確認する。

---

## 3-4. 今後の拡張（本手順の外）

- 認証をモックから本物（Cookie セッションや JWT）に差し替える
- 各メニュー項目の遷移先（/posts/new, /profile 等）を実装する
- パンくずをルートごとに動的にする
- 投稿カード・トップ画面の API/UI は別マニュアルで実装する

以上で共通パーツの実装手順は完了とする。
