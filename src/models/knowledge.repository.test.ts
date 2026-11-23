import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
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
    const knowledge = Knowledge.create('テストタイトル', '# 見出し\n\nテスト本文', 'test-author');

    await KnowledgeRepository.upsert(knowledge);
    const knowledges = await KnowledgeRepository.getAll();

    expect(knowledges).toEqual([knowledge]);
  });

  it('同じ knowledgeId で upsert すると内容が上書き保存される', async () => {
    const original = Knowledge.create('タイトル', '更新前の本文', 'test-author');
    const updated = Knowledge.update(original, '更新後の本文');

    await KnowledgeRepository.upsert(original);
    await KnowledgeRepository.upsert(updated);
    const knowledges = await KnowledgeRepository.getAll();

    expect(knowledges).toEqual([updated]);
  });

  it('getByKnowledgeId で knowledgeId が一致する Knowledge だけを取得できる', async () => {
    const target = Knowledge.create('対象タイトル', '取得対象の本文', 'test-author');
    const other = Knowledge.create('別タイトル', '別の本文', 'test-author');

    await KnowledgeRepository.upsert(target);
    await KnowledgeRepository.upsert(other);

    expect(await KnowledgeRepository.getByKnowledgeId(target.knowledgeId)).toEqual(target);
  });

  it('title が無い既存 JSON を読み込む場合は空文字として補完する', async () => {
    await mkdir('./storage', { recursive: true });
    await writeFile(
      './storage/legacy-id.json',
      JSON.stringify({
        __tag: 'Knowledge',
        knowledgeId: 'legacy-id',
        content: '既存の本文',
        authorId: 'legacy-author',
        createdAt: 1700000000,
        updatedAt: 1700000000,
      }),
      'utf-8',
    );

    const knowledge = await KnowledgeRepository.getByKnowledgeId('legacy-id');
    expect(knowledge?.title).toBe('');
  });

  it('getByKnowledgeId は存在しない knowledgeId に対して undefined を返す', async () => {
    expect(await KnowledgeRepository.getByKnowledgeId('does-not-exist')).toBeUndefined();
  });

  it('getByKnowledgeId はパス区切り文字を含む knowledgeId に対して undefined を返す', async () => {
    expect(await KnowledgeRepository.getByKnowledgeId('../package')).toBeUndefined();
  });
});
