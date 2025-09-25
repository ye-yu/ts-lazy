import {describe, it, expect, vi} from 'vitest'
import {memo, Memo, recomputeMemo, type ValueProvider} from '../src'

class Example {
    _age: ValueProvider<number> = memo(() => {
        // side-effect to observe computation
        console.log('called _age')
        return 42
    })
    get age(): number {
        this._age = this._age.compute()
        return this._age.value
    }
}

describe('memo', () => {
    it('computes exactly once across multiple getter accesses', () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {
        })

        const ex = new Example()
        expect(ex.age).toBe(42)
        expect(ex.age).toBe(42)
        expect(ex.age).toBe(42)

        // should have logged exactly once
        const calls = logSpy.mock.calls.filter(([msg]) => msg === 'called _age').length
        expect(calls).toBe(1)

        logSpy.mockRestore()
    })

    it('throws if .value accessed before compute()', () => {
        const v = memo(() => 1)
        expect(() => (v as any).value).toThrowError(/Must call compute\(\)/)
    })

    it('ComputedValue.compute() returns the same instance', () => {
        // after computing once, compute() should be idempotent and return self
        let p = memo(() => 7)
        const p2 = p.compute()
        // calling compute again on the computed value should return the same reference
        const p3 = p2.compute()
        expect(p2).toBe(p3)
        // and the value should be available
        // Type narrowing: after compute(), value is accessible
        expect(p2.value).toBe(7)
    })
})

class DecoratorExample {
    @Memo(() => {
        console.log('called memo supplier')
        return 42;
    })
    readonly age!: number;
}

describe('@Memo()', () => {
    it('computes exactly once across multiple getter accesses', () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {
        })


        const ex = new DecoratorExample()
        expect(ex.age).toBe(42)
        expect(ex.age).toBe(42)
        expect(ex.age).toBe(42)

        // should have logged exactly once
        const calls = logSpy.mock.calls.filter(([msg]) => msg === 'called memo supplier').length
        expect(calls).toBe(1)

        logSpy.mockRestore()
    })
    it('should be able to recompute if requested', () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {
        })


        const ex = new DecoratorExample()
        expect(ex.age).toBe(42)
        recomputeMemo(ex);
        expect(ex.age).toBe(42)
        expect(ex.age).toBe(42)

        // should have logged exactly once
        const calls = logSpy.mock.calls.filter(([msg]) => msg === 'called memo supplier').length
        expect(calls).toBe(2)

        logSpy.mockRestore()
    })
})