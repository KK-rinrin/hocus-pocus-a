import { afterEach, describe, expect, it, vi } from 'vitest';
import { Knowledge, KnowledgeContentRequiredError } from './knowledge.model.js';

afterEach(() => {
  vi.useRealTimers();
});

describe('Create Knowledge', () => {
  it('Knowledge が作成できる', () => {
    const content = 'This is a test content.';
    const authorId = 'test-author';
    const knowledge = Knowledge.create(content, authorId);

    expect(knowledge.content).toBe(content);
    expect(knowledge.authorId).toBe(authorId);
    expect(knowledge.createdAt).toEqual(knowledge.updatedAt);
  });

  it('空文字と空白だけの本文を拒否する', () => {
    expect(() => Knowledge.create('', 'test-author')).toThrow(KnowledgeContentRequiredError);
    expect(() => Knowledge.create(' \n\t ', 'test-author')).toThrow('本文を入力してください');
  });

  it('有効な本文の空白を保持する', () => {
    const content = '  This is a test content.  ';

    expect(Knowledge.create(content, 'test-author').content).toBe(content);
  });
});

describe('Update Knowledge', () => {
  it('Knowledge が更新できる', () => {
    vi.useFakeTimers();

    const original = Knowledge.create('This is an original content', 'test-author');
    const content = 'This is an updated content.';

    vi.advanceTimersByTime(10000);

    const updated = Knowledge.update(original, content);

    expect(updated.knowledgeId).toBe(original.knowledgeId);
    expect(updated.content).toBe(content);
    expect(updated.authorId).toBe(original.authorId);
    expect(updated.createdAt).toEqual(original.createdAt);
    expect(updated.updatedAt).toBeGreaterThan(original.updatedAt);
  });
});
