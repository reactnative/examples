import { render, screen, userEvent } from '@testing-library/react-native';

import { libraries } from '../src/data';
import { SearchableList } from '../src/SearchableList';

const names = libraries.map((item) => item.name);

test('shows every item', async () => {
  await render(<SearchableList items={libraries} />);

  for (const name of names) {
    expect(screen.getByText(name)).toBeOnTheScreen();
  }
});

test('typing "nav" shows only the matching items', async () => {
  const user = userEvent.setup();
  await render(<SearchableList items={libraries} />);

  await user.type(screen.getByLabelText('Search'), 'nav');

  const matching = ['React Navigation', 'React Native Navigation'];
  for (const name of names) {
    if (matching.includes(name)) {
      expect(screen.getByText(name)).toBeOnTheScreen();
    } else {
      expect(screen.queryByText(name)).not.toBeOnTheScreen();
    }
  }
});

test('typing "zzz" shows "No matches"', async () => {
  const user = userEvent.setup();
  await render(<SearchableList items={libraries} />);

  await user.type(screen.getByLabelText('Search'), 'zzz');

  expect(screen.getByText('No matches')).toBeOnTheScreen();
  for (const name of names) {
    expect(screen.queryByText(name)).not.toBeOnTheScreen();
  }
});

test('clearing the search shows every item again', async () => {
  const user = userEvent.setup();
  await render(<SearchableList items={libraries} />);
  const search = screen.getByLabelText('Search');

  await user.type(search, 'zzz');
  await user.clear(search);

  expect(screen.queryByText('No matches')).not.toBeOnTheScreen();
  for (const name of names) {
    expect(screen.getByText(name)).toBeOnTheScreen();
  }
});
