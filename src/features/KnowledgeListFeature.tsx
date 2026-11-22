import type { Knowledge } from '../models/knowledge.model.js';
import { Layout } from './Layout.js';

interface Props {
  userName: string;
  knowledges: Knowledge[];
}

export function KnowledgeListFeature({ userName, knowledges }: Props) {
  return (
    <Layout title="ナレッジ一覧">
      <div class="flex items-center justify-between py-s">
        <h1 class="text-(length:--font-size-20) font-bold text-gray-900">ナレッジ一覧</h1>
        <a
          class="inline-flex items-center gap-3xs px-s py-2xs rounded-(--border-radius-8) bg-blue-500 text-(length:--font-size-14) font-bold text-white hover:opacity-80"
          href="/knowledges/new"
        >
          <span aria-hidden="true">＋</span>
          新規作成
        </a>
      </div>
      <p>
        こんにちは <span class="text-blue-500 font-bold">{userName}</span> さん
      </p>
      {knowledges.length ? (
        <ul class="flex flex-col gap-s py-s">
          {knowledges.map((knowledge) => (
            <li class="border-b border-gray-200 pb-s" key={knowledge.knowledgeId}>
              <div class="mb-2xs flex items-center justify-between text-(length:--font-size-12) text-gray-600">
                <span>{knowledge.authorId}</span>
                <time dateTime={new Date(knowledge.createdAt * 1000).toISOString()}>
                  {new Date(knowledge.createdAt * 1000).toLocaleString('ja-JP')}
                </time>
              </div>
              <pre class="whitespace-pre-wrap text-(length:--font-size-14)">{knowledge.content}</pre>
            </li>
          ))}
        </ul>
      ) : (
        <ul>
          <li>投稿済みのナレッジは 0 件です</li>
        </ul>
      )}
    </Layout>
  );
}
