# Hyperguard: TypeScript object validation

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/shovon/hyperguard/blob/main/LICENSE) ![Hyperguard version](https://img.shields.io/npm/v/hyperguard) [![CircleCI](https://circleci.com/gh/shovon/hyperguard/tree/main.svg?style=svg)](https://circleci.com/gh/shovon/hyperguard/tree/main)

_Hyperguard_ is a tiny, zero-dependency library for validating JavaScript and TypeScript values. You build schemas by composing small validators. Your types are inferred for free, your validators double as parsers, and nothing ever locks you in.

**Killer Features:**

- **Tiny and zero-dependency**. The whole library is a single file you can read in one sitting
- **Type inference built in**. Derive your static TypeScript types straight from a schema with `InferType`, no duplication
- **Composable by design** . Build complex schemas out of small validators, and write your own whenever you need to
- **Validators are also parsers**. Transform values as you validate them (an ISO string into a `Date`, say)
- **Plain, serializable results**. Validation returns a simple discriminated union you can inspect or `JSON.stringify` and send over the wire
- **No lock-in**. Every validator is just [an object with a `validate` method](#validator), so moving to (or away from) Hyperguard is trivial

New here? Head to [Getting Started](#getting-started).

## Getting Started

Schema creation is done by creating a validator. Hyperguard has simple creators, that will allow you to define your overall schema.

```typescript
import {
  object,
  string,
  number,
  exact,
  either,
  InferType,
  Validator,
} from "hyperguard";

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
    }),
  ),
});

type User = InferType<typeof userSchema>;
/*
type User = {
  name: string
  age: number
  address: {
    apartment: string | undefined
    streetNumber: string
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

<!-- doc-gen TOC maxDepth=4 -->

- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
  - [Installing](#installing)
    - [npm (Node.js, Webpack, Vite, Browserify, or any other that use npm)](#npm-nodejs-webpack-vite-browserify-or-any-other-that-use-npm)
    - [Deno](#deno)
    - [Browser via `import` statement (dist/esm/lib.js)](#browser-via-import-statement-distesmlibjs)
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
  - [Functions](#functions)
    - [arrayOf()](#arrayof)
    - [boolean()](#boolean)
    - [chain()](#chain)
    - [either()](#either)
    - [exact()](#exact)
    - [except()](#except)
    - [exclude()](#exclude)
    - [fallback()](#fallback)
    - [instance()](#instance)
    - [intersection()](#intersection)
    - [lazy()](#lazy)
    - [number()](#number)
    - [object()](#object)
    - [objectOf()](#objectof)
    - [predicate()](#predicate)
    - [replaceError()](#replaceerror)
    - [string()](#string)
    - [transform()](#transform)
    - [tuple()](#tuple)
    - [unknown()](#unknown)
    - [validate()](#validate)
  - [Type Aliases](#type-aliases)
    - [ExactTypes](#exacttypes)
    - [InferType](#infertype)
    - [IValidationError](#ivalidationerror)
    - [ObjectValidator](#objectvalidator)
    - [PossibleTypeof](#possibletypeof)
    - [ValidationFailure](#validationfailure)
    - [ValidationResult](#validationresult)
    - [ValidationSuccess](#validationsuccess)
    - [Validator](#validator)
- [Similar libraries](#similar-libraries)
  - [How Hyperguard compares to zod](#how-hyperguard-compares-to-zod)
  - [See also](#see-also)

<!-- end-doc-gen -->

## Usage Guide

The Hyperguard library was designed to be used for the purposes of validating incoming JSON data, whether they be from an HTTP request, an AJAX response, a WebSocket payload, etc.

```typescript
const data = await fetch(url).then((response) => response.json());

const validation = schema.validate(data);

if (validation.isValid) {
  const value = validation.value;
}
```

Hyperguard becomes especially powerful when larger `Validator`s are comprised from smaller reusable validators, that serve their own purpose. These validators can then be used across multiple larger validators.

### Installing

By design, Hyperguard places you under **no obligation** to use any package manager; you most certainly can copy and paste either [`lib.ts`](https://github.com/shovon/hyperguard/blob/main/lib.ts) for TypeScript, [`dist/lib.js`](https://github.com/shovon/hyperguard/blob/main/dist/lib.js) for CommonJS (require), or [`dist/esm/lib.js`](https://github.com/shovon/hyperguard/blob/main/dist/esm/lib.js) for importing via the `import` statement.

With that said, you are certainly more than welcomed to use a package manager, especially since it will allow you to easily upgrade, without the possibility of errors while copying and pasting.

#### npm (Node.js, Webpack, Vite, Browserify, or any other that use npm)

If you are using Node.js or a bundler that uses npm, Hyperguard has been published to npm for your convenience. You can install using your preferred package manager. For example:

- npm: `npm install hyperguard`
- Yarn: `yarn add hyperguard`
- pnpm: `pnpm add hyperguard`

Additional, for the JavaScript CommonJS code, transpilers should not be needed. However if you are having trouble importing Hyperguard into your bundler (Webpack, Vite, Browserify, etc.), then please do [open a new issue](https://github.com/shovon/hyperguard/issues), and I will investigate.

##### Importing via CommonJS `require`

Once installed, you should be able to import the module via CommonJS `require`, like so:

```javascript
const hyperguard = require("hyperguard");
```

##### Importing via Node.js' ECMAScript module (`import` statement)

In a Node.js `mjs` file, you can simply import using the `import` syntax.

```javascript
import * as hyperguard from "hyperguard";
```

#### Deno

With Deno, you can directly import the `lib.ts` file from GitHub.

```typescript
import * as hyperguard from "https://raw.githubusercontent.com/shovon/hyperguard/main/lib.ts";
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
  import * as hyperguard from "/path/to/hyperguard/lib.js";
</script>
```

> **Hot Tip**
>
> If you want a minified version, you can download it from this URL:
>
> https://cdn.jsdelivr.net/npm/hyperguard@latest/dist/esm/lib.min.js

**Option 2: Importing from npm (via jsDelivr)**

If you don't want to download, and you just want to give the library a try, then you can link directly to jsDelivr.

```html
<script type="module">
  import * as hyperguard from "https://cdn.jsdelivr.net/npm/hyperguard@latest/dist/esm/lib.js";
</script>
```

Alternatively, if you want the minified version, you can simply add a `.min` after the `/lib`, and before the `.js`:

```html
<script type="module">
  import * as hyperguard from "https://cdn.jsdelivr.net/npm/hyperguard@latest/dist/esm/lib.min.js";
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
  messageReceivedSchema,
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

For a full example, take a look at the [example project](https://github.com/shovon/hyperguard/tree/main/example).

### Tips and tricks

Below are some tricks you can use to make Hyperguard an even more powerful validation tool.

#### Recursive types

If your application has data, whose schema comes in a tree-like structure (recursive type), then you can use the `lazy` validator, so that your schema can work with TypeScript.

```typescript
type Node = {
  value: unknown;
  left: Node | null;
  right: Node | null;
};

const nodeSchema: Validator<Node> = lazy<Node>(() =>
  object({
    value: unknown(),
    left: either(nodeSchema, exact(null)),
    right: either(nodeSchema, exact(null)),
  }),
);
```

#### Create custom validators by composing other validators

Hyperguard offers some basic validator creators, such as for strings, numbers, and booleans. But, if you wanted to create your own validator creator for other purposes, you certainly can. Here's an example: optional values.

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
} from "hyperguard";

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
			transform(string(), (value) => new Date(value))
			(d) => isNaN(d.getTime())
		),
		(value) => new DateError(value)
	);
```

From which you can try to derive a date from a string.

Example:

```typescript
const validDate = new Date(new Date().toISOString());

const shouldBeValid = date().validate(validDate);

if (shouldBeValid.isValid) {
  valid.value; // This is the value
}

const invalid = new Date("invalid");

const shouldBeInvalid = date().validate(invalid);

if (!shouldBeValid.isValid) {
  valid.error; // this is the error
}
```

It gets even better. The above validator will have its type inferred as a `Date`.

```typescript
const dateSchema = date();

type CustomDate = InferType<typeof dateSchema>;
// type CustomDate = Date;
```

> **Note**
>
> In the above example, we created a custom error class called `DateError`, by deriving Hyperguard's `ValidationError` class.
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

Hyperguard is written with five principles in mind:

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

The central idea is that complex validation rules can be built from the ground up out of [atomic](https://spin.atomicobject.com/2016/01/06/defining-atomic-object/) elements. Schema construction will happen through the _composition_ of one or more of these "atoms". The Hyperguard library's `Validator` is the type definition that serves as the "atom".

The definition of a `Validator` is simply:

```typescript
export type Validator<T> = {
  validate: (value: unknown) => ValidationResult<T>;
};

export type ValidationFailure = { isValid: false; error: IValidationError };
export type ValidationSuccess<T> = { value: T; isValid: true };

export type ValidationResult<T> = ValidationFailure | ValidationSuccess<T>;

export type IValidationError = {
  readonly type: string;
  readonly errorMessage: string;
  readonly value: unknown;
};
```

Any object of type `Validator` can implement the `validate` method in their own way. It can even invoke the `validate` method from another `Validator`.

In fact, as far as this library is concerned, you can define your `Validator`s not only by composing simpler validators defined in this library, but also by writing your own.

### Composition

Rather than relying on—arguably—complex configurations and validation engines, Hyperguard empowers you to define schemas by composing smaller validators.

Additionally, you can easily re-use smaller validators across larger schemas.

The `either` creator is a good example of **validator composition**. It allows you to define a validator for a value that could _either_ be a `string` or a `number`.

```typescript
const eitherStringOrNumber = either(string(), number());

eitherStringOrNumber.validate("10").isValid; // true
eitherStringOrNumber.validate(10).isValid; // true
eitherStringOrNumber.validate(true).isValid; // false
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
> When compositions grow deep, wrap them in your own validator creators (see [Create custom validators by composing other validators](#create-custom-validators-by-composing-other-validators)) to keep call sites readable.
>
> Composition like this would also read beautifully with the [TC39 pipeline operator](https://github.com/tc39/proposal-pipeline-operator), if it ever lands.

### Embrace JavaScript itself; use idioms

Traditionally, validation libraries often resorted to abstracting away the minutiae behind JavaScript. According to those libraries, the idea is that JavaScript as a language is flawed, and those flaws need to be abstracted away.

**Hyperguard, on the other hand, embraces JavaScript.**

At its core, the power of Hyperguard is all encompassed by the following type definitions:

```typescript
export type Validator<T> = {
  validate: (value: unknown) => ValidationResult<T>;
};

export type ValidationFailure = { isValid: false; error: IValidationError };
export type ValidationSuccess<T> = { value: T; isValid: true };

export type ValidationResult<T> = ValidationFailure | ValidationSuccess<T>;

export type IValidationError = {
  readonly type: string;
  readonly errorMessage: string;
  readonly value: unknown;
};
```

You don't even need to use Hyperguard. As long as you can define your own Validator, you can perform validations as you would with Hyperguard.

Alternatively, you can even write your own `Validator`s, and they will be 100% compatible with Hyperguard.

### Clarity and transparency

This library does away with configurations. And thus, behaviour is never redefined using booleans, or other configuration options.

This makes behaviours of each validator creators testable and predictable.

Additionally, results from validation will be easily inspectable, and serializable into JSON via `JSON.stringify`.

### Power to the client

Want to go beyond what this library has to offer? You're in luck. Hyperguard won't lock you into using a quasi-proprietary `addMethod` function. You are free to create your own validators.

Better yet, these validators can be used beyond just validation; but also data transformation.

For instance, if you have a string that represents a timestamp, you can convert the string to a JavaScript `Date`.

```typescript
import { ValidationError } from "hyperguard";

class DateError extends ValidationError {
  constructor(value: string) {
    super(
      "Date error",
      `The supplied string ${value} was not a valid format that can be parsed into a Date`,
      value,
    );
  }
}

export const date = (): Validator<Date> => ({
  validate: (value: unknown) => {
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

<!-- doc-gen API -->

**hyperguard**

***

### Functions

#### arrayOf()

> **arrayOf**\<`V`\>(`validator`): [`Validator`](#validator)\<`V`[]\>

Creates a validator that determines if the supplied value is an array of the
specified validator.

##### Usage

```typescript
const numbers = arrayOf(number());

numbers.validate([1, 2, 3]).isValid;   // ✅ true
numbers.validate([1, "2", 3]).isValid; // ❌ false (a non-number element)
numbers.validate("nope").isValid;      // ❌ false (not an array)
```

##### Type Parameters

| Type Parameter |
| ------ |
| `V` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `validator` | [`Validator`](#validator)\<`V`\> | The validator to validate the individual array values against |

##### Returns

[`Validator`](#validator)\<`V`[]\>

A validator to check if the value is an array of the specified
  validator

***

#### boolean()

> **boolean**(): [`Validator`](#validator)\<`boolean`\>

Creates a validator that determines if the supplied value is a boolean.

##### Usage

```typescript
const bool = boolean();

bool.validate(true).isValid;  // ✅ true
bool.validate("true").isValid; // ❌ false
```

##### Returns

[`Validator`](#validator)\<`boolean`\>

A validator to check if the value is of type boolean

***

#### chain()

> **chain**\<`T1`, `T2`\>(`left`, `right`): [`Validator`](#validator)\<`T2`\>

Chains two validators together.

The value (possibly transformed) produced by `left` is fed into `right`, so
this is how you compose, for example, a parse step with a shape check.

##### Usage

```typescript
// Validate a string, then constrain it to a minimum length.
const nonEmpty = chain(string(), predicate(string(), (s) => s.length > 0));

nonEmpty.validate("hi").isValid; // ✅ true
nonEmpty.validate("").isValid;   // ❌ false (empty)
nonEmpty.validate(42).isValid;   // ❌ false (not a string)
```

##### Type Parameters

| Type Parameter |
| ------ |
| `T1` |
| `T2` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `left` | [`Validator`](#validator)\<`T1`\> | the first validator to validate values against |
| `right` | [`Validator`](#validator)\<`T2`\> | the second validator to validate values against |

##### Returns

[`Validator`](#validator)\<`T2`\>

a validator that will validate first against the first validator
  then the second validator

***

#### either()

> **either**\<`T`\>(...`alts`): `ValidatorArrayToValidatorUnion`\<`T`\>

A validator for validating objects against a list of validators.

This is especially useful if a possible object has more than one possible
valid type.

##### Usage

```typescript
const stringOrNumber = either(string(), number());

stringOrNumber.validate(10).isValid;      // ✅ true
stringOrNumber.validate("hello").isValid; // ✅ true
stringOrNumber.validate(true).isValid;    // ❌ false
```

##### Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* [`Validator`](#validator)\<`unknown`\>[] |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| ...`alts` | `T` | A list of validators that are to be run |

##### Returns

`ValidatorArrayToValidatorUnion`\<`T`\>

A validator to validate an object against a set of validators

***

#### exact()

> **exact**\<`V`\>(`expected`): [`Validator`](#validator)\<`V`\>

Creates a validator that validates values that match the expected value
exactly.

##### Usage

```typescript
const yes = exact("yes");

yes.validate("yes").isValid; // ✅ true
yes.validate("no").isValid;  // ❌ false
```

##### Type Parameters

| Type Parameter |
| ------ |
| `V` *extends* [`ExactTypes`](#exacttypes) |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `expected` | `V` | The exact value to be expected |

##### Returns

[`Validator`](#validator)\<`V`\>

A validator that will only validate values that match exactly the
  expected value

***

#### except()

> **except**\<`T`, `I`\>(`validator`, `invalidator`): [`Validator`](#validator)\<`Exclude`\<`T`, `I`\>\>

Creates a validator for an object that rejects all values that passes the
invalidator.

This validator is especially useful for cases where a value can be a string,
except for specific strings.

##### Usage

```typescript
const everythingBut = except(string(), exact("but"));

everythingBut.validate("apples").isValid; // ✅ true
everythingBut.validate("cherries").isValid; // ✅ true
everythingBut.validate("but").isValid; // ❌ false (the excluded value)
everythingBut.validate(42).isValid; // ❌ false (not a string)
```

##### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `I` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `validator` | [`Validator`](#validator)\<`T`\> | The validator for which to validate the value against |
| `invalidator` | [`Validator`](#validator)\<`I`\> | The validator for which if is valid, the value will be rejected |

##### Returns

[`Validator`](#validator)\<`Exclude`\<`T`, `I`\>\>

A Validator that will reject all values for which the invalidator
  validates the object

***

#### exclude()

> **exclude**\<`V`, `T`\>(`a`, `b`): [`Validator`](#validator)\<`Exclude`\<`V`, `T`\>\>

A validator that validates if a value does not validate against another
validator.

Similar to TypeScript's `Exclude` utility type.

##### Usage

```typescript
const notAdmin = exclude(string(), exact("admin"));

notAdmin.validate("hello").isValid; // ✅ true  (a string, not "admin")
notAdmin.validate("admin").isValid; // ❌ false (excluded value)
notAdmin.validate(42).isValid;      // ❌ false (not a string)
```

##### Type Parameters

| Type Parameter |
| ------ |
| `V` |
| `T` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `a` | [`Validator`](#validator)\<`V`\> | The validation to include |
| `b` | [`Validator`](#validator)\<`T`\> | The validation to exclude |

##### Returns

[`Validator`](#validator)\<`Exclude`\<`V`, `T`\>\>

A validator where it validates if value validates with `a` but does
  not validate against `b`.

***

#### fallback()

> **fallback**\<`T1`, `T2`\>(`validator`, `getFallback`): [`Validator`](#validator)\<`T1` \| `T2`\>

Creates a validator that can fallback to another value.

##### Usage

```typescript
// Use the given number, or default to 0 when the value isn't a number.
const count = fallback(number(), () => 0);

count.validate(42);    // { isValid: true, value: 42 }
count.validate("nope"); // { isValid: true, value: 0 }  (fell back)
```

##### Type Parameters

| Type Parameter |
| ------ |
| `T1` |
| `T2` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `validator` | [`Validator`](#validator)\<`T1`\> | The validator that, if failed, will need a fallback |
| `getFallback` | () => `T2` | The function to acquire the fallback value |

##### Returns

[`Validator`](#validator)\<`T1` \| `T2`\>

A validator that should never be invalid

***

#### instance()

> **instance**\<`T`\>(`constructor`): [`Validator`](#validator)\<`T`\>

Creates a validator that determines if the supplied value is an instance of
the given constructor (i.e. `value instanceof constructor`).

##### Usage

```typescript
const dateValidator = instance(Date);

dateValidator.validate(new Date()).isValid; // ✅
dateValidator.validate("2026-06-14").isValid; // ❌
```

##### Type Parameters

| Type Parameter |
| ------ |
| `T` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `constructor` | `Object` | The constructor to check the value against |

##### Returns

[`Validator`](#validator)\<`T`\>

A validator that checks if the value is an instance of `constructor`

***

#### intersection()

> **intersection**\<`T1`, `T2`\>(`a`, `b`): [`Validator`](#validator)\<`T1` & `T2`\>

Gets the intersection of two validators

##### Usage

```typescript
const named = object({ name: string() });
const aged = object({ age: number() });

// Must satisfy both shapes: { name: string } & { age: number }.
const person = intersection(named, aged);

person.validate({ name: "Ada", age: 36 }).isValid; // ✅ true
person.validate({ name: "Ada" }).isValid;          // ❌ false (missing age)
```

##### Type Parameters

| Type Parameter |
| ------ |
| `T1` |
| `T2` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `a` | [`Validator`](#validator)\<`T1`\> | The first validator to validate the object against |
| `b` | [`Validator`](#validator)\<`T2`\> | The second validator to validate the object against |

##### Returns

[`Validator`](#validator)\<`T1` & `T2`\>

A validator that is the intersection of the types represented by
  validators a and b

***

#### lazy()

> **lazy**\<`V`\>(`schemaFn`): [`Validator`](#validator)\<`V`\>

Creates a validator that lazily evaluates the callback, at every validation.

Useful for recursive types, such as a node for a tree.

##### Usage

```typescript
type Tree = { value: number; children: Tree[] };

// `lazy` defers referencing `tree` until validation time, so the validator
// can refer to itself.
const tree: Validator<Tree> = object({
  value: number(),
  children: lazy(() => arrayOf(tree)),
});

tree.validate({ value: 1, children: [{ value: 2, children: [] }] }).isValid; // ✅ true
```

##### Type Parameters

| Type Parameter |
| ------ |
| `V` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `schemaFn` | () => [`Validator`](#validator)\<`V`\> | A function that returns a validator |

##### Returns

[`Validator`](#validator)\<`V`\>

A validator, effectively just a "forwarding" of the validator
  returned by the `schemaFn`

***

#### number()

> **number**(): [`Validator`](#validator)\<`number`\>

Creates a validator that determines if the supplied value is a number.

##### Usage

```typescript
const num = number();

num.validate(42).isValid;      // ✅ true
num.validate("42").isValid;    // ❌ false
```

##### Returns

[`Validator`](#validator)\<`number`\>

A validator to check if the value is of type number

***

#### object()

> **object**\<`S`, `V`\>(`shape`): [`ObjectValidator`](#objectvalidator)\<`V`, `S`\>

Creates a validator for an object, specified by the "schema".

Each field in the "schema" is a validator, and each of them will validate
values against objects in concern.

##### Usage

```typescript
const user = object({
  name: string(),
  age: number(),
});

user.validate({ name: "Ada", age: 36 }).isValid; // ✅ true
user.validate({ name: "Ada" }).isValid;          // ❌ false (missing age)
user.validate({ name: "Ada", age: "36" }).isValid; // ❌ false (age not a number)
```

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `S` *extends* `object` | - |
| `V` *extends* `object` | `InferSchema`\<`S`\> |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `shape` | `S` | An object containing fields of nothing but validators, each of which will be used to validate the value's respective fields |

##### Returns

[`ObjectValidator`](#objectvalidator)\<`V`, `S`\>

A validator that will validate an object against the `schema`

***

#### objectOf()

> **objectOf**\<`V`\>(`validator`): [`Validator`](#validator)\<\{\[`keys`: `string`\]: `V`; \}\>

Creates a validator that determines if the supplied value is an object, whose
fields contains are of nothing but types as defined by the specified
validator.

##### Usage

```typescript
// An object used as a string-keyed map of numbers.
const scores = objectOf(number());

scores.validate({ alice: 10, bob: 20 }).isValid; // ✅ true
scores.validate({ alice: 10, bob: "20" }).isValid; // ❌ false (a non-number field)
```

##### Type Parameters

| Type Parameter |
| ------ |
| `V` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `validator` | [`Validator`](#validator)\<`V`\> | The validator to validate the individual fields in the object |

##### Returns

[`Validator`](#validator)\<\{\[`keys`: `string`\]: `V`; \}\>

A validator that determines if the supplied value is an object,
  whose fields contains are of nothing but types as defined by the specified
  validator.

***

#### predicate()

> **predicate**\<`T`\>(`validator`, `pred`): [`Validator`](#validator)\<`T`\>

A validator creator that also accepts a predicate

##### Usage

```typescript
// A string of at least 8 characters. `value` is typed as `string`.
const password = predicate(string(), (value) => value.length >= 8);

password.validate("hunter2000").isValid; // ✅ true
password.validate("short").isValid;      // ❌ false (fails the predicate)
password.validate(42).isValid;           // ❌ false (not a string)
```

##### Type Parameters

| Type Parameter |
| ------ |
| `T` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `validator` | [`Validator`](#validator)\<`T`\> | The validator to run the predicate against |
| `pred` | (`value`) => `boolean` | The predicate to run against the value |

##### Returns

[`Validator`](#validator)\<`T`\>

A Validator, where if the predicate were to fail, it will result in
  a failed validation

***

#### replaceError()

> **replaceError**\<`T`\>(`validator`, `createError`): [`Validator`](#validator)\<`T`\>

A Validator creator that substitutes the error from one validator, to another
error for that validator.

##### Usage

```typescript
class NotAName extends ValidationError {
  constructor(value: unknown) {
    super("Not a name", "Expected a name string", value);
  }
}

// Same validation as `string()`, but with a custom error on failure.
const name = replaceError(string(), (value) => new NotAName(value));

name.validate("Ada").isValid; // ✅ true
name.validate(42).isValid;    // ❌ false (fails with a NotAName error)
```

##### Type Parameters

| Type Parameter |
| ------ |
| `T` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `validator` | [`Validator`](#validator)\<`T`\> | The validator for which to have the error substituted |
| `createError` | (`value`, `error`) => [`IValidationError`](#ivalidationerror) | An error function that will return the appropriate error object |

##### Returns

[`Validator`](#validator)\<`T`\>

A validator

***

#### string()

> **string**(): [`Validator`](#validator)\<`string`\>

Creates a validator that determines if the supplied value is a string.

##### Usage

```typescript
const str = string();

str.validate("hello").isValid; // ✅ true
str.validate(42).isValid;      // ❌ false
```

##### Returns

[`Validator`](#validator)\<`string`\>

A validator to check if the value is of type string

***

#### transform()

> **transform**\<`I`, `O`\>(`validator`, `parse`): [`Validator`](#validator)\<`O`\>

Creates a validator that first validates the supplied value against
`validator`, then maps the validated value through `parse`.

Because the input is validated up front, the `parse` callback receives a
value already narrowed to the validator's type, rather than `unknown`. To
transform an arbitrary value with no prior validation, pass [unknown](#unknown)
as the validator.

##### Usage

```typescript
// `value` is inferred as `string`, so no cast is needed.
const toDate = transform(string(), (value) => new Date(value));

toDate.validate("1970-01-01T00:00:00.000Z").isValid; // ✅
toDate.validate(42).isValid;                          // ❌ not a string
```

##### Type Parameters

| Type Parameter |
| ------ |
| `I` |
| `O` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `validator` | [`Validator`](#validator)\<`I`\> | The validator the value must satisfy before being parsed |
| `parse` | (`value`) => `O` | The parser, receiving the validated value |

##### Returns

[`Validator`](#validator)\<`O`\>

A validator that validates then maps the value

***

#### tuple()

> **tuple**\<`T`\>(`t`): `ValidatorTupleToValueTuple`\<`T`\>

Used to validate a tuple against the individual values in an array.

##### Usage

```typescript
const tup = tuple([string(), number()]);

tup.validate(["a", 1]).isValid; // ✅ true
tup.validate([1, "a"]).isValid; // ❌ false (wrong order)
tup.validate([1]).isValid;      // ❌ false (wrong length)
```

##### Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* [`Validator`](#validator)\<`unknown`\>[] |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `t` | \[`...T[]`\] | The tuple of validators to validate a tuple against |

##### Returns

`ValidatorTupleToValueTuple`\<`T`\>

A validator to validate tuples

***

#### unknown()

> **unknown**(): [`Validator`](#validator)\<`unknown`\>

Creates a validator that where the validation function will never determine
that a value is invalid

##### Usage

```typescript
const anything = unknown();

anything.validate(42).isValid;      // ✅ true
anything.validate("hi").isValid;    // ✅ true
anything.validate(null).isValid;    // ✅ true
```

##### Returns

[`Validator`](#validator)\<`unknown`\>

A validator that will validate *all* objects

***

#### validate()

> **validate**\<`T`\>(`validator`, `value`): `T`

This function validates and returns the parsed value. If validation failed,
it will throw a runtime exception

##### Usage

```typescript
const user = object({ name: string(), age: number() });

// Returns the typed value on success...
const value = validate(user, { name: "Ada", age: 36 });
value.name; // "Ada", typed as string

// ...and throws the ValidationError on failure.
validate(user, { name: "Ada" }); // throws
```

##### Type Parameters

| Type Parameter |
| ------ |
| `T` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `validator` | [`Validator`](#validator)\<`T`\> | A validator to run the validation against the supplied value |
| `value` | `unknown` | The value to run the validation against |

##### Returns

`T`

The outcome of the validation

### Type Aliases

#### ExactTypes

> **ExactTypes** = `string` \| `number` \| `boolean` \| `null` \| `undefined`

The set of primitive values that [exact](#exact) can match against.

***

#### InferType

> **InferType**\<`V`\> = `V` *extends* [`Validator`](#validator)\<infer T\> ? `T` : `never`

A helper type for converting a Validator<T> type to a T

For example, if you wanted to grab the validator from a `string()`, you'd use
this type like so:

```typescript
const stringValidator = string();

type Str = InferType<typeof stringValidator>;
// Should be `type Str = string`
```

You can do this with objects as well. For example:

```typescript
const objectValidator = object({
  name: string(),
  email: string(),
  age: number()
});

type Obj = InferType<typeof objectValidator>;
// Should be:
//
// type Obj = {
//   name: string
//   email: string
//   age: number
// }
```

##### Type Parameters

| Type Parameter |
| ------ |
| `V` *extends* [`Validator`](#validator)\<`unknown`\> |

***

#### IValidationError

> **IValidationError** = `object`

An object that represents a validation error.

***

#### ObjectValidator

> **ObjectValidator**\<`V`, `S`\> = [`Validator`](#validator)\<`V`\> & `Readonly`\<\{ `omit`: \<`T`\>(`keys`) => [`ObjectValidator`](#objectvalidator)\<`Omit`\<`V`, `T`\>, `S`\>; `partial`: [`ObjectValidator`](#objectvalidator)\<`Partial`\<`V`\>, \{ \[key in keyof V\]: Validator\<V\[key\] \| undefined\> \}\>; `pick`: \<`T`\>(`keys`) => [`ObjectValidator`](#objectvalidator)\<`Pick`\<`V`, `T`\>, `S`\>; `required`: [`ObjectValidator`](#objectvalidator)\<`{ [key in keyof V]: Exclude<V[key], undefined> }`, `{ [key in keyof V]: Validator<Exclude<V[key], undefined>> }`\>; `shape`: `S`; \}\>

A [Validator](#validator) for objects, as produced by [object](#object). In addition to
validating, it exposes the underlying `shape` and derived validators
(`partial`, `required`, `omit`, `pick`) for refining the schema.

##### Type Parameters

| Type Parameter |
| ------ |
| `V` *extends* `object` |
| `S` *extends* `object` |

***

#### PossibleTypeof

> **PossibleTypeof** = *typeof* `_s`

The union of strings that the `typeof` operator can produce (e.g. `"string"`,
`"number"`, `"object"`).

***

#### ValidationFailure

> **ValidationFailure** = `object`

The result of a failed validation, carrying the validation error.

***

#### ValidationResult

> **ValidationResult**\<`T`\> = [`ValidationFailure`](#validationfailure) \| [`ValidationSuccess`](#validationsuccess)\<`T`\>

An object that represents the result of a validation check.

##### Type Parameters

| Type Parameter |
| ------ |
| `T` |

***

#### ValidationSuccess

> **ValidationSuccess**\<`T`\> = `object`

The result of a successful validation, carrying the validated value.

##### Type Parameters

| Type Parameter |
| ------ |
| `T` |

***

#### Validator

> **Validator**\<`T`\> = `object`

An object that serves as a validator.

##### Type Parameters

| Type Parameter |
| ------ |
| `T` |

<!-- end-doc-gen -->

## Similar libraries

### How Hyperguard compares to zod

[zod](https://github.com/colinhacks/zod) is excellent, mature, and the right default for most projects. Hyperguard overlaps with it more than it differs — both are zero-dependency, both infer static types from your schema, and both can transform values as they validate. The differences are about _size and philosophy_, not capability.

| | Hyperguard | zod |
| --- | --- | --- |
| Dependencies | Zero | Zero |
| Distribution | npm, or copy one file into your project | npm package |
| Type inference | Yes (`InferType`) | Yes (`z.infer`) |
| Transform while validating | Yes (`chain` + `transform`) | Yes (`.transform`) |
| API style | Function composition (`object`, `either`, `chain`, `predicate`) | Fluent chaining (`.min().email().optional()`) |
| Built-in formats (email, uuid, min/max…) | Not built in — compose with `predicate` | Extensive, built in |
| Error reporting | Simple, structural | Rich (issue paths, error maps, i18n) |
| Extending it | Write a plain object with a `validate` method — first-class | `.refine` / `.superRefine` / `.transform` / `z.custom` |
| Coupling | Your code depends on a one-method interface, not a library class | Schemas are zod types |
| Maturity & ecosystem | Small and new | Large, battle-tested, huge ecosystem |

**Reach for zod** when you want batteries-included formats, the richest possible error reporting, or its enormous ecosystem of integrations (tRPC, React Hook Form, and so on).

**Reach for Hyperguard** when you want something tiny enough to vendor and read end-to-end, and a `Validator` contract so minimal — `{ validate(value): ValidationResult<T> }` — that writing your own validators, or swapping the library out entirely, costs you almost nothing.

### See also

- [yup](https://github.com/jquense/yup)
- [io-ts](https://github.com/gcanti/io-ts)
