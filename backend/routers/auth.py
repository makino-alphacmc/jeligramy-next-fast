from fastapi import APIRouter
from schemas.user import UserMe

router = APIRouter(prefix="/api/auth", tags=["auth"])

MOCK_USER = UserMe(
  id="user-1",
  username="槇野ジェリエル",
  avatar_url=None,
)

@router.get("/me", response_model=UserMe)
def get_me():
    # 現在ユーザー取得。フロントの Header が fetchMe() で呼び、username を表示する
    return MOCK_USER

@router.post("/logout")
def logout():
    # ログアウト。フロントのサイドメニュー「Logout」クリックで呼ばれる
    return {"ok": True}