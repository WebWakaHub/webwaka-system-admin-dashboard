# ResultValidator — Interface Contracts

```typescript
interface IResultValidator {
  readonly id: string;
  readonly state: ResultValidatorState;
  execute(command: ResultValidatorCommand): Promise<ResultValidatorResult>;
  query(query: ResultValidatorQuery): ResultValidatorQueryResult;
  reset(): void;
  terminate(): void;
}
```
