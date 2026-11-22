import { describe, expect, it } from 'vitest';
import { router } from './router.js';

describe('Create knowledge validation', () => {
  it('空本文を拒否して、入力値とエラーを作成画面に返す', async () => {
    const content = ' \t ';
    const response = await router.request('/knowledges/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ content }),
    });

    const html = await response.text();

    expect(response.status).toBe(400);
    expect(html).toContain('本文を入力してください');
    expect(html).toContain(`>${content}</textarea>`);
  });
});
