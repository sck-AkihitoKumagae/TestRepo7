# サーバー台帳 - Server Inventory Management System

モダンでスケーラブルなサーバー資産管理Webアプリケーション

## 概要

このシステムは、企業のサーバー資産を一元管理するための Web アプリケーションです。メタデータ駆動型の設計により、新しいフィールドの追加や変更を柔軟に行うことができます。

### 主な機能

- **サーバー一覧表示**: 検索、フィルタリング、ソート機能付きのデータグリッド
- **詳細表示**: 右側ドロワーでサーバー詳細を表示
- **メタデータ駆動**: データ辞書による動的フィールド管理
- **メトリクス管理**: サーバーの使用状況をリアルタイム表示
- **監査ログ**: すべての変更を記録
- **認証・認可**: JWT ベースの認証

## 技術スタック

### フロントエンド
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: SWR
- **Table**: TanStack Table
- **Icons**: Lucide React

### バックエンド
- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: Prisma
- **Authentication**: Passport JWT
- **API**: RESTful API

### データベース
- **Database**: PostgreSQL 14+
- **Features**: JSONB, INET types, Materialized Views

## プロジェクト構造

```
TestRepo7/
├── frontend/           # Next.js frontend application
│   ├── app/           # Next.js app directory
│   │   ├── servers/   # Server list page
│   │   └── page.tsx   # Root page (redirects to servers)
│   ├── components/    # React components
│   ├── lib/           # API client and types
│   └── public/        # Static files
│
├── backend/           # NestJS backend application
│   ├── src/
│   │   ├── auth/      # Authentication module
│   │   ├── servers/   # Servers CRUD module
│   │   ├── server-fields/  # Metadata management
│   │   ├── metrics/   # Metrics ingestion and query
│   │   ├── audit/     # Audit logging
│   │   └── prisma/    # Prisma service
│   └── prisma/
│       ├── schema.prisma  # Database schema
│       └── seed.ts        # Sample data
│
├── database/          # Database scripts
│   └── schema.sql     # SQL schema and sample data
│
└── docs/             # Documentation
    └── README.md     # This file
```

## セットアップ

### 前提条件

- Node.js 18 以上
- PostgreSQL 14 以上
- npm または yarn

### データベースのセットアップ

1. PostgreSQL をインストールして起動

2. データベースを作成:
```bash
createdb server_inventory
```

3. スキーマを適用（オプション - Prisma を使う場合は不要）:
```bash
psql server_inventory < database/schema.sql
```

### バックエンドのセットアップ

1. バックエンドディレクトリに移動:
```bash
cd backend
```

2. 依存関係をインストール:
```bash
npm install
```

3. 環境変数を設定:
```bash
cp .env.example .env
# .env ファイルを編集してデータベース接続情報を設定
```

4. Prisma クライアントを生成:
```bash
npm run prisma:generate
```

5. データベースマイグレーション:
```bash
npm run prisma:migrate
```

6. サンプルデータを投入（オプション）:
```bash
npx ts-node prisma/seed.ts
```

7. 開発サーバーを起動:
```bash
npm run start:dev
```

バックエンド API は http://localhost:3001 で起動します。

### フロントエンドのセットアップ

1. フロントエンドディレクトリに移動:
```bash
cd frontend
```

2. 依存関係をインストール:
```bash
npm install
```

3. 環境変数を設定:
```bash
cp .env.example .env.local
# 必要に応じて API URL を変更
```

4. 開発サーバーを起動:
```bash
npm run dev
```

フロントエンドは http://localhost:3000 で起動します。

## 使用方法

### 1. ログイン

デモ用として、任意のユーザー名とパスワードでログインできます。
本番環境では適切な認証を実装してください。

### 2. サーバー一覧の表示

- 左側のフィルタパネルで環境（本番/検証/開発）を絞り込み
- 検索バーでサーバー名、IP、タグを検索
- テーブルの行をクリックして詳細を表示

### 3. サーバーの登録

「新規サーバー登録」ボタンから新しいサーバーを追加できます。

### 4. フィールドの追加

管理者は新しいフィールド定義を追加して、すべてのサーバーに動的に適用できます。

## API エンドポイント

### 認証
- `POST /api/auth/login` - ログイン

### サーバー
- `GET /api/servers` - サーバー一覧取得
- `GET /api/servers/:id` - サーバー詳細取得
- `POST /api/servers` - サーバー作成
- `PATCH /api/servers/:id` - サーバー更新
- `DELETE /api/servers/:id` - サーバー削除

### サーバーフィールド（メタデータ）
- `GET /api/server-fields` - フィールド定義一覧
- `POST /api/server-fields` - フィールド定義作成
- `PATCH /api/server-fields/:id` - フィールド定義更新
- `DELETE /api/server-fields/:id` - フィールド定義削除

### メトリクス
- `GET /api/servers/:id/metrics/latest` - 最新メトリクス取得
- `GET /api/servers/:id/metrics/:metric` - メトリクス履歴取得
- `POST /api/metrics/ingest` - メトリクス一括投入

### 監査ログ
- `GET /api/audit` - 監査ログ一覧取得

## データモデル

### サーバー（servers）
- 基本情報: 名前、IPアドレス、環境、OS、ロール、ロケーション
- 拡張属性: JSONB 形式で任意のフィールドを保存
- タグ: サーバーに複数のタグを関連付け

### サーバーフィールド（server_fields）
- データ辞書として機能
- 型、ラベル、グループ、表示順序などを定義
- 動的なフォームと列の生成に使用

### メトリクス（metrics）
- 時系列データ
- メモリ使用率、ディスク空き容量などの運用メトリクス
- マテリアライズドビューで最新値を高速取得

### 監査ログ（audit_logs）
- すべての作成、更新、削除操作を記録
- 誰が、いつ、何を変更したかを追跡

## カスタマイズ

### 新しいフィールドの追加

1. サーバーフィールド API を使用して新しいフィールド定義を作成:
```bash
POST /api/server-fields
{
  "key": "warranty_date",
  "label": "保証期限",
  "type": "date",
  "group": "資産",
  "orderIndex": 60,
  "required": false
}
```

2. サーバーの attributes フィールドに新しいデータを追加:
```bash
PATCH /api/servers/:id
{
  "attributes": {
    "warranty_date": "2025-12-31"
  }
}
```

### メトリクスの取り込み

外部監視システムからメトリクスを定期的に投入:
```bash
POST /api/metrics/ingest
{
  "items": [
    {
      "server_name": "srv-app-001",
      "metric": "memory_used_percent",
      "ts": "2025-12-05T09:00:00Z",
      "value": 63.4
    }
  ]
}
```

## セキュリティ

- JWT トークンによる認証
- ロールベースのアクセス制御（実装予定）
- すべての変更を監査ログに記録
- 環境変数で機密情報を管理

## パフォーマンス

- サーバーサイドページネーション
- マテリアライズドビューによる高速なメトリクス取得
- インデックスの最適化
- SWR によるクライアントサイドキャッシング

## 今後の拡張

- [ ] サーバー登録フォーム
- [ ] フィールド管理画面
- [ ] CSVインポート/エクスポート
- [ ] ダッシュボード（KPI カード）
- [ ] メトリクスのグラフ表示
- [ ] 通知機能
- [ ] より詳細な権限管理
- [ ] 変更履歴の差分表示

## ライセンス

MIT

## サポート

問題や質問がある場合は、GitHub Issues を使用してください。
