# valentina JavaScript object validation

_Valentina_ is a tiny library for validating JavaScript values. Whether they be primitives, such as strings and numbers, or modelling more complex objects, Valentina will empower you to express your data validation rules, your way.

**Killer Features:**

- minimal and intuitive API, allowing for expressive JavaScript object schema and type definitions
- Powerful TypeScript support to infer static types from schema
- Composable validators, empowering you to define your own rules, your way
- zero dependencies
- install either via npm, or copy and paste the `lib.ts` file into your project

## Getting Started

The core idea of Valentina is that you create a `Validator`. That `Validator` could represent a rule as simple as determining whether some value is even a JavaScript string. For example

```typescript
import { string } from "valentina";

const stringSchema = string(); // Is of type `Validator<string>`

console.log(stringSchema.validate("hello").valid);
// Will evaluate to true

console.log(stringSchema.validate(42).valid);
// Will evaluate to false
```

Or it could be an object with fields. For instance, let's write a schema for an object that has a name and an age fields, one being a string, and the other being a number, respectively

```typescript
import { object, string, number } from "valentina";

let userSchema = object({
  name: string(),
  age: number(),
});

console.log(userSchema.validate({ name: "Jane", age: 31 }).valid);
// Will evaluate to true

console.log(userSchema.validate({ name: 42, age: "32" }).valid);
// Will evaluate to false
```

Whether you invoke the `string`, `number`, or `object` functions, all of those functions will return a `Validator`, each serving their own purpose. And each of these Validators could be composed into a more complex schema, just as `string()`, and `number()` were used to define the more complex `Validator` as defined in the above `userSchema`. You can define a `Validator` to be as elaborate as you want, or simple as you want. In either case, defining one is straightforward, all thanks to the power of composability.

For example, if you wanted to define a `userSchema` with an optional `address` field, with multiple sub-fields, you can certainly do that

```typescript
import { object, string, number, alternatives, exact } from "valentina";

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
```

But it gets better.

You can derive the actual _type_ that the `Validator` is supposed to validate against.

Examples:

```typescript
import { InferType } from "valentina";

const strSchema = string();

type Str = InferType<typeof strSchema>;
// type Str = string;

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

## API
