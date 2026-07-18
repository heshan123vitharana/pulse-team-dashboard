import { Router, Response } from 'express';
import Groq from 'groq-sdk';
import prisma from '../lib/prisma';
import { authenticate, requireProjectManager, AuthRequest } from '../middleware/auth';

const router = Router();

const groqClient = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

async function getTeamContext(): Promise<string> {
  const thirty_days_ago = new Date();
  thirty_days_ago.setDate(thirty_days_ago.getDate() - 30);

  const recent_reports = await prisma.weeklyReport.findMany({
    where: { submitted_at: { gte: thirty_days_ago } },
    include: { user: true, project: true }
  });

  if (recent_reports.length === 0) return 'No recent reports available.';

  return recent_reports.map(report => {
    const user_name = report.user.name;
    const project_name = report.project.project_name;
    let line = `- ${user_name} on project '${project_name}': Status ${report.submission_status}. Accomplished: ${report.tasks_completed}. `;
    if (report.blockers) line += `Blockers: ${report.blockers}. `;
    if (report.tasks_planned) line += `Next Steps: ${report.tasks_planned}.`;
    return line;
  }).join('\n');
}

// POST /api/v1/chat/message — AI chat assistant (Project Manager+)
router.post('/message', authenticate, requireProjectManager, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!groqClient) {
    res.json({
      response:
        'The Groq API key is not configured. Please add GROQ_API_KEY to your .env file to enable the AI assistant.'
    });
    return;
  }

  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ detail: 'message is required' });
      return;
    }

    const context = await getTeamContext();

    const system_prompt = `You are a helpful AI assistant for a team manager.
Use the following recent weekly reports from the team to answer the manager's questions.
Do not hallucinate data that is not in the context. If you don't know the answer based on the context, say so.

CONTEXT (Recent Weekly Reports):
${context}`;

    const messages = [
      { role: 'system', content: system_prompt },
      ...history
        .filter((m: any) => m.role === 'user' || m.role === 'assistant')
        .map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    const completion = await groqClient.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: messages as any,
      temperature: 0.5,
      max_tokens: 500
    });

    const ai_response = completion.choices[0]?.message?.content || 'No response generated.';
    res.json({ response: ai_response });
  } catch (err: any) {
    console.error('Groq error:', err);
    res.status(500).json({ detail: `Failed to communicate with AI service: ${err.message}` });
  }
});

export default router;
