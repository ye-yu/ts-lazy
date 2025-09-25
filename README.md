# ts-memo

Elegant memo computation utilities for TypeScript: remove branching in getters by using a ValueProvider.

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
import { memo, type ValueProvider } from 'ts-memo'

class Person {
  private _age: ValueProvider<number> = memo(() => computeAge())
  get age(): number {
    this._age = this._age.compute()
    return this._age.value
  }
}
```

- No `if` branching.
- The expensive function runs only once.

## API

- `memo<T>(getter: () => T): ValueProvider<T>`: Wrap a getter so it can be computed on-demand.
- `ValueProvider<T>`: has `compute(): ValueProvider<T>` and a readonly `value: T` that is only accessible on the computed provider.

Trying to access `.value` before calling `compute()` will throw with a helpful error message. This helps uncover misuse during development.

## Install

```
npm i ts-memo
```

## Usage Example

```ts
import { memo } from 'ts-memo'

class Example {
  private _age = memo(() => {
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

## Using the @Memo decorator (optional)

If you prefer not to keep a backing ValueProvider field and a getter, you can use the @Memo property decorator to install a memo getter automatically. The value is computed the first time the property is accessed, cached on the instance, and returned directly thereafter.

Prerequisites:
- TypeScript: enable experimental decorators in tsconfig.json
  {
    "compilerOptions": {
      "experimentalDecorators": true
    }
  }
- Use a definite assignment assertion (!) to silence the "not definitely assigned" error in strict mode.

Example:
```ts
import { Memo, recomputeMemo } from 'ts-memo'

class DecoratorExample {
  @Memo(() => {
    console.log('called memo supplier')
    return 42
  })
  readonly age!: number
}

const ex = new DecoratorExample()
console.log(ex.age) // 42, logs "called memo supplier" once
console.log(ex.age) // 42, does not log again

// If you need to recompute all @Memo values on an instance (e.g., after invalidation):
recomputeMemo(ex)
console.log(ex.age) // 42, logs again because it was recomputed
```

Notes:
- The factory passed to @Memo receives this as its context, so you can reference other instance fields.
- recomputeMemo(instance) will trigger all memoized properties on that instance to recompute the next time they are accessed.

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
