import { afterEach, describe, expect, it, vi } from 'vitest';
import { KnowledgeRepository } from './models/knowledge.repository.js';
import { router } from './router.js';

function postCreateKnowledge(content: string) {
  return router.request('/knowledges/new', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ content }),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Create knowledge validation', () => {
  it('空本文を拒否して、入力値とエラーを作成画面に返す', async () => {
    const content = ' \t ';
    const response = await postCreateKnowledge(content);

    const html = await response.text();

    expect(response.status).toBe(400);
    expect(html).toContain('本文を入力してください');
    expect(html).toContain(`>${content}</textarea>`);
  });
});

describe('Create knowledge transition', () => {
  it('保存に成功したら、一覧画面へリダイレクトする', async () => {
    const upsert = vi.spyOn(KnowledgeRepository, 'upsert').mockResolvedValue();
    const content = '# Hello\n\nMarkdown 本文';

    const response = await postCreateKnowledge(content);

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/');
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ content }));
  });

  it('保存に失敗したら、例外をログに残し、入力値とエラーを作成画面に返す', async () => {
    const failure = new Error('disk full');
    vi.spyOn(KnowledgeRepository, 'upsert').mockRejectedValue(failure);
    const logError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const content = '保存できない本文';

    const response = await postCreateKnowledge(content);

    const html = await response.text();

    expect(response.status).toBe(500);
    expect(html).toContain('保存に失敗しました');
    expect(html).toContain(`>${content}</textarea>`);
    expect(logError).toHaveBeenCalledWith(failure);
  });
});
