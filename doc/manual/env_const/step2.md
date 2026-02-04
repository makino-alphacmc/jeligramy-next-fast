# Step 2: リポジトリ作成とフォルダ設計

## 2-1. ルートディレクトリ作成

```bash
mkdir jeligramy-next-fast
cd jeligramy-next-fast
git init
```

---

## 2-2. フォルダ構成（目標）

```
jeligramy-next-fast/
├── frontend/          # Next.js + Tailwind + shadcn/ui
├── backend/           # FastAPI
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 2-3. ディレクトリを用意する

```bash
mkdir frontend backend
touch docker-compose.yml .gitignore README.md
```

---

## 2-4. .gitignore の例

```gitignore
# Node
frontend/node_modules/
frontend/.next/

# Python
backend/__pycache__/
backend/.venv/
backend/venv/
*.pyc

# Env
.env
.env.local

# IDE
.idea/
.vscode/
*.swp
```

---

## 2-5. コミット

```bash
git add .
git commit -m "chore: initial folder structure"
```

次は **Step 3** でバックエンド（FastAPI）をセットアップする。
