import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { items } from '../src/items';

// Each test renders the example's own app/ directory, relative to the
// folder Jest runs in, so the routes are the real ones.

test('the Home tab lists the 5 items', async () => {
  await renderRouter('./app');

  expect(screen).toHavePathname('/');
  for (const item of items) {
    expect(screen.getByRole('link', { name: item.title })).toBeOnTheScreen();
  }
});

test('pressing an item opens its detail screen', async () => {
  const user = userEvent.setup();
  await renderRouter('./app');

  await user.press(screen.getByRole('link', { name: 'Coffee' }));

  expect(screen).toHavePathname('/item/3');
  expect(screen.getByRole('header', { name: 'Coffee' })).toBeOnTheScreen();
  expect(screen.getByText('Item 3 of 5')).toBeOnTheScreen();
});

test('an unknown id shows a message instead of an item', async () => {
  // initialUrl opens the app at this URL instead of at /.
  await renderRouter('./app', { initialUrl: '/item/9' });

  expect(screen).toHavePathname('/item/9');
  expect(screen.getByText('No item has the id 9.')).toBeOnTheScreen();
});

test('the Settings tab renders', async () => {
  const user = userEvent.setup();
  await renderRouter('./app');

  await user.press(screen.getByText('Settings'));

  expect(screen).toHavePathname('/settings');
  expect(screen.getByText('No settings yet.')).toBeOnTheScreen();
});
