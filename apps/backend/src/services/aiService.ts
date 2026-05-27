import { GoogleGenerativeAI } from '@google/generative-ai';

class AIService {
  private genAI: GoogleGenerativeAI;
  private model;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  // Explain code snippet
  async explainCode(code: string, language?: string): Promise<string> {
    const prompt = `You are a senior software engineer. Explain the following ${
      language || 'code'
    } in a clear, concise way. Include:
1. What the code does
2. Key concepts used
3. Potential improvements or issues

Code:
\`\`\`${language || ''}
${code}
\`\`\`

Provide a well-structured explanation.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error: any) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate code explanation');
    }
  }

  // Analyze repository and generate summary
  async analyzeRepository(data: {
    name: string;
    description: string;
    languages: string[];
    readme: string;
    stars: number;
    openIssues: number;
  }): Promise<string> {
    const prompt = `You are a technical analyst reviewing GitHub repositories. Analyze this repository:

**Repository:** ${data.name}
**Description:** ${data.description || 'No description'}
**Languages:** ${data.languages.join(', ')}
**Stars:** ${data.stars}
**Open Issues:** ${data.openIssues}

**README Preview:**
${data.readme.slice(0, 1000)}...

Provide a **concise** analysis covering:
1. Project purpose and use case
2. Tech stack assessment
3. Code quality indicators
4. Recommendations for contributors

Keep it under 300 words.`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to analyze repository');
    }
  }

  // Generate README suggestions
  async suggestReadmeImprovements(currentReadme: string): Promise<string> {
    const prompt = `As a documentation expert, review this README and suggest 3-5 specific improvements:

${currentReadme.slice(0, 2000)}

Focus on:
- Missing sections (installation, usage, contributing)
- Clarity and structure
- Missing badges or metadata
- Code examples

Provide actionable suggestions.`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate README suggestions');
    }
  }

  // Debug assistant
  async debugCode(
    code: string,
    error: string,
    language?: string
  ): Promise<string> {
    const prompt = `You are a debugging expert. Help fix this ${language || 'code'} error:

**Error Message:**
${error}

**Code:**
\`\`\`${language || ''}
${code}
\`\`\`

Provide:
1. Root cause of the error
2. Fixed code
3. Explanation of the fix
4. How to prevent similar issues`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to debug code');
    }
  }
}

export default new AIService();