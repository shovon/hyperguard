# Valentina: JavaScript object validation

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/shovon/valentina/blob/main/LICENSE)

_Valentina_ is a tiny library for validating JavaScript values. Whether they be primitives, such as strings and numbers, or modelling more complex objects, Valentina will empower you to express your data validation rules, your way.

**Killer Features:**

- no library lock-ins. So you used this library for a day, and hate it? As long as the next library defines their own [`Validator`](https://github.com/shovon/valentina/blob/c56c15a5ddededc5ea69c6b7f96108a1b83ac8b1/lib.ts#L30-L36) type, you should be able to migrate to that other library very easily. Or, you can quickly write your own
- minimal and intuitive API, allowing for expressive JavaScript object schema and type definitions
- Powerful TypeScript support to infer static types from schema
- Composable validators, empowering you to define your own rules, your way
- zero dependencies
- install either via npm, or copy and paste the [`lib.ts`](https://raw.githubusercontent.com/shovon/valentina/main/lib.ts) (or [`lib.js`](https://github.com/shovon/valentina/blob/main/dist/lib.js) for JavaScript) file into your project

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

A validator has a `validate` method, which you can invoke for the purposes of validating data.

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

These are the very basics that you can go off of, and start validating your data.

## Table of Contents

- [Usage Guide](#usage-guide)
  - [Example application](#example-application)
  - [Installing](#installing)
  - [Tips and tricks](#tips-and-tricks)
    - [Recursive types (for TypeScript)](#recursive-types-for-typescript)
    - [Create custom validators by composing other validators](#create-custom-validators-by-composing-other-validators)
    - [Custom validators and parsing values](#custom-validators-and-parsing-values)
- [Design Philosophy](#design-philosophy)
  - [Atomic Validators](#atomic-validators) \* [Atomic](#atomic)
  - [Composition](#composition)
  - [Embrace JavaScript itself, and use idioms](#embrace-javascript-itself-and-use-idioms)
- [API](#api)
  - [string(): Validator&lt;string&gt;](#string-validatorstring)
  - [number(): Validator&lt;number&gt;](#number-validatornumber)
  - [boolean(): Validator&lt;boolean&gt;](#boolean-validatorboolean)
  - [exact&lt;V extends string | number | boolean | null | undefined&gt;(expected: V): Validator&lt;V&gt;](#exactv-extends-string--number--boolean--null--undefinedexpected-v-validatorv)
  - [either(...alts: Validator&lt;any&gt;[]): Validator&lt;any&gt;](#eitheralts-validatorany-validatorany)
  - [arrayOf&lt;T&gt;(validator: Validator&lt;T&gt;): Validator&lt;T[]&gt;](#arrayoftvalidator-validatort-validatort)
  - [any(): Validator&lt;any&gt;](#any-validatorany)
    - [Usage](#usage)
  - [objectOf&lt;T&gt;(validator: Validator&lt;T&gt;): Validator&lt;{ [key: string]: V }&gt;](#objectoftvalidator-validatort-validator-key-string-v-)
  - [tuple&lt;T&gt;(validator: Validator&lt;T&gt;): Validator&lt;{ [key: string]: V }&gt;](#tupletvalidator-validatort-validator-key-string-v-)
  - [except&lt;T, I&gt;(validator: Validator&lt;T&gt;, invalidator: Validator&lt;I&gt;): Exclude&lt;T, I&gt;](#exceptt-ivalidator-validatort-invalidator-validatori-excludet-i)
    - [Usage](#usage-1)
  - [object&lt;V extends object&gt;(schema: { [key in keyof V]: Validator&lt;V[key]&gt; }): Validator&lt;V&gt;](#objectv-extends-objectschema--key-in-keyof-v-validatorvkey--validatorv)
  - [lazy&lt;V&gt;(schemaFn: () =&gt; Validator&lt;V&gt;): Validator&lt;V&gt;](#lazyvschemafn---validatorv-validatorv)
    - [Motivation and usage](#motivation-and-usage)
- [Similar libraries](#similar-libraries)

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

### Example application

Our chat application will have four events:

- user joined
- user left
- application state
- message sent

The user object will have two fields: `id` and a `name`.

```typescript
export const userSchema = object({
  id: string(),
  name: string(),
});

export type User = InferType<typeof userSchema>;
/**
// Will be defined as
type User = {
  id: string
  name: string
}
*/
```

Both the "user joined" event and the "application state" event will have a `User` type somewhere in their definition

Let's define the "user joined" event.

```typescript
import { userSchema } from "./User";

// USER_JOINED

export const userJoinedSchema = object({
  type: exact("USER_JOINED"),

  // Composing a smaller `userSchema`
  data: userSchema,
});

export type UserJoined = InferType<typeof userJoinedSchema>;

// APPLICATION_STATE

export const applicationStateSchema = object({
  type: exact("APPLICATION_STATE"),

  // Composing a smaller `userSchema`
  data: arrayOf(userSchema),
});

export type ApplicationState = InferType<typeof applicationStateSchema>;

export const userLeftSchema = object({
  type: exact("USER_LEFT"),
  data: object({
    id: string(),
  }),
});

export type UserLeft = InferType<typeof userLeftSchema>;
```

And then, when a message was broadcast, the sent message from the server could have the following schema:

```typescript
export const messageReceivedSchema = object({
  type: exact("MESSAGE_RECEIVED"),
  data: object({
    from: string(),
    whenSent: string(),
    messageBody: string(),
  }),
});

export type MessageReceived = InferType<typeof messageReceivedSchema>;
```

And finally, you can consolidate all events into a single schema, by using the `either` validator.

```typescript
export const eventSchema = either(
  applicationStateSchema,
  userJoinedSchema,
  userLeftSchema,
  messageReceivedSchema
);

export type Event = InferType<typeof eventSchema>;
```

Then, the application can handle events like so:

```typescript
function handleMessage(value: Event) {
  switch (value.type) {
    case "USER_JOINED":
      break;
    case "APPLICATION_STATE":
      break;
    case "USER_LEFT":
      break;
    case "MESSAGE_RECEIVED":
      break;
    default:
      console.error("Unknown type");
      break;
  }
}
```

For a full example, take a look at the [example project](https://github.com/shovon/valentina/tree/main/example).

### Installing

With Node.js, if you want to use a package manager with npm, then this library will work all of the following package managers:

- npm: `npm install valentina`
- Yarn: `yarn add valentina`
- pnpm: `pnpm add valentina`

### Tips and tricks

Below are some tricks you can use to make Valentina an even more powerful validation tool.

#### Recursive types (for TypeScript)

If your application has data, whose schema comes in a tree-like structure (recursive type), then you can use the `lazy` validator, so that your schema can work with TypeScript.

```typescript
type Node = {
  value: any;
  left: Node | null;
  right: Node | null;
};

const nodeSchema: Validator<Node> = lazy<Node>(() => {
  object({
    value: any(),
    left: either(node, exact(null)),
    right: either(node, exact(null)),
  });
});
```

#### Create custom validators by composing other validators

Valentina offers some basic validator creators, such as for strings, numbers, and booleans. But, if you wanted to create your own validator creator for other purposes, you certainly can. Here's an example: optional values.

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

A validator doesn't need to exclusively be for validation, but it can also be used for transforming incoming data.

For instance, the JSON standard does not have a data type for `Date`s. You can create a validator that will parse a string, and convert it to a JavaScript date

```typescript
export const date = (): Validator<Date> => ({
  __: new Date(),
  validate: (value: any) => {
    const validation = string().validate(value);
    if (!validation.isValid) {
      return { isValid: false };
    }
    const d = new Date();
    return isNaN(d.getTime())
      ? { isValid: false }
      : { isValid: true, value: d };
  },
});
```

From which you can try to derive a date from a string.

Example:

```typescript
const valid = new Date(new Date().toISOString());

const shouldBeValid = date().validate(validDate);

if (valid.isValid) {
  // Given the above `valid
}

const invalid = new Date("invalid");

const shouldBeInvalid;
```

It gets even better. The above validator will have its type inferred as a `Date`.

```typescript
const dateSchema = date();

type CustomDate = InferType<typeof dateSchema>;
// type CustomDate = Date;
```

And, when used in a larger schema, it can be defined as something

## Design Philosophy

Valentina is written with three principles in mind:

- Atomic validators
- Validator composition
- Embrace the language, and use idioms

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
  __: T;
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
  __: T;
  validate: (value: any) => { isValid: false } | { value: T; isValid: true };
};
```

> The `__` is only used for TypeScript type casting. You don't actually need \*\* in the actual JavaScript Validator object

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
> Due to a limitation in TypeScript, we are unable derive a subset of an "unbounded" type. For example, `Exclude<string, "but">` (set of all strings except for the string `"but"`) will merely evaluate to `string`. Likewise, `Exclude<any, undefined>` will simply evaluate to `any`.

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
const objValidator = object({
  type: exact("SOME_OBJ"),
  value: string(),
  someNumber: number(),
  somethingOptional: either(string(), exact(undefined)),
});

// ✅ Evaluates to true
objValidator.validate({ type: "SOME_OBJ", value: "something", someNumber: 10 })
  .isValid;

// ✅ Evaluates to true
objValidator.validate({
  type: "SOME_OBJ",
  value: "something",
  someNumber: 10,
  sometihingOptional: "sweet",
}).isValid;

// ✅ Evaluates to true
objValidator.validate({ type: "SOME_OBJ", value: "something", someNumber: 10 })
  .isValid;

// ❌ Evaluates to false (the field `type` is set to something other than
// `SOME_OBJ`)
objValidator.validate({ type: "something", value: "something", someNumber: 10 })
  .isValid;
```

### `lazy<V>(schemaFn: () => Validator<V>): Validator<V>`

The lazy validator allows you to wrap another validator in a callback.

```typescript
const everythingButValidator = lazy(() => except(string(), exact("but")));

// ✅ Evaluates to true
everythingButValidator.validate("apples").isValid;

// ✅ Evaluates to true
everythingButValidator.validate("bananas").isValid;

// ✅ Evaluates to true
everythingButValidator.validate("cherries").isValid;

// ❌ Evaluates to false
everythingButValidator.validate("but").isValid;
```

#### Motivation and usage

If your application has data, whose schema comes in a tree-like structure (recursive type), then you can use the `lazy` validator, so that your schema can work with TypeScript.

```typescript
type Node = {
  value: any;
  left: Node | null;
  right: Node | null;
};

const nodeSchema: Validator<Node> = lazy<Node>(() => {
  object({
    value: any(),
    left: either(node, exact(null)),
    right: either(node, exact(null)),
  });
});
```

## Similar libraries

Valentina was inspired by [yup.js](https://github.com/jquense/yup). It's a good library, but Valentina's purpose is to limit the number of dependencies that JavaScript projects rely on
