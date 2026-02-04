# Step 5: Docker 化と docker-compose 統合

## 5-1. ルートの docker-compose.yml

プロジェクトルートに配置：

### `docker-compose.yml`

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - ENV=development
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
```

※ 開発でホットリロードしたい場合は、frontend の `CMD` を `npm run dev` にした Dockerfile を別途用意し、`ports` は `3000:3000` のままにする。

---

## 5-2. 開発用 compose（オプション）

開発時だけ frontend を `npm run dev` で動かす場合の例：

### `docker-compose.dev.yml`（例）

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    command: uvicorn main:app --reload --host 0.0.0.0 --port 8000

  frontend:
    image: node:20-alpine
    working_dir: /app
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: sh -c "npm install && npm run dev"
    depends_on:
      - backend
```

起動：

```bash
docker compose -f docker-compose.dev.yml up
```

---

## 5-3. 起動確認

```bash
docker compose up --build
```

- Frontend: http://localhost:3000  
- Backend:  http://localhost:8000  

両方にアクセスできれば **Step 5 完了**。次は **Step 6** で API・UI 実装と git push を行う。
