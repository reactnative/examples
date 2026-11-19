export type FeedItem = { id: string; title: string; kind: 'header' | 'row' };

// 200 items in 10 sections: every 20th item, starting with the first, is a
// section header, followed by its 19 rows.
export const feed: FeedItem[] = Array.from({ length: 200 }, (_, index): FeedItem => {
  const section = Math.floor(index / 20) + 1;
  const position = index % 20;
  return position === 0
    ? { id: `section-${section}`, title: `Section ${section}`, kind: 'header' }
    : { id: `item-${section}-${position}`, title: `Item ${section}.${position}`, kind: 'row' };
});
