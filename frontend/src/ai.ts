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
export type BuildBrief = { text: string; source: InferenceSource; trace: RoutingTrace };
import { route, type RoutingTrace, type PrivacyLabel } from './privacy';

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

function createModel(choice: AIChoice, cloudPreferred = false) {
  if (!ai) throw new Error('Add the Firebase web config and App Check site key to enable AI.');
  return getGenerativeModel(ai, {
    mode: cloudPreferred ? InferenceMode.PREFER_IN_CLOUD : modeByChoice[choice],
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
  label: PrivacyLabel = 'LOCAL_ONLY',
): Promise<BuildBrief> {
  const trace = route(idea, label, choice);
  const effective = trace.cloudAllowed ? choice : 'On-device';
  const model = createModel(effective, trace.mode === 'PREFER_IN_CLOUD');
  const started = performance.now();

  if (effective !== 'Cloud') {
    const preparation = model.initializeDeviceModel(onModelProgress);
    if (effective === 'On-device') {
      try { await preparation; } catch { throw new Error('BLOCKED: on-device unavailable; cloud fallback denied.'); }
    }
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
  if (!trace.cloudAllowed && source !== 'on_device') throw new Error('POLICY_VIOLATION: unexpected inference source');
  return { text, source, trace: { ...trace, source, latencyMs: Math.round(performance.now() - started) } };
}
