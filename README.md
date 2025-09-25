# ts-lazy

Elegant lazy computation utilities for TypeScript: remove branching in getters by using a ValueProvider.

## Problem

You want to compute an expensive value the first time it is requested without littering your code with if-statements:

```ts
class Person {
  private _age?: number
  get age(): number {
    if (typeof this._age !== 'number') {
      this._age = computeAge()
    }
    return this._age
  }
}
```

## Solution

Replace the ad-hoc branching with a small protocol: a ValueProvider<T> that becomes stable after `compute()` is called. Your getter turns into straight-line code:

```ts
import { lazy, type ValueProvider } from 'ts-lazy'

class Person {
  private _age: ValueProvider<number> = lazy(() => computeAge())
  get age(): number {
    this._age = this._age.compute()
    return this._age.value
  }
}
```

- No `if` branching.
- The expensive function runs only once.

## API

- `lazy<T>(getter: () => T): ValueProvider<T>`: Wrap a getter so it can be computed on-demand.
- `ValueProvider<T>`: has `compute(): ValueProvider<T>` and a readonly `value: T` that is only accessible on the computed provider.

Trying to access `.value` before calling `compute()` will throw with a helpful error message. This helps uncover misuse during development.

## Install

```
npm i ts-lazy
```

## Usage Example

```ts
import { lazy } from 'ts-lazy'

class Example {
  private _age = lazy(() => {
    console.log('called _age')
    return 42
  })
  get age(): number {
    this._age = this._age.compute()
    return this._age.value
  }
}

const e = new Example()
console.log('Getting age', e.age)
console.log('Getting age', e.age)
```

Expected output:
- "called _age" appears only once.

## Development

- Build: `npm run build`
- Test: `npm test`
- Coverage: `npm run coverage`

The test suite (Vitest) covers:
- Single computation across multiple accesses.
- Error when accessing `.value` prior to `compute()`.
- Idempotent `compute()` on already-computed values.

## License

MIT
