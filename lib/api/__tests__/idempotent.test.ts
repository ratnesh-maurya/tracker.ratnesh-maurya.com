import { saveOnce } from '../idempotent';

const makeDoc = (save = jest.fn().mockResolvedValue(undefined)) => ({ save }) as any;

describe('saveOnce', () => {
    it('saves normally without a clientId', async () => {
        const model = { findOne: jest.fn() } as any;
        const doc = makeDoc();
        await expect(saveOnce(model, doc, 'u1', undefined)).resolves.toEqual({ doc, created: true });
        expect(model.findOne).not.toHaveBeenCalled();
    });

    it('returns the earlier entry instead of saving a duplicate', async () => {
        const existing = { _id: 'first' };
        const model = { findOne: jest.fn().mockResolvedValue(existing) } as any;
        const doc = makeDoc();
        await expect(saveOnce(model, doc, 'u1', 'c1')).resolves.toEqual({ doc: existing, created: false });
        expect(model.findOne).toHaveBeenCalledWith({ userId: 'u1', clientId: 'c1' });
        expect(doc.save).not.toHaveBeenCalled();
    });

    it('returns the winner when two copies race to save', async () => {
        const winner = { _id: 'winner' };
        const model = { findOne: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(winner) } as any;
        const doc = makeDoc(jest.fn().mockRejectedValue({ code: 11000 }));
        await expect(saveOnce(model, doc, 'u1', 'c1')).resolves.toEqual({ doc: winner, created: false });
    });

    it('rethrows other save errors', async () => {
        const model = { findOne: jest.fn().mockResolvedValue(null) } as any;
        const doc = makeDoc(jest.fn().mockRejectedValue(new Error('validation')));
        await expect(saveOnce(model, doc, 'u1', 'c1')).rejects.toThrow('validation');
    });
});
