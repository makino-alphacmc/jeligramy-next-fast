# Step 1: ゴール確認と事前準備

## ゴール（完了条件）

- [ ] `docker compose up` で **frontend(3000)** / **backend(8000)** が起動する
- [ ] Front から API を呼べる（一覧取得 / 作成 / 削除）
- [ ] UI：投稿一覧が表示され、新規投稿でき、削除できる
- [ ] GitHub（またはGitリモート）に `git push` 済み

---

## 1-1. 必要ツールのインストール

| ツール | 用途 |
|--------|------|
| Git | バージョン管理 |
| Docker Desktop（or Docker Engine） | コンテナで front/back を起動 |
| Node.js | ローカルで Next を触る場合（Docker のみでも可） |
| エディタ | VSCode 推奨 |

---

## 1-2. バージョン目安

| 項目 | 目安 |
|------|------|
| Node.js | 20.x |
| Python | 3.11+ |
| FastAPI | 最新安定版（requirements で固定） |
| Next.js | 最新安定版（create-next-app） |

> 厳密に固定したい場合は README に記載する。

---

## 1-3. 確認コマンド

```bash
git --version
docker --version
node --version   # 20.x
python3 --version  # 3.11+
```

以上が揃っていれば **Step 2** へ進む。
