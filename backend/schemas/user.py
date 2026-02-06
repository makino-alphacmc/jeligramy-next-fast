from pydantic import BaseModel

class UserMe(BaseModel):
  # 現在ログイン中のユーザー情報。GET /api/auth/me のレスポンス型。フロントの Header がこの形で受け取る
    id: str
    username: str
    avatar_url: str | None = None