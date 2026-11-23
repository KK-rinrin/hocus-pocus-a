import { KnowledgeDetailFeature } from '../features/KnowledgeDetailFeature.js';
import { KnowledgeNotFoundFeature } from '../features/KnowledgeNotFoundFeature.js';
import { KnowledgeRepository } from '../models/knowledge.repository.js';

/**
 * ナレッジ詳細画面を組み立てる
 *
 * @returns ナレッジが見つからない場合は `undefined` (HTTP ステータスの判断は Router に委譲する)
 */
export async function getKnowledgeController(knowledgeId: string, currentUserId?: string) {
  const knowledge = await KnowledgeRepository.getByKnowledgeId(knowledgeId);

  if (knowledge == null) return undefined;

  return <KnowledgeDetailFeature currentUserId={currentUserId} knowledge={knowledge} />;
}

/**
 * ナレッジが見つからない場合の画面を組み立てる
 */
export function knowledgeNotFoundController() {
  return <KnowledgeNotFoundFeature />;
}
