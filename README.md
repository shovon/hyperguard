# valentina JavaScript object validation

_Valentina_ is a tiny library for validating JavaScript values. Whether they be primitives, such as strings and numbers, or modelling more complex objects, Valentina will empower you to express your data validation rules, your way.

**Killer Features:**

- minimal and intuitive API, allowing for expressive JavaScript object schema and type definitions
- Powerful TypeScript support to infer static types from schema
- Composable validators, empowering you to define your own rules, your way
- zero dependencies
- install either via npm, or copy and paste the `lib.ts` file into your project

## Getting Started

The core idea of Valentina is that you create a `Validator`, and you can compose multiple such `Validator`s to define an elaborate validation rule.

Additonally, the correct type can even be inferred from the `Validator`, using `InferType`.

```typescript
import { object, string, number, InferType } from "valentina";

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

We can invoke the `Validator<T>.validate` method to validate an object:

```typescript

```

## API

### `string(): Validator<string>`
