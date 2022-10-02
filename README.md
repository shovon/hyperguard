# Ninazu: JavaScript object validation

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/shovon/valentina/blob/main/LICENSE) [![npm version](https://badge.fury.io/js/valentina.svg)](https://badge.fury.io/js/valentina) [![CircleCI](https://circleci.com/gh/shovon/valentina/tree/main.svg?style=svg)](https://circleci.com/gh/shovon/valentina/tree/main) [![Gitter](https://badges.gitter.im/valentina-validation/community.svg)](https://gitter.im/valentina-validation/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

_ninazu_ is a tiny library for validating JavaScript values. Whether they be primitives, such as strings and numbers, or modelling more complex objects, Ninazu will empower you to express your data validation rules, your way.

**Killer Features:**

- clear and transparent API, with no hidden surprises
- minimal and intuitive API, allowing for expressive JavaScript object schema and type definitions
- Powerful TypeScript support to infer static types from schema
- Composable validators, empowering you to define your own rules, your way
- zero dependencies
- install either via npm, or copy and paste the [`lib.ts`](https://raw.githubusercontent.com/shovon/valentina/main/lib.ts) (or [`dist/lib.js`](https://raw.githubusercontent.com/shovon/valentina/main/dist/lib.js) for JavaScript) file into your project
- no library lock-ins. So you used this library for a day, and now you hate it? As long as the next library defines their own [`Validator`](https://github.com/shovon/valentina/blob/c56c15a5ddededc5ea69c6b7f96108a1b83ac8b1/lib.ts#L30-L36) type, you should be able to migrate to that other library very easily. Or, you can quickly write your own

## Getting Started

Schema creation is done by creating a validator. Ninazu has simple creators, that will allow you to define your overall schema.

```typescript
import {
  object,
  string,
  number,
  InferType,
  either,
  Validator,
} from "ninazu";

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
  - [Installing](#installing)
    - [npm (Node.js, Webpack, Vite, Browserify, or any other that use npm)](#npm-nodejs-webpack-vite-browserify-or-any-other-that-use-npm)
      - [Importing via CommonJS require](#importing-via-commonjs-require)
      - [Importing via Node.js' ECMAScript module (import statement)](#importing-via-nodejs-ecmascript-module-import-statement)
    - [Deno](#deno)
    - [Browser via import statement (dist/esm/lib.js)](#browser-via-import-statement-distesmlibjs)
  - [Example application](#example-application)
  - [Tips and tricks](#tips-and-tricks)
    - [Recursive types](#recursive-types)
    - [Create custom validators by composing other validators](#create-custom-validators-by-composing-other-validators)
    - [Custom validators and parsing values](#custom-validators-and-parsing-values)
- [Design Philosophy](#design-philosophy)
  - [Atomic Validators](#atomic-validators)
  - [Composition](#composition)
  - [Embrace JavaScript itself; use idioms](#embrace-javascript-itself-use-idioms)
  - [Clarity and transparency](#clarity-and-transparency)
  - [Power to the client](#power-to-the-client)
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

The Ninazu library was designed to be used for the purposes of validating incoming JSON data, whether they be from an HTTP request, an AJAX response, a WebSocket payload, etc.

```typescript
const data = await fetch(url).then((response) => response.json());

const validation = schema.validate(data);

if (validation.isValid) {
  const value = validation.value;
}
```

Ninazu becomes especially powerful when larger `Validator`s are comprised from smaller reusable validators, that serve their own purpose. These validators can then be used across multiple larger validators.

### Installing

By design, Ninazu places you under **no obligation** to use any package manager; you most certainly can copy and paste either [`lib.ts`](https://github.com/shovon/ninazu/blob/main/lib.ts) for TypeScript, [`dist/lib.js`](https://github.com/shovon/valentina/blob/main/dist/lib.js) for CommonJS (require), or [`dist/esm/lib.js`](https://github.com/shovon/ninazu/blob/main/dist/esm/lib.js) for importing via the `import` statement.

With that said, you are certainly more than welcomed to use a package manager, especially since it will allow you to easily upgrade, without the possibility of errors while copying and pasting.

#### npm (Node.js, Webpack, Vite, Browserify, or any other that use npm)

If you are using Node.js or a bundler that uses npm, Ninazu has been published to npm for your convenience. You can install using your preferred package manager. For example:

- npm: `npm install ninazu`
- Yarn: `yarn add ninazu`
- pnpm: `pnpm add ninazu`

Additional, for the JavaScript CommonJS code, transpilers should not be needed. However if you are having trouble importing Ninazu into your bundler (Webpack, Vite, Browserify, etc.), then please do [open a new issue](https://github.com/shovon/ninazu/issues), and I will investigate.

##### Importing via CommonJS `require`

Once installed, you should be able to import the module via CommonJS `require`, like so:

```javascript
const parseValidate = require("ninazu");
```

##### Importing via Node.js' ECMAScript module (`import` statement)

In a Node.js `mjs` file, you can simply import using the `import` syntax.

```javascript
import * as parseValidate from "ninazu";
```

#### Deno

With Deno, you can directly import the `lib.ts` file from GitHub.

```typescript
import * as parseValidate from "https://raw.githubusercontent.com/shovon/ninazu/main/lib.ts";
```

#### Browser via `import` statement (dist/esm/lib.js)

> **Warning**
>
> The `dist/lib.js` file will not work in browsers!
>
> **You must use the `dist/esm/lib.js` file instead!**

**Option 1: Checking in an original copy of lib.js file into your project**

Download or copy & paste the ECMAScript module located in [`dist/esm/lib.js`](). Optionally, you can also grab a copy of the sourcemap file at [`dist/esm/lib.js.map`]() for debugging purposes.

```html
<!-- Minified -->
<script type="module">
  import * as parseValidate from "/path/to/ninazu/lib.js";
</script>
```

> **Hot Tip**
>
> If you want a minified version, you can download it from this URL:
>
> https://cdn.jsdelivr.net/npm/ninazu@latest/dist/esm/lib.min.js

**Option 2: Importing from npm (via jsDelivr)**

If you don't want to download, and you just want to give the library a try, then you can link directly to jsDelivr.

```html
<script type="module">
  import * as valentina from "https://cdn.jsdelivr.net/npm/ninazu@latest/dist/esm/lib.js";
</script>
```

Alternatively, if you want the minified version, you can simply add a `.min` after the `/lib`, and before the `.js`:

```html
<script type="module">
  import * as valentina from "https://cdn.jsdelivr.net/npm/ninazu@latest/dist/esm/lib.min.js";
</script>
```

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

  // Compositon from another schema
  data: userSchema,
});

export type UserJoined = InferType<typeof userJoinedSchema>;

// APPLICATION_STATE

export const applicationStateSchema = object({
  type: exact("APPLICATION_STATE"),

  // Compositon from another schema
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

For a full example, take a look at the [example project](https://github.com/shovon/ninazu/tree/main/example).

### Tips and tricks

Below are some tricks you can use to make Ninazu an even more powerful validation tool.

#### Recursive types

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

Ninazu offers some basic validator creators, such as for strings, numbers, and booleans. But, if you wanted to create your own validator creator for other purposes, you certainly can. Here's an example: optional values.

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

For instance, the JSON standard does not have a data type for `Date`s. You can create a validator that will parse a string, and convert it to a JavaScript date.

```typescript
import {
  chain,
  transform,
  predicate,
  replaceError,
  string,
  ValidationError,
} from "ninazu";

class DateError extends ValidationError {
  constructor(value: string) {
    super(
      "Date error",
      `The supplied string ${value} was not a valid format that can be parsed into a Date`,
      value
    );
  }
}

export const date = () =>
  replaceError(
    predicate(
      chain(
        string(),
        transform((value) => new Date(value))
      ),
      (d) => isNaN(d.getTime())
    ),
    (value) => new DateError(value)
  );
```

From which you can try to derive a date from a string.

Example:

```typescript
const valid = new Date(new Date().toISOString());

const shouldBeValid = date().validate(validDate);

if (valid.isValid) {
  valid.value; // This is the value
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

> **Note**
>
> In the above example, we created a custom error class called `DateError`, by deriving ninazu's `ValidationError` class.
>
> By the definition of the `error` field in `ValidationResult<T>`, you don't have to use a class. You can simply initialize an object with the appropriate fileds.
>
> So in the above example, you could have simply defined a function, that returns an object, that has the appropriate fields.
>
> For example.
>
> ```typescript
> function createDateError(value: string) {
>   return {
>     type: "Date error",
>     errorMessage: `The supplied string ${value} was not a valid format that can be parsed into a Date`,
>     value,
>   };
> }
> ```
>
> The above would have been a perfectly valid error object.
>
> With that said, using `ValidationError` provides the added advantage of capturing the call stack, allowing for easier debuggability, or even observability (if you were to also serialize the call stack that is, by getting it from error.stack).

## Design Philosophy

Ninazu is written with five principles in mind:

- Atomic validators
- Validator composition
- Embrace the language; use idioms
- Clarity and transparency
- Power to the client

### Atomic Validators

> **Atomic**
>
> _adjective_
>
> of or forming a single irreducible unit or component in a larger system.

The central idea is that complex validation rules can be built from the ground up out of [atomic](https://spin.atomicobject.com/2016/01/06/defining-atomic-object/) elements. Schema construction will happen through the _composition_ of one or more of these "atoms". The Ninazu library's `Validator` is the type definition that serves as the "atom".

The definition of a `Validator` is simply:

```typescript
export type Validator<T> = {
	validate: (value: any) => ValidationResult<T>;
};

export type ValidationFailure = { isValid: false; error: IValidationError };
export type ValidationSuccess<T> = { value: T; isValid: true };

export type ValidationResult<T> = ValidationFailure | ValidationSuccess<T>;

export type IValidationError = {
	readonly type: string;
	readonly errorMessage: string;
	readonly value: any;
} & { [key: string]: any };
```

Any object of type `Validator` can implement the `validate` method in their own way. It can even invoke the `validate` method from another `Validator`.

In fact, as far as this library is concerned, you can define your `Validator`s not only by composing simpler validators defined in this library, but also by writing your own.

### Composition

Rather than relying on—arguably—complex configurations and validation engines, Ninazu empowers you to define schemas by composing smaller validators.

Additionally, you can easily re-use smaller validators across larger schemas.

The `either` creator is a good example of **validator composition**. It allows you to define a validator for a value that could _either_ be a `string` or a `number`.

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

> **Side note**
>
> Notice that the function composition chain becomes cumbersome?
>
> You can potentially abstract those compositions away, to hide the inherent ugliness of it, but what would be even more awesome is if JavaScript supported the [pipelining operator](https://2ality.com/2022/01/pipe-operator.html).
>
> **Part of the reason why this library exists is to nudge the [TC39](https://tc39.es/) to actually approve the [proposed JavaScript pipeline operator](https://github.com/tc39/proposal-pipeline-operator)**

### Embrace JavaScript itself; use idioms

Traditionally, validation libraries often resorted to abstracting away the minutiae behind JavaScript. According to those libraries, the idea is that JavaScript as a language is flawed, and those flaws need to be abstracted away.

**Ninazu, on the other hand, embraces JavaScript.**

At it's core, the power of Ninazu is all encompassed by the following type definitions:

```typescript
export type Validator<T> = {
	validate: (value: any) => ValidationResult<T>;
};

export type ValidationFailure = { isValid: false; error: IValidationError };
export type ValidationSuccess<T> = { value: T; isValid: true };

export type ValidationResult<T> = ValidationFailure | ValidationSuccess<T>;

export type IValidationError = {
	readonly type: string;
	readonly errorMessage: string;
	readonly value: any;
} & { [key: string]: any };
```

> The `__` is only used for TypeScript type casting. You don't actually need \*\* in the actual JavaScript Validator object

You don't even need to use Ninazu. As long as you can define your own Validator, you can perform validations as you would with Ninazu.

Alternatively, you can even write your own `Validator`s, and they will be 100% compatible with Ninazu.

### Clarity and transparency

This library does away with configurations. And thus, behaviour is never redefined using booleans, or other configuration options.

This makes behaviours of each validator creators testable and predictable.

Additionally, results from validation will be easily inspectable, and serializable into JSON via `JSON.stringify`.

### Power to the client

Want to go beyond what this library has to offer? You're in luck. Ninazu won't lock you into using a quazi-proprietary `addMethod` function. You are free to create your own validators.

Better yet, these validators can be used beyond just validation; but also data transformation.

For instance, if you have a string that represents a timestamp, you can convert the string to a JavaScript `Date`.

```typescript
import { ValidationError } from "ninazu";

class DateError extends ValidationError {
  constructor(value: string) {
    super(
      "Date error",
      `The supplied string ${value} was not a valid format that can be parsed into a Date`,
      value
    );
  }
}

export const date = (): Validator<Date> => ({
  __: new Date(),
  validate: (value: any) => {
    const validation = string().validate(value);
    if (validation.isValid === false) {
      return { isValid: false, error: validation.error };
    }
    const d = new Date(validation.value);
    return isNaN(d.getTime())
      ? {
          isValid: false,
          error: new DateError(validation.value),
        }
      : { isValid: true, value: d };
  },
});
```

You can then use the `date` validator creator to parse strings into a `Date`.

```typescript
const validation = date().validate("2022-03-04T23:44:42.086Z");
if (validation.isValid) {
  // validation.value should be a Date, and not a string
}
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

If your application has data, whose schema comes in a tree-like structure (recursive type), then you can use the `lazy` validator, so that your schema can work.

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

### `transform<T>(parse: (value: any) => T): Validator<T>`

Given a parser function, parses the input object into an output object.

```typescript
const json = transform<any>(JSON.parse.bind(JSON));

const result1 = json.validate("1");
if (result1.isValid) {
  // We get the JavaScript Number `1`
  result1.value;
}

const emptyStr = json.validate("\"\"");
if (emptyStr.isValid) {
  // We get the JavaScript string `""`
  emptyStr.value;
}
```

#### Motivation and usage

The core of Ninazu's philosophy is that not only should we validate inputs, but also apply necessary transformations from them.

In this case, not only are we expecting a string, but the string should also be a valid JSON string. From which, we should be able to parse it into a JavaScript object.

This pattern is especially powerful when combined with the `chain` validator.

### `chain<T1, T2>(left: Validator<T1>, right: Validator<T2>): Validator<T2>`

Takes two other validators, to create a new validator where the left validation is run, then the right one shortly afterwards.

```typescript
const date = chain(
  either(string(), number()),
  transform((value) => new Date(value))
);

// ✅ Evaluates to true
date.validate('2020-10-10').isValid

// ✅ Evaluates to true
date.validate(10).isValid
```

### `fallback<T1, T2>(validator: Validator<T1>, getFallback: () => T2)`

Takes a validator, and a function to return a default fallback value, and gives a validator that will never fail.


```typescript
const alwaysNumber = fallback(number(), () => 42);

// ✅ Evaluates to true
fallback.validate(10); 

const fallbackValidation = fallback.validate("10");

// ✅ Evaluates to true, even if the supplied input is a string
if (fallbackValidation.isValid) {

  // Will evaluate to `42`, since `"10"` is a string, not a number/
  fallbackValidation.value;
}
```

#### Motivation and usage

In many instances, you just don't want validations to fail, and bite the bullet and just set a default value.


### `predicate<T>(validator: Validator<T>, pred: (value: T) => boolean)`

Accepts a validator, and a predicate function. Validation will first run the input against the validator, then check against the predicate. If the predicate fails, then, we will get a failed validation.

```typescript
const even = predicate(number(), (value) => value % 2 === 0);

// ✅ Evaluates to true
even.validate(2).isValid;

// ✅ Evaluates to true
even.validate(4).isValid;

// ❌ Evaluates to false
even.validate(3).isValid;
```

### `replaceError<T>(validator: Validator<T>, createError: (value: any, error: IValidationError) => IValidationError): Validator<T>`

Given the original validator, whatever error is emitted by it, replace by the error as returned by the `createError` callback function.

```typescript
const withDifferentError = replaceError(string(), (value) => ({
  type: 'Custom error',
  errorMessage: 'Some custom error',
  value
}));

if (!validator.validate(10).isValid) {
  // This is where the error will be.
  validator.error;
}
```

## Similar libraries

Ninazu was inspired by [yup.js](https://github.com/jquense/yup). It's a good library, but Ninazu's purpose is to limit the number of dependencies that JavaScript projects rely on
