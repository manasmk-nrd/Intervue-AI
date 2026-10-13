import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// -------------------------------------------------------------
// Health / Status Endpoint
// -------------------------------------------------------------
app.get('/api/status', (req, res) => {
  res.json({
    hasKey: !!ai,
    model: 'gemini-3.1-flash-lite',
    status: 'operational',
  });
});

// -------------------------------------------------------------
// Fallback Mock Generators (Used if API Key is absent or fails)
// -------------------------------------------------------------
function generateFallbackStart(config: any) {
  const subject = config.subject || 'Software Engineering';
  const role = config.jobRole ? ` for the ${config.jobRole} position` : '';
  const greeting = `Hello, and welcome to your ${config.difficulty} ${config.interviewType} interview on ${subject}${role}. I will be guiding you through a series of focused questions. Take your time, structure your thoughts, and answer when you are ready.`;

  let firstQuestion = `To start off, could you explain the fundamental core principles of ${subject}, and how you have applied them in a practical project or coursework?`;
  if (config.interviewType === 'hr' || config.interviewType === 'behavioral') {
    firstQuestion = `Could you introduce yourself, highlighting the key experiences and strengths that make you well-suited for ${config.jobRole || subject}?`;
  }

  return {
    message: `${greeting}\n\n**Question 1:** ${firstQuestion}`,
    questionNumber: 1,
    isFollowUp: false,
    isDemoMode: true,
  };
}

function generateFallbackTurn(config: any, answer: string, currentQuestionNumber: number, isFollowUp: boolean) {
  const isLastQuestion = currentQuestionNumber >= config.questionCount && isFollowUp;
  const advanceToNext = isFollowUp || answer.length > 250;

  if (isLastQuestion || (currentQuestionNumber >= config.questionCount && !isFollowUp && Math.random() > 0.4)) {
    return {
      message: `Thank you for sharing your thoughts on that. That concludes our planned questions for this session. You demonstrated good engagement with the topic. Let's move to your comprehensive evaluation report.`,
      isInterviewComplete: true,
      nextQuestionNumber: currentQuestionNumber,
      isFollowUp: false,
      isDemoMode: true,
    };
  }

  if (!isFollowUp && answer.length < 200 && Math.random() > 0.3) {
    // Probing follow up
    return {
      message: `That's an interesting start. Could you dive deeper into that specific trade-off? How would you handle potential edge cases or scale constraints with this approach in ${config.subject}?`,
      isInterviewComplete: false,
      nextQuestionNumber: currentQuestionNumber,
      isFollowUp: true,
      isDemoMode: true,
    };
  }

  // Next primary question
  const nextQNum = currentQuestionNumber + 1;
  const questionsBySubject: Record<string, string[]> = {
    default: [
      `Could you describe a scenario where standard best practices in ${config.subject} might conflict with practical deadlines or performance constraints, and how you would navigate that?`,
      `How would you diagnose and debug a subtle performance bottleneck or unexpected failure in a system built around ${config.subject}?`,
      `Walk me through how you approach architecture and modularity when starting a new implementation in ${config.subject}.`,
      `What are the most critical safety, reliability, or testing considerations you keep in mind when deploying ${config.subject} solutions?`,
    ],
  };
  const pool = questionsBySubject.default;
  const chosenQ = pool[(nextQNum - 2) % pool.length] || `How do you stay updated with emerging techniques and modern standards in ${config.subject}?`;

  return {
    message: `Thank you for that response. Moving forward.\n\n**Question ${nextQNum}:** ${chosenQ}`,
    isInterviewComplete: false,
    nextQuestionNumber: nextQNum,
    isFollowUp: false,
    isDemoMode: true,
  };
}

function generateFallbackEvaluation(config: any, messages: any[]) {
  const candidateResponses = messages.filter((m: any) => m.sender === 'candidate');
  const totalAnswers = candidateResponses.length;
  const isLimited = totalAnswers < 2;

  const baseScore = isLimited ? 45 : Math.min(94, 68 + Math.floor(Math.random() * 20));

  const questionsAsked = messages
    .filter((m: any) => m.sender === 'interviewer' && !m.isGreeting)
    .slice(0, Math.max(1, totalAnswers));

  const questionEvaluations = candidateResponses.map((candMsg: any, idx: number) => {
    const qMsg = questionsAsked[idx] || { text: `Question ${idx + 1}` };
    const qClean = qMsg.text.replace(/\*\*Question \d+:\*\*/g, '').trim();
    const score = isLimited ? 45 : 75 + ((idx * 7) % 20);

    return {
      questionNumber: idx + 1,
      question: qClean || `Discussion point ${idx + 1} regarding ${config.subject}`,
      isFollowUp: !!qMsg.isFollowUp,
      candidateAnswer: candMsg.text,
      score,
      factualCorrectness: score > 70 ? 'Sound conceptual understanding with valid reasoning.' : 'Partially correct with missing core principles.',
      feedback: `You articulated the general premise well. To elevate your answer, quantify trade-offs and cite concrete architectural design decisions.`,
      modelAnswer: `An exemplary answer directly defines the foundational concept in ${config.subject}, outlines a standard implementation pattern, and proactively discusses edge cases, time/space trade-offs, and verification strategies.`,
      keyTakeaway: `Frame answers using structured methodologies: Definition -> Practical Application -> Edge Cases & Trade-offs.`,
    };
  });

  return {
    overallScore: baseScore,
    scoreGrade: baseScore >= 85 ? 'Strong Hire' : baseScore >= 70 ? 'Hire' : baseScore >= 55 ? 'Developing' : 'Needs Preparation',
    breakdown: {
      technicalKnowledge: {
        score: Math.min(100, baseScore + 2),
        comment: `Demonstrated familiarity with ${config.subject} terminology and core constructs.`,
      },
      factualAccuracy: {
        score: Math.min(100, baseScore - 1),
        comment: `Core statements were factually consistent with standard industry paradigms.`,
      },
      reasoningAndProblemSolving: {
        score: Math.min(100, baseScore + 4),
        comment: `Logical flow observed in analytical responses.`,
      },
      clarityAndStructure: {
        score: Math.min(100, baseScore - 3),
        comment: `Clear communication style; could benefit from structured bullet points or STAR framework.`,
      },
    },
    strengths: [
      `Articulated concepts in ${config.subject} with genuine enthusiasm and relevance to ${config.jobRole || 'the role'}.`,
      `Responded thoughtfully without rushing into unstructured speculation.`,
      `Highlighted practical context when discussing implementations.`,
    ],
    areasForImprovement: [
      `Deepen technical specificity by referencing industry benchmark tooling and real-world failure modes.`,
      `Structure behavioral and technical trade-off answers using explicit frameworks (Situation-Task-Action-Result or Problem-Solution-Impact).`,
      `Elaborate more fully on edge cases and scalability bottlenecks.`,
    ],
    questionEvaluations,
    recommendedTopics: [
      {
        topic: `Advanced Architectural Patterns in ${config.subject}`,
        priority: 'high',
        reason: 'Crucial for passing senior or intermediate rounds for ' + (config.jobRole || 'target positions') + '.',
      },
      {
        topic: 'Performance Profiling & Optimization Strategies',
        priority: 'medium',
        reason: 'Interviewers frequently probe deeper on resource limits and latency.',
      },
      {
        topic: 'Structured Technical Communication & STAR Technique',
        priority: 'high',
        reason: 'Ensures your technical knowledge is delivered crisply in timed interview formats.',
      },
    ],
    preparationPlan: [
      {
        step: 1,
        title: 'Revise Core Fundamentals & Edge Cases',
        detail: `Review top 20 canonical interview problem statements and algorithmic/domain trade-offs in ${config.subject}.`,
        timeframe: 'Day 1 - 2',
      },
      {
        step: 2,
        title: 'Mock Answer Drills & Time-boxing',
        detail: 'Practice answering out loud under a 2-minute timer to tighten concise delivery and eliminate filler words.',
        timeframe: 'Day 3 - 4',
      },
      {
        step: 3,
        title: 'Simulate Advanced Pressure Scenarios',
        detail: 'Run full 10-question interviews on Intervue AI targeting Challenging difficulty.',
        timeframe: 'Day 5 onwards',
      },
    ],
    summary: `You displayed a solid baseline during this ${config.difficulty} ${config.interviewType} interview on ${config.subject}. With deliberate focus on structured communication frameworks and deepening edge-case analysis, you will be well-prepared for competitive interview rounds.`,
    evaluationTimestamp: new Date().toISOString(),
    evaluationReliability: isLimited ? 'limited_data' : 'high',
  };
}

// -------------------------------------------------------------
// POST /api/interview/start
// -------------------------------------------------------------
app.post('/api/interview/start', async (req, res) => {
  const config = req.body;

  if (!config || !config.subject) {
    return res.status(400).json({ error: 'Subject is required.' });
  }

  if (!ai) {
    const fallback = generateFallbackStart(config);
    return res.json(fallback);
  }

  try {
    const systemPrompt = `You are a world-class professional interviewer conducting a mock interview for the platform Intervue AI.
Target subject: "${config.subject}"
Target job role: "${config.jobRole || 'General candidate'}"
Interview type: "${config.interviewType}" (e.g. technical, hr, behavioral, academic, custom)
Difficulty: "${config.difficulty}" (beginner, intermediate, advanced)
Experience level: "${config.experienceLevel}" (student, fresher, experienced)
Total planned primary questions: ${config.questionCount}
Duration target: ${config.durationMinutes} minutes
Interviewer style: "${config.style}" (friendly, professional, challenging)
Interview mode: "${config.mode}" (interview, practice)

RULES:
1. Act exclusively as the interviewer.
2. Provide a brief, authentic 1-2 sentence welcome/introduction tailored to the candidate's chosen topic and role.
3. Immediately follow with Question 1 (the first primary interview question).
4. Do NOT reveal answers or hints.
5. Make Question 1 appropriate for the selected difficulty and experience level.
6. Return a JSON object with two fields:
   - "greeting": Brief introductory greeting (e.g. "Hello! Welcome to your interview on Python for the Junior Backend Developer role...")
   - "question": The exact first primary question.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: 'Begin the interview now.',
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            greeting: { type: Type.STRING },
            question: { type: Type.STRING },
          },
          required: ['greeting', 'question'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const greeting = parsed.greeting || 'Welcome to your interview.';
    const question = parsed.question || `Could you explain the fundamentals of ${config.subject}?`;

    res.json({
      message: `${greeting}\n\n**Question 1:** ${question}`,
      questionNumber: 1,
      isFollowUp: false,
      isDemoMode: false,
    });
  } catch (err: any) {
    console.error('Error starting interview with Gemini:', err);
    res.json(generateFallbackStart(config));
  }
});

// -------------------------------------------------------------
// POST /api/interview/turn
// -------------------------------------------------------------
app.post('/api/interview/turn', async (req, res) => {
  const { config, messages, candidateAnswer, currentQuestionNumber, isFollowUp, timeRemainingSec } = req.body;

  if (!candidateAnswer || !candidateAnswer.trim()) {
    return res.status(400).json({ error: 'Candidate answer is required.' });
  }

  if (!ai) {
    const fallback = generateFallbackTurn(config, candidateAnswer, currentQuestionNumber, isFollowUp);
    return res.json(fallback);
  }

  try {
    const isTimeAlmostUp = typeof timeRemainingSec === 'number' && timeRemainingSec <= 60;
    const isAtLimit = currentQuestionNumber >= config.questionCount && isFollowUp;

    const transcriptSummary = messages
      .slice(-6)
      .map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`)
      .join('\n\n');

    const systemPrompt = `You are an expert interviewer conducting an interview on Intervue AI.
Subject: "${config.subject}"
Role: "${config.jobRole || 'Standard Candidate'}"
Interview Type: "${config.interviewType}"
Difficulty: "${config.difficulty}"
Experience Level: "${config.experienceLevel}"
Style: "${config.style}"
Mode: "${config.mode}"
Current Primary Question Number: ${currentQuestionNumber} of ${config.questionCount}
Was the previous question a follow-up? ${isFollowUp ? 'YES' : 'NO'}
Is time almost expired? ${isTimeAlmostUp ? 'YES' : 'NO'}

CANDIDATE'S LATEST ANSWER:
"""
${candidateAnswer}
"""

RECENT CONTEXT:
${transcriptSummary}

INTERVIEW RULES:
1. NEVER reveal correct answers or solutions during the interview.
2. Briefly acknowledge the student's response in 1 concise sentence (e.g., "Good explanation on...", "Thank you for clarifying that.", "I see your perspective on...").
3. DECIDE NEXT ACTION:
   - If the candidate gave an incomplete, intriguing, or surface-level response AND previous was NOT a follow-up AND time permits: Ask a targeted follow-up question (set isFollowUp: true, nextQuestionNumber: ${currentQuestionNumber}).
   - Otherwise, if currentQuestionNumber < ${config.questionCount} and time remains: Ask the NEXT primary question (${currentQuestionNumber + 1}) (set isFollowUp: false, nextQuestionNumber: ${currentQuestionNumber + 1}).
   - If currentQuestionNumber >= ${config.questionCount} OR time is up: Conclude the interview professionally (set isInterviewComplete: true).
4. Keep questions sharp, professional, realistic, and relevant to the candidate's chosen difficulty.
5. In Practice Mode, if the user explicitly requested guidance, give a constructive coaching hint.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: 'Evaluate the response and proceed with the interview.',
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            acknowledgement: {
              type: Type.STRING,
              description: 'Brief 1-sentence acknowledgment of candidate answer',
            },
            nextQuestion: {
              type: Type.STRING,
              description: 'The question text to ask, or concluding farewell if interview is finished',
            },
            isFollowUp: {
              type: Type.BOOLEAN,
              description: 'True if this is a follow-up probing the previous question',
            },
            nextQuestionNumber: {
              type: Type.INTEGER,
              description: 'Current question number or next question number',
            },
            isInterviewComplete: {
              type: Type.BOOLEAN,
              description: 'True if session has concluded',
            },
            reason: {
              type: Type.STRING,
              description: 'Brief internal rationale for follow-up vs next question',
            },
          },
          required: ['acknowledgement', 'nextQuestion', 'isFollowUp', 'nextQuestionNumber', 'isInterviewComplete'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const isComplete = parsed.isInterviewComplete || isAtLimit;
    const nextQNum = parsed.nextQuestionNumber || (isFollowUp ? currentQuestionNumber + 1 : currentQuestionNumber);
    const ack = parsed.acknowledgement || 'Thank you for your response.';
    const qText = parsed.nextQuestion || 'How would you apply this in production?';

    let formattedMessage = '';
    if (isComplete) {
      formattedMessage = `${ack} That concludes our interview questions for today! Thank you for your time and thoughtful responses. We will now generate your detailed evaluation report.`;
    } else if (parsed.isFollowUp) {
      formattedMessage = `${ack}\n\n**Follow-up Question:** ${qText}`;
    } else {
      formattedMessage = `${ack}\n\n**Question ${nextQNum}:** ${qText}`;
    }

    res.json({
      message: formattedMessage,
      isInterviewComplete: isComplete,
      nextQuestionNumber: isComplete ? currentQuestionNumber : nextQNum,
      isFollowUp: !!parsed.isFollowUp,
      isDemoMode: false,
    });
  } catch (err: any) {
    console.error('Error processing turn with Gemini:', err);
    res.json(generateFallbackTurn(config, candidateAnswer, currentQuestionNumber, isFollowUp));
  }
});

// -------------------------------------------------------------
// POST /api/interview/hint
// -------------------------------------------------------------
app.post('/api/interview/hint', async (req, res) => {
  const { config, currentQuestion } = req.body;

  if (!ai) {
    return res.json({
      hint: `Consider structuring your answer around core principles of ${config.subject}. Think about what happens behind the scenes, practical trade-offs, and how you would test your solution.`,
      isDemoMode: true,
    });
  }

  try {
    const prompt = `You are a supportive interview coach on Intervue AI. The candidate is in Practice Mode.
Subject: ${config.subject}
Role: ${config.jobRole || 'Candidate'}
Current Question: "${currentQuestion}"

Provide a concise, constructive 2-sentence HINT to guide their thinking without directly giving away the solution. Encourage them to consider key concepts, architectural patterns, or real-world trade-offs.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
    });

    res.json({
      hint: response.text?.trim() || 'Consider breaking the problem down into components and discussing trade-offs.',
      isDemoMode: false,
    });
  } catch (err: any) {
    console.error('Error generating hint:', err);
    res.json({
      hint: `Focus on the foundational architecture in ${config.subject} and explain why specific choices are preferred over alternatives.`,
      isDemoMode: true,
    });
  }
});

// -------------------------------------------------------------
// POST /api/interview/tts (Realistic Audio Generation)
// -------------------------------------------------------------
app.post('/api/interview/tts', async (req, res) => {
  const { text, voiceName = 'Kore' } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required for TTS' });
  }

  const cleanText = text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/###/g, '')
    .replace(/# /g, '')
    .trim();

  if (!ai) {
    return res.status(503).json({ error: 'AI not configured' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text: cleanText.slice(0, 1000) }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
      });
    }

    res.status(500).json({ error: 'Failed to generate audio' });
  } catch (err: any) {
    console.error('Error in TTS endpoint:', err);
    res.status(500).json({ error: err.message || 'TTS generation failed' });
  }
});

// -------------------------------------------------------------
app.post('/api/interview/evaluate', async (req, res) => {
  const { config, messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Valid messages array is required.' });
  }

  const candidateResponses = messages.filter((m: any) => m.sender === 'candidate');
  if (candidateResponses.length === 0) {
    return res.json(generateFallbackEvaluation(config, messages));
  }

  if (!ai) {
    return res.json(generateFallbackEvaluation(config, messages));
  }

  try {
    // Build clean transcript
    const transcriptText = messages
      .filter((m: any) => !m.isGreeting)
      .map((m: any) => `[${m.sender.toUpperCase()}]: ${m.text}`)
      .join('\n\n');

    const systemPrompt = `You are an elite talent evaluation specialist and technical interviewer conducting a post-interview assessment for Intervue AI.
Target Subject: "${config.subject}"
Target Role: "${config.jobRole || 'General'}"
Interview Type: "${config.interviewType}"
Difficulty: "${config.difficulty}"
Experience Level: "${config.experienceLevel}"

CRITICAL INSTRUCTIONS:
1. Ground your entire evaluation in the actual transcript provided below.
2. Evaluate technical knowledge, factual accuracy, reasoning, problem solving, and communication clarity.
3. Calculate an honest overall score from 0 to 100 based on their actual performance.
4. For every question answered, provide a score (0-100), factual correctness assessment, actionable feedback, and an exemplary model answer.
5. If the interview was cut short or contains fewer than 2 responses, note that in evaluationReliability ('limited_data' or 'moderate') and avoid false precision.
6. Provide specific, evidence-based strengths quoting or referencing actual statements made.
7. Recommend 3 specific topics to revise with priority (high, medium, low).
8. Provide a clear 3-step action plan for future preparation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Here is the interview transcript:\n\n${transcriptText}\n\nGenerate the complete evaluation JSON.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: 'Score between 0 and 100' },
            scoreGrade: {
              type: Type.STRING,
              description: 'Strong Hire, Hire, Developing, or Needs Preparation',
            },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                technicalKnowledge: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    comment: { type: Type.STRING },
                  },
                  required: ['score', 'comment'],
                },
                factualAccuracy: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    comment: { type: Type.STRING },
                  },
                  required: ['score', 'comment'],
                },
                reasoningAndProblemSolving: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    comment: { type: Type.STRING },
                  },
                  required: ['score', 'comment'],
                },
                clarityAndStructure: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    comment: { type: Type.STRING },
                  },
                  required: ['score', 'comment'],
                },
              },
              required: ['technicalKnowledge', 'factualAccuracy', 'reasoningAndProblemSolving', 'clarityAndStructure'],
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-4 specific strengths with evidence',
            },
            areasForImprovement: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-4 constructive areas for growth',
            },
            questionEvaluations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionNumber: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  isFollowUp: { type: Type.BOOLEAN },
                  candidateAnswer: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  factualCorrectness: { type: Type.STRING },
                  feedback: { type: Type.STRING },
                  modelAnswer: { type: Type.STRING },
                  keyTakeaway: { type: Type.STRING },
                },
                required: ['questionNumber', 'question', 'candidateAnswer', 'score', 'factualCorrectness', 'feedback', 'modelAnswer', 'keyTakeaway'],
              },
            },
            recommendedTopics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['topic', 'priority', 'reason'],
              },
            },
            preparationPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  detail: { type: Type.STRING },
                  timeframe: { type: Type.STRING },
                },
                required: ['step', 'title', 'detail', 'timeframe'],
              },
            },
            summary: { type: Type.STRING, description: 'Executive summary paragraph' },
            evaluationReliability: {
              type: Type.STRING,
              description: 'high, moderate, or limited_data',
            },
          },
          required: [
            'overallScore',
            'scoreGrade',
            'breakdown',
            'strengths',
            'areasForImprovement',
            'questionEvaluations',
            'recommendedTopics',
            'preparationPlan',
            'summary',
            'evaluationReliability',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    parsed.evaluationTimestamp = new Date().toISOString();
    res.json(parsed);
  } catch (err: any) {
    console.error('Error generating evaluation with Gemini:', err);
    res.json(generateFallbackEvaluation(config, messages));
  }
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Intervue AI server running on http://0.0.0.0:${port}`);
  });
}

setupVite();
