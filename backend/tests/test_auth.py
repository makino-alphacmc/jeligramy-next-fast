from fastapi.testclient import TestClient
from main import app

client = TestClient(app)  # 実際のAPIと同じものを渡す


def test_get_me():  # test_で始まるのがお作法
    res = client.get("/api/auth/me")  # GET /api/auth/me を実行
    assert res.status_code == 200  # assertの意味：True→200 False→テスト失敗
    data = res.json()  # JSONの中身を取り出す
    assert "id" in data
    assert "username" in data
    assert "avatar_url" in data
    assert data["username"] == "槇野ジェリエル"


def test_get_me_exact_body():
    """/api/auth/me のレスポンスボディが完全一致しているか"""
    res = client.get("/api/auth/me")
    assert res.status_code == 200
    assert res.json() == {
        "id": "user-1",
        "username": "槇野ジェリエル",
        "avatar_url": None,
    }


def test_get_me_avatar_is_none():
    # avatar_url が None（null）で返ることを確認
    res = client.get("/api/auth/me")
    data = res.json()
    assert data["avatar_url"] is None


def test_post_logout():
    res = client.post("/api/auth/logout")
    assert res.status_code == 200
    data = res.json()
    assert data.get("ok") is True  # "ok" が無いときは None が返り、AssertionError で「期待したレスポンスじゃない」と分かる。


def test_logout_wrong_method_get_not_allowed():
    """POST専用エンドポイントにGETでアクセスすると405になることを確認"""
    res = client.get("/api/auth/logout")
    assert res.status_code == 405


def test_not_found_path():
    """存在しないURLは404になることを確認"""
    res = client.get("/api/auth/unknown")
    assert res.status_code == 404