# Step 3: バックエンド（FastAPI）セットアップ

## 3-1. backend ディレクトリに移動

```bash
cd backend
```

---

## 3-2. 仮想環境と依存関係（ローカル用）

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy pydantic
pip freeze > requirements.txt
```

---

## 3-3. 最小構成のファイル作成

### `backend/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Instagram Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "API is running"}

# 後で追加: 投稿一覧 GET /posts, 作成 POST /posts, 削除 DELETE /posts/{id}
```

---

## 3-4. ローカルで起動確認

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

ブラウザで `http://localhost:8000` を開き、`{"message":"API is running"}` が返れば OK。

---

## 3-5. backend 用 Dockerfile（後で compose から使う）

### `backend/Dockerfile`

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

ここまででバックエンドの土台ができる。**Step 4** でフロントエンドをセットアップする。
