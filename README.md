# JSON valid

JSON-valid is a tiny library, to help validate JSON 

**Killer Features:**

- minimal API, with
- zero dependencies
- install either via npm, or copy and paste the code. Your choice
- Powerful TypeScript support to infer static types from schema
- Composable validators, empowering you to add your own validation rules

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
