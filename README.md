# 広島テニスDB MVP

広島県の一般・社会人テニス大会を横断検索するポータルサイトです。

## 現在できること

- トップページ
- 大会検索
- 市町村 / 種目 / 性別 / クラス / 参加資格での絞り込み
- 検索結果一覧
- 大会詳細
- 情報修正提案フォーム
- 管理者向け修正提案画面（UIモック）
- 31件の大会データを `data/tournaments.json` に同梱

## 起動

Node.js 20系を推奨。

```bash
npm install
npm run dev
```

## 現段階の位置づけ

この版は「画面＋検索体験」を先に固めるためのMVPです。
データはJSONを読み込むだけで、Supabaseにはまだ接続していません。

次の実装段階では以下を置き換えます。

1. `data/tournaments.json` → Supabase PostgreSQL
2. 修正提案フォーム → `change_proposals` テーブル
3. `/admin` → Supabase Auth付き管理画面
4. 公式URL → AIによる情報抽出・差分検知
5. 公開判定 → 管理者承認

## ディレクトリ

```text
app/
  page.tsx
  tournaments/page.tsx
  tournaments/[id]/page.tsx
  tournaments/[id]/suggest/page.tsx
  admin/page.tsx
components/
data/
doc/
lib/
types/
```
