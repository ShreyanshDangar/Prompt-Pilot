export interface PromptTemplate {
  id: string
  name: string
  category: string
  description: string
  content: string
  tags: string[]
}

export const TEMPLATE_CATEGORIES = [
  "Coding",
  "Writing",
  "Analysis",
  "Business",
  "Creative",
] as const

export const TEMPLATES: PromptTemplate[] = [
  {
    id: "code-review",
    name: "Code Review",
    category: "Coding",
    description: "Structured code review with specific feedback areas",
    content: "Review the following {{language}} code. Focus on:\n1. Correctness and potential bugs\n2. Performance issues\n3. Security vulnerabilities\n4. Code readability and maintainability\n5. Adherence to best practices\n\nProvide specific line-by-line feedback where applicable.\n\nCode:\n```\n{{code}}\n```",
    tags: ["review", "quality", "feedback"],
  },
  {
    id: "debug-helper",
    name: "Debug Assistant",
    category: "Coding",
    description: "Systematic debugging approach for error resolution",
    content: "I'm encountering the following error in my {{language}} project:\n\nError message:\n{{error}}\n\nRelevant code:\n```\n{{code}}\n```\n\nWhat I've tried:\n{{attempts}}\n\nPlease help me identify the root cause and provide a fix.",
    tags: ["debug", "error", "fix"],
  },
  {
    id: "architecture-design",
    name: "Architecture Design",
    category: "Coding",
    description: "System architecture planning and evaluation",
    content: "Design a system architecture for {{project_description}}.\n\nRequirements:\n{{requirements}}\n\nConsider: scalability, maintainability, security, cost, and development speed. Provide diagrams or structured descriptions of components, data flow, and technology choices.",
    tags: ["architecture", "design", "system"],
  },
  {
    id: "refactor-guide",
    name: "Refactoring Guide",
    category: "Coding",
    description: "Code refactoring with preservation of functionality",
    content: "Refactor the following {{language}} code to improve readability, performance, and maintainability. Preserve all existing functionality.\n\nCurrent code:\n```\n{{code}}\n```\n\nSpecific concerns:\n{{concerns}}",
    tags: ["refactor", "clean-code", "improvement"],
  },
  {
    id: "blog-post",
    name: "Blog Post Writer",
    category: "Writing",
    description: "Structured blog post with SEO considerations",
    content: "Write a blog post about {{topic}}.\n\nTarget audience: {{audience}}\nTone: {{tone}}\nLength: {{word_count}} words\n\nInclude:\n- Engaging introduction with a hook\n- Clear subheadings\n- Practical examples\n- Conclusion with call to action\n- SEO-friendly structure",
    tags: ["blog", "content", "seo"],
  },
  {
    id: "email-drafter",
    name: "Professional Email",
    category: "Writing",
    description: "Professional email with appropriate tone and structure",
    content: "Draft a professional email with the following details:\n\nRecipient: {{recipient}}\nPurpose: {{purpose}}\nTone: {{tone}}\nKey points to cover:\n{{key_points}}\n\nKeep it concise, clear, and action-oriented.",
    tags: ["email", "professional", "communication"],
  },
  {
    id: "documentation-writer",
    name: "Technical Documentation",
    category: "Writing",
    description: "Clear technical documentation for APIs or features",
    content: "Write technical documentation for {{feature_name}}.\n\nOverview: {{overview}}\n\nInclude:\n- Description and purpose\n- Setup / installation steps\n- Usage examples with code snippets\n- API reference (if applicable)\n- Common issues and troubleshooting\n- Related resources",
    tags: ["documentation", "technical", "api"],
  },
  {
    id: "data-analysis",
    name: "Data Analysis Plan",
    category: "Analysis",
    description: "Structured approach to data analysis tasks",
    content: "Analyze the following data/situation:\n\n{{data_description}}\n\nObjective: {{objective}}\n\nProvide:\n1. Key findings and patterns\n2. Statistical insights (if applicable)\n3. Visualizations recommendations\n4. Actionable conclusions\n5. Limitations and caveats",
    tags: ["data", "analysis", "insights"],
  },
  {
    id: "comparison-matrix",
    name: "Comparison Analysis",
    category: "Analysis",
    description: "Detailed comparison between options or alternatives",
    content: "Compare the following options:\n\nOption A: {{option_a}}\nOption B: {{option_b}}\n\nCriteria for comparison:\n{{criteria}}\n\nProvide a structured comparison with pros, cons, and a recommendation based on the criteria.",
    tags: ["comparison", "evaluation", "decision"],
  },
  {
    id: "business-proposal",
    name: "Business Proposal",
    category: "Business",
    description: "Professional business proposal framework",
    content: "Create a business proposal for {{project_name}}.\n\nClient: {{client}}\nObjective: {{objective}}\nBudget range: {{budget}}\nTimeline: {{timeline}}\n\nInclude: executive summary, scope of work, deliverables, timeline, pricing, and terms.",
    tags: ["proposal", "business", "client"],
  },
  {
    id: "meeting-summary",
    name: "Meeting Summary",
    category: "Business",
    description: "Structured meeting notes with action items",
    content: "Summarize the following meeting notes into a structured format:\n\n{{raw_notes}}\n\nOrganize into:\n1. Meeting overview (date, attendees, purpose)\n2. Key discussion points\n3. Decisions made\n4. Action items (owner, deadline)\n5. Follow-up needed",
    tags: ["meeting", "summary", "action-items"],
  },
  {
    id: "brainstorm",
    name: "Brainstorming Session",
    category: "Creative",
    description: "Structured creative ideation and brainstorming",
    content: "Help me brainstorm ideas for {{topic}}.\n\nContext: {{context}}\nConstraints: {{constraints}}\n\nGenerate 10 diverse ideas ranging from practical to innovative. For each idea, provide a brief description and potential impact.",
    tags: ["brainstorm", "ideas", "creative"],
  },
  {
    id: "story-outline",
    name: "Story Outline",
    category: "Creative",
    description: "Narrative structure and story planning",
    content: "Create a story outline with the following elements:\n\nGenre: {{genre}}\nSetting: {{setting}}\nMain character: {{character}}\nCentral conflict: {{conflict}}\n\nProvide: premise, three-act structure, key plot points, character arcs, and thematic elements.",
    tags: ["story", "narrative", "creative-writing"],
  },
]
