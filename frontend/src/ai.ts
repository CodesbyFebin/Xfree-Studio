import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  InferenceMode,
} from 'firebase/ai';
import { firebaseApp } from './firebaseApp';
import { firebaseAppCheckReady } from './firebaseConfig';

export type AIChoice = 'Hybrid' | 'On-device' | 'Cloud';
export type InferenceSource = 'on_device' | 'in_cloud';
export type BuildBrief = { text: string; source: InferenceSource };

const ai = firebaseApp && firebaseAppCheckReady
  ? getAI(firebaseApp, {
      backend: new GoogleAIBackend(),
      useLimitedUseAppCheckTokens: true,
    })
  : null;

export const hybridAIReady = ai !== null;

const modeByChoice = {
  Hybrid: InferenceMode.PREFER_ON_DEVICE,
  'On-device': InferenceMode.ONLY_ON_DEVICE,
  Cloud: InferenceMode.ONLY_IN_CLOUD,
} as const;

function createModel(choice: AIChoice) {
  if (!ai) throw new Error('Add the Firebase web config and App Check site key to enable AI.');
  return getGenerativeModel(ai, {
    mode: modeByChoice[choice],
    inCloudParams: {
      model: 'gemini-3.8-flash',
      generationConfig: { maxOutputTokens: 700, temperature: 0.45 },
    },
    onDeviceParams: {
      createOptions: {
        expectedInputs: [{ type: 'text', languages: ['en'] }],
        expectedOutputs: [{ type: 'text', languages: ['en'] }],
        initialPrompts: [{
          role: 'system',
          content: [{
            type: 'text',
            value: 'You are X, a practical product and software studio partner. Turn rough ideas into clear, achievable project briefs. Be specific, concise, and honest. Never say you created or ran files. Return plain text with headings: Outcome, MVP, Build sequence, Risks. Keep the response under 220 words.',
          }],
        }],
      },
    },
  });
}

export async function prepareOnDeviceModel(onProgress?: (progress: number) => void): Promise<void> {
  await createModel('On-device').initializeDeviceModel(onProgress);
}

export async function generateBuildBrief(
  idea: string,
  choice: AIChoice,
  onModelProgress?: (progress: number) => void,
): Promise<BuildBrief> {
  const model = createModel(choice);

  if (choice !== 'Cloud') {
    const preparation = model.initializeDeviceModel(onModelProgress);
    if (choice === 'On-device') await preparation;
    else void preparation.catch(() => undefined);
  }

  const result = await model.generateContent(
    `You are X, a practical product and software studio partner. Turn this rough idea into a clear, achievable project brief for a real audience. Include one primary user problem, a small first release, a testable success signal, and concrete next steps. Never claim to have created or run files. Return plain text with headings: Outcome, MVP, Build sequence, Risks. Keep it concise.\n\nIdea:\n${idea.trim().slice(0, 3000)}`,
  );
  const text = result.response.text().trim();
  const source = result.response.inferenceSource;
  if (!text) throw new Error('The model returned an empty response. Try a more specific idea.');
  if (source !== 'on_device' && source !== 'in_cloud') {
    throw new Error('Firebase AI Logic returned a response without an inference source.');
  }
  return { text, source };
}
