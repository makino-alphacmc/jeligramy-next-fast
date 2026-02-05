# トップ画面 API 一覧

`api-data/TOP.md` から抜き出した、トップ画面で想定する API。

| API名 | メソッド | パス | 用途 |
|-------|----------|------|------|
| 現在ユーザー取得 | GET | `/api/auth/me` | 3点メニュー本人判定 |
| 投稿一覧 | GET | `/api/posts` | トップのカード一覧（`?page=&limit=`） |
| 投稿 1 件取得 | GET | `/api/posts/:id` | 編集用など |
| 投稿更新 | PATCH | `/api/posts/:id` | 3点メニューから編集 |
| 投稿削除 | DELETE | `/api/posts/:id` | 3点メニューから削除 |
| いいね | POST | `/api/posts/:id/likes` | いいね ON |
| いいね解除 | DELETE | `/api/posts/:id/likes` | いいね OFF |

**計 7 本**（認証 1、投稿 4、いいね 2）
