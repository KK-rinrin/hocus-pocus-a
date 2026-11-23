import { Layout } from './Layout.js';

export function KnowledgeNotFoundFeature() {
  return (
    <Layout title="ナレッジが見つかりません">
      <div class="py-s">
        <h1 class="text-(length:--font-size-20) font-bold text-gray-900 mb-s">ナレッジが見つかりません</h1>
        <p class="mb-s text-(length:--font-size-14) text-gray-600">
          URL が間違っているか、ナレッジが削除された可能性があります。
        </p>
        <a class="text-(length:--font-size-14) text-gray-500 hover:underline" href="/">
          一覧へ戻る
        </a>
      </div>
    </Layout>
  );
}
