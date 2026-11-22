import { CreateKnowledgeFeature } from '../features/CreateKnowledgeFeature.js';
import { Knowledge } from '../models/knowledge.model.js';
import { KnowledgeRepository } from '../models/knowledge.repository.js';

export function createKnowledgeController() {
  return <CreateKnowledgeFeature />;
}

export async function submitCreateKnowledgeController(content: string, authorId: string) {
  const knowledge = Knowledge.create(content, authorId);

  await KnowledgeRepository.upsert(knowledge);
}
