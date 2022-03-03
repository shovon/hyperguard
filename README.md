# Valentina: JavaScript object validation

_Valentina_ is a tiny library for validating JavaScript values. Whether they be primitives, such as strings and numbers, or modelling more complex objects, Valentina will empower you to express your data validation rules, your way.

**Killer Features:**

- minimal and intuitive API, allowing for expressive JavaScript object schema and type definitions
- Powerful TypeScript support to infer static types from schema
- Composable validators, empowering you to define your own rules, your way
- zero dependencies
- install either via npm, or copy and paste the `lib.ts` file into your project

## Getting Started

The core idea of Valentina is that you create a `Validator`, and you can compose multiple such `Validator`s to define an elaborate validation rule, or define your own `Validator` creator.

Additonally, the correct type can even be inferred from the `Validator`, using `InferType`.

```typescript
import {
  object,
  string,
  number,
  InferType,
  either,
  Validator,
} from "valentina";

// Create a validator that allows for values to be set to `undefined`
const optional = <T>(validator: Validator<T>) =>
  either(validator, exact(undefined));

let userSchema = object({
  name: string(),
  age: number(),
  address: either(
    optional({
      apartment: optional(string()),
      streetNumber: string(),
      streetName: string(),
    })
  ),
});

type User = InferType<typeof userSchema>;
/*
type User = {
  name: string
  age: number
  address: {
    apartment: string | undefined
    streetNmber: string
    streetName: string
  } | undefined
}
*/
```

We can then invoke the `Validator<T>.validate` method for validating a value:

```typescript
const data: any = {
  name: "Jane",
  age: 31,
  address: { streetNumber: "123", streetName: "Peaceful Blvd" },
};

const result = userSchema.validate(data);

result.isValid;
// Will be 'true'

// In TypeScript, to cast the above `data` into a `user`, use a type guard
let user: User;
if (result.isValid) {
  user = result.value;
}

// Simply defining `const str = result.value` will be a compile-time error;
// type guards are used precisely for casting purposes
```

## Design Philosophy

Fundamentally, this library should not even exist. You merely need to define the following three types in your TypeScript project.

```typescript
export type ValidationResult<T> =
  | { isValid: false }
  | { value: T; isValid: true };

export type Validator<T> = {
  __outputType: T;
  validate: (value: any) => ValidationResult<T>;
};

export type InferType<T extends Validator<any>> = T["__outputType"];
```

## API

### `string(): Validator<string>`

Creates a validator for determining if a value is of type string.

Example:

```typescript
const strValidator = string();

// ✅ Evaluates to true
strValidator.validate("").isValid;

// ❌ Evaluates to false
strValidator.validate(10).isValid;
```

### `number(): Validator<number>`

Creates a validator for determining if a value is of type number.

Example:

```typescript
const numberValidator = number();

// ✅ Evaluates to true
numberValidator.validate(10).isValid;

// ❌ Evaluates to false
numberValidator.validate("").isValid;
```

### `boolean(): Validator<boolean>`

Creates a validator for determining if a value is of type boolean.

Example:

```typescript
const boolValidator = boolean();

// ✅ Evaluates to true
boolValidator.validate(true).isValid;

// ✅ Evaluates to true
boolValidator.validate(false).isValid;

// ❌ Evaluates to false
boolValidator.validate("").isValid;
```

### `exact<V extends string | number | boolean | null | undefined>(expected: V): Validator<V>`

Creates a validator that checks to see if the value exactly mathes the expected value passed in as the function's parameter.

Example:

```typescript
const helloValidator = exact("hello");

// ✅ Evaluates to true
helloValidator.validate("hello").isValid;

// ❌ Evaluates to false
helloValidator.validate("").isValid;
```

### `either(...alts: Validator<any>[]): Validator<any>`

Creates a validator for determining if a value is of any of the types as outlined in the supplied set of validators. In other words, you want a _union_ of possible types.

So that means—for example—if you expect a value to be _either_ of string, number, or boolean, you can use the `either` function to create a validator to check for any of those types.

Example:

```typescript
const eitherValidator = either(boolean(), string(), number());
// The resulting validator will be of type Validator<boolean | string | number>

// ✅ Evaluates to true
eitherValidator.validate(true).isValid;

// ✅ Evaluates to true
eitherValidator.validate(false).isValid;

// ✅ Evaluates to true
eitherValidator.validate("").isValid;

// ✅ Evaluates to true
eitherValidator.validate(10).isValid;

// ❌ Evaluates to false
boolValidator.validate({}).isValid;
```

### `arrayOf<T>(validator: Validator<T>): Validator<T[]>`

Creates a validator for validating an array and the individual values that the array holds

Example:

```typescript
const arrayValidator = arrayOf(string());
// The resulting validator will be of type Validator<string[]>

// ✅ Evaluates to true
arrayValidator.validate([]).isValid;

// ✅ Evaluates to true
arrayValidator.validate(["cool"]).isValid;

// ✅ Evaluates to true
arrayValidator.validate(["foo", "bar"]).isValid;

// ✅ Evaluates to true
arrayValidator.validate(["sweet"]).isValid;

// ❌ Evaluates to false
arrayValidator.validate({}).isValid;

// ❌ Evaluates to false
arrayValidator.validate([1, 2, 3]).isValid;
```

### `any(): Validator<any>`

Creates a validator that will evaluate all values as being valid.

Example:

```typescript
const anyValidator = any();
// Resulting in a validator that will be of type `Validator<any>`

// ✅ Evaluates to true
anyValidator.validate(true).isValid;

// ✅ Evaluates to true
anyValidator.validate(false).isValid;

// ✅ Evaluates to true
anyValidator.validate("").isValid;

// ✅ Evaluates to true
anyValidator.validate(10).isValid;

// ✅ Evaluates to true
anyValidator.validate(null).isValid;
```

#### Usage

`any()` is especially useful in conjunction with [`arrayOf()`](#). `arrayOf` checks not only if a value is an array, but it will also validate the individual items in said array. If you merely want an array, without checking any of the values, then `any()` comes handy.

```typescript
const arrayValidator = arrayOf(any());

// ✅ Evaluates to true
arrayValidator.validate([]).isValid;

// ✅ Evaluates to true
arrayValidator.validate([1, 2, 3]).isValid;

// ✅ Evaluates to true
arrayValidator.validate(["a", "b", "c"]).isValid;

// ✅ Evaluates to true
arrayValidator.validate([true, 1, "2", {}]).isValid;

// ❌ Evaluates to false
arrayValidator.validate(10).isValid;

// ❌ Evaluates to false
arrayValidator.validate(null).isValid;
```

### `objectOf<T>(validator: Validator<T>): Validator<{ [key: string]: V }>`

Creates a validator for validating an object and the individual _values_ (not field names) in said object.

Example:

```typescript
const objectValidator = objectOf(string());

// ✅ Evaluates to true
objectValidator.validate([]).isValid;

// ✅ Evaluates to true
objectValidator.validate(["cool"]).isValid;

// ✅ Evaluates to true
objectValidator.validate(["foo", "bar"]).isValid;

// ✅ Evaluates to true
objectValidator.validate(["sweet"]).isValid;

// ❌ Evaluates to false
objectValidator.validate({}).isValid;

// ❌ Evaluates to false
objectValidator.validate([1, 2, 3]).isValid;
```

### `except<T, I>(validator: Validator<T>, invalidator: Validator<I>): Exclude<T, I>`

Given two `Validator`s—one acting as a "validator" and another as an "invalidator"—the function `except` creates a `Validator` that determines it is indeed a value in accordance to the _validator_, _except_ something defined by the supplied *in*validator.

Example:

```typescript
const everythingButValidator = except(string(), exact("but"));

// ✅ Evaluates to true
everythingButValidator.validate("apples").isValid;

// ✅ Evaluates to true
everythingButValidator.validate("bananas").isValid;

// ✅ Evaluates to true
everythingButValidator.validate("cherries").isValid;

// ❌ Evaluates to false
everythingButValidator.validate("but").isValid;
```

> **Note**
>
> Due to a limitation in TypeScript, we are unable derive a subset of an "infinite" type. For example, `Exclude<string, "but">` (set of all strings except for the string `"but"`) will merely evaluate to `string`. Likewise, `Exclude<any, undefined>` will simply evaluate to `any`.

#### Usage

In some instances, it may not matter the exact content of a value, so long as it is not undefined. The `except` function can create a `Validator` that checks for any value that isn't undefined.

```typescript
const notUndefinedValidator = except(any(), exact(undefined));

// ✅ Evaluates to true
notUndefinedValidator.validate("cool").isValid;

// ✅ Evaluates to true
notUndefinedValidator.validate(19).isValid;

// ✅ Evaluates to true
notUndefinedValidator.validate([]).isValid;

// ❌ Evaluates to false
notUndefinedValidator.validate(undefined).isValid;
```
