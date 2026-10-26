import { applyCheckIn, fetchCheckInsByHabit } from '../checkins';

function mockFetch(body: unknown, status = 200) {
    const fetchMock = jest.fn().mockResolvedValue({ status, json: async () => body });
    global.fetch = fetchMock as unknown as typeof fetch;
    return fetchMock;
}

describe('fetchCheckInsByHabit', () => {
    it('makes one request and groups check-ins per habit, in habit order', async () => {
        const fetchMock = mockFetch({
            success: true,
            data: [
                { _id: 'c1', habitId: 'h2', value: true },
                { _id: 'c2', habitId: 'h1', value: 3 },
                { _id: 'c3', habitId: 'h2', value: true },
            ],
        });

        const result = await fetchCheckInsByHabit([{ _id: 'h1' }, { _id: 'h2' }, { _id: 'h3' }]);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0][0]).toBe('/api/habits/checkins');
        expect(result.map((r) => r.habitId)).toEqual(['h1', 'h2', 'h3']);
        expect(result[0].checkIns.map((c) => c._id)).toEqual(['c2']);
        expect(result[1].checkIns.map((c) => c._id)).toEqual(['c1', 'c3']);
        expect(result[2].checkIns).toEqual([]);
    });

    it('limits the request to one day when a day is given', async () => {
        const fetchMock = mockFetch({ success: true, data: [] });
        const day = new Date('2026-10-27T00:00:00.000Z');

        await fetchCheckInsByHabit([{ _id: 'h1' }], day);

        expect(fetchMock.mock.calls[0][0]).toBe(
            `/api/habits/checkins?startDate=${day.toISOString()}&endDate=${day.toISOString()}`
        );
    });

    it('throws on an API error instead of returning empty check-ins', async () => {
        mockFetch({ success: false, error: 'Failed to fetch check-ins' }, 500);
        await expect(fetchCheckInsByHabit([{ _id: 'h1' }])).rejects.toThrow('Failed to fetch check-ins');
    });
});

describe('applyCheckIn', () => {
    const day = new Date(2026, 9, 27);
    const yesterday = new Date(2026, 9, 26);

    it("replaces only that habit's check-in for that day", () => {
        const groups = [
            { habitId: 'h1', checkIns: [{ _id: 'a', date: day, value: false }, { _id: 'b', date: yesterday, value: true }] },
            { habitId: 'h2', checkIns: [{ _id: 'c', date: day, value: true }] },
        ] as any;

        const result = applyCheckIn(groups, 'h1', day.toISOString(), true);

        expect(result[0].checkIns.map((c) => [c.value, new Date(c.date).getDate()])).toEqual([[true, 27], [true, 26]]);
        expect(result[1]).toBe(groups[1]);
    });
});
