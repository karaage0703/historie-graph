# Issue処理コマンド

GitHub issueを読み取り、`public/data.json`を更新します。

## 引数
- `$ARGUMENTS`: issue番号（例: `123`）または issue URL
- 引数なしの場合: `media-request` または `event-request` ラベルが付いたオープンなissueを全て処理

## 処理手順

1. **issueの取得**:
   - 引数ありの場合: `gh issue view $ARGUMENTS --json number,title,body,labels` でissue情報を取得
   - 引数なしの場合: `gh issue list --label "media-request" --label "event-request" --state open --json number,title,body,labels` で対象issueを全て取得し、1件ずつ処理

2. **ラベルの確認**:
   - `media-request`: 作品追加リクエストとして処理
   - `event-request`: 歴史イベント追加リクエストとして処理

3. **データ抽出**: issue本文から構造化データを抽出
   - GitHub issue formのフィールドは `### フィールド名` の形式で記載されている

4. **data.jsonの更新**:
   - `.github/ISSUE_PROCESSING.md` のガイドラインに従ってデータを変換
   - `public/data.json` を読み込み、適切な位置にデータを追加
   - 歴史イベントは `year` フィールドで年代順にソート

5. **変更のコミット**:
   - ブランチ作成: `git checkout -b issue-$ARGUMENTS`
   - 変更をコミット: `[Auto] Close #$ARGUMENTS - <作品名 or イベント名>`
   - PRを作成し、元issueをクローズするようにリンク

## データ形式

### data.json の構造
```json
{
  "events": [...],
  "media": [...]
}
```

### 作品追加 (media-request)
`media` 配列に追加:
```json
{
  "id": "kebab-case形式のユニークID（作品名から生成）",
  "title": "作品名",
  "type": "manga または novel",
  "remark": "備考",
  "coverageStartYear": 数値（任意）,
  "coverageEndYear": 数値（任意）,
  "kindleUrl": "URL（任意）",
  "relatedEventIds": ["関連イベントのID"]
}
```

#### IDの生成ルール
- 作品名をローマ字/英語のkebab-case形式に変換
- 例: "キングダム" → "kingdom", "三国志" → "sangokushi"

### イベント追加 (event-request)
`events` 配列に追加:
```json
{
  "id": "UUID形式で生成",
  "year": 数値,
  "yearDisplay": "表示用年代",
  "era": "時代名",
  "region": "china|japan|europe|middle_east|other",
  "title": "イベント名",
  "description": "説明",
  "links": ["参考URL"]
}
```

## 注意事項
- MediaTypeは `manga` または `novel` のみ有効
- 年代は西暦で、紀元前は負の数
- 既存データとの重複がないか確認
- イベント追加時は年代順ソートを維持
- 作品は `media` 配列に独立して追加（イベントに埋め込まない）
- 作品とイベントの関連付けは `relatedEventIds` で管理
