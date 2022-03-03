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

## API

### `string(): Validator<string>`

Creates a validator for determining if a value is of type string.

For example:

```typescript
const strValidator = string();

// ✅ Evaluates to true
strValidator.validate("").isValid;

// ❌ Evaluates to false
strValidator.validate(10).isValid;
```

### `number(): Validator<number>`

Creates a validator for determining if a value is of type number.

For example:

```typescript
const numberValidator = number();

// ✅ Evaluates to true
numberValidator.validate(10).isValid;

// ❌ Evaluates to false
numberValidator.validate("").isValid;
```

### `boolean(): Validator<boolean>`

Creates a validator for determining if a value is of type boolean.

For example:

```typescript
const boolValidator = boolean();

// ✅ Evaluates to true
boolValidator.validate(true).isValid;

// ✅ Evaluates to true
boolValidator.validate(false).isValid;

// ❌ Evaluates to false
boolValidator.validate("").isValid;
```

### `either(...alts: Validator<any>[]): Validator<any>`

Creates a validator for determining if a value is of any of the types as outlined in the supplied set of validators.

So that means—for example—if you expect a value to be either of string, number, or boolean, you can use the `alternatives` function to create a validator to check for any of those types.

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

### `any(): Validator<any>`

Creates a validator that will evaluate all values as being valid.

For example:

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

### `arrayOf<T>(validator: Validator<T>[]): Validator<T[]>`

Creates

For example:

```typescript
const alternativesValidator = arrayOf(string());
// The resulting validator will be of type Validator<boolean | string | number>

// ✅ Evaluates to true
alternativesValidator.validate([]).isValid;

// ✅ Evaluates to true
alternativesValidator.validate(["cool"]).isValid;

// ✅ Evaluates to true
alternativesValidator.validate(["foo", "bar"]).isValid;

// ✅ Evaluates to true
alternativesValidator.validate(["sweet"]).isValid;

// ❌ Evaluates to false
boolValidator.validate({}).isValid;

// ❌ Evaluates to false
boolValidator.validate([1, 2, 3]).isValid;
```
