import { Layout } from './Layout.js';

interface Props {
  title?: string;
  content?: string;
  error: string | undefined;
}

export function CreateKnowledgeFeature({ title = '', content = '', error }: Props) {
  return (
    <Layout title="ナレッジ作成">
      <div class="py-s">
        <h1 class="text-(length:--font-size-20) font-bold text-gray-900 mb-s">ナレッジ作成</h1>

        {/* /knowledges/new へ POST 送信 */}
        <form action="/knowledges/new" class="flex flex-col gap-s" method="post">
          {error && (
            <p class="text-red-500 text-(length:--font-size-14)" role="alert">
              {error}
            </p>
          )}
          <div class="flex flex-col gap-3xs">
            <label class="text-(length:--font-size-14) font-bold text-gray-700" for="title">
              タイトル
            </label>
            <input
              class="w-full p-xs border border-gray-300 rounded-(--border-radius-8) text-(length:--font-size-14)"
              id="title"
              name="title"
              placeholder="タイトルを入力..."
              required
              type="text"
              value={title}
            />
          </div>

          <div class="flex flex-col gap-3xs">
            <label class="text-(length:--font-size-14) font-bold text-gray-700" for="content">
              本文
            </label>
            <textarea
              class="w-full p-xs border border-gray-300 rounded-(--border-radius-8) text-(length:--font-size-14)"
              id="content"
              name="content"
              placeholder="Markdown 形式で本文を入力..."
              required
              rows={8}
            >
              {content}
            </textarea>
          </div>

          <div class="flex items-center justify-between">
            {/* キャンセル時に一覧へ戻るリンク */}
            <a class="text-(length:--font-size-14) text-gray-500 hover:underline" href="/">
              キャンセル
            </a>

            <button
              class="px-s py-2xs rounded-(--border-radius-8) bg-blue-500 text-(length:--font-size-14) font-bold text-white hover:opacity-80"
              type="submit"
            >
              作成
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
