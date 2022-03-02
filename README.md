# valentina JavaScript object validation

`valentina` is a tiny library for validating JavaScript values. Whether it be primitives, such as strings and numbers, or modelling more complex objects, `valentina` will empower you to express your data validation rules, your way.

**Killer Features:**

- minimal and intuitive API, allowing for expressive JavaScript object schema and type definition
- Powerful TypeScript support to infer static types from schema
- Composable validators, empowering you to add your own rules, your way
- zero dependencies
- install either via npm, or copy and paste the code

## Getting Started

```typescript
import {
  object,
  string,
  number,
  optional,
  nullable,
  InferType,
} from "json-valid";

let userSchema = object({
  name: string(),
  age: number(),
  email: optional(string()),
  website: optional(nullable(string())),
  createdOn: string(),
});

type User = InferType<typeof userSchema>;
/* {
  name: string;
  age: number;
  email?: string | undefined
  website?: string | null | undefined
  createdOn: string
}*/
```

## Usage
