import type { Knowledge } from '../models/knowledge.model.js';
import { Layout } from './Layout.js';

interface Props {
  knowledge: Knowledge;
  content?: string | undefined;
  error?: string | undefined;
}

export function KnowledgeEditFeature({ knowledge, content, error }: Props) {
  const currentContent = content ?? knowledge.content;
  const pageTitle = knowledge.title ? `「${knowledge.title}」の編集` : 'ナレッジ編集';

  return (
    <Layout title={pageTitle}>
      <div class="py-s">
        <h1 class="text-(length:--font-size-20) font-bold text-gray-900 mb-s">{pageTitle}</h1>

        {/* /knowledges/:knowledgeId/edit へ POST 送信 */}
        <form action={`/knowledges/${knowledge.knowledgeId}/edit`} class="flex flex-col gap-s" method="post">
          {error && (
            <p class="text-red-500 text-(length:--font-size-14)" role="alert">
              {error}
            </p>
          )}

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
              {currentContent}
            </textarea>
          </div>

          <div class="flex items-center justify-between">
            {/* キャンセル時に詳細画面へ戻るリンク */}
            <a
              class="text-(length:--font-size-14) text-gray-500 hover:underline"
              href={`/knowledges/${knowledge.knowledgeId}`}
            >
              キャンセル
            </a>

            <button
              class="px-s py-2xs rounded-(--border-radius-8) bg-blue-500 text-(length:--font-size-14) font-bold text-white hover:opacity-80"
              type="submit"
            >
              更新
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
