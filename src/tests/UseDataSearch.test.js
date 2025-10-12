import { renderHook, act } from '@testing-library/react';
import useDataSearch from '../hooks/useDataSearch';

const mockInitialData = [
  { name: 'Budi Santoso', username: 'budi' },
  { name: 'Ani Lestari', username: 'ani' },
  { name: 'Charlie', username: 'charlie' },
];

const mockFilterFunction = (item, term) =>
  item.name.toLowerCase().includes(term.toLowerCase()) ||
  item.username.toLowerCase().includes(term.toLowerCase());

describe('useDataSearch Hook', () => {
  test('should return all data initially when search term is empty', () => {
    const { result } = renderHook(() =>
      useDataSearch(mockInitialData, mockFilterFunction)
    );

    expect(result.current.filteredData).toHaveLength(3);
    expect(result.current.searchTerm).toBe('');
  });

  test('should filter data based on the search term', () => {
    const { result } = renderHook(() =>
      useDataSearch(mockInitialData, mockFilterFunction)
    );

    act(() => {
      result.current.setSearchTerm('Budi');
    });

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].name).toBe('Budi Santoso');
  });

  test('should return an empty array if no data matches the search term', () => {
    const { result } = renderHook(() =>
      useDataSearch(mockInitialData, mockFilterFunction)
    );

    act(() => {
      result.current.setSearchTerm('Zulfa');
    });

    expect(result.current.filteredData).toHaveLength(0);
  });

  test('should handle changes in the initial data array', () => {
    const { result, rerender } = renderHook(
      ({ initialData }) => useDataSearch(initialData, mockFilterFunction),
      { initialProps: { initialData: mockInitialData } }
    );

    expect(result.current.filteredData).toHaveLength(3);

    const newData = [...mockInitialData, { name: 'David', username: 'david' }];
    rerender({ initialData: newData });

    expect(result.current.filteredData).toHaveLength(4);
  });
});
