import type { SiteContent } from "./types";

// The default, editable content for the whole site + quiz. The admin page
// writes overrides of this into Supabase (site_content). On first run the
// API seeds this object so the scorecard works out of the box.
export const defaultContent: SiteContent = {
  meta: {
    brandName: "AI Dojo",
    productName: "The AI Leadership Readiness Scorecard",
    tagline: "Are your leaders ready to lead with AI?",
    footerNote: "Helping senior leaders turn AI into measurable productivity gains.",
    debriefUrl: "#book-a-debrief",
  },

  landing: {
    eyebrow: "AI Readiness · 3-minute scorecard",
    h1Pre: "Are your leaders ready to lead with ",
    h1Accent: "AI",
    h1Post: "?",
    lede:
      "Answer 11 quick questions to see how ready your leaders are to turn AI into real <strong>productivity gains</strong> — scored across Knowledge, Mindset, Skills, and Leadership — and get a personalized report with your biggest opportunity and concrete next steps.",
    primaryCta: "Start the Scorecard",
    primaryCtaSub: "Takes less than 3 minutes",
    metricA: "11",
    metricALabel: "quick questions",
    metricB: "4",
    metricBLabel: "readiness areas",
    metricC: "3 min",
    metricCLabel: "to your report",
    credEyebrow: "Why trust this",
    credQuote:
      "“AI won't replace humans — but humans with AI will replace humans without AI.”",
    credAttribution:
      "Based on the AI Maturity framework from Harvard Business Impact and HBS Professor Karim Lakhani's work on AI adoption.",
    pillarsEyebrow: "The four building blocks",
    pillarsTitle: "What we measure",
    pillarsLede:
      "Every category lands on the same 1–5 scale, so you can see exactly where to focus first.",
    pillars: [
      { emoji: "📚", title: "Knowledge", desc: "Baseline understanding of AI, the tools, real use cases, and responsible use." },
      { emoji: "🧭", title: "Mindset", desc: "Curiosity, experimentation, and a growth-and-disruptor outlook toward AI." },
      { emoji: "🛠️", title: "Skills", desc: "Testing and applying generative AI to create value — safely and at scale." },
      { emoji: "🏆", title: "Leadership", desc: "Embedding AI in operations, supporting risk-taking, and measuring impact." },
    ],
    connectionEyebrow: "Why now",
    connectionTitle: "Most leaders know AI matters — few know where they actually stand",
    connectionBody:
      "Senior leaders feel the pressure to deliver AI-driven productivity, but rarely have a clear read on where their organization actually stands. This scorecard meets your leaders where they are today and shows the fastest path to measurable gains.",
    finalCtaTitle: "Get your AI Readiness Report",
    finalCtaBody:
      "Finish to unlock your personalized AI Readiness Report (PDF) you can share with your leadership team.",
    finalCtaButton: "Start the Scorecard",
  },

  lead: {
    title: "First, where should we send your report?",
    subtitle:
      "We'll generate a personalized AI Readiness Report and email you a copy with your benchmark chart and next steps.",
    submitCta: "Start the questions →",
    consentNote:
      "We'll email your results and occasional AI-readiness insights. Unsubscribe anytime.",
    roleOptions: [
      "C-suite",
      "VP/Director",
      "Senior manager",
      "Middle manager",
      "Individual contributor",
      "Other",
    ],
    sizeOptions: ["1–50", "51–250", "251–1,000", "1,001–5,000", "5,000+"],
  },

  quiz: {
    introCategoryLabels: {
      knowledge: "Knowledge",
      mindset: "Mindset",
      skills: "Skills",
      leadership: "Leadership",
    },
    questions: [
      {
        id: "q1",
        category: "knowledge",
        type: "single",
        prompt:
          "How well would you say most leaders in your organization understand what AI is and what it's capable of?",
        options: [
          { id: "q1a", label: "Very well", points: 5 },
          { id: "q1b", label: "Somewhat well", points: 4 },
          { id: "q1c", label: "Mixed", points: 3 },
          { id: "q1d", label: "Not very well", points: 2 },
          { id: "q1e", label: "Not at all", points: 1 },
          { id: "q1f", label: "Not sure / don't know", points: null },
        ],
      },
      {
        id: "q2",
        category: "knowledge",
        type: "multi_interests",
        prompt: "What are your top interests in using AI today?",
        help: "Select all that apply. This isn't scored — it helps us tailor your follow-up.",
        options: [
          { id: "q2a", label: "Improve efficiency", points: null },
          { id: "q2b", label: "Automate processes / functions", points: null },
          { id: "q2c", label: "Augment creativity", points: null },
          { id: "q2d", label: "Use advanced data / predictive analytics", points: null },
          { id: "q2e", label: "Reduce costs", points: null },
          { id: "q2f", label: "Enhance user experience (e.g., personalization)", points: null },
          { id: "q2g", label: "None of the above", points: null },
        ],
      },
      {
        id: "q3",
        category: "knowledge",
        type: "single",
        prompt:
          "How well versed are your company's leaders in your AI ethics and responsible-use policies?",
        options: [
          { id: "q3a", label: "Very well — most could quote them", points: 5 },
          { id: "q3b", label: "Somewhat well — most know what they can/can't do", points: 4 },
          { id: "q3c", label: "Basically aware — most know we have policies and where to find them", points: 3 },
          { id: "q3d", label: "Not aware — most could benefit from brushing up", points: 1 },
          { id: "q3e", label: "Not sure / don't know — \"do we even have a policy?\"", points: null },
        ],
      },
      {
        id: "q4",
        category: "mindset",
        type: "single",
        prompt:
          "On HBS Professor Karim Lakhani's scale — from \"skeptic\" to \"cyborg\" — where would most leaders in your organization fall?",
        options: [
          { id: "q4a", label: "Cyborg — basically half droid", points: 5 },
          { id: "q4b", label: "Explorer — actively experimenting", points: 4 },
          { id: "q4c", label: "Dabbler — testing with free trials", points: 3 },
          { id: "q4d", label: "Searcher — considering opportunities", points: 2 },
          { id: "q4e", label: "Skeptic — 100% people-powered", points: 1 },
        ],
      },
      {
        id: "q5",
        category: "mindset",
        type: "single",
        prompt:
          "When it comes to AI, how comfortable are your leaders with testing to learn and failing fast?",
        options: [
          { id: "q5a", label: "Very comfortable", points: 5 },
          { id: "q5b", label: "Somewhat comfortable", points: 4 },
          { id: "q5c", label: "Somewhat uncomfortable", points: 2 },
          { id: "q5d", label: "Very uncomfortable", points: 1 },
          { id: "q5e", label: "Not sure / don't know", points: null },
        ],
      },
      {
        id: "q6",
        category: "mindset",
        type: "single",
        prompt:
          "How proactive are your leaders at anticipating the impact of next-generation AI technologies before they become mainstream?",
        options: [
          { id: "q6a", label: "Very proactive", points: 5 },
          { id: "q6b", label: "Somewhat proactive", points: 4 },
          { id: "q6c", label: "Somewhat reactive", points: 2 },
          { id: "q6d", label: "Very reactive", points: 1 },
          { id: "q6e", label: "Not sure / don't know", points: null },
        ],
      },
      {
        id: "q7",
        category: "skills",
        type: "multi_count",
        prompt:
          "Which AI collaboration skills are the majority of your leaders proficient in (i.e., currently use to create value)?",
        help: "Select all that apply.",
        options: [
          { id: "q7a", label: "Intelligent interrogation / prompting", points: 1 },
          { id: "q7b", label: "Contextualizing information", points: 1 },
          { id: "q7c", label: "Curating and structuring information", points: 1 },
          { id: "q7d", label: "Exercising critical thinking / judgment", points: 1 },
          { id: "q7e", label: "Responsible use / ethics", points: 1 },
          { id: "q7f", label: "Data input and feedback loops", points: 1 },
          { id: "q7g", label: "None of the above", points: 0 },
        ],
        bands: [
          { min: 6, max: 6, points: 5 },
          { min: 5, max: 5, points: 4 },
          { min: 3, max: 4, points: 3 },
          { min: 1, max: 2, points: 2 },
          { min: 0, max: 0, points: 1 },
        ],
      },
      {
        id: "q8",
        category: "skills",
        type: "single",
        prompt:
          "How would you describe your leaders' ability to use generative AI tools to derive meaningful outcomes at scale?",
        help: "Incorporating enablers like customer-centricity, design thinking, and change leadership.",
        options: [
          { id: "q8a", label: "Guiding the organization through transformational change with their expertise", points: 5 },
          { id: "q8b", label: "Regularly contribute to early successes but need to strengthen efforts to scale", points: 4 },
          { id: "q8c", label: "Need support integrating these tools with broader strategies (design thinking, customer-centricity)", points: 2 },
          { id: "q8d", label: "Need guidance to test and apply gen AI tools safely and effectively", points: 1 },
        ],
      },
      {
        id: "q9",
        category: "leadership",
        type: "single",
        prompt:
          "How actively does your organization support risk-taking and experimentation on digital/AI initiatives?",
        options: [
          { id: "q9a", label: "Leaders have ample executive support for creative risk-taking in the digital space", points: 5 },
          { id: "q9b", label: "Individual leaders are willing, but must overcome organizational resistance to experimentation", points: 3 },
          { id: "q9c", label: "No penalty for sticking with the tried and true, so people tend to do that", points: 2 },
          { id: "q9d", label: "Our organization has policies in place to prevent AI experimentation", points: 1 },
          { id: "q9e", label: "Not sure / don't know", points: null },
        ],
      },
      {
        id: "q10",
        category: "leadership",
        type: "single",
        prompt: "How extensively is AI embedded in leaders' everyday operational practices?",
        options: [
          { id: "q10a", label: "Strategically integrated into all aspects of their operations", points: 5 },
          { id: "q10b", label: "Leaders empower certain teams/individuals to use AI tools without interference", points: 4 },
          { id: "q10c", label: "Using some AI tools and technologies in parts of their operations", points: 3 },
          { id: "q10d", label: "Leaders are unaware of the level of individual AI use on their teams", points: 1 },
          { id: "q10e", label: "Not sure / don't know", points: null },
        ],
      },
      {
        id: "q11",
        category: "leadership",
        type: "single",
        prompt:
          "Do your leaders use a common set of metrics to evaluate the use and impact of AI in your business?",
        options: [
          { id: "q11a", label: "Yes", points: 5 },
          { id: "q11b", label: "Maybe", points: 3 },
          { id: "q11c", label: "No", points: 1 },
          { id: "q11d", label: "Don't know", points: null },
        ],
      },
    ],
  },

  results: {
    headline: "Your AI Leadership Readiness Score",
    opportunityEyebrow: "Your biggest opportunity",
    opportunityIntro:
      "This is the area where focused effort will move your readiness the fastest.",
    recTitle: "What to do in each area",
    downloadCta: "Download PDF report",
    primaryCta: "Book a free AI Readiness debrief",
    tiers: [
      { key: "aware", name: "AI Aware", min: 1.0, max: 2.2, meaning: "Foundations are forming. The priority is building shared AI knowledge and a safe space to experiment.", cta: "Get the intro guide to AI-ready leadership." },
      { key: "engaged", name: "AI Engaged", min: 2.3, max: 3.2, meaning: "Curiosity is real but uneven. Time to convert interest into repeatable skills and clearer policy.", cta: "Book a 20-min AI Readiness debrief and get your report." },
      { key: "enabled", name: "AI Enabled", min: 3.3, max: 4.1, meaning: "Leaders are applying AI in real work. Focus on scaling wins and embedding metrics.", cta: "Book a strategy call on scaling AI wins across the org." },
      { key: "first", name: "AI-First Leaders", min: 4.2, max: 5.0, meaning: "AI is woven into how leaders operate. Push the frontier and institutionalize the advantage.", cta: "Explore an advanced engagement or peer cohort." },
    ],
    categories: [
      {
        key: "knowledge", label: "Knowledge", emoji: "📚", accent: "#0033cc",
        recHigh: "Strong foundation of AI knowledge. Advance with deeper integration across functions and continuous education on emerging trends and ethics.",
        recMedium: "You understand AI but should strengthen areas like ethics or applying AI in new ways. Consider targeted training and raising AI literacy.",
        recLow: "Opportunity to build foundational AI knowledge. Prioritize education so leaders understand both the potential and the ethical implications.",
      },
      {
        key: "mindset", label: "Mindset", emoji: "🧭", accent: "#7a1ec2",
        recHigh: "Forward-thinking AI mindset. Keep pushing boundaries with more innovative applications and encourage experimentation with new tools.",
        recMedium: "Willing to engage, but would benefit from a culture that embraces experimentation and learning from failure.",
        recLow: "Mindset may be cautious or reactive. Build comfort with testing and adapting by starting with small pilots.",
      },
      {
        key: "skills", label: "Skills", emoji: "🛠️", accent: "#f08a1c",
        recHigh: "Strong AI collaboration skills. Maintain the edge with advanced applications and upskilling in responsible use and data-input techniques.",
        recMedium: "Solid grasp of collaborating with AI; improve critical thinking and feedback loops via advanced workshops.",
        recLow: "Key collaboration skills may be missing. Invest in training on AI integration, data analysis, and responsible use.",
      },
      {
        key: "leadership", label: "Leadership", emoji: "🏆", accent: "#2f7a3a",
        recHigh: "Fostering AI leadership well. Keep empowering risk-taking and integrate AI metrics into all decision-making.",
        recMedium: "Making progress; reinforce support for experimentation and embed AI more fully into everyday operations.",
        recLow: "May lack robust AI leadership. Build a culture that supports risk-taking and develop a common set of metrics to evaluate AI's impact.",
      },
    ],
  },
};
