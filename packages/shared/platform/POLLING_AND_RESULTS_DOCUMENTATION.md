# Polling & Results Module - Documentation

**Module:** Politics Suite - Polling & Results  
**Version:** 1.0  
**Date:** 2026-02-13

---

## Overview

The Polling & Results module enables creation and management of polls, voting mechanisms, and real-time results tracking for political organizations, electoral bodies, and community groups.

---

## Features

- **Poll Management:** Create, activate, and close polls
- **Multiple Voting Types:** Simple, multiple choice, ranked, yes/no
- **Real-time Results:** Live vote counting and aggregation
- **Anonymous Voting:** IP-based duplicate prevention
- **Results Export:** JSON and CSV formats
- **Demographic Analysis:** Vote breakdown by demographics
- **Geographic Analysis:** Vote distribution by location
- **Event-Driven:** Real-time notifications and integrations

---

## Quick Start

### Creating a Poll

```typescript
import { PollService } from './services/poll.service';
import { EventEmitter } from 'events';

const pollService = new PollService(repository, new EventEmitter());

const poll = await pollService.createPoll({
  tenantId: 'tenant-1',
  title: 'Presidential Election Poll',
  pollType: 'simple',
  questions: [
    {
      id: 'q1',
      pollId: '',
      text: 'Who will you vote for?',
      questionType: 'simple',
      options: [
        { id: 'opt1', questionId: 'q1', text: 'Candidate A', order: 1 },
        { id: 'opt2', questionId: 'q1', text: 'Candidate B', order: 2 },
      ],
      required: true,
      order: 1,
    },
  ],
  startDate: new Date('2026-03-01'),
  endDate: new Date('2026-03-31'),
  resultsVisibility: 'public',
  allowAnonymous: false,
}, 'user-1');

// Activate poll
await pollService.activatePoll(poll.id, 'tenant-1', 'user-1');
```

### Casting a Vote

```typescript
import { VotingService } from './services/voting.service';

const votingService = new VotingService(repository, new EventEmitter());

const vote = await votingService.castVote(
  'poll-1',
  'q1',
  {
    selectedOptions: ['opt1'],
  },
  'voter-1'
);
```

### Getting Results

```typescript
import { ResultsService } from './services/results.service';

const resultsService = new ResultsService(repository, new EventEmitter());

const results = await resultsService.calculateResults('poll-1', 'q1');

console.log(`Total Votes: ${results.totalVotes}`);
results.optionResults.forEach(option => {
  console.log(`${option.optionText}: ${option.voteCount} (${option.percentage.toFixed(2)}%)`);
});
```

---

## API Reference

### PollService

#### createPoll(data, userId)
Creates a new poll in draft status.

**Parameters:**
- `data`: Poll configuration
- `userId`: ID of user creating the poll

**Returns:** `Promise<Poll>`

**Events:** `polling.poll.created`

#### activatePoll(id, tenantId, userId)
Activates a draft poll to allow voting.

**Parameters:**
- `id`: Poll ID
- `tenantId`: Tenant ID
- `userId`: ID of user activating the poll

**Returns:** `Promise<Poll>`

**Events:** `polling.poll.activated`

**Throws:** Error if poll is not in draft status

#### closePoll(id, tenantId, userId)
Closes an active poll to stop voting.

**Parameters:**
- `id`: Poll ID
- `tenantId`: Tenant ID
- `userId`: ID of user closing the poll

**Returns:** `Promise<Poll>`

**Events:** `polling.poll.closed`

**Throws:** Error if poll is not active

#### updatePoll(id, tenantId, data, userId)
Updates a draft poll. Cannot update after activation.

**Parameters:**
- `id`: Poll ID
- `tenantId`: Tenant ID
- `data`: Partial poll data to update
- `userId`: ID of user updating the poll

**Returns:** `Promise<Poll>`

**Throws:** Error if poll is not in draft status

#### getPoll(id, tenantId)
Retrieves a poll by ID.

#### listPolls(tenantId, filters?)
Lists all polls for a tenant with optional filters.

---

### VotingService

#### castVote(pollId, questionId, voteData, voterId?)
Casts a vote in an active poll.

**Parameters:**
- `pollId`: Poll ID
- `questionId`: Question ID
- `voteData`: Vote data including selectedOptions
- `voterId`: Optional voter ID (omit for anonymous)

**Returns:** `Promise<Vote>`

**Events:** `polling.vote.cast`, `polling.results.updated`

**Throws:**
- Error if poll is not active
- Error if voter has already voted

#### validateVoter(pollId, voterId)
Validates if a voter is eligible to vote.

#### checkDuplicateVote(pollId, voterId?, ipAddress?)
Checks if a vote has already been cast.

#### getVoterHistory(voterId, tenantId)
Retrieves voting history for a voter.

---

### ResultsService

#### calculateResults(pollId, questionId)
Calculates current results for a poll question.

**Returns:** `Promise<PollResults>`

#### getResultsByDemographic(pollId, questionId)
Gets vote breakdown by demographic categories.

**Returns:** `Promise<DemographicResult[]>`

#### getResultsByGeography(pollId, questionId)
Gets vote distribution by geographic location.

**Returns:** `Promise<GeographicResult[]>`

#### getTurnoutRate(pollId)
Calculates voter turnout percentage.

**Returns:** `Promise<number>`

#### exportResults(pollId, format)
Exports poll results in specified format.

**Parameters:**
- `pollId`: Poll ID
- `format`: 'json' | 'csv'

**Returns:** `Promise<string>`

---

## Events

### polling.poll.created
Emitted when a new poll is created.

```typescript
{
  pollId: string;
  tenantId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  createdBy: string;
}
```

### polling.poll.activated
Emitted when a poll is activated.

```typescript
{
  pollId: string;
  tenantId: string;
  activatedBy: string;
}
```

### polling.poll.closed
Emitted when a poll is closed.

```typescript
{
  pollId: string;
  tenantId: string;
  closedBy: string;
}
```

### polling.vote.cast
Emitted when a vote is cast.

```typescript
{
  pollId: string;
  questionId: string;
  voterId?: string;
  anonymous: boolean;
  timestamp: Date;
}
```

### polling.results.updated
Emitted when results are recalculated.

```typescript
{
  pollId: string;
  questionId: string;
}
```

---

## Usage Examples

### Example 1: Simple Poll

```typescript
// Create and activate a simple yes/no poll
const poll = await pollService.createPoll({
  tenantId: 'tenant-1',
  title: 'Should we extend voting hours?',
  pollType: 'yesno',
  questions: [
    {
      id: 'q1',
      text: 'Extend voting hours?',
      questionType: 'yesno',
      options: [
        { id: 'yes', text: 'Yes', order: 1 },
        { id: 'no', text: 'No', order: 2 },
      ],
      required: true,
      order: 1,
    },
  ],
  startDate: new Date(),
  endDate: new Date(Date.now() + 86400000),
  resultsVisibility: 'public',
  allowAnonymous: false,
}, 'admin-1');

await pollService.activatePoll(poll.id, 'tenant-1', 'admin-1');
```

### Example 2: Anonymous Voting

```typescript
// Cast anonymous vote with IP-based duplicate prevention
await votingService.castVote('poll-1', 'q1', {
  selectedOptions: ['opt1'],
  ipAddress: '192.168.1.100',
});
```

### Example 3: Results with Demographics

```typescript
// Get results with demographic breakdown
const results = await resultsService.calculateResults('poll-1', 'q1');
const demographics = await resultsService.getResultsByDemographic('poll-1', 'q1');

console.log('Overall Results:');
results.optionResults.forEach(option => {
  console.log(`${option.optionText}: ${option.percentage.toFixed(2)}%`);
});

console.log('\nDemographic Breakdown:');
demographics.forEach(demo => {
  console.log(`${demo.demographic}: ${demo.voteCount} votes (${demo.percentage.toFixed(2)}%)`);
});
```

### Example 4: Export Results

```typescript
// Export results as CSV
const csvData = await resultsService.exportResults('poll-1', 'csv');
// Save to file or send to client

// Export as JSON
const jsonData = await resultsService.exportResults('poll-1', 'json');
const parsed = JSON.parse(jsonData);
```

---

## Best Practices

1. **Always activate polls** before allowing voting
2. **Use anonymous voting** for sensitive topics
3. **Set appropriate date ranges** for poll validity
4. **Monitor turnout rates** during active polls
5. **Export results** after closing polls for archival
6. **Listen to events** for real-time integrations
7. **Validate voter eligibility** before casting votes
8. **Use demographics** for targeted analysis

---

## Nigerian Context

### Supported Demographics
- Age groups: 18-25, 26-35, 36-45, 46-60, 60+
- Gender: Male, Female, Other
- Education: Primary, Secondary, Tertiary
- Occupation categories
- Income brackets (NGN)

### Supported Locations
- Nigerian states (36 + FCT)
- Local Government Areas (LGAs)
- Constituencies
- Urban/Rural classification

---

## Troubleshooting

### Poll won't activate
- Ensure poll is in 'draft' status
- Check that startDate and endDate are valid
- Verify questions and options are properly configured

### Duplicate vote error
- Check if voter has already voted
- For anonymous polls, verify IP address hasn't voted
- Ensure poll is active

### Results not updating
- Listen for `polling.results.updated` event
- Call `calculateResults()` to get latest results
- Check that votes are being recorded properly

---

**Documentation by:** webwakaagent4  
**Date:** 2026-02-13  
**Version:** 1.0
