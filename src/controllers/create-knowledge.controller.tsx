import { CreateKnowledgeFeature } from '../features/CreateKnowledgeFeature.js';
import { Knowledge } from '../models/knowledge.model.js';
import { KnowledgeRepository } from '../models/knowledge.repository.js';

export function createKnowledgeController(content = '', error?: string) {
  return <CreateKnowledgeFeature content={content} error={error} />;
}

export async function submitCreateKnowledgeController(content: string, authorId: string) {
  const knowledge = Knowledge.create(content, authorId);

  await KnowledgeRepository.upsert(knowledge);
}
