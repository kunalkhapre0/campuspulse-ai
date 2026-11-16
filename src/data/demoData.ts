import type {
  BedrockAnalyticsResult,
  CampusEvent,
  EventCategory,
  EventRegistration,
  EventReport,
  StudentFeedback,
} from '@/src/types/campus';

export const EVENT_CATEGORIES: EventCategory[] = [
  'Cloud & Serverless',
  'AI & Machine Learning',
  'Hackathon',
  'Hands-On Lab',
  'Community & Networking',
];

export const HERO_IMAGE_PATH = '/src/assets/images/hero_campus_summit_1794829626125.jpg';

export const DEMO_STUDENT_PROFILE = {
  studentName: 'Aarav Patel',
  studentEmail: 'aarav.patel@university.edu',
  studentId: 'CS-2026-0418',
  department: 'Computer Science & Engineering',
};

export const DEMO_EVENTS: CampusEvent[] = [
  {
    id: 'evt-aws-cloud-ai-workshop',
    title: 'AWS Cloud & AI Workshop',
    description:
      'Hands-on architectural session covering serverless APIs with AWS Lambda, DynamoDB single-table patterns, and generative AI workflows using Amazon Bedrock.',
    category: 'Cloud & Serverless',
    date: '2026-12-04',
    startTime: '14:00',
    endTime: '17:00',
    venue: 'Engineering Innovation Hall, Room 204',
    capacity: 120,
    registeredCount: 94,
    checkedInCount: 0,
    organizerName: 'Dr. Elena Rostova',
    organizerEmail: 'cloud-club@university.edu',
    organizerDepartment: 'School of Computing',
    status: 'upcoming',
    imageUrl: '/src/assets/images/event_cloud_workshop_1794829626254.jpg',
    createdAt: '2026-11-01T09:00:00Z',
    schedule: [
      { time: '14:00 - 14:30', title: 'Serverless Foundations & HTTP API Gateway', speaker: 'Dr. Elena Rostova' },
      { time: '14:30 - 15:45', title: 'Building Event Handlers with Node.js Lambda & DynamoDB', speaker: 'Marcus Chen, AWS Hero' },
      { time: '15:45 - 17:00', title: 'Integrating Amazon Bedrock Inference & Q&A', speaker: 'Priya Nair, Cloud Architect' },
    ],
  },
  {
    id: 'evt-genai-innovation-day',
    title: 'Generative AI Innovation Day',
    description:
      'University-wide symposium showcasing applied foundation models, responsible evaluation guardrails, and production retrieval architectures for student researchers.',
    category: 'AI & Machine Learning',
    date: '2026-12-11',
    startTime: '10:00',
    endTime: '16:30',
    venue: 'Main Auditorium, North Campus',
    capacity: 250,
    registeredCount: 238,
    checkedInCount: 0,
    organizerName: 'Prof. Julian Vance',
    organizerEmail: 'ai-institute@university.edu',
    organizerDepartment: 'Applied AI Research Center',
    status: 'upcoming',
    imageUrl: '/src/assets/images/event_genai_day_1794829627290.jpg',
    createdAt: '2026-11-02T11:30:00Z',
    schedule: [
      { time: '10:00 - 11:15', title: 'Keynote: Foundation Models in Campus Research', speaker: 'Prof. Julian Vance' },
      { time: '11:30 - 13:00', title: 'Structured Sentiment & Theme Extraction at Scale', speaker: 'Nadia Al-Mansoor' },
      { time: '14:00 - 16:30', title: 'Student Research Demos & Architecture Review', speaker: 'Research Panel' },
    ],
  },
  {
    id: 'evt-campus-hackathon-2026',
    title: 'Campus Hackathon 2026',
    description:
      '36-hour engineering buildathon challenging student teams to ship zero-infrastructure cloud applications addressing campus sustainability, accessibility, and learning.',
    category: 'Hackathon',
    date: '2026-12-18',
    startTime: '09:00',
    endTime: '20:00',
    venue: 'Central Engineering Atrium',
    capacity: 180,
    registeredCount: 152,
    checkedInCount: 0,
    organizerName: 'ACM Student Chapter',
    organizerEmail: 'hackathon@university.edu',
    organizerDepartment: 'Student Engineering Council',
    status: 'upcoming',
    imageUrl: '/src/assets/images/event_hackathon_night_1794829627860.jpg',
    createdAt: '2026-11-03T15:00:00Z',
    schedule: [
      { time: '09:00 - 10:00', title: 'Problem Tracks Briefing & Team Formation', speaker: 'ACM Executive Board' },
      { time: '10:00 - 17:00', title: 'Build Sprint & AWS Architecture Office Hours', speaker: 'Cloud Mentors' },
      { time: '17:30 - 20:00', title: 'Live Demo Judging & Technical Debrief', speaker: 'Faculty & Industry Jury' },
    ],
  },
  {
    id: 'evt-cloud-computing-bootcamp',
    title: 'Cloud Computing Bootcamp',
    description:
      'Intensive technical lab guiding undergraduates through IAM least privilege, DynamoDB indexing, S3 presigned URLs, and Step Functions workflow orchestration.',
    category: 'Hands-On Lab',
    date: '2026-10-22',
    startTime: '13:00',
    endTime: '17:30',
    venue: 'Systems Lab 3B, Turing Building',
    capacity: 80,
    registeredCount: 80,
    checkedInCount: 74,
    organizerName: 'Cloud Builders Society',
    organizerEmail: 'builders@university.edu',
    organizerDepartment: 'Department of Computer Science',
    status: 'past',
    imageUrl: '/src/assets/images/event_bootcamp_studio_1794829628330.jpg',
    createdAt: '2026-09-25T10:00:00Z',
    schedule: [
      { time: '13:00 - 14:15', title: 'IAM Policies & Private S3 Storage Patterns', speaker: 'Devon Brooks' },
      { time: '14:30 - 16:00', title: 'Step Functions State Machines Lab', speaker: 'Sana Takahashi' },
      { time: '16:15 - 17:30', title: 'Production Deployment & Cost Guardrails', speaker: 'Devon Brooks' },
    ],
  },
  {
    id: 'evt-developer-community-meetup',
    title: 'Developer Community Meetup',
    description:
      'Peer-led architecture lightning talks, open-source project showcases, and technical networking across software engineering, cloud, and data science cohorts.',
    category: 'Community & Networking',
    date: '2026-11-05',
    startTime: '17:30',
    endTime: '19:30',
    venue: 'Commons Glass Pavilion',
    capacity: 100,
    registeredCount: 86,
    checkedInCount: 79,
    organizerName: 'Campus Developer Guild',
    organizerEmail: 'devguild@university.edu',
    organizerDepartment: 'Student Innovation Office',
    status: 'past',
    imageUrl: '/src/assets/images/event_dev_meetup_1794829628209.jpg',
    createdAt: '2026-10-12T08:45:00Z',
    schedule: [
      { time: '17:30 - 18:15', title: 'Lightning Talks: Serverless Side Projects', speaker: 'Student Speakers' },
      { time: '18:15 - 19:00', title: 'Panel: Preparing for Cloud Engineering Internships', speaker: 'Alumni Engineers' },
      { time: '19:00 - 19:30', title: 'Open Networking & Project Showcase', speaker: 'All Attendees' },
    ],
  },
];

export const DEMO_REGISTRATIONS: EventRegistration[] = [
  {
    id: 'reg-1001',
    eventId: 'evt-aws-cloud-ai-workshop',
    studentName: DEMO_STUDENT_PROFILE.studentName,
    studentEmail: DEMO_STUDENT_PROFILE.studentEmail,
    studentId: DEMO_STUDENT_PROFILE.studentId,
    department: DEMO_STUDENT_PROFILE.department,
    status: 'confirmed',
    registeredAt: '2026-11-10T14:22:00Z',
  },
  {
    id: 'reg-1002',
    eventId: 'evt-cloud-computing-bootcamp',
    studentName: DEMO_STUDENT_PROFILE.studentName,
    studentEmail: DEMO_STUDENT_PROFILE.studentEmail,
    studentId: DEMO_STUDENT_PROFILE.studentId,
    department: DEMO_STUDENT_PROFILE.department,
    status: 'attended',
    registeredAt: '2026-10-10T09:15:00Z',
  },
  {
    id: 'reg-1003',
    eventId: 'evt-developer-community-meetup',
    studentName: DEMO_STUDENT_PROFILE.studentName,
    studentEmail: DEMO_STUDENT_PROFILE.studentEmail,
    studentId: DEMO_STUDENT_PROFILE.studentId,
    department: DEMO_STUDENT_PROFILE.department,
    status: 'attended',
    registeredAt: '2026-10-28T16:40:00Z',
  },
  {
    id: 'reg-1004',
    eventId: 'evt-genai-innovation-day',
    studentName: 'Maya Lin',
    studentEmail: 'maya.lin@university.edu',
    studentId: 'DS-2026-0192',
    department: 'Data Science',
    status: 'confirmed',
    registeredAt: '2026-11-12T11:05:00Z',
  },
];

export const DEMO_FEEDBACK: StudentFeedback[] = [
  {
    id: 'fb-201',
    eventId: 'evt-cloud-computing-bootcamp',
    studentName: 'Aarav Patel',
    studentEmail: 'aarav.patel@university.edu',
    overallRating: 5,
    eventQuality: 5,
    speakerQuality: 5,
    learningExperience: 5,
    writtenFeedback:
      'Walking through real Step Functions ASL definitions and private S3 presigned URLs made serverless orchestration click immediately.',
    suggestions: 'Share the SAM starter repository 24 hours earlier so students can pre-install CLI dependencies.',
    submittedAt: '2026-10-22T18:10:00Z',
  },
  {
    id: 'fb-202',
    eventId: 'evt-cloud-computing-bootcamp',
    studentName: 'Sophia Alvarez',
    studentEmail: 'sophia.alvarez@university.edu',
    overallRating: 4,
    eventQuality: 4,
    speakerQuality: 5,
    learningExperience: 4,
    writtenFeedback:
      'Strong speaker pacing and clear IAM policy explanations. The DynamoDB key design walkthrough was especially useful.',
    suggestions: 'Add 15 more minutes to the debugging portion of Lab 2; campus Wi-Fi slowed down npm installs.',
    submittedAt: '2026-10-22T19:02:00Z',
  },
  {
    id: 'fb-203',
    eventId: 'evt-cloud-computing-bootcamp',
    studentName: 'Liam OConnor',
    studentEmail: 'liam.oconnor@university.edu',
    overallRating: 3,
    eventQuality: 3,
    speakerQuality: 4,
    learningExperience: 3,
    writtenFeedback:
      'Good technical depth overall, though the final cost guardrails section felt rushed near the end of the afternoon.',
    suggestions: 'Provide a concise checklist handout for AWS Free Tier billing alerts before students deploy.',
    submittedAt: '2026-10-23T08:45:00Z',
  },
  {
    id: 'fb-204',
    eventId: 'evt-cloud-computing-bootcamp',
    studentName: 'Neha Sharma',
    studentEmail: 'neha.sharma@university.edu',
    overallRating: 5,
    eventQuality: 5,
    speakerQuality: 5,
    learningExperience: 5,
    writtenFeedback:
      'Best technical workshop this semester. Leaving with a working serverless API and Step Functions workflow gave our team confidence.',
    suggestions: 'Run an intermediate follow-up focused on observability and CloudWatch structured logging.',
    submittedAt: '2026-10-23T10:14:00Z',
  },
  {
    id: 'fb-205',
    eventId: 'evt-developer-community-meetup',
    studentName: 'Aarav Patel',
    studentEmail: 'aarav.patel@university.edu',
    overallRating: 5,
    eventQuality: 5,
    speakerQuality: 4,
    learningExperience: 5,
    writtenFeedback:
      'The lightning talk format kept energy high and the alumni panel gave realistic advice on architecture interviews.',
    suggestions: 'Include a shared project board so attendees can follow up with student speakers afterward.',
    submittedAt: '2026-11-05T20:15:00Z',
  },
  {
    id: 'fb-206',
    eventId: 'evt-developer-community-meetup',
    studentName: 'Daniel Kim',
    studentEmail: 'daniel.kim@university.edu',
    overallRating: 4,
    eventQuality: 4,
    speakerQuality: 4,
    learningExperience: 4,
    writtenFeedback:
      'Great atmosphere in the Commons Pavilion. Acoustics near the back tables made a couple of Q&A questions harder to hear.',
    suggestions: 'Use a handheld microphone for audience Q&A and publish lightning talk slide decks.',
    submittedAt: '2026-11-06T09:30:00Z',
  },
  {
    id: 'fb-207',
    eventId: 'evt-developer-community-meetup',
    studentName: 'Chloe Bennett',
    studentEmail: 'chloe.bennett@university.edu',
    overallRating: 2,
    eventQuality: 3,
    speakerQuality: 3,
    learningExperience: 2,
    writtenFeedback:
      'Networking was friendly, but I expected deeper code-level walkthroughs during the lightning talks.',
    suggestions: 'Label session tracks clearly as beginner overview versus deep-dive architecture.',
    submittedAt: '2026-11-06T12:10:00Z',
  },
];

export const DEMO_REPORTS: EventReport[] = [
  {
    id: 'rep-cloud-bootcamp-2026',
    eventId: 'evt-cloud-computing-bootcamp',
    eventName: 'Cloud Computing Bootcamp',
    status: 'SUCCEEDED',
    source: 'demo',
    executionArn: 'DEMO-PREVIEW-ONLY (Connect AWS Step Functions to generate live ARN)',
    generatedAt: '2026-10-23T11:30:00Z',
    aiSummary:
      'Synthetic preview summary: 74 of 80 registered students checked in (92.5% attendance). Attendees rated hands-on Step Functions and IAM labs highly (4.25/5 overall), while flagging setup latency from campus Wi-Fi and rushed billing guardrail coverage.',
    feedbackAnalysis:
      'Out of 4 synthetic feedback entries, 2 expressed strongly positive sentiment regarding hands-on AWS architecture clarity, 1 was positive with pacing notes, and 1 was neutral requesting clearer Free Tier alert guidance.',
    keyRecommendations: [
      'Publish repository prerequisites and CLI setup steps 24 hours prior to lab start.',
      'Allocate 15 additional minutes to Lab 2 debugging and cost-alert verification.',
      'Schedule a follow-up session on structured CloudWatch observability.',
    ],
    s3Key: 'demo-preview/reports/evt-cloud-computing-bootcamp/report.json',
  },
  {
    id: 'rep-dev-meetup-2026',
    eventId: 'evt-developer-community-meetup',
    eventName: 'Developer Community Meetup',
    status: 'SUCCEEDED',
    source: 'demo',
    executionArn: 'DEMO-PREVIEW-ONLY (Connect AWS Step Functions to generate live ARN)',
    generatedAt: '2026-11-06T14:00:00Z',
    aiSummary:
      'Synthetic preview summary: Strong turnout (79/86 checked in) with high appreciation for peer lightning talks and alumni career panels. Acoustic clarity during Q&A and session depth labeling were the primary improvement areas.',
    feedbackAnalysis:
      'Out of 3 synthetic feedback entries, 2 highlighted engaging peer networking and alumni advice, while 1 noted insufficient technical depth for advanced builders.',
    keyRecommendations: [
      'Provide a wireless Q&A microphone in the Commons Glass Pavilion.',
      'Tag lightning talks by technical depth (Introductory vs. Architecture Deep Dive).',
      'Publish a post-event directory of student project links.',
    ],
    s3Key: 'demo-preview/reports/evt-developer-community-meetup/report.json',
  },
];

const DEMO_BEDROCK_NARRATIVES: Record<
  string,
  Pick<BedrockAnalyticsResult, 'themes' | 'repeatedConcerns' | 'recommendations' | 'executiveSummary'>
> = {
  'evt-cloud-computing-bootcamp': {
    executiveSummary:
      'Synthetic demo preview: Students valued hands-on Step Functions and private S3 presigned URL labs, achieving strong practical comprehension. Main friction points centered on in-room dependency download time and compressed coverage of AWS billing guardrails.',
    themes: [
      { theme: 'Step Functions & S3 Architecture Clarity', mentions: 3, sentiment: 'positive' },
      { theme: 'Pre-Lab CLI Setup & Wi-Fi Latency', mentions: 2, sentiment: 'negative' },
      { theme: 'AWS Cost & Free Tier Guardrails', mentions: 2, sentiment: 'mixed' },
      { theme: 'Desire for CloudWatch Follow-Up Lab', mentions: 1, sentiment: 'positive' },
    ],
    repeatedConcerns: [
      'Dependency installation during the live session consumed lab debugging time.',
      'Final billing alert and cost-control segment felt rushed in the last 15 minutes.',
    ],
    recommendations: [
      'Distribute the SAM template and package lockfile 24 hours ahead of the workshop.',
      'Reserve a dedicated 15-minute block for AWS Budgets and CloudWatch alarm setup.',
      'Offer an intermediate Part 2 session focused on distributed tracing and observability.',
    ],
  },
  'evt-developer-community-meetup': {
    executiveSummary:
      'Synthetic demo preview: Peer-led lightning talks and the alumni engineering panel drove strong engagement. Attendees requested clearer technical level indicators and improved room audio during open Q&A.',
    themes: [
      { theme: 'Alumni Career & Architecture Panel', mentions: 2, sentiment: 'positive' },
      { theme: 'Lightning Talk Energy & Pacing', mentions: 2, sentiment: 'positive' },
      { theme: 'Pavilion Acoustics During Q&A', mentions: 1, sentiment: 'negative' },
      { theme: 'Technical Depth Expectations', mentions: 1, sentiment: 'mixed' },
    ],
    repeatedConcerns: [
      'Back-row attendees had difficulty hearing unamplified audience questions.',
      'Advanced students wanted clearer track labels separating overview talks from code deep dives.',
    ],
    recommendations: [
      'Deploy a roving Q&A microphone for all audience interactions in Commons Pavilion.',
      'Tag each lightning talk with difficulty level and stack prerequisites in the agenda.',
      'Share speaker repositories and slide decks immediately after the meetup.',
    ],
  },
};

export function computeDemoAnalytics(
  eventId: string,
  feedbackList: StudentFeedback[]
): BedrockAnalyticsResult {
  const entries = feedbackList.filter((item) => item.eventId === eventId);

  if (entries.length === 0) {
    return {
      eventId,
      source: 'unavailable',
      modelId: 'Not invoked (No feedback submissions)',
      generatedAt: null,
      responseCount: 0,
      averageOverall: 0,
      averageEventQuality: 0,
      averageSpeakerQuality: 0,
      averageLearningExperience: 0,
      sentimentCounts: { positive: 0, neutral: 0, negative: 0 },
      themes: [],
      repeatedConcerns: [],
      recommendations: [],
      executiveSummary: '',
      unavailableReason:
        'No student feedback has been submitted for this event yet. Once attendees submit feedback, Amazon Bedrock can analyze themes and recommendations.',
    };
  }

  const count = entries.length;
  const avg = (picker: (f: StudentFeedback) => number) =>
    Number((entries.reduce((sum, f) => sum + picker(f), 0) / count).toFixed(2));

  // Derive sentiment strictly from actual ratings in the feedback entries (never fabricated)
  const sentimentCounts = entries.reduce(
    (acc, item) => {
      if (item.overallRating >= 4) acc.positive += 1;
      else if (item.overallRating === 3) acc.neutral += 1;
      else acc.negative += 1;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );

  const preset = DEMO_BEDROCK_NARRATIVES[eventId];

  return {
    eventId,
    source: 'demo',
    modelId: 'Demo Preview Dataset (Connect AWS API Gateway for live Amazon Bedrock)',
    generatedAt: new Date().toISOString(),
    responseCount: count,
    averageOverall: avg((f) => f.overallRating),
    averageEventQuality: avg((f) => f.eventQuality),
    averageSpeakerQuality: avg((f) => f.speakerQuality),
    averageLearningExperience: avg((f) => f.learningExperience),
    sentimentCounts,
    themes: preset
      ? preset.themes
      : [
          {
            theme: 'Newly Submitted Student Feedback (Awaiting Live Bedrock Synthesis)',
            mentions: count,
            sentiment: sentimentCounts.positive >= sentimentCounts.negative ? 'positive' : 'mixed',
          },
        ],
    repeatedConcerns: preset
      ? preset.repeatedConcerns
      : entries
          .map((e) => e.suggestions.trim())
          .filter(Boolean)
          .slice(0, 3),
    recommendations: preset
      ? preset.recommendations
      : [
          'Connect your AWS API Gateway endpoint to run Amazon Bedrock theme clustering on these new responses.',
        ],
    executiveSummary: preset
      ? preset.executiveSummary
      : `Synthetic local summary based on ${count} submitted feedback ${
          count === 1 ? 'response' : 'responses'
        } (average overall rating ${avg((f) => f.overallRating)}/5). Connect a live AWS backend to run Amazon Bedrock synthesis.`,
  };
}
