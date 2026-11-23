interface Props {
  /**
   * UNIX タイムスタンプ (秒)
   */
  value: number;
}

export function Timestamp({ value }: Props) {
  const date = new Date(value * 1000);

  return <time dateTime={date.toISOString()}>{date.toLocaleString('ja-JP')}</time>;
}
