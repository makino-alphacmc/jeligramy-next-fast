# 共通パーツ 製造マニュアル

本ディレクトリは、共通パーツの**詳細設計兼手順書**を格納する。  
単体テストは**機能ごと**（Step 1 実装直後にバックエンドの単体テスト、Step 2 実装直後にフロントの単体テスト）で実施する。

- **詳細設計**: 実装する機能の仕様・API・DB・コンポーネント・ファイル配置を記載する。
- **手順書**: 作業手順を Step 単位で記載し、実施順に進められるようにする。

---

## 対象実装

| 対象       | フォルダ             | 概要                                                                                                            |
| ---------- | -------------------- | --------------------------------------------------------------------------------------------------------------- |
| 共通パーツ | [common/](./common/) | ヘッダー・サイドメニュー・パンくず・フッター・メインコンテンツエリアと、共通で使う API（auth/me, logout）の実装 |

### 共通パーツの進め方

1. [common/00-design.md](./common/00-design.md) — 詳細設計の確認
2. [common/step1-backend.md](./common/step1-backend.md) — バックエンド API 実装
3. [common/step2-frontend.md](./common/step2-frontend.md) — フロントエンド 共通レイアウト実装
4. [common/step3-integration.md](./common/step3-integration.md) — 結合・動作確認

---

## 進め方

1. 対象フォルダの **00-design.md** で詳細設計を確認する。
2. **step1.md 以降** を順に実施する。
3. 各 Step の「完了条件」を満たしたら次へ進む。

---

## 参照

- 基本設計: `docs/high-level-design/common/basic-design/COMMON.md`
- API 一覧: `docs/high-level-design/common/api/COMMON.md`
- 低レベル設計（UI 仕様）: `docs/low-level-design/COMMON.md`
