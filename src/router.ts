import { Hono } from 'hono';
import {
  createKnowledgeController,
  submitCreateKnowledgeController,
} from './controllers/create-knowledge.controller.js';
import { getAllKnowledgesController } from './controllers/get-all-knowledges.controller.js';
import { KnowledgeContentRequiredError } from './models/knowledge.model.js';

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
  // 本文を取得
  const content = typeof body['content'] === 'string' ? body['content'] : '';
  // ユーザーIDを取得
  const authorId = ctx.get('userId');

  try {
    await submitCreateKnowledgeController(content, authorId);
  } catch (error) {
    if (error instanceof KnowledgeContentRequiredError) {
      return ctx.html(createKnowledgeController(content, error.message), 400);
    }

    // MEMO: 例外を握りつぶさずログに残し、入力内容を保ったまま再入力画面を返す
    console.error(error);
    return ctx.html(createKnowledgeController(content, SAVE_FAILED_MESSAGE), 500);
  }

  return ctx.redirect('/');
});
