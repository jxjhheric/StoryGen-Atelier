# Veo / Video Generation Prompt Authoring Guide

> Purpose: Practical reference for anyone writing prompts for AI video generation
> Scope: For use with **Vertex AI Veo** (or similar video models with safety filters)

---

## 1. Before You Start: Three Core Principles

1. **Be clear about the purpose**

   * Is this for an ad, product demo, onboarding, education, internal prototype, or something else?
   * The clearer the use case, the easier it is to write a good, compliant prompt.

2. **Creative ideas are welcome, but wording must stay within policy**

   * You can use themes like action, mystery, or even war, **but** avoid:

     * explicit sexual content, graphic violence, hate speech, or encouragement of self-harm.
   * Prefer **implication and atmosphere** over explicit description.

3. **Assume everything is logged and reviewable**

   * Don’t include real personal sensitive data (PII), credentials, or confidential business details.
   * Write as if an external auditor or partner could safely read your prompt.

---

## 2. Safety & Policy Basics

Veo uses built-in **safety filters** on all prompts (text, image, video) to block harmful content and enforce Google Cloud policies.

If a request violates or risks violating Google Cloud policies, the model may:

* refuse the prompt (e.g. “The prompt couldn’t be submitted… it might violate our policies”), or
* return **fewer videos than requested** because some outputs were blocked.

### 2.1 High-Risk / Prohibited Content (avoid in prompts and inputs)

**Sexual / pornographic**

* Explicit sexual content or description of sexual acts.
* Strong sexual innuendo or fetishized description focused on the body.
* Any sexual context where people are not clearly presented as mature, consenting adults in a neutral setting.

**Violence / gore**

* Graphic description of serious injuries, dismemberment, or extreme suffering.
* Detailed torture or self-harm scenes.

> If you must depict conflict (e.g. war, accident, disaster), use **distant, non-graphic** descriptions, such as:
> “In the far distance, faint flashes suggest a battle, but no injuries are visible.”

**Hate / discrimination / extremism**

* Attacks against groups based on race, religion, gender, nationality, and similar attributes.
* Promotion or praise of extremist organizations, symbols, or ideologies.

**Dangerous / illegal activities**

* Step-by-step instructions for weapons, explosives, or serious harm.
* Guidance for committing crimes, evading law enforcement, or abusing systems.
* Instructions for illegal drug production or trafficking.

**Personal data (PII)**

* Real IDs, credit card numbers, full home addresses, phone numbers, emails, etc.
* Prompts or reference materials that clearly identify a real private individual in a sensitive context.

**Real people & celebrities**

* Realistic videos of **specific, real celebrities or public figures** without proper authorization.
* Any use of real individuals that could reasonably be perceived as misleading, defamatory, or invasive.

---

## 3. Recommended Prompt Structure

Break your idea into components. You don’t need all of them every time, but thinking in this order helps:

1. **Subject** – who / what
2. **Action** – what they are doing
3. **Scene / context** – where / when / atmosphere
4. **Camera** – angle and movement
5. **Visual style** – realism vs animation, lighting, tone
6. **Audio** (optional) – ambience, music, dialogue

### 3.1 Generic Prompt Template

Use this as a base and customize:

> **Subject**: A [role / character / object]
> **Action**: [what they are doing]
> **Scene**: [location + time of day + atmosphere]
> **Camera**: [shot size + angle + movement]
> **Visual style**: [realistic / animated + lighting + mood]
> **Audio (optional)**: [ambient sounds / music / dialogue / no audio]

**Example**

> Subject: A female engineer in a white shirt
> Action: Explaining a system design, pointing to diagrams on a large screen
> Scene: Evening in a modern office, city lights visible through the windows, quiet and focused atmosphere
> Camera: Medium side shot, slow dolly-in as she explains
> Visual style: Semi-realistic, clean corporate look, soft warm lighting, trustworthy feeling
> Audio: Soft office ambience, subtle background music, her speech is clear and calm

---

## 4. How to Write Each Element (Safe + Effective)

### 4.1 Subject (who / what)

**Good patterns**

* “A female engineer in a white shirt”
* “A researcher wearing safety goggles at a lab bench”
* “An orange cat sitting on a windowsill”
* “A vintage blue sports car parked on a coastal road”

**Avoid**

* Realistic depictions of **specific real celebrities or public figures**, for example:

  * “A hyper-realistic video of [real person] giving a speech”
* Any description that could be interpreted as sexualizing people whose age or context is unclear.

Use **fictional characters, roles, and approximate traits** instead of real names, unless you have explicit rights and your use case is approved.

---

### 4.2 Action (what is happening)

**Recommended**

* “Explaining a solution and pointing to charts on the screen”
* “Carefully adjusting equipment on a workbench”
* “Slowly opening the door and looking around the room”
* “Riding a bicycle through the city at night, hair moving gently in the wind”

**Not recommended**

* Aggressive actions described in a graphic way.
* Any explicitly sexual or suggestive actions described in detail.

Keep actions focused on **work, everyday life, atmosphere, or storytelling** rather than explicit harm or intimacy.

---

### 4.3 Scene / context (where, when, atmosphere)

**Recommended**

* “A modern office at dusk, with city lights visible through large windows”
* “A quiet beach at sunrise, warm light reflecting on the waves”
* “A cyberpunk street at night, neon signs reflecting on wet pavement”
* “A cozy living room with wooden floors and warm yellow lamps”

**Avoid**

* Scenes centered on graphic horror, gore, or shock value.
* Locations described mainly through injuries, blood, or suffering.

If you need a serious or tense setting (e.g. hospital, battlefield), keep descriptions **non-graphic** and focus on mood and environment.

---

### 4.4 Camera (angles & movement)

Use simple, cinematic language. Common safe combinations:

* “Medium shot, slight push-in toward the character”
* “Wide shot, slow sideways tracking following the character”
* “Bird’s-eye view over a busy city intersection”
* “Close-up on the main character’s face, background softly blurred”

**Example**

> “Medium side shot of the engineer presenting at a whiteboard, camera slowly dolly-in as she talks.”

---

### 4.5 Visual style (look & feel)

You can mix:

* **Realism vs stylization**

  * photorealistic, cinematic, film-like
  * 2D animation, hand-drawn illustration, low-poly 3D, anime-inspired

* **Lighting**

  * soft, bright, high contrast, backlit silhouette, golden hour, moody low-key

* **Mood**

  * warm, uplifting, calm, futuristic, dreamy, mysterious, playful

**Example**

> “Cinematic but not hyper-realistic, soft lighting, warm tones, overall mood is hopeful and trustworthy.”

---

### 4.6 Audio (if supported)

When using a Veo model that supports audio, describe audio in a **separate sentence or line**:

* “Audio: office ambience with quiet keyboard clicks, soft electronic background music, no dialogue.”
* “Audio: ocean waves and distant seagulls, no music.”
* “Audio: narrator with a calm, neutral accent explaining the product steps.”

If you want **no sound**, say so explicitly:

* “Audio: none / silent video.”

---

## 5. Handling Safety Errors & Support Codes

If a request triggers safety filters, Veo may return an error like:

> “The prompt couldn’t be submitted, it might violate our policies. Support codes: 64151117”

**What to do**

1. **Capture context**

   * Save the prompt and the Support code for internal debugging (avoid logging raw PII).

2. **Self-check against this guide**

   * Does the prompt include sexual content, graphic violence, hate, real persons, dangerous instructions, or PII?
   * Is any part overly detailed, sensational, or focused on harm?

3. **De-risk the prompt**

   * Remove or soften sensitive details.
   * Make conflict non-graphic and distant, or change to purely suggestive / atmospheric.
   * Replace real names with fictional roles or generic actors.

4. **Retry with safer wording**

   * If prompts repeatedly trigger filters, consider adjusting the overall concept, not just a few words.

5. **Escalate only when it clearly looks like a false positive**

   * If the team believes it’s genuinely compliant, use internal escalation (e.g. Google Cloud support) with the Support code and a **high-level** description.

---

## 6. Quick Checklist Before You Run a Prompt

Before sending a prompt, quickly verify:

1. It avoids:

   * sexual content or explicit innuendo
   * graphic violence or gore
   * hate or extremist messaging
   * dangerous or illegal instructions
   * real personal data (PII)
   * realistic depictions of specific real celebrities / public figures without rights

2. The **purpose** is clear (ad, demo, explainer, internal test, etc.).

3. The basics are covered:

   * **Subject** – who or what
   * **Action** – doing what
   * **Scene** – where / when / atmosphere
   * **Camera** – angle and movement
   * **Style** – realism, lighting, mood
   * **Audio** – what you want to hear (or silence)