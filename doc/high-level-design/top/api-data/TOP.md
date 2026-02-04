# API・データ設計（トップ画面）

トップ画面の **main contents** のみの設計（ヘッダー・フッター・サイドメニューは含まない）。他画面は別設計。

---

## 1. 画面項目一覧

| 項目名 | I/O | 編集仕様 | 関連API |
|--------|-----|----------|---------|
| 投稿カード一覧 | 出力 | グリッド表示・ページネーションで追加 | GET /api/posts |
| 各カード：投稿者・サムネ・タイトル・説明・いいね数・コメント数 | 出力 | 表示のみ | GET /api/posts（各件の author, likes_count, comments_count, is_liked） |
| 各カード：3点メニュー | 入出力 | 本人投稿時のみ編集・削除を有効化 | GET /api/auth/me（本人判定）, PATCH/DELETE /api/posts/:id |

---

## 2. イベント一覧

| イベント名 | トリガー | 編集仕様 | 関連API |
|------------|----------|----------|---------|
| 画面表示（初回） | ページ表示 | 公開投稿一覧を表示（本人判定のため現在ユーザーも取得） | GET /api/posts, GET /api/auth/me |
| スクロール（追加読み込み） | 一覧下端到達 | 次のページを取得して末尾に追加 | GET /api/posts?page=&limit= |
| いいねタップ | いいねボタンタップ | いいね ON/OFF トグル、件数・状態を更新 | POST /api/posts/:id/likes, DELETE /api/posts/:id/likes |
| 3点メニュー → 編集 | 編集選択 | 投稿編集（編集画面は他設計） | GET /api/posts/:id, PATCH /api/posts/:id |
| 3点メニュー → 削除 | 削除選択 | 投稿削除、一覧から除外 or 再取得 | DELETE /api/posts/:id |

---

## 3. 機能概要

### 3.1 API

| API名 | 用途 | メソッド | パラメーター | 概要（カラム名） |
|-------|------|----------|--------------|------------------|
| 現在ユーザー取得 | 3点メニュー本人判定 | GET | — | id, username, avatar_url |
| 投稿一覧 | トップのカード一覧 | GET | page, limit | id, user_id, image_url, title, body, status, created_at, author(id, username, avatar_url), likes_count, comments_count, is_liked |
| 投稿 1 件取得 | 編集用など | GET | id（path） | id, user_id, image_url, title, body, status, created_at, updated_at, author |
| 投稿更新 | 3点メニューから編集 | PATCH | id（path）, body | image_url, title, body, status |
| 投稿削除 | 3点メニューから削除 | DELETE | id（path） | — |
| いいね | いいね ON | POST | id（path） | — |
| いいね解除 | いいね OFF | DELETE | id（path） | — |

---

### 3.2 データテーブル（マスター）

| テーブル名 | 用途 | カラム |
|------------|------|--------|
| users | カードの投稿者表示 | id, username, avatar_url |
| posts | 投稿一覧・カード内容 | id, user_id, image_url, title, body, status, created_at, updated_at |
| likes | いいね数・is_liked | id, post_id, user_id, created_at（UNIQUE(post_id, user_id)） |
| comments | コメント数 | id, post_id, user_id, body, created_at |
