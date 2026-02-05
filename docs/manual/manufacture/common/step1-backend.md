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
- コマンドやファイルの編集は、カレントディレクトリを `backend/` にした状態で行うこと

### コードのつながり（Step 1 の流れ）

```
requirements.txt → 依存関係
schemas/user.py  → レスポンスの型（UserMe）。routers/auth.py で import
routers/auth.py  → GET /api/auth/me, POST /api/auth/logout の実装。main.py で include
main.py          → app に auth ルーターを張り、CORS を有効化。uvicorn で起動
                  ↓
フロント（Step 2）の fetchMe() / fetchLogout() がこの API を呼ぶ
```

---

## 1-2. 依存関係の準備

**手順**

1. `backend/requirements.txt` を作成する（存在しなければ）。

```txt
# なぜ必要: このプロジェクトで使う Python パッケージを固定し、どこでも同じバージョンで動くようにする
fastapi>=0.115.0      # 意味: Web API を書くためのフレームワーク。ルートやレスポンスを定義する
uvicorn[standard]>=0.32.0  # 意味: FastAPI を HTTP サーバーとして動かす。--reload でコード変更時に自動再起動できる
```

2. 仮想環境を作成し、インストールする。

```bash
# なんのため: 他プロジェクトとパッケージを分離し、backend だけの依存にしておく
cd backend
python3 -m venv .venv   # 意味: .venv フォルダにこのプロジェクト用の Python 環境を作る
source .venv/bin/activate   # 意味: このターミナルで .venv 内の Python を使うようにする（Windows: .venv\Scripts\activate）
pip install -r requirements.txt   # 意味: requirements.txt に書いたパッケージを .venv にインストールする
```

---

## 1-3. レスポンス用スキーマ

**手順**

1. `backend/schemas/` ディレクトリを作成する。
2. `backend/schemas/__init__.py` を空で作成する。
3. `backend/schemas/user.py` を作成する。

```python
# backend/schemas/user.py

# なぜ必要: API の戻り値の形を決めておくと、型チェックと JSON 変換を自動でやってくれる。フロントも同じ形を期待できる
from pydantic import BaseModel  # 意味: 型付きのモデルを定義し、dict との変換やバリデーションができる


class UserMe(BaseModel):
    """現在ログイン中のユーザー情報。GET /api/auth/me のレスポンス型。フロントの Header がこの形で受け取る"""
    id: str           # 意味: ユーザーを一意に識別するID。フロントでは「本人の投稿か」の判定などに使う
    username: str     # 意味: 画面上に表示する名前。ヘッダーアバターの横に出す
    avatar_url: str | None = None  # 意味: プロフィール画像のURL。未設定のときは null。省略可能なのでデフォルト None
```

---

## 1-4. 認証ルーター

**手順**

1. `backend/routers/` ディレクトリを作成する。
2. `backend/routers/__init__.py` を空で作成する。
3. `backend/routers/auth.py` を作成する。

```python
# backend/routers/auth.py

# なぜ必要: 認証まわりのエンドポイントを一ファイルにまとめ、main.py から include するだけでパスを張る
from fastapi import APIRouter
from schemas.user import UserMe  # なんのため: get_me の戻り値を UserMe 型にし、自動で JSON 化・検証する

# 意味: このルーターに登録するパスはすべて /api/auth のあとに続く。tags は OpenAPI のグループ名
router = APIRouter(prefix="/api/auth", tags=["auth"])

# なぜ必要: まだログイン機能がないので、とりあえず「常にこのユーザー」を返してフロントを動かすため
# 意味: 後で Cookie やセッションを見て本当のユーザーに差し替える
MOCK_USER = UserMe(
    id="user-1",
    username="jeli",
    avatar_url=None,
)


@router.get("/me", response_model=UserMe)
def get_me():
    """現在ユーザー取得。フロントの Header が fetchMe() で呼び、username を表示する"""
    # なんのため: ヘッダーに「誰でログインしているか」を表示するためのデータを返す
    # 意味: response_model=UserMe により、戻り値が UserMe の形でないと 422 になる。JSON も自動で作られる
    return MOCK_USER


@router.post("/logout")
def logout():
    """ログアウト。フロントのサイドメニュー「Logout」クリックで呼ばれる"""
    # なんのため: セッションを無効にしたいという意図をサーバーに伝える。本番ではここで Cookie 削除などをする
    # 意味: とりあえず 200 と ok: true を返し、フロントがエラーにならないようにする
    return {"ok": True}
```

---

## 1-5. FastAPI アプリのエントリポイント

**手順**

1. `backend/main.py` を次の内容で作成・上書きする。

```python
# backend/main.py

# なぜ必要: uvicorn が「どのアプリを動かすか」の入口。ここにルーターを張ると HTTP でエンドポイントが公開される
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # なんのため: 別オリジン（フロント）から fetch できるようにする
from routers import auth  # 意味: auth.py で定義した GET /me, POST /logout をアプリに追加する

app = FastAPI(title="jeligramy API")  # 意味: FastAPI のアプリ本体。ここにミドルウェアやルーターを足していく

# なぜ必要: ブラウザは「別オリジン（例: localhost:3000）から localhost:8000 へ」の fetch をデフォルトでブロックする
# この設定がないとフロントから API を呼べない
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 意味: このオリジンからのリクエストを許可する。本番では差し替え
    allow_credentials=True,   # 意味: Cookie の送受信を許可する（将来ログインでセッション Cookie を使うとき用）
    allow_methods=["*"],      # 意味: GET, POST などすべてのメソッドを許可
    allow_headers=["*"],      # 意味: すべてのリクエストヘッダーを許可
)

# なんのため: auth ルーターをアプリに組み込む。prefix が /api/auth なので、実際のパスは /api/auth/me と /api/auth/logout
app.include_router(auth.router)
```

2. ルーターで `prefix="/api/auth"` を付与しているため、パスは自動的に `/api/auth/me` と `/api/auth/logout` になる。

---

## 1-6. 起動と動作確認

**手順**

1. バックエンドを起動する。

```bash
# なんのため: バックエンドを HTTP サーバーとして起動し、フロントや curl からアクセスできるようにする
cd backend
source .venv/bin/activate   # 意味: このターミナルで backend 用の Python を使う
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# 意味: main.py の app を読み込み、port 8000 で待ち受ける。--reload はファイル変更で自動再起動。--host 0.0.0.0 は外から接続可
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
# なぜ必要: 単体テストを書いて実行するため。サーバーを立てずに API の戻り値を検証できる。
pytest>=8.0.0    # 意味: テストランナー。test_ で始まる関数を実行し、assert が失敗したらレポートする
httpx>=0.27.0    # 意味: TestClient が内部で使う HTTP クライアント。FastAPI が依存している
```

2. `pip install -r requirements.txt` で再インストールする。

3. `backend/tests/` ディレクトリを作成し、`backend/tests/__init__.py` を空で作成する。

4. `backend/tests/test_auth.py` を作成する。

```python
# backend/tests/test_auth.py
# なぜ必要: サーバーを起動しなくても「GET /api/auth/me と POST /api/auth/logout が仕様どおり返すか」を自動で確認するため。実装を変えたときに壊れていないかすぐ分かる。
# なんのため: フロントの fetchMe / fetchLogout が前提としているレスポンスの形（status 200、body のキー）が変わっていないことを保証する。

from fastapi.testclient import TestClient  # 意味: 実際に TCP で HTTP を飛ばさず、FastAPI アプリに直接リクエストを渡してレスポンスを返すクライアント。
from main import app  # 意味: 1-5 で定義した app。auth ルーターが include 済みなので /api/auth/me などが有効。

client = TestClient(app)  # 意味: この client で client.get(...) や client.post(...) を呼ぶと、app が処理してレスポンスが返る。


def test_get_me():
    # なぜ必要: get_me() が 200 と id/username/avatar_url を返すことを保証する。フロントの fetchMe はこの形を前提にしている。
    res = client.get("/api/auth/me")  # 意味: GET /api/auth/me を送ったつもりで app を実行する。
    assert res.status_code == 200     # 意味: HTTP ステータスが 200 であること。そうでなければテスト失敗。
    data = res.json()                 # 意味: レスポンス body を JSON として解釈した dict。
    assert "id" in data               # 意味: フロントが使うキーが含まれていること。
    assert "username" in data
    assert "avatar_url" in data
    assert data["username"] == "jeli" # 意味: モックユーザーと一致すること。別の値に変えるとテストが落ちて気づける。


def test_post_logout():
    # なぜ必要: logout() が 200 と ok: true を返すことを保証する。フロントの fetchLogout は 200 でれば成功とみなす。
    res = client.post("/api/auth/logout")
    assert res.status_code == 200
    data = res.json()
    assert data.get("ok") is True     # 意味: body に "ok": true が含まれること。
```

5. `backend/` で pytest を実行する。

```bash
# なんのため: テストを実行し、GET /me と POST /logout が仕様どおりか確認する
cd backend              # 意味: カレントを backend に。pytest が main を import するのでここにいる必要がある
source .venv/bin/activate
pytest tests/ -v        # 意味: tests/ 以下の test_*.py を実行。-v でテスト名を表示する
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
