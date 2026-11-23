import { KnowledgeRepository } from '../models/knowledge.repository.js';

export type DeleteKnowledgeResult = 'deleted' | 'not_found' | 'forbidden';

/**
 * ナレッジ削除処理を実行する
 *
 * @returns 削除結果 (HTTP ステータスの判断は Router に委譲する)
 */
export async function deleteKnowledgeController(knowledgeId: string, userId: string): Promise<DeleteKnowledgeResult> {
  const knowledge = await KnowledgeRepository.getByKnowledgeId(knowledgeId);

  if (knowledge == null) {
    return 'not_found';
  }

  // MEMO: 確認ダイアログを経由せず直接 POST された場合も防ぐため、サーバー側で本人確認する
  if (!userId || knowledge.authorId !== userId) {
    return 'forbidden';
  }

  await KnowledgeRepository.deleteByKnowledgeId(knowledgeId);

  return 'deleted';
}
