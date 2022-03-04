# Valentina: JavaScript object validation

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/shovon/valentina/blob/main/LICENSE)

_Valentina_ is a tiny library for validating JavaScript values. Whether they be primitives, such as strings and numbers, or modelling more complex objects, Valentina will empower you to express your data validation rules, your way.

**Killer Features:**

- no library lock-ins; hate this library? As long as the next library defines their own [`Validator`](https://github.com/shovon/valentina/blob/c56c15a5ddededc5ea69c6b7f96108a1b83ac8b1/lib.ts#L30-L36) type, you should be able to migrate to that other library very easily. Or, you can quickly write your own
- minimal and intuitive API, allowing for expressive JavaScript object schema and type definitions
- Powerful TypeScript support to infer static types from schema
- Composable validators, empowering you to define your own rules, your way
- zero dependencies
- install either via npm, or copy and paste the [`lib.ts`](https://raw.githubusercontent.com/shovon/valentina/main/lib.ts) file into your project

## Getting Started

Schema creation is done by creating a validator. Valentina has simple creators, that will allow you to define your overall schema.

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

// You create a whole schema validators by composing other smaller validators
let userSchema = object({
  name: string(),
  age: number(),
  address: optional(
    object({
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

A valdiator has a `validate` method, which you can invoke for the purposes of validating data.

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

// Simply defining `const str = result.value` will result in a compile-time
// error; type guards are used for casting purposes
```

These are the very basics that you can go off of, and start validating projects, without reading further.

## Usage Guide

The Valentina library was designed to be used for the purposes of validating incoming JSON data, whether they be from an HTTP request, an AJAX response, a WebSocket payload, etc.

```typescript
const data = await fetch(url).then((response) => response.json());

const validation = schema.validate(data);

if (validation.isValid) {
  const value = validation.value;
}
```

Valentina becomes especially powerful when larger `Validator`s are comprised from smaller reusable validators, that serve their own purpose. These validators can then be used across multiple larger validators.

### Installing

With Node.js, if you want to use a package manager with npm, then this library will work all of the following package managers:

- npm: `npm install valentina`
- Yarn: `yarn add valentina`
- pnpm: `pnpm add valentina`

### Tips and tricks

Below are some tricks you can use to make Valentina an even more powerful validation tool

#### Create custom validators by composing other validators

Valentina offers some basic validator creators, such as for strings, numbers, and booleans. However, it does not provide validators that can be creatd by composing the above validators. Here's an example: optional values. Valentina does not have a validator for that.

So let's say you wanted validation for an object with string fields that can be set to `undefined`, then a validator for that would look like so:

```typescript
either(string(), exact(undefined));
```

Let's generalize that validator, and have it be returned by a creator.

Such a function will look like so:

```typescript
const optional = <T>(validator: Validator<T>) =>
  either(validator, exact(undefined));
```

Same for nullable types:

```typescript
const nullable = <T>(validator: Validator<T>) => either(validator, exact(null));
```

And, if you wanted validation for fields that are both nullable and optional, then you can define something like this:

```typescript
const optionalNullable = <T>(validator: Validator<T>) =>
  nullable(optional(validator));
```

#### Custom validators and parsing values

## Design Philosophy

Valentina is written with three principles in mind:

- Atomic validators
- Validator composition
- Embrace language idioms

### Atomic Validators

> ##### Atomic
>
> _adjective_
>
> of or forming a single irreducible unit or component in a larger system.

The central idea is that complex validation rules can be built from the ground up out of [atomic](https://spin.atomicobject.com/2016/01/06/defining-atomic-object/) elements. Schema construction will happen through the _composition_ of one or more of these "atoms". The Valentina library's `Validator` is the type definition that serves as the "atom".

The definition of a `Validator` is simply:

```typescript
export type Validator<T> = {
  __outputType: T;
  validate: (value: any) => { isValid: false } | { value: T; isValid: true };
};
```

Any object of type `Validator` can implement the `validate` method in their own way. It can even invoke the `validate` method from another `Validator`.

In fact, as far as this library is concerned, you can define your `Validator`s not only by composing simpler validators defined in this library, but also by writing your own.

### Composition

Rather than relying on—arguably—complex configurations and validation engines, Valentina empowers you to define schemas by composing smaller validators.

Additionally, you can easily re-use smaller validators across larger schemas.

The the `either` creator is a good example of **validator composition\*\***. It allows you to define a validator for a value that could _either_ be a `string` or a `number`.

```typescript
const eitherStringOrNumber = either(string(), number());

eitherStringOrNumber.validate("10").isValid; // true
eitherStringOrNumber.validate(10).sValid; // true
eitherStringOrNumber.validate(true).sValid; // false
```

We can go even further. The `object` creator will allow us to compose multiple validators for the purposes of allowing us to validate a more complex schema

For instance, in an application that sends you a message that only contains _one_ user, or an _array_ of users, you only need to define a `User` schema once.

The following is the user schema:

```typescript
export const userSchema = object({
  id: string(),
  name: string(),
});
```

And here are the schemas for the `USER_JOINED` and `APPLICATION_STATE` messages. The first message represents the values of a single user that has joined and the second one represents the current state of the application, which will contain an array of all users.

```typescript
export const userJoined = object({
  type: exact("USER_JOINED"),
  data: userSchema,
});

export const applicationState = object({
  type: exact("APPLICATION_STATE"),
  data: arrayOf(userSchema),
});
```

None of the schema components are represented as a small part of a larger configuration object; instead they are all self-contained `Validator`s.

### Embrace JavaScript itself, and use idioms

Traditionally, validation libraries often resorted to abstracting away the minutiae behind JavaScript. According to those libraries, the idea is that JavaScript as a language is flawed, and those flaws need to be abstracted away.

Valentina, on the other hand, embraces the language.

At it's core, the power of Valentina is all encompassed by the following type definition:

```typescript
export type Validator<T> = {
  __outputType: T;
  validate: (value: any) => { isValid: false } | { value: T; isValid: true };
};
```

You don't even need to use Valentina. As long as you can define your own Validator, you can perform validations as you would with Valentina.

Alternatively, you can even write your own `Validator`s, and they will be 100% compatible with Valentina.

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

### `tuple<T>(validator: Validator<T>): Validator<{ [key: string]: V }>`

Creates a validator for validating an object and the individual _values_ (not field names) in said object.

Example:

```typescript
const objectValidator = tuple(string());

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

### `object<V extends object>(schema: { [key in keyof V]: Validator<V[key]> }): Validator<V>`

Given an object of Validators, creates a validator for an object, with validation for specific keys in the object.

Example:

```typescript

```

## Similar libraries

Valentina was inspired by [yup.js](https://github.com/jquense/yup). It's a good library, but Valentina's purpose is to limit the number of dependencies that JavaScript projects rely on
