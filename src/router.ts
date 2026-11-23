import { Hono } from 'hono';
import {
  createKnowledgeController,
  submitCreateKnowledgeController,
} from './controllers/create-knowledge.controller.js';
import { getAllKnowledgesController } from './controllers/get-all-knowledges.controller.js';
import { getKnowledgeController, knowledgeNotFoundController } from './controllers/get-knowledge.controller.js';
import {
  getKnowledgeEditController,
  submitKnowledgeEditController,
} from './controllers/get-knowledge-edit.controller.js';
import { KnowledgeValidationError } from './models/knowledge.model.js';

export interface Variables {
  /**
   * Signed-in User の一意な ID
   */
  userId: string;

  /**
   * Signed-in User の名前 (重複する可能性あり)
   */
  userName: string;
}

const SAVE_FAILED_MESSAGE = '保存に失敗しました。時間をおいて再度お試しください';

export const router = new Hono<{ Variables: Variables }>();

router.get('/', (ctx) => {
  // MEMO: `ctx.get(keyof Variables)` によって、必要に応じて値を利用できる
  const userId = ctx.get('userId');
  const userName = ctx.get('userName');
  console.log(`Signed-in : ${userName} (${userId})`);

  // MEMO: Controller は Context を直接受け取らず、必要な情報のみを引数に受け取る
  return ctx.html(getAllKnowledgesController(userName));
});

router.get('/knowledges/new', (ctx) => {
  return ctx.html(createKnowledgeController());
});

// 新規ナレッジ作成
router.post('/knowledges/new', async (ctx) => {
  const body = await ctx.req.parseBody();
  // タイトルと本文を取得
  const title = typeof body['title'] === 'string' ? body['title'] : '';
  const content = typeof body['content'] === 'string' ? body['content'] : '';
  // ユーザーIDを取得
  const authorId = ctx.get('userId');

  try {
    await submitCreateKnowledgeController(title, content, authorId);
  } catch (error) {
    if (error instanceof KnowledgeValidationError) {
      return ctx.html(createKnowledgeController({ content, error: error.message, title }), 400);
    }

    // MEMO: 例外を握りつぶさずログに残し、入力内容を保ったまま再入力画面を返す
    console.error(error);
    return ctx.html(createKnowledgeController({ content, error: SAVE_FAILED_MESSAGE, title }), 500);
  }

  return ctx.redirect('/');
});

// ナレッジ詳細
// MEMO: `/knowledges/new` より後に登録し、`new` が knowledgeId として扱われないようにする
router.get('/knowledges/:knowledgeId', async (ctx) => {
  const knowledgeId = ctx.req.param('knowledgeId');
  const userId = ctx.get('userId');
  const knowledgeDetail = await getKnowledgeController(knowledgeId, userId);

  // MEMO: 詳細は誰でも閲覧できるため、本人確認は行わない
  if (knowledgeDetail == null) return ctx.html(knowledgeNotFoundController(), 404);

  return ctx.html(knowledgeDetail);
});

// ナレッジ編集画面の表示
router.get('/knowledges/:knowledgeId/edit', async (ctx) => {
  const knowledgeId = ctx.req.param('knowledgeId');
  const userId = ctx.get('userId');
  const result = await getKnowledgeEditController(knowledgeId, userId);

  if (result.status === 'not_found') {
    return ctx.html(knowledgeNotFoundController(), 404);
  }

  if (result.status === 'forbidden') {
    return ctx.text('このナレッジを編集する権限がありません', 403);
  }

  return ctx.html(result.component);
});

// ナレッジの更新
router.post('/knowledges/:knowledgeId/edit', async (ctx) => {
  const knowledgeId = ctx.req.param('knowledgeId');
  const userId = ctx.get('userId');
  const body = await ctx.req.parseBody();
  const content = typeof body['content'] === 'string' ? body['content'] : '';

  try {
    const result = await submitKnowledgeEditController(knowledgeId, content, userId);

    if (result.status === 'not_found') {
      return ctx.html(knowledgeNotFoundController(), 404);
    }

    if (result.status === 'forbidden') {
      return ctx.text('このナレッジを編集する権限がありません', 403);
    }
  } catch (error) {
    if (error instanceof KnowledgeValidationError) {
      const editView = await getKnowledgeEditController(knowledgeId, userId, {
        content,
        error: error.message,
      });
      if (editView.status === 'ok') {
        return ctx.html(editView.component, 400);
      }
    }

    console.error(error);
    const editView = await getKnowledgeEditController(knowledgeId, userId, {
      content,
      error: SAVE_FAILED_MESSAGE,
    });
    if (editView.status === 'ok') {
      return ctx.html(editView.component, 500);
    }

    return ctx.text('更新に失敗しました', 500);
  }

  return ctx.redirect(`/knowledges/${knowledgeId}`);
});
