import { FlashList } from '@shopify/flash-list';
import { render, screen, userEvent } from '@testing-library/react-native';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import { feed, type FeedItem } from '../src/data';
import { Feed } from '../src/Feed';

// FlashList schedules work for the next frame after it renders. With fake
// timers, that work runs only when userEvent advances the clock, inside act().
jest.useFakeTimers();

test('shows the first header and its rows', async () => {
  await render(<Feed items={feed} />);

  expect(screen.getByRole('header', { name: 'Section 1' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Item 1.1' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Item 1.2' })).toBeOnTheScreen();
});

test('pressing a row selects it', async () => {
  const user = userEvent.setup();
  await render(<Feed items={feed} />);
  const row = screen.getByRole('button', { name: 'Item 1.1' });

  expect(row).not.toBeSelected();
  await user.press(row);

  expect(screen.getByRole('button', { name: 'Item 1.1' })).toBeSelected();
});

test('pressing a selected row unselects it', async () => {
  const user = userEvent.setup();
  await render(<Feed items={feed} />);

  await user.press(screen.getByRole('button', { name: 'Item 1.1' }));
  await user.press(screen.getByRole('button', { name: 'Item 1.1' }));

  expect(screen.getByRole('button', { name: 'Item 1.1' })).not.toBeSelected();
});

test('selecting one row does not select another', async () => {
  const user = userEvent.setup();
  await render(<Feed items={feed} />);

  await user.press(screen.getByRole('button', { name: 'Item 1.1' }));
  expect(screen.getAllByRole('button', { selected: true })).toHaveLength(1);

  // Scroll far enough down that FlashList reuses the first rows for others.
  await user.scrollTo(screen.getByTestId('feed'), { y: 5000 });
  expect(screen.queryByText('Item 1.1')).not.toBeOnTheScreen();
  expect(screen.queryAllByRole('button', { selected: true })).toHaveLength(0);

  await user.scrollTo(screen.getByTestId('feed'), { y: 0 });
  expect(screen.getByRole('button', { name: 'Item 1.1' })).toBeSelected();
});

// For comparison only: the same list, but each row keeps its own selection
// in useState instead of getting it from Feed.
function RowWithOwnState({ item }: { item: FeedItem }) {
  const [selected, setSelected] = useState(false);
  return (
    <Pressable
      onPress={() => setSelected(!selected)}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text>{item.title}</Text>
    </Pressable>
  );
}

function FeedWithRowState({ items }: { items: FeedItem[] }) {
  return (
    <FlashList
      testID="feed"
      data={items}
      keyExtractor={(item) => item.id}
      getItemType={(item) => item.kind}
      renderItem={({ item }) =>
        item.kind === 'header' ? (
          <Text accessibilityRole="header">{item.title}</Text>
        ) : (
          <RowWithOwnState item={item} />
        )
      }
    />
  );
}

test("a row's own state follows the reused component, not the item", async () => {
  const user = userEvent.setup();
  await render(<FeedWithRowState items={feed} />);

  await user.press(screen.getByRole('button', { name: 'Item 1.1' }));
  await user.scrollTo(screen.getByTestId('feed'), { y: 5000 });

  // Item 1.1 is gone, but its component now renders another item, which
  // shows as selected although nobody pressed it.
  expect(screen.queryByText('Item 1.1')).not.toBeOnTheScreen();
  expect(screen.getAllByRole('button', { selected: true })).toHaveLength(1);
});
