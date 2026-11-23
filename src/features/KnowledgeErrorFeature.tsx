import { Layout } from './Layout.js';

export type KnowledgeErrorCode = 'DELETE_FORBIDDEN' | 'DELETE_FAILED';

const ERROR_MESSAGES: Record<KnowledgeErrorCode, { title: string; message: string }> = {
  DELETE_FORBIDDEN: {
    title: '削除する権限がありません',
    message: '自分が投稿したナレッジのみ削除できます。',
  },
  DELETE_FAILED: {
    title: '削除に失敗しました',
    message: '削除に失敗しました。時間をおいて再度お試しください。',
  },
};

interface Props {
  errorCode: KnowledgeErrorCode;
  retryHref?: string;
}

export function KnowledgeErrorFeature({ errorCode, retryHref }: Props) {
  const { title, message } = ERROR_MESSAGES[errorCode];

  return (
    <Layout title={title}>
      <div class="py-s">
        <h1 class="text-(length:--font-size-20) font-bold text-gray-900 mb-s">{title}</h1>
        <p class="mb-s text-(length:--font-size-14) text-gray-600" role="alert">
          {message}
        </p>
        <div class="flex items-center justify-between">
          <a class="text-(length:--font-size-14) text-gray-500 hover:underline" href="/">
            一覧へ戻る
          </a>
          {retryHref && (
            <a
              class="rounded-(--border-radius-8) bg-blue-500 px-s py-2xs text-(length:--font-size-14) font-bold text-white hover:opacity-80"
              href={retryHref}
            >
              詳細ページへ戻る
            </a>
          )}
        </div>
      </div>
    </Layout>
  );
}
