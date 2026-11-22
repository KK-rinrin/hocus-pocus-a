ナレッジ作成機能 実装 TODO
===============================================================================

目的
-------------------------------------------------------------------------------

主要機能要件の「ナレッジ作成 (Create)」を実装する。

- Markdown 形式の本文を入力できる
- ログイン中のユーザーを作成者として保存できる
- 作成後にナレッジ一覧へ遷移できる
- 保存されたナレッジはファイルシステムから取得できる

既存実装の参考箇所
-------------------------------------------------------------------------------

- `src/features/KnowledgeListFeature.tsx`
    - 「新規作成」リンクはすでに `/knowledges/new` を指している
- `src/router.ts`
    - Hono の Router にルートを登録する場所
    - `ctx.get('userId')` と `ctx.get('userName')` を使って認証情報を取得できる
- `src/controllers/get-all-knowledges.controller.tsx`
    - Controller が Repository を呼び、Feature に値を渡す流れの参考になる
- `src/models/knowledge.model.ts`
    - `Knowledge.create(content, authorId)` がすでに実装済み
- `src/models/knowledge.repository.ts`
    - `getAll()` のみ実装済み
    - `upsert()` と実装するメソッドが TODO のまま残っている
- `src/features/Layout.tsx`
    - 共通の HTML レイアウトとして利用できる
- `src/models/knowledge.model.test.ts`
    - Model の単体テストの書き方の参考になる

Step 1: 作成画面の URL と Feature を追加する
-------------------------------------------------------------------------------

- [ ] `src/features/CreateKnowledgeFeature.tsx` を作成する
- [ ] `src/features/Layout.tsx` を利用して作成画面を構成する
- [ ] ページタイトルを「ナレッジ作成」などに設定する
- [ ] Markdown 本文の入力欄として `<textarea name="content">` を配置する
- [ ] `<form>` を `/knowledges/new` へ `POST` で送信するようにする
- [ ] キャンセル時に一覧へ戻れるリンクを作成する
- [ ] モバイルファーストの固定幅レイアウトと既存の Tailwind トークンを利用する

この Step の完遂条件:

- `/knowledges/new` にアクセスすると作成画面が表示される
- 作成画面から一覧へ戻れる
- フォームに本文を入力できる

Step 2: GET と POST のルートを Router に追加する
-------------------------------------------------------------------------------

- [ ] `src/router.ts` に `router.get('/knowledges/new', ...)` を追加する
- [ ] 作成画面用の Controller を呼び出す
- [ ] `router.post('/knowledges/new', ...)` を追加する
- [ ] `ctx.req.parseBody()` または同等の API で `content` を取得する
- [ ] `ctx.get('userId')` で作成者 ID を取得する
- [ ] 保存処理を Controller に委譲する
- [ ] 保存成功後は `ctx.redirect('/')` を返す
- [ ] `ctx` を直接 Controller に渡さず、必要な値だけを引数で渡す

この Step の完遂条件:

- 作成画面の GET リクエストを処理できる
- フォーム送信の POST リクエストを受け取れる
- POST リクエストの本文と作成者 ID を Controller に渡せる

Step 3: 作成画面用の Controller を追加する
-------------------------------------------------------------------------------

- [ ] `src/controllers/create-knowledge.controller.tsx` を作成する
- [ ] GET 用に `CreateKnowledgeFeature` を返す関数を作成する
- [ ] POST 用に `content` と `authorId` を受け取る関数を作成する
- [ ] `Knowledge.create(content, authorId)` を呼び出してドメインモデルを作成する
- [ ] `KnowledgeRepository.upsert(knowledge)` を呼び出して保存する
- [ ] 作成処理と画面組み立ての責務を分離する

この Step の完遂条件:

- GET 用と POST 用の処理を呼び分けられる
- Controller が Model と Repository を適切に利用できる
- Router は HTTP の組み立てに集中できる

Step 4: 空本文などの入力チェックを実装する
-------------------------------------------------------------------------------

- [ ] 空文字または空白だけの本文を拒否する
- [ ] バリデーションエラー時に作成画面へ戻す
- [ ] 入力した本文とエラーメッセージを画面へ返せるようにする
- [ ] 正常な文字列は空白をそのまま保存するか、削除するかの方針を決める

推奨する設計:

- ドメインルールとして `Knowledge.create()` 内で空本文を拒否する
- HTTP エラーの組み立ては Controller または Router に置く

空本文を拒否する例:

```ts
if (content.trim() === '') {
  throw new Error('本文を入力してください');
}
```

この Step の完遂条件:

- 空本文ではナレッジを保存できない
- エラー時にユーザーへ理由を表示できる

Step 5: Repository の upsert を実装する
-------------------------------------------------------------------------------

- [ ] `src/models/knowledge.repository.ts` の `upsert()` を実装する
- [ ] `node:fs/promises` のファイル書き込み API を利用する
- [ ] 保存先を `./storage/**/*.json` と一致させる
- [ ] ファイル名に `knowledge.knowledgeId` を使用する
- [ ] ディレクトリが存在しない場合は作成する
- [ ] `Knowledge` を JSON 文字列へ変換して保存する
- [ ] 書き込み失敗を呼び出し元へ伝える

既存の `getAll()` は次の実装を利用している:

```ts
const files = await Array.fromAsync(glob('./storage/**/*.json'));
const knowledges = await Promise.all(files.map((file) => readFile(file, 'utf-8').then(JSON.parse)));
```

保存先とファイル名の例:

```text
storage/<knowledgeId>.json
```

この Step の完遂条件:

- `KnowledgeRepository.upsert(knowledge)` が正常に完了する
- 保存後に `KnowledgeRepository.getAll()` で作成したナレッジを取得できる
- ページを再起動しても保存したナレッジが残る

Step 6: 作成成功後の遷移を実装する
-------------------------------------------------------------------------------

- [ ] 保存成功時に一覧画面へリダイレクトする
- [ ] 一覧画面で作成したナレッジが取得対象になることを確認する
- [ ] 保存失敗時に例外が握りつぶされないことを確認する
- [ ] 必要に応じてエラー画面または再入力画面を表示する

この Step の完遂条件:

- フォーム送信後に `/`へ遷移する
- 一覧画面が保存済みナレッジを表示できる
- 保存失敗時にブラウザへ適切な結果を返せる

Step 7: 単体テストを追加する
-------------------------------------------------------------------------------

- [ ] `src/models/knowledge.model.test.ts` に空本文のテストを追加する
- [ ] `Knowledge.create()` の作成日時と更新日時が一致することをテストする
- [ ] `Knowledge.create()` の `knowledgeId` と `authorId` をテストする
- [ ] 必要に応じて新しい `knowledge.repository.test.ts` を作成する
- [ ] 保存後に `getAll()` で取得できることをテストする

ファイルとテストの対応を保つため、モデルを追加する場合は対応する `.model.test.ts` も追加する。

この Step の完遂条件:

- 作成機能に関係するテストが失敗しない
- 空本文を拒否できる
- 保存・取得の往復が確認できる

Step 8: 動作確認とビルドを実行する
-------------------------------------------------------------------------------

- [ ] `npm test` を実行する
- [ ] `npm run build` を実行する
- [ ] `npm start -- "テストユーザー"` を実行する
- [ ] `http://localhost:8080/` を開く
- [ ] 「新規作成」から `/knowledges/new`へ遷移する
- [ ] Markdown を含む本文を入力して送信する
- [ ]一覧へ戻り、保存されたナレッジを確認する
- [ ] 空本文で送信し、拒否されることを確認する
- [ ] サーバー再起動後も保存されたナレッジが残ることを確認する

受け入れ条件
-------------------------------------------------------------------------------

次の項目をすべて満たしたら完了とする。

- [ ] 一覧画面の「新規作成」から作成画面へ遷移できる
- [ ] Markdown テキストを本文として入力できる
- [ ] 作成者 ID がログインユーザーまたはデバッグユーザーになる
- [ ] ナレッジが一意な ID を持つ
- [ ] ナレッジが標準ファイルシステムへ保存される
- [ ] 作成成功後に一覧へ遷移する
- [ ] 空本文は保存されない
- [ ] `npm test` と `npm run build` が成功する

推奨する実装順
-------------------------------------------------------------------------------

最初のスモールゴールは「画面が表示される」こと。
次に「POST を受け取れる」こと、次に「ファイルへ保存できる」こと、最後に「テストとエラー処理を整える」ことの順で進める。

各 Step の完遂後に実行するコマンド:

```sh
npm test
npm run build
```
