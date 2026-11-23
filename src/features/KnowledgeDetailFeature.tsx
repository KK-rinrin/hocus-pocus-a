import type { Knowledge } from '../models/knowledge.model.js';
import { Layout } from './Layout.js';
import { Timestamp } from './Timestamp.js';

interface Props {
  knowledge: Knowledge;
  userId?: string | undefined;
}

export function KnowledgeDetailFeature({ knowledge, userId }: Props) {
  const heading = knowledge.title || 'ナレッジ詳細';
  const isAuthor = Boolean(userId) && knowledge.authorId === userId;
  const deleteConfirmMessage = `「${heading}」を削除しますか？\n削除したナレッジは元に戻せません。`;
  const deleteOnSubmit = `return confirm(${JSON.stringify(deleteConfirmMessage)})`;

  return (
    <Layout title={heading}>
      <div class="py-s">
        <div class="flex items-center justify-between mb-s">
          <h1 class="text-(length:--font-size-20) font-bold text-gray-900">{heading}</h1>
          {isAuthor && (
            <a
              class="inline-flex items-center gap-3xs px-s py-2xs rounded-(--border-radius-8) bg-blue-500 text-(length:--font-size-14) font-bold text-white hover:opacity-80"
              href={`/knowledges/${knowledge.knowledgeId}/edit`}
            >
              編集
            </a>
          )}
        </div>

        <dl class="mb-s grid grid-cols-[auto_1fr] gap-x-s gap-y-3xs text-(length:--font-size-12) text-gray-600">
          <dt>作成者</dt>
          <dd>{knowledge.authorId}</dd>
          <dt>作成日時</dt>
          <dd>
            <Timestamp value={knowledge.createdAt} />
          </dd>
          <dt>更新日時</dt>
          <dd>
            <Timestamp value={knowledge.updatedAt} />
          </dd>
        </dl>

        {/* MEMO: hono/jsx が自動エスケープするため、本文は HTML として解釈されない */}
        <pre class="whitespace-pre-wrap border-y border-gray-200 py-s text-(length:--font-size-14)">
          {knowledge.content}
        </pre>

        <div class="mt-s flex items-center justify-between">
          <a class="text-(length:--font-size-14) text-gray-500 hover:underline" href="/">
            一覧へ戻る
          </a>

          {isAuthor && (
            <form action={`/knowledges/${knowledge.knowledgeId}/delete`} method="post" onsubmit={deleteOnSubmit}>
              <button
                class="shrink-0 cursor-pointer rounded-(--border-radius-8) bg-red-500 px-s py-2xs text-(length:--font-size-14) font-bold text-white hover:opacity-80"
                type="submit"
              >
                削除する
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
