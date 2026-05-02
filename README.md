# Video Knowledge Hub

社内向けの動画ナレッジ管理（タイムライン・一覧検索・タグ・コメント・Good/Bad）。Next.js（App Router）+ Prisma（PostgreSQL）+ NextAuth（Credentials）。

## 必要環境

- Node.js 20 以上推奨
- PostgreSQL 16 相当（Docker 利用可）

## セットアップ

### 1. 依存関係

```bash
npm install
```

### 2. 環境変数

ルートに `.env` を作成し、`.env.example` を参考に設定します。

| 変数 | 説明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 接続文字列（Prisma が使用） |
| `NEXTAUTH_URL` | アプリの公開 URL（開発時は下記ポートと **完全一致**。既定は `http://localhost:3001`） |
| `NEXTAUTH_SECRET` | セッション署名用シークレット（本番は必ず強い値に変更） |

### 3. データベース起動（Docker の例）

```bash
docker compose up -d
```

既定ではホストの **5433** が DB ポートにマッピングされています（`docker-compose.yml`）。

### 4. Prisma：マイグレーションとクライアント生成

```bash
npx prisma migrate dev
npm run prisma:generate
```

初回のみマイグレーションでスキーマを DB に反映します。

### 5. シード（初期データ）

```bash
npm run db:seed
```

作成される主なデータは「シード内容」の節を参照。

### 6. 開発サーバー

```bash
npm run dev
```

**ポートは 3001 に固定**しています（他アプリが 3000 を使っていてもずれません）。ブラウザでは **`http://localhost:3001`** を開き、`.env` の `NEXTAUTH_URL` も同じにしてください。

- どうしても **3000** で動かす場合: `npm run dev:3000` を使い、`NEXTAUTH_URL` を `http://localhost:3000` に合わせる。

#### 開発サーバーが二重起動するとき

同じプロジェクトで `next dev` を2つ立てると、新しい方が終了することがあります。**ターミナルは1つだけ** `npm run dev` を実行するか、古いプロセスを `Ctrl+C` で止めてから再度起動してください。

#### `EADDRINUSE` で 3001 が使えないとき

前回の `node` が残っていることがあります。ターミナルで次を実行し、表示された PID を `kill <PID>` で止めてから `npm run dev` し直してください。

```bash
lsof -nP -iTCP:3001 -sTCP:LISTEN
```

## DB 初期化手順（まとめ）

新しい環境でゼロから用意する場合：

1. PostgreSQL を起動し、`DATABASE_URL` を通じて DB が存在することを確認する。
2. `npx prisma migrate deploy`（本番）または `npx prisma migrate dev`（開発）でスキーマを適用する。
3. `npm run prisma:generate` でクライアントを生成する。
4. `npm run db:seed` でマスタ・管理者ユーザーを投入する。

## シード内容

- **ユーザー**
  - `admin@example.com` / `password` — ロール `ADMIN`
  - `creator@example.com` / `password` — ロール `USER`
- **タグカテゴリと項目**（各カテゴリに複数項目）
  - 業種（小売、飲食、美容・ヘルス、不動産、人材）
  - 用途（認知、訴求、CV、採用、ブランディング）
  - 雰囲気（ポップ、高級感、カジュアル、シネマティック、ミニマル）
  - 演出（テロップ多め、ナレーション、実写メイン、モーション多め）
  - 媒体（YouTube、TikTok、Instagram、X、その他）
  - 縦横（横動画、縦動画、スクエア）
  - 尺（15秒以内、30秒前後、60秒前後、3分以上）

## スクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー（**ポート 3001**） |
| `npm run dev:3000` | 開発サーバー（ポート 3000。`NEXTAUTH_URL` も合わせる） |
| `npm run build` / `npm start` | 本番ビルド・起動 |
| `npm run lint` | ESLint |
| `npm run prisma:generate` | Prisma Client 生成 |
| `npm run prisma:migrate` | 開発用マイグレーション |
| `npm run prisma:studio` | Prisma Studio |
| `npm run db:seed` | シード実行 |

## 動作確認手順（開発）

1. `docker compose up -d` → `npx prisma migrate dev` → `npm run db:seed`
2. `.env` の `DATABASE_URL` / `NEXTAUTH_URL`（例: `http://localhost:3001`）/ `NEXTAUTH_SECRET` を設定
3. `npm run dev` で起動 → **http://localhost:3001** を開く
4. `admin@example.com` / `password` でログイン
5. 「動画登録」で URL を登録 → タイムライン・一覧・詳細・コメント・Good/Bad を確認
6. 管理ユーザーで `/admin/tags`・`/admin/users` にアクセスできることを確認

## 本番デプロイ手順（概要）

1. **PostgreSQL** をマネージド DB または自前で用意し、接続文字列を `DATABASE_URL` に設定する。
2. **環境変数**をホスティング先に登録する（`NEXTAUTH_URL` は本番ドメインの `https://...`、`NEXTAUTH_SECRET` は新規生成した強い値）。
3. ビルド・起動例：

   ```bash
   npm ci
   npm run prisma:generate
   npx prisma migrate deploy
   npm run build
   npm start
   ```

4. 初回のみ `npm run db:seed` を実行するか、管理者を別経路で作成する（運用ポリシーに合わせる）。
5. **Vercel 等**では Postgres を外部サービスに置き、ビルド時に `prisma generate`、デプロイ後に `migrate deploy` を実行するワークフローを推奨する。

## 技術スタック（参考）

Next.js 16、React 19、TypeScript、Tailwind CSS 4、Prisma 7、NextAuth.js、Zod、bcryptjs。
