import { render, screen, userEvent } from '@testing-library/react-native';

import { Sheet } from '../src/Sheet';

// The mock that Bottom Sheet documents in its mock.js, plus
// `__esModule: true`. That CommonJS file lacks the flag, and without it the
// default import (BottomSheet) would get the whole module object.
// The mock's sheet renders its content in place, and its methods, such as
// snapToIndex, do nothing: they don't move the sheet or call onChange.
jest.mock('@gorhom/bottom-sheet', () => ({ __esModule: true, ...require('@gorhom/bottom-sheet/mock') }));

test('the sheet content and the position label render', async () => {
  await render(<Sheet />);

  expect(screen.getByText('Bottom sheet')).toBeOnTheScreen();
  expect(screen.getByText("This text is the sheet's content.")).toBeOnTheScreen();
  expect(screen.getByText('Position: 25%')).toBeOnTheScreen();
});

test('pressing the button snaps the sheet to index 1', async () => {
  // The mock's sheet is a class. The spy records the calls to its
  // snapToIndex method and still runs it.
  const { default: MockBottomSheet } = jest.requireMock('@gorhom/bottom-sheet');
  const snapToIndex = jest.spyOn(MockBottomSheet.prototype, 'snapToIndex');
  const user = userEvent.setup();
  await render(<Sheet />);

  await user.press(screen.getByRole('button', { name: 'Expand to 50%' }));

  expect(snapToIndex).toHaveBeenCalledTimes(1);
  expect(snapToIndex).toHaveBeenCalledWith(1);
  snapToIndex.mockRestore();
});
