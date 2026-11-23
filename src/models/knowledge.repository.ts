import { glob, mkdir, readFile, writeFile } from 'node:fs/promises';

import type { Knowledge } from './knowledge.model.js';

function parseKnowledge(json: string): Knowledge {
  const data = JSON.parse(json) as Partial<Knowledge> & Omit<Knowledge, 'title'>;
  return {
    ...data,
    title: data.title ?? '',
  };
}

async function getAll(): Promise<Knowledge[]> {
  const files = await Array.fromAsync(glob('./storage/**/*.json'));

  const knowledges = await Promise.all(files.map((file) => readFile(file, 'utf-8').then(parseKnowledge)));

  return knowledges;
}

/**
 * knowledgeId に一致するナレッジを取得する
 *
 * @returns 見つからない場合は `undefined`
 */
async function getByKnowledgeId(knowledgeId: string): Promise<Knowledge | undefined> {
  // MEMO: パス区切り文字を含む ID で storage 外のファイルを読まないようにする
  if (/[\\/]/.test(knowledgeId)) return undefined;

  try {
    const json = await readFile(`./storage/${knowledgeId}.json`, 'utf-8');
    return parseKnowledge(json);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

async function upsert(knowledge: Knowledge): Promise<void> {
  await mkdir('./storage', { recursive: true });
  await writeFile(`./storage/${knowledge.knowledgeId}.json`, JSON.stringify(knowledge, null, 2), 'utf-8');
}

export const KnowledgeRepository = {
  getByKnowledgeId,

  // biome-ignore lint/suspicious/noExplicitAny: TODO: (学生向け) 実装する
  getByAuthorId: (_: string): Promise<Knowledge[]> => undefined as any,

  getAll,

  upsert,

  // biome-ignore lint/suspicious/noExplicitAny: TODO: (学生向け) 実装する
  deleteByKnowledgeId: (_: string): Promise<void> => undefined as any,
};
