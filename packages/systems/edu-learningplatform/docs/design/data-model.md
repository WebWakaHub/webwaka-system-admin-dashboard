# LearningPlatformSystem — Data Model Design
## System ID: SYS-EDU-LEARNINGPLATFORM

### Core Entities
- `CourseManagerEntity`: Primary entity for course manager organ
- `AssessmentEngineEntity`: Primary entity for assessment engine organ
- `LearnerProfileEntity`: Primary entity for learner profile organ
- `ContentDeliveryEntity`: Primary entity for content delivery organ
- `ProgressTrackerEntity`: Primary entity for progress tracker organ

### Nigeria-First Data Patterns
- All monetary fields use `NairaAmount` type (kobo precision)
- All timestamps use WAT (UTC+1) with ISO 8601 format
- All phone numbers use Nigerian format (+234)
- All addresses support Nigerian address hierarchy (State → LGA → Ward)
