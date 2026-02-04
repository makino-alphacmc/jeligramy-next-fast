# Step 6: API・UI 実装と git push

## 6-1. バックエンド API 実装（投稿の一覧・作成・削除）

### モデル・スキーマ例（backend）

- **GET /posts** … 投稿一覧
- **POST /posts** … 投稿作成（body: `{ "content": "本文", "image_url": "任意" }`）
- **DELETE /posts/{id}** … 投稿削除

（永続化はメモリリストでも可。DB を使う場合は SQLAlchemy で Post テーブルを用意）

### 実装の流れ

1. `main.py` に上記3エンドポイントを追加
2. CORS で `http://localhost:3000` を許可（Step 3 の通り）
3. `GET /posts` で JSON 配列、`POST` で作成したオブジェクト、`DELETE` で 204 を返す

---

## 6-2. フロントエンド UI 実装

1. **トップ画面（投稿一覧）**
   - `GET /posts` を呼び、カードまたはリストで表示
   - 各投稿に「削除」ボタン → `DELETE /posts/{id}` を呼び、一覧を再取得

2. **新規投稿画面**
   - フォーム（本文・画像URL など）を用意
   - 送信で `POST /posts` を呼び、成功したらトップへ遷移 or 一覧を更新

3. API クライアント
   - `fetch(NEXT_PUBLIC_API_URL + '/posts')` や `fetch(..., { method: 'POST', body: JSON.stringify(...) })` でよい

---

## 6-3. 動作確認チェックリスト

- [ ] `docker compose up` で frontend(3000) / backend(8000) が起動する
- [ ] トップで投稿一覧が表示される
- [ ] 新規投稿ができる
- [ ] 削除ボタンで投稿が消える

---

## 6-4. GitHub に push

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git add .
git commit -m "feat: instagram clone MVP (posts list, create, delete)"
git branch -M main
git push -u origin main
```

---

## 6-5. ゴール再確認

- [ ] `docker compose up` で frontend(3000) / backend(8000) が起動する
- [ ] Front から API を呼べる（一覧取得 / 作成 / 削除）
- [ ] UI：投稿一覧表示・新規投稿・削除ができる
- [ ] GitHub に `git push` 済み

以上でインスタクローン MVP 手順は完了。
