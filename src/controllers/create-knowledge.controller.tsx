import { CreateKnowledgeFeature } from '../features/CreateKnowledgeFeature.js';
import { Knowledge } from '../models/knowledge.model.js';
import { KnowledgeRepository } from '../models/knowledge.repository.js';

interface CreateKnowledgeViewParams {
  title?: string;
  content?: string;
  error?: string;
}

export function createKnowledgeController({ title = '', content = '', error }: CreateKnowledgeViewParams = {}) {
  return <CreateKnowledgeFeature content={content} error={error} title={title} />;
}

export async function submitCreateKnowledgeController(title: string, content: string, authorId: string) {
  const knowledge = Knowledge.create(title, content, authorId);

  await KnowledgeRepository.upsert(knowledge);
}
