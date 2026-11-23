import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Knowledge } from './models/knowledge.model.js';
import { KnowledgeRepository } from './models/knowledge.repository.js';
import { router, type Variables } from './router.js';

function requestAsUser(path: string, userId: string, init?: RequestInit) {
  const app = new Hono<{ Variables: Variables }>();
  app.use('*', async (ctx, next) => {
    ctx.set('userId', userId);
    ctx.set('userName', userId);
    await next();
  });
  app.route('/', router);

  return app.request(path, init);
}

function postCreateKnowledge(title: string, content: string) {
  return router.request('/knowledges/new', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ title, content }),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Create knowledge view', () => {
  it('作成画面にタイトル入力欄と本文入力欄を表示する', async () => {
    const response = await router.request('/knowledges/new');
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('タイトル');
    expect(html).toContain('name="title"');
    expect(html).toContain('本文');
    expect(html).toContain('name="content"');
  });
});

describe('Create knowledge validation', () => {
  it('空タイトルを拒否して、入力値とエラーを作成画面に返す', async () => {
    const title = ' \t ';
    const content = '入力済みの本文';
    const response = await postCreateKnowledge(title, content);

    const html = await response.text();

    expect(response.status).toBe(400);
    expect(html).toContain('タイトルを入力してください');
    expect(html).toContain(`value="${title}"`);
    expect(html).toContain(`>${content}</textarea>`);
  });

  it('空本文を拒否して、入力値とエラーを作成画面に返す', async () => {
    const title = '入力済みのタイトル';
    const content = ' \t ';
    const response = await postCreateKnowledge(title, content);

    const html = await response.text();

    expect(response.status).toBe(400);
    expect(html).toContain('本文を入力してください');
    expect(html).toContain(`value="${title}"`);
    expect(html).toContain(`>${content}</textarea>`);
  });
});

describe('Create knowledge transition', () => {
  it('保存に成功したら、一覧画面へリダイレクトする', async () => {
    const upsert = vi.spyOn(KnowledgeRepository, 'upsert').mockResolvedValue();
    const title = 'Hello Title';
    const content = '# Hello\n\nMarkdown 本文';

    const response = await postCreateKnowledge(title, content);

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/');
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ title, content }));
  });

  it('保存に失敗したら、例外をログに残し、入力値とエラーを作成画面に返す', async () => {
    const failure = new Error('disk full');
    vi.spyOn(KnowledgeRepository, 'upsert').mockRejectedValue(failure);
    const logError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const title = '保存できないタイトル';
    const content = '保存できない本文';

    const response = await postCreateKnowledge(title, content);

    const html = await response.text();

    expect(response.status).toBe(500);
    expect(html).toContain('保存に失敗しました');
    expect(html).toContain(`value="${title}"`);
    expect(html).toContain(`>${content}</textarea>`);
    expect(logError).toHaveBeenCalledWith(failure);
  });
});

describe('Knowledge list', () => {
  it('一覧画面にナレッジのタイトルと本文を表示する', async () => {
    const knowledge = Knowledge.create('一覧のタイトル', '一覧の本文', 'list-author');
    vi.spyOn(KnowledgeRepository, 'getAll').mockResolvedValue([knowledge]);

    const response = await router.request('/');
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('一覧のタイトル');
    expect(html).toContain('一覧の本文');
  });
});

describe('Knowledge detail', () => {
  it('存在するナレッジのタイトル・本文・作成者を詳細画面に表示する', async () => {
    const knowledge = Knowledge.create('詳細タイトル', '# 詳細\n\n本文の2行目', 'detail-author');
    const getByKnowledgeId = vi.spyOn(KnowledgeRepository, 'getByKnowledgeId').mockResolvedValue(knowledge);

    const response = await router.request(`/knowledges/${knowledge.knowledgeId}`);

    const html = await response.text();

    expect(response.status).toBe(200);
    expect(getByKnowledgeId).toHaveBeenCalledWith(knowledge.knowledgeId);
    expect(html).toContain('詳細タイトル');
    expect(html).toContain('# 詳細\n\n本文の2行目');
    expect(html).toContain('detail-author');
  });

  it('タイトルと本文の HTML をエスケープして表示する', async () => {
    const knowledge = Knowledge.create('<b>title</b>', '<script>alert(1)</script>', 'detail-author');
    vi.spyOn(KnowledgeRepository, 'getByKnowledgeId').mockResolvedValue(knowledge);

    const response = await router.request(`/knowledges/${knowledge.knowledgeId}`);

    const html = await response.text();

    expect(html).not.toContain('<b>title</b>');
    expect(html).toContain('&lt;b&gt;title&lt;/b&gt;');
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('存在しないナレッジは 404 と「ナレッジが見つかりません」画面を返す', async () => {
    vi.spyOn(KnowledgeRepository, 'getByKnowledgeId').mockResolvedValue(undefined);

    const response = await router.request('/knowledges/does-not-exist');

    const html = await response.text();

    expect(response.status).toBe(404);
    expect(html).toContain('ナレッジが見つかりません');
    expect(html).toContain('href="/"');
  });

  it('投稿者本人が詳細画面を開くと、確認ダイアログ付きの削除フォームを表示する', async () => {
    const knowledge = Knowledge.create('自分のナレッジ', '本文', 'author-1');
    vi.spyOn(KnowledgeRepository, 'getByKnowledgeId').mockResolvedValue(knowledge);

    const response = await requestAsUser(`/knowledges/${knowledge.knowledgeId}`, 'author-1');
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain(`action="/knowledges/${knowledge.knowledgeId}/delete"`);
    expect(html).toContain('method="post"');
    expect(html).toContain('onsubmit="return confirm(');
    expect(html).toContain('「自分のナレッジ」を削除しますか？');
    expect(html).toContain('削除したナレッジは元に戻せません。');
    expect(html).toContain('type="submit"');
    expect(html).toContain('削除する');
  });

  it('他人には詳細画面に削除フォームを表示しない', async () => {
    const knowledge = Knowledge.create('他人のナレッジ', '本文', 'author-1');
    vi.spyOn(KnowledgeRepository, 'getByKnowledgeId').mockResolvedValue(knowledge);

    const response = await requestAsUser(`/knowledges/${knowledge.knowledgeId}`, 'other-user');
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).not.toContain(`/knowledges/${knowledge.knowledgeId}/delete`);
    expect(html).not.toContain('削除する');
  });

  it('ログインユーザーIDが未設定の場合は削除フォームを表示しない', async () => {
    const knowledge = Knowledge.create('誰かのナレッジ', '本文', 'author-1');
    vi.spyOn(KnowledgeRepository, 'getByKnowledgeId').mockResolvedValue(knowledge);

    const response = await router.request(`/knowledges/${knowledge.knowledgeId}`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).not.toContain(`/knowledges/${knowledge.knowledgeId}/delete`);
  });
});
