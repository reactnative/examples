export type Item = { id: string; title: string };

// The items listed on the Home tab. Each id is the last segment of the
// item's URL, from /item/1 to /item/5.
export const items: Item[] = [
  { id: '1', title: 'Apples' },
  { id: '2', title: 'Bread' },
  { id: '3', title: 'Coffee' },
  { id: '4', title: 'Eggs' },
  { id: '5', title: 'Milk' },
];
