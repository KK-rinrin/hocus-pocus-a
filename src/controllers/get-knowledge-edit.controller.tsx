import { KnowledgeEditFeature } from '../features/KnowledgeEditFeature.js';
import { Knowledge } from '../models/knowledge.model.js';
import { KnowledgeRepository } from '../models/knowledge.repository.js';

export type GetKnowledgeEditResult =
  | { status: 'ok'; component: ReturnType<typeof KnowledgeEditFeature> }
  | { status: 'not_found' }
  | { status: 'forbidden' };

export type SubmitKnowledgeEditResult = { status: 'ok' } | { status: 'not_found' } | { status: 'forbidden' };

interface GetKnowledgeEditOptions {
  content?: string | undefined;
  error?: string | undefined;
}

/**
 * ナレッジ編集画面の表示用コントローラー
 */
export async function getKnowledgeEditController(
  knowledgeId: string,
  userId: string,
  options?: GetKnowledgeEditOptions,
): Promise<GetKnowledgeEditResult> {
  const knowledge = await KnowledgeRepository.getByKnowledgeId(knowledgeId);

  if (knowledge == null) {
    return { status: 'not_found' };
  }

  if (knowledge.authorId !== userId) {
    return { status: 'forbidden' };
  }

  return {
    status: 'ok',
    component: <KnowledgeEditFeature content={options?.content} error={options?.error} knowledge={knowledge} />,
  };
}

/**
 * ナレッジの更新処理用コントローラー
 */
export async function submitKnowledgeEditController(
  knowledgeId: string,
  content: string,
  userId: string,
): Promise<SubmitKnowledgeEditResult> {
  const knowledge = await KnowledgeRepository.getByKnowledgeId(knowledgeId);

  if (knowledge == null) {
    return { status: 'not_found' };
  }

  if (knowledge.authorId !== userId) {
    return { status: 'forbidden' };
  }

  const updatedKnowledge = Knowledge.update(knowledge, content);
  await KnowledgeRepository.upsert(updatedKnowledge);

  return { status: 'ok' };
}
