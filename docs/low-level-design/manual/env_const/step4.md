# Step 4: フロントエンド（Next.js）セットアップ

## 4-1. Next.js プロジェクト作成

ルート（`jeligramy-next-fast`）で実行：

```bash
cd /path/to/jeligramy-next-fast
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --no-import-alias
```

プロンプトに従い、必要なら `Y` / `N` を選択。  
既に `frontend` フォルダがある場合は、その中で `npm init` してから Next を入れるか、空の `frontend` を削除してから上記を実行。

---

## 4-2. shadcn/ui の導入

```bash
cd frontend
npx shadcn@latest init
```

- Style: **Default**
- Base color: **Neutral** など好みで
- CSS variables: **Yes**

コンポーネント追加（例）：

```bash
npx shadcn@latest add button card input textarea
```

---

## 4-3. API 呼び出し用のベースURL

開発時はバックエンドが `http://localhost:8000` になるよう、環境変数を用意する。

### `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

（Docker で動かすときは `http://backend:8000` などに変更する場合あり。Step 5 で統一）

---

## 4-4. ローカル起動確認

```bash
cd frontend
npm run dev
```

`http://localhost:3000` でトップが表示されれば OK。  
この時点ではまだ API 連携はしなくてよい。

---

## 4-5. frontend 用 Dockerfile

### `frontend/Dockerfile`

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]
EXPOSE 3000
```

（開発用に `npm run dev` で動かす compose 用の Dockerfile を別で用意してもよい）

---

ここまででフロントの土台ができる。**Step 5** で Docker 化と docker-compose を組み合わせる。
