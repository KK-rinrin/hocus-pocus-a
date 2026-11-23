import { afterEach, describe, expect, it, vi } from 'vitest';
import { Knowledge, KnowledgeContentRequiredError, KnowledgeTitleRequiredError } from './knowledge.model.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

afterEach(() => {
  vi.useRealTimers();
});

describe('Create Knowledge', () => {
  it('Knowledge が作成できる', () => {
    const title = 'Test Title';
    const content = 'This is a test content.';
    const authorId = 'test-author';
    const knowledge = Knowledge.create(title, content, authorId);

    expect(knowledge.knowledgeId).toMatch(UUID_PATTERN);
    expect(knowledge.title).toBe(title);
    expect(knowledge.content).toBe(content);
    expect(knowledge.authorId).toBe(authorId);
    expect(knowledge.createdAt).toEqual(knowledge.updatedAt);
  });

  it('Knowledge ごとに一意な knowledgeId が生成される', () => {
    const first = Knowledge.create('First title', 'First content', 'test-author');
    const second = Knowledge.create('Second title', 'Second content', 'test-author');

    expect(first.knowledgeId).not.toBe(second.knowledgeId);
  });

  it('空文字と空白だけのタイトルを拒否する', () => {
    expect(() => Knowledge.create('', 'Valid content', 'test-author')).toThrow(KnowledgeTitleRequiredError);
    expect(() => Knowledge.create(' \n\t ', 'Valid content', 'test-author')).toThrow('タイトルを入力してください');
  });

  it('空文字と空白だけの本文を拒否する', () => {
    expect(() => Knowledge.create('Valid title', '', 'test-author')).toThrow(KnowledgeContentRequiredError);
    expect(() => Knowledge.create('Valid title', ' \n\t ', 'test-author')).toThrow('本文を入力してください');
  });

  it('有効なタイトルと本文の空白を保持する', () => {
    const title = '  Test Title  ';
    const content = '  This is a test content.  ';
    const knowledge = Knowledge.create(title, content, 'test-author');

    expect(knowledge.title).toBe(title);
    expect(knowledge.content).toBe(content);
  });
});

describe('Update Knowledge', () => {
  it('Knowledge が更新できる', () => {
    vi.useFakeTimers();

    const original = Knowledge.create('Original title', 'This is an original content', 'test-author');
    const content = 'This is an updated content.';

    vi.advanceTimersByTime(10000);

    const updated = Knowledge.update(original, content);

    expect(updated.knowledgeId).toBe(original.knowledgeId);
    expect(updated.title).toBe(original.title);
    expect(updated.content).toBe(content);
    expect(updated.authorId).toBe(original.authorId);
    expect(updated.createdAt).toEqual(original.createdAt);
    expect(updated.updatedAt).toBeGreaterThan(original.updatedAt);
  });
});
