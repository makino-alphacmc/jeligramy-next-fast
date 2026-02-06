from fastapi.testclient import TestClient
from main import app

client = TestClient(app) # 実際のAPIと同じものを渡す

def test_get_me():  # test_で始まるのがお作法
    res = client.get("/api/auth/me") #GET /api/auth/me を実行
    assert res.status_code == 200 #assertの意味：True→200 False→テスト失敗
    data = res.json() # JSONの中身を取り出す
    assert "id" in data
    assert "username" in data
    assert "avatar_url" in data
    assert data["username"] == "槇野ジェリエル"

def test_post_logout():
    res = client.post("/api/auth/logout")
    assert res.status_code == 200
    data = res.json()
    assert data.get("ok") is True # "ok" が無いときは None が返り、AssertionError で「期待したレスポンスじゃない」と分かる。