# 広島テニスポータル

広島県の一般・社会人テニス大会を探せる大会情報ポータルです。

大会情報を市町村・日程・種目・レベル・参加資格・申込状況などで絞り込み、
大会詳細から公式情報へ移動できます。

このREADMEは、**2026年9月26日時点の実装状況**を基準に、初めてリポジトリを見る人でも全体像を理解できるように整理しています。

---

## 1. このサービスで何ができるか

主な利用目的は、

> **「広島で、自分が参加できるテニス大会を見つける」**

ことです。

現在の公開機能は次のとおりです。

- 大会を検索・絞り込み
- 大会一覧を20件ずつ表示
- 大会詳細を確認
- 公式情報へのリンクを開く
- 気になる大会をお気に入り保存
- 最近見た大会を確認
- 市町村別に大会を探す
- 主催者別に大会を探す
- 情報の誤りを修正提案する
- サイトの利用規約・プライバシーポリシー・運営者情報・問い合わせを確認する

管理者向けには、

- 大会データの検索・直接編集
- 修正提案の承認・却下
- 変更履歴の確認
- データ品質チェック
- 情報源の確認・管理

があります。

---

## 2. 現在のデータ状況

現在接続しているSupabaseでは、次のデータが入っています。

| データ | 件数 |
|---|---:|
| 大会 | 151 |
| 主催者 | 13 |
| 会場マスタ | 0 |
| 大会情報源 | 116 |
| 修正提案 | 2 |
| 修正提案履歴 | 1 |
| お問い合わせ | 0 |
| 管理者 | 1 |

※件数は2026年9月26日時点のSupabaseの状態です。

現在登録されている大会のうち、**アシニスクラブ主催大会は51件**です。

---

## 3. 技術構成

| 項目 | 採用技術 |
|---|---|
| フロントエンド / アプリ | Next.js 15 |
| UI | React 19 |
| 言語 | TypeScript |
| データベース | Supabase / PostgreSQL |
| 認証 | Supabase Auth |
| デプロイ | Vercel |
| ソース管理 | GitHub |
| Supabase連携 | `@supabase/ssr` / `@supabase/supabase-js` |

### 環境

- 開発環境：Windows + Node.js 20系を推奨
- 本番環境：Vercel
- 本番URL：<https://hiroshima-tennis-db-xzcj-delta.vercel.app/>

---

## 4. 公開ページ

| URL | 役割 |
|---|---|
| `/` | トップページ |
| `/tournaments` | 大会検索・一覧 |
| `/tournaments/[id]` | 大会詳細 |
| `/tournaments/[id]/suggest` | 情報修正提案 |
| `/tournaments/[id]/suggest/complete` | 修正提案完了 |
| `/favorites` | お気に入り |
| `/recent` | 最近見た大会 |
| `/areas` | 掲載エリア一覧 |
| `/organizers` | 掲載主催者一覧 |
| `/organizers/[id]` | 主催者詳細 |
| `/about` | このサイトについて |
| `/terms` | 利用規約 |
| `/privacy` | プライバシーポリシー |
| `/contact` | お問い合わせ |
| `/contact/complete` | お問い合わせ完了 |
| `/operator` | 運営者情報 |

---

## 5. 大会検索

### 基本条件

- キーワード
  - 大会名
  - 会場
  - 主催者
  - 市町村
  - 検索用文字列
  - 備考
- 日程
  - すべて
  - 今月
  - 3か月以内
  - 6か月以内
- エリア
- 種目
  - シングルス
  - ダブルス
  - MIXダブルス
  - 団体戦
  - 交流大会
  - ベテラン
- レベル
  - A / B / C / D
  - AB / CD
  - オープン
- 申込状況
  - まだ申込可能
  - 7日以内に締切
  - 30日以内に締切
  - 指定なし
  - 締切情報なし

### 詳細条件

- 性別
- 参加資格
  - 非会員でも参加OK
  - 他市協会員OK
  - ビジターOK
- ステータス
  - 募集中
  - 開催予定
  - 終了

### 初期検索条件

大会検索ページは、初期状態では

> **まだ申込可能な大会**

を対象とします。

「指定なし」を選んだ場合も、過去大会を無制限に表示するのではなく、
開催日が今日以降の大会を対象とします。

### 検索結果

- 1ページ20件
- ページ番号をURLで保持
- ページ移動時も検索条件を維持
- 現在の絞り込み条件を画面上に表示
- 0件の場合は条件を広げる導線を表示

---

## 6. 大会詳細

大会詳細では、主に次の情報を表示します。

- 大会名
- 開催日
- 会場
- 種目
- 性別
- クラス
- 参加資格
- 参加費
- 申込締切
- 申込方法
- ステータス
- 最終確認日
- 備考
- 公式情報
- 情報源
- 同じ主催者の今後の大会

また、

- お気に入り登録
- 情報修正提案

ができます。

スマートフォンでは下部に主要アクションを配置しています。

---

## 7. お気に入り・最近見た

### お気に入り

ログイン不要で利用できます。

お気に入りIDはブラウザCookieに保存し、
最大100件まで保持します。

お気に入り一覧では、締切が近い大会を優先して表示します。

### 最近見た大会

最近見た大会はブラウザのLocal Storageに保存します。

- 最大10件
- 同じ大会を再度見ると先頭へ移動
- 個別削除
- 全削除

ログイン不要です。

---

## 8. 情報修正提案

大会詳細から、誤りや古い情報を管理者へ報告できます。

基本的な入力項目は、

- 対象大会
- 対象項目
- 現在の値
- 修正後の値
- 修正理由
- 根拠URL

です。

流れは、

```text
大会詳細
  ↓
情報を修正する
  ↓
修正内容を入力
  ↓
Supabaseへ保存
  ↓
管理者が確認
  ↓
承認 / 却下
  ↓
承認時に大会情報を更新
  ↓
変更履歴を保存
```

現在の実装では、**AIによる自動判定は行っていません**。

---

## 9. 管理画面

管理画面は一般公開ページとは分離されています。

### ログイン

`/admin/login`

Supabase Authでログインし、
`admin_users` に登録されたユーザーだけが管理画面を利用できます。

### 管理機能

| URL | 機能 |
|---|---|
| `/admin` | 管理者ダッシュボード |
| `/admin/tournaments` | 大会一覧・検索・管理 |
| `/admin/tournaments/[id]/edit` | 大会情報の直接編集 |
| `/admin/corrections` | 修正提案の確認・承認・却下 |
| `/admin/corrections/history` | 修正提案の変更履歴 |
| `/admin/data-quality` | データ品質チェック |
| `/admin/sources` | 情報源の確認・管理 |

大会の直接編集は、管理者専用のSupabase RPC
`update_tournament_as_admin` を使用します。

修正提案の承認・却下には、

- `approve_correction_proposal`
- `reject_correction_proposal`

を使用します。

---

## 10. データ品質管理

管理画面のデータ品質画面では、次の項目を確認します。

- 開催日未設定
- 会場未設定
- 参加費未設定
- 申込締切未設定
- 締切日未設定
- 公式URL未設定
- 公式URL形式の問題
- 最終確認日未設定
- 最終確認から30日以上経過
- 申込締切経過
- 締切日が開催日より後
- データ品質メモあり

今後開催される大会については、
**最終確認から30日以上経過した情報を古い情報として扱います。**

---

## 11. 情報源

大会情報の一次情報を追跡できるよう、
`event_sources` テーブルで情報源を管理しています。

主な情報：

- 情報源種別
- URL
- 確認日時
- メモ
- 対象大会

公式サイトやPDFなど、
大会情報の根拠をあとから確認できる構造です。

---

## 12. データベース

現在の主要テーブルは次のとおりです。

| テーブル | 役割 |
|---|---|
| `tournaments` | 大会情報 |
| `organizers` | 主催者マスタ |
| `venues` | 会場マスタ |
| `event_sources` | 大会情報の出典 |
| `correction_proposals` | ユーザー修正提案 |
| `correction_proposal_histories` | 修正提案の履歴 |
| `admin_users` | 管理者 |
| `contact_messages` | お問い合わせ |
| `ingestion_jobs` | 将来の情報取り込み用に残している一時テーブル |

### tournamentsの主な項目

- `id`
- `name`
- `organizer_id`
- `organizer_name_raw`
- `venue_id`
- `venue_name_raw`
- `city`
- `date_text`
- `start_date`
- `end_date`
- `event_type`
- `gender`
- `level`
- `eligibility`
- `eligibility_category`
- `membership_required`
- `external_allowed`
- `other_city_allowed`
- `age_condition`
- `fee_text`
- `deadline_text`
- `deadline_date`
- `application_method`
- `official_url`
- `status`
- `notes`
- `search_tokens`
- `data_quality_note`
- `last_checked_at`
- `created_at`
- `updated_at`

---

## 13. 権限設計

Supabase RLSを有効にしています。

### 公開ユーザー

大会・主催者・会場・情報源は公開参照できます。

修正提案と問い合わせは匿名ユーザーでも送信できます。

### 管理者

`admin_users` に登録された認証ユーザーのみ、

- 修正提案の閲覧
- 変更履歴の閲覧
- 大会の管理・編集
- お問い合わせの閲覧
- 情報取り込み用ジョブの操作

ができます。

AI取り込み用の`ingestion_jobs`も管理者のみ操作できます。

---

## 14. SEO・PWA関連

以下を実装しています。

- サイト名・description
- OGP / Twitter metadata
- `robots.txt`
- `sitemap.xml`
- Web App Manifest
- Google Search Console確認用ファイル
- 大会・エリア・主催者・法務ページのサイトマップ登録

---

## 15. AI機能について

AI機能は**現在導入を一時停止しています**。

将来の候補として、

- 公式Web / PDFから大会情報を抽出
- 大会情報の正規化
- DBとの差分検出
- 重複大会の検出
- ユーザー修正提案のチェック
- 定期的な公式情報確認

を想定しています。

ただし、AIが勝手に公開情報を確定する設計にはせず、

> **AIは確認・候補作成まで。最終更新は管理者が判断する。**

という方針です。

`ingestion_jobs` テーブルは将来拡張用として現時点でもDBに残っていますが、
現在の公開処理では使用していません。

---

## 16. 現在のディレクトリ構成

主要部分だけを示します。

```text
hiroshima-tennis-db/
├─ app/
│  ├─ page.tsx
│  ├─ about/
│  ├─ admin/
│  │  ├─ login/
│  │  ├─ tournaments/
│  │  ├─ corrections/
│  │  ├─ data-quality/
│  │  ├─ sources/
│  │  └─ page.tsx
│  ├─ areas/
│  ├─ contact/
│  ├─ favorites/
│  ├─ operator/
│  ├─ organizers/
│  ├─ privacy/
│  ├─ recent/
│  ├─ terms/
│  ├─ tournaments/
│  │  └─ [id]/
│  ├─ api/
│  │  ├─ admin/
│  │  ├─ contact/
│  │  ├─ correction-proposals/
│  │  └─ proposals/
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ manifest.ts
│  ├─ robots.ts
│  └─ sitemap.ts
│
├─ components/
│  ├─ AdminLogoutButton.tsx
│  ├─ FavoriteButton.tsx
│  ├─ Header.tsx
│  ├─ RecentViewTracker.tsx
│  ├─ SearchForm.tsx
│  └─ TournamentCard.tsx
│
├─ lib/
│  ├─ site.ts
│  ├─ tournaments.ts
│  └─ supabase/
│     └─ server.ts
│
├─ types/
│  └─ tournament.ts
│
├─ data/
│  └─ tournaments.json
│
├─ doc/
│  └─ 仕様書.md
│
├─ supabase/
│  ├─ create_contact_messages.sql
│  └─ update_tournament_as_admin.sql
│
├─ supabase-schema.sql
├─ package.json
└─ README.md
```

`data/tournaments.json` などの旧構成ファイルはリポジトリに残っていますが、
現在の大会データの正本はSupabaseです。

---

## 17. ローカルでの起動

Node.js 20系を推奨します。

```bash
npm install
npm run dev
```

ブラウザで

```text
http://localhost:3000
```

を開きます。

### 本番ビルド

```bash
npm run build
```

### 本番起動

```bash
npm run start
```

---

## 18. 環境変数

Supabase接続には少なくとも次の環境変数が必要です。

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

これらは`lib/supabase/server.ts`から参照しています。

---

## 19. Git / デプロイ

基本的な開発フローは、

```text
ローカルで修正
  ↓
npm run build
  ↓
git add
  ↓
git commit
  ↓
git push origin main
  ↓
VercelでProduction Deployment
```

です。

VercelのProduction Branchは`main`です。

---

## 20. 現時点で優先する開発方針

今は「機能を増やす」より、

1. 実際に大会を探せること
2. データが正しいこと
3. スマートフォンで使いやすいこと
4. 公式情報へ迷わず到達できること
5. 管理者がデータを保守できること

を優先します。

AIによる自動収集・自動判定は、サイト運用が安定してから再開します。

---

## 21. 今後の候補

将来の拡張候補です。

- 大会情報の定期更新支援
- ユーザー向け大会通知
- 自分向け大会条件の保存
- お気に入り大会の締切通知
- テニスコート情報
- テニススクール情報
- ガット張り・ストリンガー情報
- 大会以外のテニス関連情報
- 広告や掲載料などの収益化
- AIによる情報収集支援

---

## 22. 現在の位置づけ

このプロジェクトは、

> **「広島のテニス大会を、探しやすく・比較しやすく・正しい情報にたどり着きやすくする」**

ことを目的としたポータルです。

現在は大会データベースを中心に、検索・詳細・お気に入り・最近見た・修正提案・管理機能までを一通り揃えている段階です。

詳細な仕様・DB・画面・権限・運用方針は、`doc/仕様書.md` を参照してください。
