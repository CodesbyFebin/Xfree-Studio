import { ArrowRight, ChevronRight, ExternalLink, Sparkles } from 'lucide-react';

export type ContentSection = { title: string; paragraphs: string[] };
export type SEOPage = {
  path: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  answer: string;
  sections: ContentSection[];
  faqs: { question: string; answer: string }[];
  related: string[];
};

export const SEO_PAGES: SEOPage[] = [
  {
    path: '/features/xfree-studio', title: 'XFree Studio: Privacy-Aware AI Project Workspace',
    description: 'Explore XFree Studio, a browser-based project workspace with Gemini AI build briefs, local template starters, editable files, previews, and optional Firebase sync.',
    h1: 'XFree Studio: turn a rough idea into a buildable first step', eyebrow: 'PRODUCT PILLAR · XFREE STUDIO',
    answer: 'XFree Studio is a browser-based workspace that combines Gemini-generated project briefs with locally editable starter projects. It offers on-device, hybrid, and cloud AI choices, and shows the inference source after a successful AI response.',
    sections: [
      { title: 'A project workspace with explicit boundaries', paragraphs: [
        'XFree Studio brings an idea brief, a starter workspace, and a privacy choice into one place. Describe the problem you want to solve and use Gemini through Firebase AI Logic to get an outcome, a small MVP, a build sequence, and risks. The response is guidance for planning; it does not claim to have created or executed production code.',
        'When you move to the project workspace, XFree creates an editable template locally in your browser. You can inspect its files, change the source, preview the result in an isolated frame, and export a copy. This split between AI planning and deterministic scaffolding makes it clear which part is model-generated and which part is a local starter.'
      ]},
      { title: 'Choose where an AI request runs', paragraphs: [
        'Local-only mode requests Gemini Nano on supported Chrome desktop installations and is designed to keep the prompt on the device. Availability depends on browser and device support. Hybrid mode prefers the local model and may fall back to Firebase AI Logic in the cloud. Cloud-only mode sends the prompt to Firebase AI Logic. The interface identifies the source when a response succeeds.',
        'These are meaningful differences, so XFree explains them before a request. A failed request is reported as a failure; it is not presented as successful local or cloud inference. Firebase App Check helps protect Firebase AI Logic requests, but it is not proof of an AI agent’s identity.'
      ]},
      { title: 'Who XFree Studio is for', paragraphs: [
        'Developers can pressure-test a feature idea before opening an editor. Students can turn a learning goal into a manageable exercise. Independent builders can make a first plan and inspect a starter without an account. Privacy-conscious teams can see the trade-off between a local attempt and an explicit cloud route.',
        'The current product is intentionally a focused early workspace. It includes project briefs, local template-based starters, browser preview, export, optional Firebase account features, and a Know Your Agent concept demo. It does not yet provide a full IDE, a code-review service, or production agent authentication.'
      ]}
    ],
    faqs: [
      { question: 'Is XFree Studio free to try?', answer: 'The public workspace can be explored without creating an account. Cloud model availability and quotas are controlled by Firebase and the configured project; local inference depends on supported browser and device availability.' },
      { question: 'Does XFree generate and run a complete application?', answer: 'Gemini creates a written project brief. The starter workspace creates editable template files locally; it does not claim the model generated or executed a production application.' },
      { question: 'Can I use XFree Studio without sending a prompt to the cloud?', answer: 'Choose Local only. This mode requires supported on-device Gemini Nano. Hybrid mode can use Firebase cloud fallback, while Cloud mode sends requests to Firebase AI Logic.' }
    ], related: ['/features/gemini-ai-studio','/features/hybrid-ai','/tools/ai-project-brief-generator','/guides/local-vs-cloud-ai']
  },
  {
    path: '/features/gemini-ai-studio', title: 'Gemini AI Studio in XFree: Build Briefs with Firebase AI Logic',
    description: 'See how XFree Studio connects Gemini through Firebase AI Logic for concise project briefs, with visible local or cloud inference source and honest limits.',
    h1: 'A Gemini workspace that tells you where the answer came from', eyebrow: 'AI PILLAR · GEMINI IN XFREE',
    answer: 'XFree Studio uses Firebase AI Logic to request a structured, concise project brief from Gemini. It labels a successful response as on-device or cloud based on Firebase’s reported inference source.',
    sections: [
      { title: 'A focused Gemini task', paragraphs: [
        'The XFree AI flow is designed for the first stage of building: clarify the outcome, name a small MVP, suggest an order of work, and surface risks. It does not advertise an unrestricted coding agent. Starting with a bounded brief helps builders decide what to make before they commit time to a larger implementation.',
        'The Studio copilot can work from an idea or a concrete question about scope. Keep sensitive information out of prompts unless you understand the selected mode and the relevant service terms. A local-only request is intended to stay on-device; cloud and hybrid fallback requests can leave the browser.'
      ]},
      { title: 'Firebase AI Logic and App Check', paragraphs: [
        'Firebase AI Logic provides a client SDK and a proxy for Gemini requests from a web app. XFree initializes its AI client only when its Firebase web configuration and App Check configuration are present. App Check is an abuse-protection layer for the app’s Firebase requests; it does not authenticate an AI agent or validate the correctness of an answer.',
        'The model currently configured by this project is Gemini 3.8 Flash. Model support, quota, latency, and service availability can change. A successful request is required before XFree displays an inference-source label; configuration alone does not prove that a request will succeed.'
      ]},
      { title: 'Use the answer as a starting point', paragraphs: [
        'Treat a generated brief as an editable planning artifact. Check assumptions against the users, data, and constraints of your project. Ask for smaller deliverables when a plan is too broad, and validate technical recommendations against current documentation before adopting them.',
        'The next step in XFree is a local template workspace where you can inspect, edit, preview, and export starter files. The brief and the starter are separate steps, so the UI does not imply that Gemini wrote the files when it did not.'
      ]}
    ],
    faqs: [
      { question: 'Which Gemini model does XFree use?', answer: 'The current Firebase AI Logic configuration names gemini-3.8-flash for cloud inference. Google may update supported models and availability over time.' },
      { question: 'Does every Gemini request run locally?', answer: 'No. Local-only requests require supported Gemini Nano availability. Hybrid may use the Firebase cloud model. Cloud-only always selects Firebase AI Logic cloud inference.' },
      { question: 'Does App Check prove a model response is trustworthy?', answer: 'No. App Check helps protect Firebase resources from unauthorized clients. It does not prove agent identity, guarantee model accuracy, or replace human review.' }
    ], related: ['/features/xfree-studio','/features/hybrid-ai','/features/firebase-ai-logic','/tools/ai-project-brief-generator']
  },
  {
    path: '/features/hybrid-ai', title: 'Hybrid AI: Local-First Inference with Cloud Fallback | XFree',
    description: 'Understand XFree Studio hybrid AI: prefer Gemini Nano on supported Chrome desktops, then allow Firebase AI Logic cloud fallback when needed.',
    h1: 'Hybrid AI, with the fallback made visible', eyebrow: 'INFERENCE PILLAR · HYBRID AI',
    answer: 'Hybrid mode in XFree Studio prefers on-device Gemini Nano and can fall back to Firebase AI Logic in the cloud when local inference is unavailable. Choose it only when cloud fallback is acceptable for your prompt.',
    sections: [
      { title: 'What “hybrid AI” means here', paragraphs: [
        'A hybrid setup can route a request between a local model and a hosted model. In XFree, the preferred path is Gemini Nano on a compatible Chrome desktop, with Firebase AI Logic available as a cloud fallback. That can improve availability across devices, but it changes the privacy boundary: a fallback may send the prompt off-device.',
        'XFree’s mode disclosure explains that possibility before use. When a response succeeds, the app reads the inference-source value from Firebase AI Logic and labels the result as on-device or cloud. If the request errors or the source is missing, the interface reports failure rather than guessing.'
      ]},
      { title: 'When hybrid is a useful choice', paragraphs: [
        'Hybrid can be useful when a person wants to prefer local processing but also wants a chance of completing the task on a device where the on-device model is not available. It is a practical option for general project-planning prompts that are appropriate to send to the cloud if fallback occurs.',
        'For confidential content that must never leave the device, use local-only mode and confirm that the browser has the on-device model ready. If that cannot be guaranteed, do not submit the sensitive prompt. Cloud-only mode is more predictable about routing but sends the prompt to Firebase AI Logic.'
      ]},
      { title: 'Limits and prerequisites', paragraphs: [
        'Firebase documents on-device web inference for Firebase AI Logic SDK version 12.5.0 and later on Chrome desktop version 139 or newer. Model availability can still depend on browser capability, device resources, and local setup. XFree cannot promise every request will run locally or succeed.',
        'The project uses Firebase App Check and the Firebase AI Logic proxy for cloud requests. Quotas, temporary model load, and network connectivity can affect cloud inference. The source label reports the path of a completed request; it is not a performance or quality score.'
      ]}
    ],
    faqs: [
      { question: 'Does hybrid mode always keep my prompt local?', answer: 'No. Hybrid mode can fall back to Firebase AI Logic in the cloud. Use Local only when cloud transfer is not acceptable.' },
      { question: 'What browsers support the local Gemini path?', answer: 'Firebase currently documents on-device web inference for Chrome on desktop, version 139 or later, with Firebase AI Logic SDK 12.5.0 or later. Actual device readiness still matters.' },
      { question: 'How can I tell whether a request used local or cloud inference?', answer: 'After a successful request, XFree displays the inference source returned by Firebase AI Logic. A failed request does not receive a success label.' }
    ], related: ['/guides/local-vs-cloud-ai','/guides/gemini-nano-vs-cloud','/features/gemini-ai-studio','/features/firebase-ai-logic']
  },
  {
    path: '/features/private-local-ai', title: 'Local AI in XFree Studio: Gemini Nano and Device-Only Mode',
    description: 'Learn what local-only AI means in XFree, how Gemini Nano availability works in supported Chrome desktop browsers, and how it differs from hybrid mode.',
    h1: 'Local AI means a clear device-only choice', eyebrow: 'PRIVACY PILLAR · LOCAL INFERENCE',
    answer: 'XFree Local-only mode requests on-device Gemini Nano and does not permit Firebase cloud fallback. The browser and device must support and initialize the local model for the request to work.',
    sections: [
      { title: 'The local-only promise and its limits', paragraphs: [
        'Local-only mode is for prompts you want to keep on the current device. It asks Firebase AI Logic for on-device inference only. If the local model cannot be initialized or is unavailable, the request should fail instead of being redirected to cloud inference.',
        'Local processing still relies on your browser and device. Browser-level voice recognition, when used, may have its own processing behavior. XFree’s project files are stored in browser storage until exported; clearing site data can remove locally saved work. Read the controls and status messages before submitting a sensitive request.'
      ]},
      { title: 'Gemini Nano support', paragraphs: [
        'Firebase’s current web guidance identifies Chrome desktop version 139 or newer and Firebase AI Logic SDK 12.5.0 or newer for on-device inference. Having a compatible browser does not guarantee readiness: the model may need setup, the device needs sufficient resources, and the browser may report that the capability is unavailable.',
        'XFree provides a preparation action and progress text when the browser exposes the model capability. If preparation fails, try a supported device or choose a different mode for non-sensitive text. XFree does not promise that local inference is available on every Mac, phone, or browser.'
      ]},
      { title: 'Local mode versus hybrid mode', paragraphs: [
        'Both modes prefer Gemini Nano. The difference is what happens if that local path cannot complete. Local-only does not use a cloud fallback. Hybrid allows Firebase AI Logic to run the request in the cloud when required. That fallback must be an acceptable outcome for the information in your prompt.',
        'If you need the request to be cloud-hosted, select Cloud mode. XFree labels a successful response based on its actual reported inference source so that a preference is not confused with evidence of a completed path.'
      ]}
    ],
    faqs: [
      { question: 'Can I use XFree local AI on a phone?', answer: 'On-device web inference support is currently documented for Chrome desktop, not every mobile browser. The app reports when the local model cannot be prepared.' },
      { question: 'Does local-only mode fall back to the cloud?', answer: 'No. Local-only selects on-device inference only. Hybrid is the mode that permits cloud fallback.' },
      { question: 'Does “local” mean my whole browser session is offline?', answer: 'No. It describes the selected inference route. Other browser features, such as loading the site or speech recognition, can have separate network and privacy behavior.' }
    ], related: ['/features/hybrid-ai','/guides/gemini-nano-vs-cloud','/privacy/how-xfree-handles-prompts','/guides/local-vs-cloud-ai']
  },
  {
    path: '/features/firebase-ai-logic', title: 'XFree and Firebase AI Logic: Gemini Integration Details',
    description: 'A technical overview of how XFree Studio calls Gemini through Firebase AI Logic, uses App Check, selects inference modes, and reports model results.',
    h1: 'How XFree connects Gemini through Firebase AI Logic', eyebrow: 'DEVELOPER PILLAR · FIREBASE AI LOGIC',
    answer: 'XFree initializes Firebase AI Logic with its Firebase app and App Check configuration, then selects a Gemini inference mode for a project-brief request. Cloud requests use the Firebase AI Logic proxy; successful results display their reported inference source.',
    sections: [
      { title: 'Client SDK and model selection', paragraphs: [
        'The web app uses the Firebase JavaScript SDK AI module. Its current cloud model identifier is gemini-3.8-flash, while its inference mode can request on-device only, prefer on-device with cloud fallback, or use cloud only. The actual response source is read from the SDK response rather than inferred from the selected preference.',
        'The generated task is a build brief. The prompt asks Gemini for an outcome, a small MVP, a build sequence, and risks. This is a product-planning flow, not a generic agent tool runner, a source-code review service, or an automatic deployment system.'
      ]},
      { title: 'App Check and cloud requests', paragraphs: [
        'Firebase AI Logic can use Firebase App Check to help protect model requests from unauthorized clients. XFree configures limited-use App Check tokens. This layer is useful for abuse resistance, but it does not replace authorization rules for other services and does not establish whether a caller is a human or an autonomous agent.',
        'A cloud model request sends the prompt to Firebase AI Logic. Hybrid mode may do the same if the local model is unavailable. Use Local only when a cloud fallback is unacceptable and the device supports the local path. The user-facing disclosure states these distinctions before submission.'
      ]},
      { title: 'Failure handling and operations', paragraphs: [
        'AI calls can fail because of configuration, App Check, service availability, rate limits, model overload, or network issues. XFree surfaces a request error and does not mark a failed call as a completed inference. The production project’s quotas and model availability should be checked in Firebase when diagnosing live failures.',
        'For maintainers, keep the model identifier and SDK behavior aligned with current Firebase documentation. Monitor quota and App Check status, review security rules before enabling data sync, and avoid placing server credentials in frontend code. Firebase web configuration identifies the app but is not a substitute for backend security.'
      ]}
    ],
    faqs: [
      { question: 'Does XFree send Gemini requests directly from the browser?', answer: 'The Firebase AI Logic client SDK sends requests through Firebase’s proxy service. Cloud-mode prompts are sent for cloud inference; hybrid may use cloud fallback.' },
      { question: 'What does Firebase App Check protect?', answer: 'App Check helps Firebase distinguish requests from the registered app. It is an abuse-protection layer, not agent identity proof or a guarantee of model correctness.' },
      { question: 'Can I change the model?', answer: 'The cloud model identifier is configured in the app source. Any change should use a model currently supported by Firebase AI Logic and be checked against the Firebase project’s quota and provider settings.' }
    ], related: ['/features/gemini-ai-studio','/features/hybrid-ai','/guides/app-check-and-agent-identity','/features/xfree-studio']
  },
  {
    path: '/tools/ai-project-brief-generator', title: 'AI Project Brief Generator: Plan an MVP with XFree Studio',
    description: 'Turn a rough product idea into a concise outcome, MVP scope, build sequence, and risk list with the XFree Studio Gemini project brief tool.',
    h1: 'Turn a rough idea into an AI project brief', eyebrow: 'WORKFLOW PILLAR · PROJECT BRIEFS',
    answer: 'The XFree project brief flow asks Gemini for an outcome, a small MVP, a build sequence, and risks. It is intended to help a person plan and refine a project before writing production code.',
    sections: [
      { title: 'What a useful brief contains', paragraphs: [
        'A good first brief names a real audience and one problem, then proposes the smallest useful first release. It should make a test signal visible: an observable result that would support or challenge the idea. XFree asks its model to organize the response around an outcome, MVP, build sequence, and risks so the next decision is easier to see.',
        'A brief is not a validated business plan. Check its assumptions with the people who might use the product, confirm technical details with current sources, and reduce scope where a suggestion exceeds your time or budget.'
      ]},
      { title: 'Prompt for a better first draft', paragraphs: [
        'Include the person you are helping, the task they are trying to complete, the current friction, and the boundaries of a first version. For example, specify whether the project is a static web page, a browser tool, or a mobile app; mention the skill level and time limit; and say which features can wait.',
        'Avoid adding passwords, personal identifiers, customer data, or confidential company information to a prompt unless you are authorized and comfortable with the selected inference route. Choose Local, Hybrid, or Cloud deliberately. Hybrid can send the text to Firebase AI Logic if local inference is unavailable.'
      ]},
      { title: 'Move from brief to editable starter', paragraphs: [
        'After reviewing the plan, open XFree’s project workspace and create a local starter from a description. The current starter action uses deterministic templates, not Gemini-generated code. You can inspect, edit, preview, save in the browser, and export project files.',
        'Keeping those steps separate prevents the interface from overstating what the model did. Use the brief as a planning aid, and use the project workspace to make and test changes you can inspect.'
      ]}
    ],
    faqs: [
      { question: 'Can the AI brief generator create code?', answer: 'The Gemini brief flow returns a written plan. The separate project starter uses local templates and is not represented as LLM-generated code.' },
      { question: 'What should I include in a project prompt?', answer: 'Describe the user, the task, the main constraint, and the smallest useful outcome. Avoid sensitive information unless its use is authorized for the selected inference mode.' },
      { question: 'Can I keep the prompt local?', answer: 'Yes, by selecting Local only when Gemini Nano is supported and ready on the device. Hybrid mode can fall back to cloud inference.' }
    ], related: ['/features/xfree-studio','/features/gemini-ai-studio','/tools/website-starter','/for/independent-builders']
  },
  {
    path: '/tools/website-starter', title: 'Free Website Starter Workspace | XFree Studio',
    description: 'Create a local, editable website starter in XFree Studio. Inspect HTML and CSS, preview it safely, save in your browser, and export a copy.',
    h1: 'A website starter you can inspect and edit', eyebrow: 'TOOLS · WEBSITE STARTER',
    answer: 'XFree Studio’s starter workspace creates template-based project files locally in the browser. You can edit the source, view an isolated preview, save locally, and export the project.',
    sections: [
      { title: 'Start with a clear page goal', paragraphs: [
        'Before creating a starter, decide what a visitor should understand and do. A portfolio may need a short introduction, selected work, and contact action. A small product page may need a problem statement, key capability, limits, and a next step. A narrow purpose makes the starter easier to review.',
        'XFree’s local builder turns a prompt into a template project. It is useful for creating a place to begin, not a promise of polished brand strategy, production-ready security, or custom model-written code.'
      ]},
      { title: 'Edit, preview, and export', paragraphs: [
        'The workspace presents project files in an editor. Make changes directly, switch to the preview, and save the project in browser storage. Export a copy when you need a backup or want to continue elsewhere. Preview runs inside a restricted iframe that does not grant same-origin access, forms, popups, or top-level navigation.',
        'Browser-local storage belongs to that browser profile. Clearing site data or moving to another device can make the saved copy unavailable, so use export when you want a separate durable file.'
      ]},
      { title: 'Use Gemini for planning, not hidden code claims', paragraphs: [
        'The Gemini feature in XFree generates a project brief through Firebase AI Logic. It is separate from the deterministic starter action. The AI response can help shape the page goal and implementation order, while you remain responsible for reviewing and changing the starter files.',
        'If you use the AI brief, pick the inference mode based on the prompt’s sensitivity. Hybrid mode allows cloud fallback. Local-only requires supported Gemini Nano availability and will not fall back to cloud.'
      ]}
    ],
    faqs: [
      { question: 'Does the website starter use Gemini to write files?', answer: 'No. The current starter generator uses local templates. Gemini is used separately for written project briefs.' },
      { question: 'Where are projects saved?', answer: 'The workspace saves projects in this browser’s local storage. You can export a copy for use outside the browser.' },
      { question: 'Is the preview a full browser environment?', answer: 'No. It is an iframe sandbox with scripts enabled but without same-origin access, forms, popups, or navigation permissions.' }
    ], related: ['/tools/ai-project-brief-generator','/tools/project-workspace','/features/xfree-studio','/for/developers']
  },
  {
    path: '/tools/project-workspace', title: 'Local Project Workspace: Edit, Preview and Export | XFree',
    description: 'Use XFree Studio as a local project workspace to inspect files, edit starter code, preview safely, save in the browser, and export a backup.',
    h1: 'A small project workspace that keeps files visible', eyebrow: 'TOOLS · PROJECT WORKSPACE',
    answer: 'XFree’s project workspace shows starter files in an editable panel, provides a sandboxed preview, saves to browser storage, and exports a project copy.',
    sections: [
      { title: 'Keep the artifacts inspectable', paragraphs: [
        'An early project is easier to reason about when its output is visible. XFree lists each file, shows source text in an editor, and lets you switch to a preview. This makes the generated starter something a person can examine and change instead of an opaque result that must be trusted without review.',
        'The current generation is template-based. It does not call Gemini to write or execute application code. Use the separate Gemini brief assistant to organize a plan, then use the workspace to edit the local starter.'
      ]},
      { title: 'Browser storage and export', paragraphs: [
        'Save keeps the project in the current browser’s local storage. This is convenient for a quick working session, but it is not cloud backup and is tied to the browser profile. Export a copy if you want to preserve the work, move it, or put it under version control.',
        'Optional Firebase sign-in and Firestore synchronization are distinct from local editing. Cloud save requires the configured Firebase services and an authenticated account. Review the account and data-sharing choices before syncing a project.'
      ]},
      { title: 'Preview isolation', paragraphs: [
        'The preview runs in a sandboxed iframe. It allows scripts but does not grant same-origin access, forms, popups, or top-level navigation. That isolation reduces what starter code can do inside the parent application, though it is not a substitute for reviewing code before running it elsewhere.',
        'Exported files are no longer protected by the in-app iframe once opened in another environment. Inspect untrusted code and use appropriate development practices before deploying it.'
      ]}
    ],
    faqs: [
      { question: 'Does XFree replace an IDE?', answer: 'No. It is a lightweight starter editor and preview workspace. It does not provide a full IDE, package manager, or production deployment pipeline.' },
      { question: 'Does saving locally sync my project?', answer: 'No. Browser save is local to that browser profile. Use the optional Firebase sync controls to upload after signing in, or export a local copy.' },
      { question: 'Can I export my project?', answer: 'Yes. The project workspace provides an export action for the current project.' }
    ], related: ['/tools/website-starter','/features/xfree-studio','/features/firebase-ai-logic','/for/independent-builders']
  },
  {
    path: '/tools/ai-developer-tool', title: 'XFree App for Developers: Briefs, Starters and Trust Concepts',
    description: 'Explore XFree Studio as a lightweight developer tool for planning an MVP, editing local template projects, and exploring agent trust concepts.',
    h1: 'A developer tool for the first decisions in a build', eyebrow: 'TOOLS · DEVELOPER WORKFLOW',
    answer: 'XFree is a browser-based developer workspace for project briefs and editable template starters. It includes local, hybrid, and cloud AI choices plus a clearly marked Know Your Agent concept demo.',
    sections: [
      { title: 'Shorten the distance from idea to scope', paragraphs: [
        'A promising developer idea can still be too vague to build. XFree’s Gemini brief flow asks for a practical outcome, a narrow first release, a build sequence, and risks. Use the output to decide what should be implemented and tested, not as proof that the code has already been written.',
        'Once the scope is concrete, the local starter workspace can create editable files from a template. Review the source, make changes, preview the result, and export it into your normal development environment.'
      ]},
      { title: 'Choose the right AI route for the prompt', paragraphs: [
        'The local mode requests Gemini Nano on supported Chrome desktops and does not use a cloud fallback. Hybrid prefers local inference but may send the prompt to Firebase AI Logic if it cannot complete on-device. Cloud mode explicitly uses Firebase AI Logic.',
        'For source code or proprietary context, check whether a cloud route is permitted before using Hybrid or Cloud. For a device-only requirement, select Local and verify that the model is available. XFree labels the returned source after success.'
      ]},
      { title: 'A focused tool, not a full IDE', paragraphs: [
        'XFree is an early-stage browser app. It is not a replacement for a terminal, editor extensions, automated tests, or deployment controls. The starter is not reviewed for production and should be checked against your project’s runtime, security, and accessibility requirements.',
        'The Know Your Agent interface is a concept demo with simulated signals. It is useful for discussing explainable trust decisions and human review, but it does not authenticate agents or protect real financial transactions.'
      ]}
    ],
    faqs: [
      { question: 'Can XFree review my repository?', answer: 'The current product does not implement a repository code-review workflow. It provides an AI project brief and a local template starter workspace.' },
      { question: 'Can I use XFree without signup?', answer: 'You can explore the public workspace without an account. Optional cloud project synchronization requires Firebase authentication.' },
      { question: 'Is Know Your Agent production security?', answer: 'No. The current Trust Gate is a concept demo using simulated signals and does not establish real agent identity.' }
    ], related: ['/for/developers','/tools/project-workspace','/features/know-your-agent','/features/xfree-studio']
  },
  {
    path: '/features/know-your-agent', title: 'Know Your Agent: Explainable Agent Trust Concepts | XFree',
    description: 'Explore XFree’s Know Your Agent concept: identity, scope, session evidence, human review, and transparent allow, step-up, hold, or block recommendations.',
    h1: 'Know Your Agent: make trust decisions explainable', eyebrow: 'SAFETY PILLAR · KNOW YOUR AGENT',
    answer: 'XFree’s Know Your Agent screen is a concept demo that organizes simulated identity and session signals into an explainable recommendation. It is not a production identity verifier or transaction authorization service.',
    sections: [
      { title: 'Separate identity, permission, and action', paragraphs: [
        'A non-human agent may have a cryptographic identity and still request an action outside its delegated scope. A trustworthy design should examine who or what is making the request, which permissions were delegated, what resource is affected, and whether the action needs human confirmation.',
        'XFree’s concept screen separates example evidence such as credential, signature, scope, and session context. It presents possible actions—allow, step-up, hold, or block—so a reviewer can discuss why a decision might be made rather than relying on one unexplained score.'
      ]},
      { title: 'A trust score should show its evidence', paragraphs: [
        'A numeric score without factors, weights, and limits can create false confidence. An explainable agent-trust design should make each signal visible, distinguish verified facts from assumptions, and show which conditions lower confidence. A risk recommendation should also identify what additional authentication or human review could resolve the uncertainty.',
        'In a real banking workflow, a score must be validated against threat models and operational data, protected from manipulation, and tied to accountable authorization rules. A demo score should never approve lending, payments, or access to sensitive accounts.'
      ]},
      { title: 'What the current XFree demo does not do', paragraphs: [
        'The current Trust Gate uses simulated signals. It does not verify an external agent credential, inspect a live banking session, calculate a calibrated production risk model, or send a transaction for approval. Firebase App Check attests the app request context; it does not prove agent identity.',
        'That limitation is visible in the interface and should remain part of any public demonstration. The valuable prototype question is whether evidence and recommended human intervention are understandable, not whether the screen can be treated as a deployed security control.'
      ]}
    ],
    faqs: [
      { question: 'Does XFree detect real autonomous agents?', answer: 'No. The current Know Your Agent view is a concept demo with simulated evidence. It does not detect agents in a live banking session.' },
      { question: 'What could an agent trust score include?', answer: 'A production design might evaluate a verified agent identity, credential freshness, delegated scope, session context, requested action, and required human approval. Each factor needs a defined source and validation.' },
      { question: 'Does Firebase App Check identify an AI agent?', answer: 'No. App Check helps protect Firebase resources from unauthorized app clients. It does not verify the identity or authorization of an autonomous agent.' }
    ], related: ['/guides/agent-trust-score','/guides/app-check-and-agent-identity','/features/xfree-studio','/for/developers']
  },
  {
    path: '/guides/agent-trust-score', title: 'Agent Trust Score: Design an Explainable Risk Model',
    description: 'A practical guide to designing an explainable agent trust score with verifiable identity, delegated scope, action risk, uncertainty, and human escalation.',
    h1: 'How to design an explainable agent trust score', eyebrow: 'GUIDE · TRUST SCORE DESIGN',
    answer: 'An agent trust score should summarize verifiable evidence about identity, delegation, session context, and the requested action while exposing uncertainty and a human escalation path. It should not act as an unexplained approval by itself.',
    sections: [
      { title: 'Start with a decision, not a number', paragraphs: [
        'Define the decision the system needs to support. Is it deciding whether an agent may read a record, initiate a payment, or request human approval? Different actions have different consequences and should not share one generic threshold. Establish an explicit policy before choosing a score scale.',
        'A usable recommendation can be categorical: allow within scope, require step-up authentication, hold for a reviewer, or block. A numeric summary can help sort cases, but the system should show which evidence led to the category and what the score does not know.'
      ]},
      { title: 'Use evidence that can be checked', paragraphs: [
        'Candidate signals include a cryptographically verified agent identifier, issuer and credential validity, token audience and expiration, delegation chain, allowed tool and resource scope, session age, device or workload attestation, action value, and policy version. Each signal needs a trustworthy collection point and a failure state.',
        'Avoid treating the application’s own claim as proof of its identity. Firebase App Check protects app requests but does not provide a universal autonomous-agent identity assertion. Connect identity evidence to an issuer or platform that can be validated for the specific deployment.'
      ]},
      { title: 'Calibrate, explain, and escalate', paragraphs: [
        'Document how factors are weighted, how missing data affects confidence, and what threshold triggers a human review. Test policy against benign and adversarial cases, measure false accepts and false holds, and monitor for drift. Keep an audit record that explains what was seen and which policy version made the recommendation.',
        'For high-impact actions, keep the accountable human in control until the system is independently validated and the organization has approved the authorization policy. XFree’s current interface is a simulated concept for exploring this design, not a financial-grade scoring service.'
      ]}
    ],
    faqs: [
      { question: 'Should a trust score automatically approve a transaction?', answer: 'A score should not be a standalone authorization. Define an action-specific policy, expose evidence and uncertainty, and preserve human escalation for consequential decisions.' },
      { question: 'What is the first factor to verify?', answer: 'Verify the agent identity and credential chain from a trusted issuer, then validate the delegated scope against the exact requested action and resource.' },
      { question: 'Does XFree provide a production trust score?', answer: 'No. XFree currently presents simulated signals in a concept demo.' }
    ], related: ['/features/know-your-agent','/guides/app-check-and-agent-identity','/for/developers','/features/firebase-ai-logic']
  },
  {
    path: '/guides/app-check-and-agent-identity', title: 'Firebase App Check vs Agent Identity: What Each Proves',
    description: 'Understand the difference between Firebase App Check app attestation and cryptographic identity or authorization for autonomous agents.',
    h1: 'App Check and agent identity solve different problems', eyebrow: 'GUIDE · IDENTITY BOUNDARIES',
    answer: 'Firebase App Check helps protect Firebase resources by checking that requests come from an authorized app instance. It does not authenticate a non-human agent, prove its delegation, or authorize a transaction.',
    sections: [
      { title: 'What App Check is for', paragraphs: [
        'Firebase App Check helps reduce abuse of Firebase services by requiring requests to carry an attestation associated with an app. For web apps, the chosen provider and app configuration determine how that attestation is obtained and verified. It is one layer in a service-protection setup.',
        'App Check does not guarantee that a request is benign, that a human intended it, or that content generated by an AI model is correct. A valid app attestation should not be interpreted as the identity of a separate autonomous agent acting through the app.'
      ]},
      { title: 'What an agent identity design needs', paragraphs: [
        'Agent identity needs a verifiable identifier and a trusted credential issuer or platform, with clear validity and rotation rules. Authorization then needs to bind that identity to a user or organization, a delegated set of tools, a resource scope, and an action policy.',
        'A payment or account change should be authorized according to its own risk and approval requirements. The system should check whether the credential is current, whether the requested action is inside scope, and whether a human must confirm it.'
      ]},
      { title: 'How XFree presents the distinction', paragraphs: [
        'XFree uses Firebase AI Logic and App Check for its AI requests. Its Know Your Agent concept screen demonstrates how identity, scope, and action evidence might be surfaced to a reviewer. The screen’s signals are simulated and are not linked to an external identity provider.',
        'This separation is intentional: app integrity and agent identity are related security concerns but different claims. Any implementation that connects a real agent identity should choose a credential standard or provider that fits the deployment and test it with a threat model.'
      ]}
    ],
    faqs: [
      { question: 'If App Check passes, is the AI agent trusted?', answer: 'No. App Check attests the app request context. It does not identify or authorize an AI agent.' },
      { question: 'Can App Check prevent all abuse?', answer: 'No single control prevents all abuse. App Check is one protection layer; pair it with authorization rules, quotas, monitoring, and application-specific policy.' },
      { question: 'Does the XFree Trust Gate verify credentials?', answer: 'No. Its current evidence is simulated for demonstration.' }
    ], related: ['/features/firebase-ai-logic','/features/know-your-agent','/guides/agent-trust-score','/features/xfree-studio']
  },
  {
    path: '/guides/local-vs-cloud-ai', title: 'Local AI vs Cloud AI: Privacy, Access and Trade-offs | XFree',
    description: 'Compare local-only, hybrid, and cloud AI modes in XFree Studio by data flow, availability, device requirements, and fallback behavior.',
    h1: 'Local AI vs cloud AI: choose by data flow', eyebrow: 'GUIDE · INFERENCE MODES',
    answer: 'Local-only inference keeps the model request on a supported device and has no cloud fallback. Cloud inference sends the prompt to Firebase AI Logic. Hybrid prefers local processing but may use cloud fallback.',
    sections: [
      { title: 'Local-only: a device requirement', paragraphs: [
        'Local inference can reduce the need to send prompt text to a hosted model, but it depends on a compatible browser, model availability, device resources, and successful setup. If the local model cannot run, a strict local-only experience should stop and explain the limitation.',
        'In XFree, Local only requests Gemini Nano on supported Chrome desktop installations. The browser may not be ready even if it is current. Prepare the model first for a task that depends on local inference, and do not submit a sensitive prompt if the app cannot confirm an acceptable route.'
      ]},
      { title: 'Cloud: hosted model access', paragraphs: [
        'Cloud inference can provide access to a hosted Gemini model without local model setup. It requires network access and is subject to project configuration, quota, service availability, and provider behavior. The prompt is sent to Firebase AI Logic for processing.',
        'Cloud may be appropriate for non-sensitive tasks when the user accepts that transfer. App Check helps protect calls to Firebase AI Logic but does not change the fact that the model request is cloud-hosted.'
      ]},
      { title: 'Hybrid: local preference with a cloud path', paragraphs: [
        'Hybrid combines the two: prefer on-device inference when it is available and allow cloud fallback when it is not. This can improve the chance a request completes across supported environments, but the fallback means a prompt may leave the device.',
        'XFree displays the source of a successful response. The selected mode is a routing preference; the returned inference source is evidence about the completed request. For confidential content, decide whether any fallback is permitted before selecting Hybrid.'
      ]}
    ],
    faqs: [
      { question: 'Which mode is best for private data?', answer: 'Use Local only only when device-only processing is required and the local model is supported. If it is not available, do not switch to Hybrid for that sensitive prompt.' },
      { question: 'Which mode is most reliable?', answer: 'Reliability depends on device and network conditions. Hybrid has an additional cloud path, but that path changes where the prompt may be processed.' },
      { question: 'Does local AI mean no data ever leaves my browser?', answer: 'It describes the model inference route. Other features, such as voice recognition or optional cloud sync, have separate data flows.' }
    ], related: ['/features/hybrid-ai','/features/private-local-ai','/guides/gemini-nano-vs-cloud','/privacy/how-xfree-handles-prompts']
  },
  {
    path: '/privacy/how-xfree-handles-prompts', title: 'How XFree Handles Prompts and Project Files',
    description: 'A practical data-flow guide for XFree Studio: local prompts, Firebase AI Logic cloud requests, browser-saved projects, exports, and optional Firestore sync.',
    h1: 'Know where your prompt and project files go', eyebrow: 'PRIVACY · DATA FLOW',
    answer: 'XFree’s data flow depends on the feature and selected mode: local-only AI requests use the supported device model, Cloud uses Firebase AI Logic, Hybrid may use cloud fallback, and project files remain in browser storage unless exported or explicitly synced.',
    sections: [
      { title: 'AI prompts', paragraphs: [
        'Local-only mode asks for on-device Gemini Nano and does not allow cloud fallback. Cloud mode sends prompt text to Firebase AI Logic. Hybrid mode prefers the local route but permits the cloud model when needed. The app labels a successful inference source returned by Firebase AI Logic.',
        'Browser speech recognition is a separate feature. Its processing and privacy behavior depend on the browser implementation and settings. Avoid dictating sensitive information unless you understand the browser’s handling and have permission to process it.'
      ]},
      { title: 'Project files', paragraphs: [
        'The template builder creates files in the browser. Save stores the project in local browser storage; export creates a portable copy. Browser storage can be cleared, so export anything you need to keep. The preview is sandboxed and does not grant same-origin access, forms, popups, or top-level navigation.',
        'XFree also includes optional Firebase account and project-sync features. Signing in and using cloud save sends project data to Firebase services under the configured project’s rules. Do not sync confidential data unless the account, rules, and organization’s data policy allow it.'
      ]},
      { title: 'Make an informed choice', paragraphs: [
        'Choose Local only for an on-device requirement, Cloud for an explicitly hosted model request, or Hybrid only if a cloud fallback is acceptable. Check the status text before submitting, and review the returned source after success.',
        'XFree’s public demo and this page describe the app’s code paths, not a guarantee that every browser path or Firebase operation succeeds. Service errors, quota, network conditions, or browser support can prevent completion.'
      ]}
    ],
    faqs: [
      { question: 'Are project files uploaded automatically?', answer: 'No. Local starters are saved in browser storage. Cloud sync is optional and requires sign-in and an explicit save action.' },
      { question: 'Does Hybrid send prompts to Firebase?', answer: 'It may. Hybrid permits Firebase AI Logic cloud fallback when the local path is not used or unavailable.' },
      { question: 'Can I use XFree anonymously?', answer: 'You can explore the workspace without an account. Account sign-in is for optional Firebase features.' }
    ], related: ['/features/private-local-ai','/features/hybrid-ai','/tools/project-workspace','/guides/local-vs-cloud-ai']
  },
  {
    path: '/guides/gemini-nano-vs-cloud', title: 'Gemini Nano vs Cloud Gemini: What Changes in XFree',
    description: 'Compare Gemini Nano on-device inference with cloud Gemini in Firebase AI Logic, including browser support, fallback, privacy, and availability.',
    h1: 'Gemini Nano vs cloud Gemini in XFree Studio', eyebrow: 'GUIDE · MODEL ROUTING',
    answer: 'Gemini Nano is the on-device path for supported Chrome desktop browsers. XFree’s cloud path uses Gemini through Firebase AI Logic. Hybrid mode can prefer Nano and fall back to the cloud model.',
    sections: [
      { title: 'Gemini Nano on supported devices', paragraphs: [
        'The on-device path can process a supported text request using the browser’s local model. This avoids sending that particular model request to the cloud. It also depends on browser version, device resources, local model readiness, and the browser’s implementation.',
        'Firebase’s current guidance documents web on-device inference for Chrome desktop 139 and later with Firebase AI Logic SDK 12.5.0 or later. A supported version is necessary but may not be enough to ensure that the model is ready on every device.'
      ]},
      { title: 'Gemini through Firebase AI Logic', paragraphs: [
        'The cloud model runs as a hosted service reached through Firebase AI Logic. It avoids local model downloads but requires an internet connection and is governed by Firebase project configuration, service quotas, and current model availability. The prompt is processed through the cloud path.',
        'XFree currently configures gemini-3.8-flash for cloud requests. Check current Firebase model documentation before changing the identifier or relying on a model’s lifecycle, feature set, or quota.'
      ]},
      { title: 'How to select a path', paragraphs: [
        'Use Local only when the prompt must stay on the device and the browser has prepared the on-device model. Use Cloud when a hosted model is intended. Use Hybrid when you prefer local execution but accept that a fallback may transmit the prompt to Firebase AI Logic.',
        'After a successful request, XFree displays the inference source reported by Firebase AI Logic. A source label is a path indicator, not an assurance that the content is correct, secure, or suitable for a consequential decision.'
      ]}
    ],
    faqs: [
      { question: 'Does Gemini Nano require a download?', answer: 'The browser may need to prepare or download local model data. XFree exposes a preparation action and reports when preparation is unavailable.' },
      { question: 'Is the cloud model always newer or better?', answer: 'Model quality and capability depend on current versions and task. Do not assume one route is universally better; check model documentation and validate important answers.' },
      { question: 'Can Hybrid run without internet?', answer: 'The on-device portion may work offline after the model and app are available, but any cloud fallback requires network access.' }
    ], related: ['/features/hybrid-ai','/features/private-local-ai','/features/firebase-ai-logic','/guides/local-vs-cloud-ai']
  },
  {
    path: '/for/developers', title: 'XFree for Developers: Plan and Prototype in the Browser',
    description: 'Use XFree Studio to clarify a software idea, generate a Gemini project brief, edit a local template starter, and inspect a sandboxed preview.',
    h1: 'XFree for developers: scope the first version before the sprint', eyebrow: 'AUDIENCE · DEVELOPERS',
    answer: 'XFree gives developers a browser-based path from a rough idea to a project brief and editable template starter, with local, hybrid, and cloud AI modes explained in the interface.',
    sections: [
      { title: 'Turn a feature idea into a smaller task', paragraphs: [
        'Use the brief flow to state a user problem, technical constraint, and the outcome that would make a first version useful. Gemini returns a concise outcome, MVP, build sequence, and risk list. Ask follow-up questions by refining the prompt; verify APIs and implementation details against current official documentation.',
        'This can help a solo developer or a team prepare for a design discussion. It does not replace issue tracking, architecture review, tests, or a code-review workflow.'
      ]},
      { title: 'Inspect the starter rather than trusting a black box', paragraphs: [
        'XFree’s starter builder is template-based and runs locally. The workspace lists files, provides an editable source panel, and renders a restricted preview. Export a copy to continue in a full editor or version-control repository.',
        'The preview sandbox limits access to the parent app, but exported code should still be reviewed before execution or deployment. The current workspace is intentionally smaller than a full IDE.'
      ]},
      { title: 'Pick an inference route that fits the data', paragraphs: [
        'A generic feature description may be suitable for Hybrid if cloud fallback is acceptable. Proprietary source code or customer context should not go into Cloud or Hybrid unless your policy permits sending it to Firebase AI Logic. Local-only mode requires supported Gemini Nano availability.',
        'The app shows a source label for completed inference and an error message when the request does not complete. Treat the model output as a draft, not a test result or proof that files were created.'
      ]}
    ],
    faqs: [
      { question: 'Can XFree analyze my repository?', answer: 'The current app does not have repository import or code-review features. Its Gemini flow produces a project brief, and its separate starter uses local templates.' },
      { question: 'Can I export the starter into Git?', answer: 'You can export the project copy and then add it to your normal Git workflow outside XFree.' },
      { question: 'Does XFree run tests?', answer: 'No. The local workspace provides a source editor and sandboxed preview, but does not run a test suite or claim that generated code passes tests.' }
    ], related: ['/tools/ai-developer-tool','/tools/project-workspace','/features/firebase-ai-logic','/guides/agent-trust-score']
  },
  {
    path: '/for/students', title: 'XFree for Students: Plan Small Coding Projects',
    description: 'Use XFree Studio to break a learning idea into a small project brief, explore AI inference choices, and edit a browser-based starter.',
    h1: 'XFree for students: make a project small enough to finish', eyebrow: 'AUDIENCE · STUDENTS',
    answer: 'Students can use XFree to turn a learning goal into a concise project brief, then inspect and edit a local template starter. AI output is a draft to learn from, not a substitute for coursework or understanding.',
    sections: [
      { title: 'Start with a learning objective', paragraphs: [
        'Choose one concept you want to practice—forms, state, semantic HTML, data visualization, or a small API integration. Describe what you already know and what you want to learn. A brief can help split that goal into a small build sequence and identify the riskiest unknown.',
        'Check your course rules before using AI-generated planning or code. The current XFree AI flow creates a written project brief, while its starter builder creates local templates. You should understand, review, and make your own changes to every artifact you submit.'
      ]},
      { title: 'Keep the project manageable', paragraphs: [
        'A finished project can be more valuable than a broad unfinished idea. Ask for the smallest version that demonstrates one behavior, then identify what should wait. Use the preview to inspect the starter and export a copy when you are ready to work in your usual editor.',
        'The in-browser builder is not a full coding environment and does not run an automated test suite. Use it as a first step, then test your work in the tools and environment required by your course.'
      ]},
      { title: 'Understand your privacy choices', paragraphs: [
        'The AI mode matters. Local-only requests require a supported Gemini Nano browser and do not allow cloud fallback. Hybrid may send the prompt to Firebase AI Logic if the local model is unavailable. Cloud mode sends it to Firebase AI Logic.',
        'Do not include student IDs, grades, personal contact details, or restricted course material in prompts. Ask an instructor if you are unsure what tool use is allowed.'
      ]}
    ],
    faqs: [
      { question: 'Does XFree complete my assignment?', answer: 'No. XFree offers planning help and starter templates. Follow your course’s academic integrity and AI-use rules.' },
      { question: 'Can I learn from the generated files?', answer: 'Yes. The project workspace makes starter source editable and previewable. Review the code and use it as a learning aid.' },
      { question: 'Do I need to create an account?', answer: 'No account is required to explore the main workspace. Optional Firebase cloud features use sign-in.' }
    ], related: ['/features/xfree-studio','/tools/ai-project-brief-generator','/tools/website-starter','/guides/local-vs-cloud-ai']
  },
  {
    path: '/for/independent-builders', title: 'XFree for Independent Builders and Solo Founders',
    description: 'Plan a focused first release with XFree Studio: a Gemini brief, local starter template, explicit AI modes, browser preview, and export.',
    h1: 'XFree for independent builders: test the idea before expanding it', eyebrow: 'AUDIENCE · INDEPENDENT BUILDERS',
    answer: 'Independent builders can use XFree Studio to make an early product idea more specific, review an MVP brief, and start from an editable local project template.',
    sections: [
      { title: 'Write down the customer problem first', paragraphs: [
        'A founder’s first challenge is often choosing a narrow customer and a problem worth solving. Describe the current workaround, the person using it, and the result they want. The XFree Gemini brief flow can help express a first outcome and a build sequence, while surfacing assumptions to validate.',
        'Model-generated plans can sound confident without evidence. Talk to likely users, measure real behavior, and update the brief based on what you learn. Treat suggested market assumptions as hypotheses, not research.'
      ]},
      { title: 'Prototype with visible files', paragraphs: [
        'Create a template starter when a lightweight first artifact helps. Edit the files, inspect the preview, and export the result for a full development environment. This gives you a concrete starting point without implying that the model has produced a finished product.',
        'Use the brief to select a learning milestone. A landing page, clickable prototype, or internal tool may be enough to test one assumption before investing in a larger feature set.'
      ]},
      { title: 'Protect sensitive business information', paragraphs: [
        'A product idea may contain confidential details, customer information, or unpublished strategy. Local-only mode is the device-only path when supported. Hybrid may fall back to cloud inference, while Cloud sends the prompt to Firebase AI Logic. Select a mode based on what your team allows.',
        'Keep project artifacts local unless you deliberately sign in and use cloud synchronization. Export your work if you need an independent copy or want to move into a version-controlled repository.'
      ]}
    ],
    faqs: [
      { question: 'Can XFree validate my startup idea?', answer: 'No. It can help structure a hypothesis, but validation requires evidence from users and the market.' },
      { question: 'Will XFree deploy my product?', answer: 'The current project workspace does not deploy an application. It creates, edits, previews, saves locally, and exports a starter project.' },
      { question: 'Can I use the tool without an account?', answer: 'Yes. The main workspace is available without signup; optional Firebase sync requires sign-in.' }
    ], related: ['/tools/ai-project-brief-generator','/tools/website-starter','/features/xfree-studio','/privacy/how-xfree-handles-prompts']
  },
  {
    path: '/for/privacy-conscious-creators', title: 'XFree for Privacy-Conscious Creators',
    description: 'Explore XFree’s local-only, hybrid, and cloud AI modes and understand where prompts, voice input, and project files may be processed or saved.',
    h1: 'A creative workspace that makes data choices explicit', eyebrow: 'AUDIENCE · PRIVACY-CONSCIOUS CREATORS',
    answer: 'XFree explains whether an AI request is local-only, cloud-hosted, or hybrid with possible cloud fallback, and lets creators keep template projects in browser storage until they choose to export or sync them.',
    sections: [
      { title: 'Choose the route before sharing an idea', paragraphs: [
        'A creator’s prompt can contain unpublished work, client details, or personal information. Local-only mode requests Gemini Nano on supported Chrome desktop browsers and does not permit a Firebase cloud fallback. Hybrid mode may use the cloud if the local model cannot complete. Cloud mode sends text to Firebase AI Logic.',
        'Decide what information is safe for the chosen route. If a prompt must not leave the device, use Local only and verify the local model is ready. If the model is unavailable, stop rather than changing modes without considering the data flow.'
      ]},
      { title: 'Keep project files under your control', paragraphs: [
        'The local template workspace stores projects in the current browser. You can inspect and edit the source, preview it, and export a copy. Browser storage is not durable backup, so export files you need to keep.',
        'Optional Firebase sync is a separate action that requires sign-in. Review what you are uploading before using the cloud save. Avoid syncing client work unless your agreement and data-handling policy allow it.'
      ]},
      { title: 'Know the boundaries of other browser features', paragraphs: [
        'Voice input depends on browser speech-recognition support, and its network or processing behavior can vary by browser. The app’s privacy-by-mode control describes Gemini inference and does not automatically govern browser speech services or other platform features.',
        'XFree’s Gemini feature returns a project brief. It is not an image-generation tool or an autonomous publishing service. Use it to shape a plan, then review and create the final work yourself.'
      ]}
    ],
    faqs: [
      { question: 'Which mode should I choose for unpublished client work?', answer: 'Follow your client agreement. Local only is the device-only inference option when supported. Hybrid permits cloud fallback and should not be treated as device-only.' },
      { question: 'Are local projects automatically uploaded?', answer: 'No. They stay in browser storage unless you explicitly export or use optional Firebase cloud sync.' },
      { question: 'Does voice input have the same privacy behavior as Gemini?', answer: 'Not necessarily. Browser speech recognition is a separate feature with behavior that can vary by browser.' }
    ], related: ['/privacy/how-xfree-handles-prompts','/features/private-local-ai','/guides/local-vs-cloud-ai','/features/xfree-studio']
  },
];

const pageByPath = new Map(SEO_PAGES.map((page) => [page.path, page]));
export function getSEOPage(path: string) { return pageByPath.get(path.replace(/\/$/, '') || '/'); }

export function SeoPageView({ page }: { page: SEOPage }) {
  const related = page.related.map((path) => SEO_PAGES.find((item) => item.path === path)).filter((item): item is SEOPage => Boolean(item));
  return <div className="seo-site">
    <header className="seo-header"><a className="seo-brand" href="/"><img src="/x-logo-cutout.png" alt=""/><span>XFree<small>STUDIO · OPEN WORKSPACE</small></span></a><nav aria-label="Primary"><a href="/features/xfree-studio">XFree Studio</a><a href="/features/hybrid-ai">Hybrid AI</a><a href="/features/know-your-agent">Know Your Agent</a></nav><a className="seo-cta" href="/studio">Open Studio <ArrowRight size={16}/></a></header>
    <main className="seo-main">
      <nav className="seo-breadcrumb" aria-label="Breadcrumb"><a href="/">XFree</a><ChevronRight size={14}/><span>{page.eyebrow.split(' · ').at(-1)}</span></nav>
      <article>
        <header className="seo-hero"><span className="seo-eyebrow"><Sparkles size={14}/>{page.eyebrow}</span><h1>{page.h1}</h1><p>{page.description}</p><a href="/studio" className="seo-cta">Try XFree Studio <ArrowRight size={16}/></a></header>
        <section className="seo-answer" aria-label="Quick answer"><span>IN SHORT</span><p>{page.answer}</p></section>
        <div className="seo-article-grid"><div className="seo-content">{page.sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
          <section className="seo-faq"><h2>Frequently asked questions</h2>{page.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
        </div><aside className="seo-sidebar"><div className="seo-side-card"><span>BUILD WITH XFREE</span><h2>Ideas into a clearer first build.</h2><p>Plan with Gemini, choose an inference mode, then inspect a local starter.</p><a href="/studio">Open the workspace <ArrowRight size={14}/></a></div><div className="seo-side-card seo-related"><span>RELATED TOPICS</span>{related.map((item) => <a key={item.path} href={item.path}>{item.h1}<ArrowRight size={14}/></a>)}</div></aside></div>
      </article>
    </main>
    <footer className="seo-footer"><a href="/">XFree Studio</a><nav aria-label="Explore pages">{SEO_PAGES.slice(0, 8).map((item) => <a key={item.path} href={item.path}>{item.h1.replace(/\s*[:—].*/, '')}</a>)}</nav><span>Local-first choices. Clear limits. Human review.</span></footer>
    <a href="/studio" className="seo-floating">Open Studio <ExternalLink size={14}/></a>
  </div>;
}
