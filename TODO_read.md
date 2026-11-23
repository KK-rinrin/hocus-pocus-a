ナレッジ詳細表示機能 実装 TODO
===============================================================================

目的
-------------------------------------------------------------------------------

主要機能要件の「ナレッジ詳細表示 (Read)」を実装する。

- 一覧から特定のナレッジへ遷移できる
- 誰でも詳細ページを閲覧できる
- `knowledgeId` に対応するナレッジだけを表示できる
- 存在しないナレッジへのアクセスを適切に処理できる

既存実装の参考箇所
-------------------------------------------------------------------------------

- `src/features/KnowledgeListFeature.tsx`
    - 一覧表示の Feature
    - 各ナレッジを `li` として表示している箇所を詳細ページへのリンクへ変更する
- `src/router.ts`
    - Hono の Router にルートを登録する場所
    - `ctx.html()` で JSX をレスポンスへ変換する流れを利用する
- `src/controllers/get-all-knowledges.controller.tsx`
    - Controller が Repository を呼び、Feature に値を渡す流れを参考にする
- `src/models/knowledge.model.ts`
    - 詳細表示対象となる `Knowledge` の型とフィールドを確認する
- `src/models/knowledge.repository.ts`
    - `getByKnowledgeId()` が未実装
    - `getAll()` は保存済み JSON ファイルから一覧を取得する
- `src/features/Layout.tsx`
    - 詳細ページにも共通レイアウトを利用する
- `CHALLENGE.md`
    - 詳細表示はログイン関係なく誰でも閲覧できる要件である

ナレッジの主要フィールド
-------------------------------------------------------------------------------

- `knowledgeId`: 詳細URLや検索に使う一意な ID
- `authorId`: 作成者の ID
- `content`: Markdown 形式の本文
- `createdAt`: 作成日時
- `updatedAt`: 更新日時

推奨する URL
-------------------------------------------------------------------------------

```text
/knowledges/:knowledgeId
```

例:

```text
/knowledges/305f56c6-260d-4b33-ae2e-c1f5bd4313ed
```

Step 1: 一覧から詳細ページへ遷移できるリンクを作る
-------------------------------------------------------------------------------

- [x] `src/features/KnowledgeListFeature.tsx` を確認する
- [x] 各ナレッジの表示をリンク可能な要素へ変更する
- [x] `href` を `/knowledges/{knowledge.knowledgeId}` の形にする
- [x] ナレッジ本文だけをリンクにせず、作成情報が分かる構成を検討する
- [x] 詳細ページへ戻る導線として「一覧へ戻る」リンクを設計する

この Step の完遂条件:

- 一覧画面のナレッジをクリックすると詳細URLへ遷移する
- URLに正しい `knowledgeId` が含まれる

実装イメージ:

```tsx
<a href={`/knowledges/${knowledge.knowledgeId}`}>
  {knowledge.knowledgeId}
</a>
```

Step 2: 詳細ページ用の Feature を作成する
-------------------------------------------------------------------------------

- [x] `src/features/KnowledgeDetailFeature.tsx` を作成する
- [x] Props に `Knowledge` を1件受け取る
- [x] `src/features/Layout.tsx` を利用する
- [x] Markdown 本文を表示する領域を作成する
- [x] 作成者、作成日時、更新日時を表示できる構成にする
- [x] 一覧へ戻るリンクを配置する
- [x] 375px の固定幅レイアウトと既存の Tailwind トークンを利用する

Props の例:

```tsx
interface Props {
  knowledge: Knowledge;
}
```

この Step の完遂条件:

- 詳細Featureが単一のナレッジを受け取れる
- Markdown本文をページ上に表示できる
- 一覧へ戻れる

Step 3: パスパラメータを受け取れるルートを追加する
-------------------------------------------------------------------------------

- [x] `src/router.ts` に詳細ページ用のルートを追加する
- [x] `/knowledges/:knowledgeId` の形で登録する
- [x] `ctx.req.param('knowledgeId')` で ID を取得する
- [x] ID を詳細表示 Controller に引数として渡す
- [x] `ctx.html()` で Controller の戻り値をレスポンスへする
- [x] Controller は Context を直接受け取らない設計を維持する

ルート例:

```tsx
router.get('/knowledges/:knowledgeId', async (ctx) => {
  const knowledgeId = ctx.req.param('knowledgeId');

  return ctx.html(await getKnowledgeController(knowledgeId));
});
```

この Step の完遂条件:

- 任意のナレッジIDを含むURLを受け取れる
- パスパラメータを文字列として Controller に渡せる

Step 4: Repository に getByKnowledgeId を実装する
-------------------------------------------------------------------------------

- [x] `src/models/knowledge.repository.ts` の `getByKnowledgeId()` を実装する
- [x] 引数の `knowledgeId` と一致するJSONファイルを探す
- [x] JSONファイルを読み込んで `Knowledge` として返す
- [x] 存在しない場合の失敗方針を決める
- [x] 不正なデータや読み込み失敗を呼び出し元へ伝える

Repositoryの責務は、HTTPや画面のことを知らず、ナレッジの検索だけを行うこと。

パスから検索する実装例:

```ts
async function getByKnowledgeId(knowledgeId: string): Promise<Knowledge | null> {
  // storage 配下のファイルから knowledgeId が一致するものを返す
  // 見つからなければ null を返す
}
```

注意:

- 戻り値型を `Knowledge | undefined` または `Knowledge | null` に統一する
- 現在の `Promise<Knowledge>` の TODO実装は本物の値を返す形へ置き換える
- 画面表示のためにファイルパスを組み立てるのは避けるか、URLではなくRepository内だけで完結させる

この Step の完遂条件:

- 正しいIDを渡すと対応するナレッジを取得できる
- 存在しないIDを渡すと、例外ではなく明確な値を返せる

Step 5: 詳細表示 Controller を作成する
-------------------------------------------------------------------------------

- [x] `src/controllers/get-knowledge.controller.tsx` を作成する
- [x] `knowledgeId` を引数で受け取る
- [x] `KnowledgeRepository.getByKnowledgeId(knowledgeId)` を呼び出す
- [x] 取得できた場合は `KnowledgeDetailFeature` を返す
- [x] 取得できない場合は詳細Featureではなくエラー結果を返せる設計にする
- [x] Controller は HTTPレスポンスやリダイレクトを組み立てない

処理の例:

```tsx
export async function getKnowledgeController(knowledgeId: string) {
  const knowledge = await KnowledgeRepository.getByKnowledgeId(knowledgeId);

  if (knowledge == null) {
    return null;
  }

  return <KnowledgeDetailFeature knowledge={knowledge} />;
}
```

この Step の完遂条件:

- Repositoryから取得したナレッジをFeatureへ渡せる
- 見つからない場合をRouterへ明確に伝えられる

Step 6: 404など存在しないナレッジを処理する
-------------------------------------------------------------------------------

- [x] 詳細ページが見つからない場合の画面またはレスポンスを決める
- [x] Routerで404ステータスを返す
- [x] シンプルなメッセージとして「ナレッジが見つかりません」を表示する
- [x] 一覧へ戻るリンクを表示する
- [x] 誰でも詳細ページへアクセスできるため、認証チェックを追加しない

Honoでは404の組み立て例:

```tsx
const knowledgeDetail = await getKnowledgeController(knowledgeId);

if (knowledgeDetail == null) {
  return ctx.notFound();
}

return ctx.html(knowledgeDetail);
```

この Step の完遂条件:

- 存在するナレッジは詳細を表示する
- 存在しないナレッジは404として処理する
- 一覧へ戻れる導線がある

Step 7: Markdown本文の表示方針を決める
-------------------------------------------------------------------------------

初期実装では、本文を安全に表示できる単純な方法を優先する。

- [ ] 初期段階では `<pre>` または改行を維持する要素で本文を表示する
- [ ] ユーザー入力をHTMLとして直接埋め込まない
- [ ] Markdown記号をテキストとして表示するか、レンダリングするか方針を決める
- [ ] 発展課題としてMarkdownレンダリングライブラリを検討する
- [ ] レンダリング導入時はHTMLインジェクション対策を確認する

推奨する初期表示:

```tsx
<pre class="whitespace-pre-wrap">{knowledge.content}</pre>
```

この Step の完遂条件:

- 改行を維持して本文を表示できる
- ユーザー入力がそのままスクリプトとして実行されない

Step 8: 単体テストまたはRepositoryテストを追加する
-------------------------------------------------------------------------------

- [x] 正しい `knowledgeId` でナレッジを取得できるテストを追加する
- [x] 存在しない `knowledgeId` に対して `null` または `undefined` を返すテストを追加する
- [ ] `KnowledgeDetailFeature`に渡すオブジェクトが正しいことを確認する (不要と判断: Router テストで本文・作成者の表示を確認)
- [ ] 日時フィールドや本文が詳細ページへ渡ることを確認する (不要と判断: 同上)
- [x] 必要に応じてテスト用の保存先を分離する

モデルを追加する場合は、既存ルールに従って対応する `*.model.test.ts`を作成する。

この Step の完遂条件:

- 正常なIDと不正なIDの両方をテストできる
- Repositoryが不正な状態を誤って返さない
- 詳細表示に必要な値が欠けていない

Step 9: 動作確認とビルドを実行する
-------------------------------------------------------------------------------

- [x] `npm test` を実行する
- [x] `npm run build` を実行する
- [x] `npm start -- "テストユーザー"` を実行する
- [x] 一覧画面を開く
- [x] ナレッジの詳細リンクをクリックする
- [x] URLに `knowledgeId` が含まれることを確認する
- [x] 本文とメタ情報が表示されることを確認する
- [x] 一覧へ戻るリンクが動作することを確認する
- [x] 存在しないIDへ直接アクセスして404になることを確認する
- [x] デバッグユーザーなしでも閲覧できる設計になっていることを確認する (投稿者以外のユーザーで閲覧できることを確認。認証自体は index.ts で全ルート共通)

受け入れ条件
-------------------------------------------------------------------------------

- [x] 一覧から特定ナレッジへ遷移できる
- [x] 詳細URLは `/knowledges/:knowledgeId` を使う
- [x] `knowledgeId` に一致するナレッジだけを表示する
- [x] Markdown本文の改行を維持できる
- [x] 作成者や日時など必要な情報を表示できる
- [x] 存在しないナレッジは404または適切なエラー画面を返す
- [x] 認証ユーザー以外でも詳細ページを閲覧できる設計になる
- [x] `npm test` と `npm run build` が成功する

推奨する実装順
-------------------------------------------------------------------------------

最初のスモールゴールは、一覧から正しいIDを含むURLへ遷移できること。
次にRepositoryからナレッジを取得できること、次に詳細Featureへ表示できること、最後に404とテストを整える順で進める。

各 Step の完遂後に実行するコマンド:

```sh
npm test
npm run build
```
