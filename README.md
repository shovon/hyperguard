# JSON valid

Ridiculously easy JSON object validator, with absolutely no dependencies. Copy and paste the code into your own projects.

Take a look for yourself at the level of simplicity that this library has:

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
  age: number((n) => n >= 0 && Number.isInteger(n)),
  email: optional(string(isEmail)),
  website: optional(nullable(string(isUrl))),
  createdOn: string(isDate),
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
