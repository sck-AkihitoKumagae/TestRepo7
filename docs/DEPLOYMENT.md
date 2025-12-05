# デプロイメントガイド - Deployment Guide

## 開発環境でのセットアップ

### 前提条件

- Node.js 18以上
- PostgreSQL 14以上
- npm または yarn

### 1. データベースのセットアップ

PostgreSQLをインストールして起動後、データベースを作成します：

```bash
createdb server_inventory
```

### 2. バックエンドのセットアップ

```bash
cd backend

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env
# .envファイルを編集してデータベース接続情報を設定
# DATABASE_URL="postgresql://user:password@localhost:5432/server_inventory?schema=public"
# JWT_SECRET="your-secret-key-change-in-production"

# Prismaクライアントを生成
npx prisma generate

# データベースマイグレーション
npx prisma migrate dev --name init

# サンプルデータを投入（オプション）
npx ts-node prisma/seed.ts

# 開発サーバーを起動
npm run start:dev
```

バックエンドAPIは http://localhost:3001 で起動します。

### 3. フロントエンドのセットアップ

```bash
cd frontend

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local
# 必要に応じてAPI URLを変更

# 開発サーバーを起動
npm run dev
```

フロントエンドは http://localhost:3000 で起動します。

## 本番環境へのデプロイ

### オプション1: Docker Composeを使用

最も簡単な方法は Docker Compose を使用することです：

```bash
# ルートディレクトリで実行
docker-compose up -d
```

これにより、PostgreSQL、バックエンド、フロントエンドのすべてが起動します。

### オプション2: 個別にデプロイ

#### データベース

PostgreSQL 14以上を本番サーバーにインストールし、以下を実行：

```bash
# データベース作成
createdb server_inventory

# スキーマ適用
psql server_inventory < database/schema.sql
```

#### バックエンド

```bash
cd backend

# 依存関係をインストール
npm ci --production

# 環境変数を設定
export DATABASE_URL="postgresql://user:password@prod-db:5432/server_inventory?schema=public"
export JWT_SECRET="your-production-secret-key"
export JWT_EXPIRES_IN="24h"
export PORT=3001

# Prismaクライアントを生成
npx prisma generate

# マイグレーション実行
npx prisma migrate deploy

# ビルド
npm run build

# 本番モードで起動
npm run start:prod
```

#### フロントエンド

```bash
cd frontend

# 依存関係をインストール
npm ci

# 環境変数を設定
export NEXT_PUBLIC_API_URL="https://api.yourdomain.com"

# ビルド
npm run build

# 本番サーバーを起動
npm start
```

### オプション3: Vercel + Heroku/Railway

#### フロントエンド (Vercel)

1. GitHub リポジトリを Vercel に接続
2. ルートディレクトリを `frontend` に設定
3. 環境変数を設定：
   - `NEXT_PUBLIC_API_URL`: バックエンドのURL

#### バックエンド (Heroku または Railway)

1. `backend` ディレクトリをデプロイ
2. PostgreSQL アドオンを追加
3. 環境変数を設定：
   - `DATABASE_URL`: 自動設定される
   - `JWT_SECRET`: ランダムな文字列
   - `JWT_EXPIRES_IN`: "24h"
   - `PORT`: 自動設定される

## 環境変数

### バックエンド (.env)

```
DATABASE_URL="postgresql://user:password@localhost:5432/server_inventory?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="24h"
PORT=3001
```

### フロントエンド (.env.local)

```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## データベースマイグレーション

新しいスキーマ変更を適用する場合：

```bash
cd backend

# 開発環境
npx prisma migrate dev --name description_of_change

# 本番環境
npx prisma migrate deploy
```

## バックアップとリストア

### バックアップ

```bash
# データベース全体
pg_dump server_inventory > backup_$(date +%Y%m%d).sql

# データのみ
pg_dump --data-only server_inventory > data_backup_$(date +%Y%m%d).sql
```

### リストア

```bash
psql server_inventory < backup_20251205.sql
```

## モニタリングとログ

### バックエンドログ

開発環境：
```bash
cd backend
npm run start:dev
# コンソールにログが表示されます
```

本番環境：
- PM2 を使用する場合: `pm2 logs`
- Docker を使用する場合: `docker logs server-inventory-backend`

### フロントエンドログ

- Next.js のビルドログ: `.next/` ディレクトリ
- ブラウザのコンソールログ

## トラブルシューティング

### データベース接続エラー

```
Error: Can't reach database server
```

- PostgreSQL が起動しているか確認
- DATABASE_URL が正しいか確認
- ファイアウォール設定を確認

### Prismaクライアントエラー

```
Error: @prisma/client did not initialize yet
```

解決方法：
```bash
npx prisma generate
```

### ポート競合

```
Error: listen EADDRINUSE: address already in use :::3001
```

解決方法：
```bash
# プロセスを確認
lsof -i :3001

# プロセスを停止
kill -9 <PID>
```

### フロントエンドのAPI接続エラー

```
Network Error / 401 Unauthorized
```

- バックエンドが起動しているか確認
- NEXT_PUBLIC_API_URL が正しいか確認
- JWT トークンが有効か確認（ログインし直す）

## パフォーマンス最適化

### データベース

1. インデックスの最適化
```sql
-- 既存のインデックスを確認
SELECT * FROM pg_indexes WHERE tablename IN ('servers', 'metrics', 'audit_logs');

-- 必要に応じて追加
CREATE INDEX idx_servers_environment ON servers(environment);
CREATE INDEX idx_servers_name ON servers(name);
```

2. マテリアライズドビューの更新
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY metrics_latest;
```

### バックエンド

- Redis を使用したキャッシング
- データベースコネクションプールの調整
- 不要なログの削減

### フロントエンド

- 画像の最適化
- コード分割
- CDN の使用

## セキュリティチェックリスト

- [ ] JWT_SECRET が本番環境で強力な値に設定されている
- [ ] データベースユーザーが最小権限で設定されている
- [ ] HTTPS が有効になっている
- [ ] CORS が適切に設定されている
- [ ] 環境変数が安全に管理されている（.env ファイルは Git にコミットしない）
- [ ] 定期的なバックアップが設定されている
- [ ] 監査ログが有効になっている
- [ ] レート制限が設定されている（オプション）

## スケーリング

### 水平スケーリング

- バックエンド: 複数のインスタンスを起動し、ロードバランサーで分散
- フロントエンド: CDN または複数のエッジサーバー
- データベース: リードレプリカの追加

### 垂直スケーリング

- データベースサーバーのスペック向上
- アプリケーションサーバーのスペック向上

## サポート

問題が発生した場合：

1. ログを確認
2. GitHub Issues で既知の問題を検索
3. 新しい Issue を作成して問題を報告
