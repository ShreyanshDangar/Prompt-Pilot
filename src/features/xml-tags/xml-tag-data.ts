export interface XmlTag {
  id: string
  name: string
  description: string
  category: string
}

export const XML_TAG_CATEGORIES = [
  "Basic Structure",
  "Code Generation",
  "Data Processing",
] as const

export const BUILT_IN_XML_TAGS: XmlTag[] = [
  { id: "task", name: "task", description: "Define the main objective or action you want the AI to perform", category: "Basic Structure" },
  { id: "context", name: "context", description: "Provide background information the AI needs to understand the task", category: "Basic Structure" },
  { id: "requirements", name: "requirements", description: "Specify what the output must include or achieve", category: "Basic Structure" },
  { id: "constraints", name: "constraints", description: "Define limitations, restrictions, or boundaries for the response", category: "Basic Structure" },
  { id: "output", name: "output", description: "Specify the exact structure and format of the expected response", category: "Basic Structure" },
  { id: "language", name: "language", description: "Specify the programming language for code generation", category: "Code Generation" },
  { id: "framework", name: "framework", description: "Define the technology stack and frameworks to use", category: "Code Generation" },
  { id: "features", name: "features", description: "List specific functionality the code must implement", category: "Code Generation" },
  { id: "code_style", name: "code_style", description: "Define coding conventions and style preferences", category: "Code Generation" },
  { id: "tests", name: "tests", description: "Specify testing expectations for generated code", category: "Code Generation" },
  { id: "data_source", name: "data_source", description: "Describe where the data comes from and its characteristics", category: "Data Processing" },
  { id: "transformations", name: "transformations", description: "Define how data should be cleaned, transformed, or enriched", category: "Data Processing" },
  { id: "validation", name: "validation", description: "Specify rules to validate data quality and integrity", category: "Data Processing" },
  { id: "error_handling", name: "error_handling", description: "Define how to handle errors, exceptions, and edge cases", category: "Data Processing" },
  { id: "output_format", name: "output_format", description: "Specify the structure of processed data output", category: "Data Processing" },
]
