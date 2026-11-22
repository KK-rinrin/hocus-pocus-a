import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Knowledge } from './knowledge.model.js';
import { KnowledgeRepository } from './knowledge.repository.js';

describe('KnowledgeRepository', () => {
  const originalCwd = process.cwd();
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'hocus-pocus-test-'));
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  });

  it('upsert で保存した Knowledge を getAll で取得できる', async () => {
    const knowledge = Knowledge.create('# タイトル\n\nテスト本文', 'test-author');

    await KnowledgeRepository.upsert(knowledge);
    const knowledges = await KnowledgeRepository.getAll();

    expect(knowledges).toEqual([knowledge]);
  });

  it('同じ knowledgeId で upsert すると内容が上書き保存される', async () => {
    const original = Knowledge.create('更新前の本文', 'test-author');
    const updated = Knowledge.update(original, '更新後の本文');

    await KnowledgeRepository.upsert(original);
    await KnowledgeRepository.upsert(updated);
    const knowledges = await KnowledgeRepository.getAll();

    expect(knowledges).toEqual([updated]);
  });
});
