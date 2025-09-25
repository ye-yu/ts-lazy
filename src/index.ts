/**
 * Elegant lazy computation utilities for TypeScript.
 *
 * Motivation:
 *   Avoid imperative if-branches to initialize fields on-demand. Instead of
 *   mutating in a getter with an if-check, wrap values into a ValueProvider
 *   that can be computed once and then reused without branching.
 */

/**
 * A provider which may initially be a thunk and later become a concrete value.
 * Call compute once to obtain a stable provider that exposes the computed value.
 */
export interface ValueProvider<T> {
  /** Compute the value and return a provider that is guaranteed to be stable. */
  compute(): ValueProvider<T>;
  /** Access the computed value. Only safe on the stable provider. */
  readonly value: T;
}

/**
 * A stable provider that already holds the computed value.
 */
class ComputedValue<T> implements ValueProvider<T> {
  constructor(public readonly value: T) {}
  compute = () => this;
}

/**
 * A computable provider that defers computation until compute() is called.
 * Accessing `.value` prior to compute is a developer error and will throw.
 */
class ComputableValue<T> implements ValueProvider<T> {
  constructor(public readonly getter: () => T) {}
  compute = () => new ComputedValue(this.getter());
  get value(): T {
    throw new Error(
      "UnstableValue: Must call compute() and use the returned provider's .value"
    );
  }
}

/**
 * Create a lazily-computed ValueProvider from a getter function.
 *
 * Example usage inside a class:
 *   private _age = lazy(() => expensiveComputeAge());
 *   get age(): number {
 *     this._age = this._age.compute();
 *     return this._age.value;
 *   }
 */
export function lazy<T>(getter: () => T): ValueProvider<T> {
  return new ComputableValue(getter);
}

export type { ComputedValue, ComputableValue };
