# ORG-CM-COMPOSITION_MODELER-v0.1.0 — P5-T02: Usage Examples

## Example 1: Create and Validate a Simple Composition
```typescript
const orchestrator = new CompositionOrchestrator(storage, events, observability);

const snapshot = await orchestrator.createComposition({
  name: 'identity-cell',
  version: '1.0.0',
  organelle_refs: [
    { organelle_id: 'subject-registry', version: '^0.1.0' },
    { organelle_id: 'trust-assertion', version: '^0.1.0' },
  ],
  connection_map: [
    { source: 'subject-registry:identity-out', target: 'trust-assertion:subject-in' },
  ],
});

const result = await orchestrator.validateComposition({ composition_id: snapshot.composition_id });
console.log(result.is_valid); // true
```

## Example 2: Detect Circular Dependencies
```typescript
const snapshot = await orchestrator.createComposition({
  name: 'circular-cell',
  version: '1.0.0',
  organelle_refs: [
    { organelle_id: 'org-a', version: '^1.0.0' },
    { organelle_id: 'org-b', version: '^1.0.0' },
    { organelle_id: 'org-c', version: '^1.0.0' },
  ],
  connection_map: [
    { source: 'org-a:out', target: 'org-b:in' },
    { source: 'org-b:out', target: 'org-c:in' },
    { source: 'org-c:out', target: 'org-a:in' }, // Creates cycle!
  ],
});

const result = await orchestrator.validateComposition({ composition_id: snapshot.composition_id });
console.log(result.is_valid); // false
console.log(result.errors[0].code); // CM-003
```

## Example 3: Deploy and Archive
```typescript
await orchestrator.deployComposition({
  composition_id: snapshot.composition_id,
  target_environment: 'production',
});

await orchestrator.archiveComposition({
  composition_id: snapshot.composition_id,
});
```
