import type { Knowledge } from '../models/knowledge.model.js';
import { Layout } from './Layout.js';
import { Timestamp } from './Timestamp.js';

interface Props {
  knowledge: Knowledge;
}

export function KnowledgeDetailFeature({ knowledge }: Props) {
  const heading = knowledge.title || 'ナレッジ詳細';

  return (
    <Layout title={heading}>
      <div class="py-s">
        <h1 class="text-(length:--font-size-20) font-bold text-gray-900 mb-s">{heading}</h1>

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

        <a class="mt-s inline-block text-(length:--font-size-14) text-gray-500 hover:underline" href="/">
          一覧へ戻る
        </a>
      </div>
    </Layout>
  );
}
