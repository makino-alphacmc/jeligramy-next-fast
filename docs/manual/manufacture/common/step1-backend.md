# Step 1: バックエンド — 共通 API 実装

## ゴール（完了条件）

- [ ] FastAPI アプリが起動し、`/api/auth/me` と `/api/auth/logout` が動作する
- [ ] GET /api/auth/me が 200 で `{ "id", "username", "avatar_url" }` を返す（モックでよい）
- [ ] POST /api/auth/logout が 200 を返す
- [ ] CORS で frontend のオリジン（例: http://localhost:3000）からアクセス可能
- [ ] 単体テストが通り、`GET /api/auth/me` と `POST /api/auth/logout` のレスポンスを検証している

---

## 1-1. 前提

- Python 3.11+ がインストールされていること
- プロジェクトルートの `backend/` で作業する

---

## 1-2. 依存関係の準備

**手順**

1. `backend/requirements.txt` を作成する（存在しなければ）。

```txt
fastapi>=0.115.0
uvicorn[standard]>=0.32.0
```

2. 仮想環境を作成し、インストールする。

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

---

## 1-3. レスポンス用スキーマ

**手順**

1. `backend/schemas/` ディレクトリを作成する。
2. `backend/schemas/__init__.py` を空で作成する。
3. `backend/schemas/user.py` を作成する。

```python
# backend/schemas/user.py
from pydantic import BaseModel


class UserMe(BaseModel):
    id: str
    username: str
    avatar_url: str | None = None
```

---

## 1-4. 認証ルーター

**手順**

1. `backend/routers/` ディレクトリを作成する。
2. `backend/routers/__init__.py` を空で作成する。
3. `backend/routers/auth.py` を作成する。

```python
# backend/routers/auth.py
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from schemas.user import UserMe

router = APIRouter(prefix="/api/auth", tags=["auth"])

# モック: 認証済みとして固定ユーザーを返す。後で Cookie/セッションに差し替え可能。
MOCK_USER = UserMe(
    id="user-1",
    username="jeli",
    avatar_url=None,
)


@router.get("/me", response_model=UserMe)
def get_me():
    """現在ユーザー取得。未認証時はモックでユーザーを返す。本番では認証ミドルウェアで 401 を返す。"""
    return MOCK_USER


@router.post("/logout")
def logout():
    """ログアウト（セッション無効化）。本番では Cookie 削除等を行う。"""
    return {"ok": True}
```

---

## 1-5. FastAPI アプリのエントリポイント

**手順**

1. `backend/main.py` を次の内容で作成・上書きする。

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth

app = FastAPI(title="jeligramy API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
```

2. ルーターで `prefix="/api/auth"` を付与しているため、パスは自動的に `/api/auth/me` と `/api/auth/logout` になる。

---

## 1-6. 起動と動作確認

**手順**

1. バックエンドを起動する。

```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. ブラウザまたは curl で確認する。

```bash
curl -s http://localhost:8000/api/auth/me
# 期待: {"id":"user-1","username":"jeli","avatar_url":null}

curl -s -X POST http://localhost:8000/api/auth/logout
# 期待: {"ok":true}
```

3. OpenAPI: http://localhost:8000/docs で `/api/auth/me` と `/api/auth/logout` が表示されることを確認する。

---

## 1-7. 単体テスト（バックエンド）

**手順**

1. 依存関係に pytest と httpx を追加する。`backend/requirements.txt` に以下を追記する。

```txt
pytest>=8.0.0
httpx>=0.27.0
```

2. `pip install -r requirements.txt` で再インストールする。

3. `backend/tests/` ディレクトリを作成し、`backend/tests/__init__.py` を空で作成する。

4. `backend/tests/test_auth.py` を作成する。

```python
# backend/tests/test_auth.py
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_get_me():
    """GET /api/auth/me が 200 で id, username, avatar_url を返す"""
    res = client.get("/api/auth/me")
    assert res.status_code == 200
    data = res.json()
    assert "id" in data
    assert "username" in data
    assert "avatar_url" in data
    assert data["username"] == "jeli"


def test_post_logout():
    """POST /api/auth/logout が 200 で ok: true を返す"""
    res = client.post("/api/auth/logout")
    assert res.status_code == 200
    data = res.json()
    assert data.get("ok") is True
```

5. `backend/` で pytest を実行する。

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

6. 2 件とも PASS することを確認する。

---

## 1-8. トラブルシュート

| 現象 | 確認すること |
|------|----------------|
| ModuleNotFoundError: schemas / routers | カレントディレクトリが `backend/` であること。`uvicorn main:app` を `backend/` で実行する。 |
| CORS エラー | `main.py` の `allow_origins` にフロントのオリジン（例: http://localhost:3000）が含まれていること。 |
| pytest で main を import できない | テスト実行時のカレントディレクトリを `backend/` にすること。`pytest tests/` を `backend/` で実行する。 |

以上（1-7 の単体テスト含む）が完了したら **Step 2（フロントエンド）** に進む。
