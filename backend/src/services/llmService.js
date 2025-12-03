const { GoogleGenerativeAI } = require("@google/generative-ai");
const { log } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// Shared visual style to keep frames consistent (also mirrored in imageGenService).
const BASE_IMAGE_STYLE = process.env.GEMINI_IMAGE_STYLE || "Cinematic neon-noir, teal-magenta palette, volumetric rain and fog, soft bloom, anamorphic lens, shallow depth of field, subtle film grain, 16:9 composition";

// Fallback storyboard data (The "Seed" story)
const FALLBACK_STORYBOARD = [
  {
    shot: 1,
    prompt: "Extreme macro close-up of a small, dormant seed nestled in dark, moist, granular soil. The camera slowly zooms in, focusing on subtle tremors as the seed casing cracks. A tiny, pale green sprout, delicate and hopeful, slowly pushes through the cracked seed and then through the soil surface. The movement is a smooth, time-lapse-like emergence. Ends with the very tip of the sprout just breaking the soil line, surrounded by richly detailed soil. Cinematic, macro photography, hyperrealistic, 4K, soft, diffused natural light, shallow depth of field, seamless emergence, no text, no captions.",
    duration: "5-6 seconds",
    description: "The Awakening: A seed cracks and a sprout emerges from the soil.",
    shotStory: "在黑暗潮湿的泥土中，一颗沉睡的种子开始苏醒。种壳轻轻裂开，一株嫩绿的幼芽缓缓破土而出，带着对生命的渴望。",
    imageUrl: "http://localhost:5180/images/shot1.jpg"
  },
  {
    shot: 2,
    prompt: "Low angle shot. Gentle rain begins to fall. The tiny sprout grows rapidly in a time-lapse style. It unfurls leaves, stretching upwards. The stem thickens and turns woody, transforming from a fragile sprout into a sturdy young sapling. The rain nourishes it, and the soil stays dark and rich. Photorealistic, Time-lapse, 4K.",
    duration: "6-7 seconds",
    description: "The Growth: Rain falls, and the sprout grows into a sapling.",
    shotStory: "紧接着，天空飘起细雨。雨水滋润着刚破土的幼芽，它迅速舒展叶片，茎干逐渐变粗变硬，从脆弱的小苗成长为一株健壮的树苗。",
    imageUrl: "http://localhost:5180/images/shot2.jpg"
  },
  {
    shot: 3,
    prompt: "Wide shot. The rain stops, sun breaks through. The sapling accelerates into a mighty, ancient oak tree. Branches reach out, leaves explode in lush green canopies. The trunk expands, bark becoming rough. Sunbeams filter through leaves, creating dappled light. Birds fly into the branches. Cinematic, Majestic, Hyperrealistic.",
    duration: "7-8 seconds",
    description: "The Mighty Tree: The sapling becomes a massive, ancient oak.",
    shotStory: "雨过天晴，阳光穿透云层。树苗在光芒中加速生长，枝干向四周伸展，树冠郁郁葱葱。它已蜕变成一棵参天古橡树，鸟儿飞入枝头栖息。",
    imageUrl: "http://localhost:5180/images/shot3.jpg"
  },
  {
    shot: 4,
    prompt: "Wide landscape view. The mighty tree stands in a vibrant meadow. Roots spread deep. Under its shade, animals graze. A stream flows nearby. Flowers bloom around it. The tree stands as a beacon of life. Cinematic, Detailed Ecosystem, Golden Hour.",
    duration: "6-7 seconds",
    description: "The Source of Life: The tree supports a vibrant ecosystem.",
    shotStory: "如今，这棵从种子成长而来的大树矗立在生机勃勃的草地上。它的树荫下动物悠闲觅食，溪流在旁潺潺流过，鲜花环绕盛开——它已成为生命的源泉。",
    imageUrl: "http://localhost:5180/images/shot4.jpg"
  }
];

const resizeStoryboard = (storyboard, desiredCount) => {
  if (!desiredCount || desiredCount <= 0) return storyboard;
  const result = [];
  for (let i = 0; i < desiredCount; i++) {
    const template = storyboard[i % storyboard.length];
    result.push({ ...template, shot: i + 1 });
  }
  return result;
};

const retry = async (fn, attempts = 2, delayMs = 400) => {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastErr;
};

// Read the Prompt Guide once
let PROMPT_GUIDE_CONTENT = "";
try {
  const guidePath = path.join(__dirname, '../../../guide/VideoGenerationPromptGuide.md');
  if (fs.existsSync(guidePath)) {
    PROMPT_GUIDE_CONTENT = fs.readFileSync(guidePath, 'utf-8');
  } else {
    console.warn("Warning: VideoGenerationPromptGuide.md not found at", guidePath);
  }
} catch (e) {
  console.warn("Failed to read VideoGenerationPromptGuide.md:", e);
}

exports.analyzeShotTransition = async (shotA, shotB) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash"; // Using Flash for speed

  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('your_')) {
    throw new Error("No valid GEMINI_API_KEY found for transition analysis.");
  }

  // Function to fetch image and convert to base64 part
  const getImagePart = async (url) => {
    const { fetch } = require('undici');
    if (!url) return null;
    // Simple check for base64 data URI
    if (url.startsWith('data:')) {
      return {
        inlineData: {
          data: url.split(',')[1],
          mimeType: url.split(';')[0].split(':')[1]
        }
      };
    }
    // Assume it's a URL
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return {
      inlineData: {
        data: Buffer.from(buffer).toString('base64'),
        mimeType: response.headers.get('content-type') || 'image/jpeg'
      }
    };
  };

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: geminiModel });

    const imagePartA = await getImagePart(shotA);
    const imagePartB = await getImagePart(shotB);

    if (!imagePartA || !imagePartB) {
       throw new Error("Invalid image inputs for transition analysis.");
    }

    const promptParts = [
      { text: `
        Role: Expert Film Director and Cinematographer.
        Context: You are generating prompts for Google's Veo video generation model.
        
        IMPORTANT SAFETY GUIDELINES:
        `
      },
      { text: PROMPT_GUIDE_CONTENT },
      { text: `
        Task: Analyze these two sequential storyboard frames (First Frame -> Last Frame).
        1. Describe the specific camera movement and visual transition required to bridge these two shots seamlessly (e.g., "Slow dolly zoom in while panning right", "Focus pull from foreground to background").
        2. Determine the optimal duration for this transition to feel natural (MUST be 4, 6, or 8 seconds).

        Output ONLY a raw JSON object (no markdown):
        {
          "transition_prompt": "Detailed cinematic description, strictly following safety guidelines...",
          "duration": 4
        }
      `}
    ];

    const result = await retry(() => model.generateContent(promptParts));
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
        const parsed = JSON.parse(text);
        // Normalize duration
        let dur = parseInt(parsed.duration);
        if (![4, 6, 8].includes(dur)) dur = 6;
        return {
            transition_prompt: parsed.transition_prompt,
            duration: dur
        };
    } catch (e) {
        console.error("Failed to parse LLM transition response:", text);
        return { transition_prompt: "Cinematic transition", duration: 6 };
    }

  } catch (error) {
    console.error("Error analyzing shot transition:", error);
    // Fallback
    return { transition_prompt: "Smooth cinematic transition", duration: 6 };
  }
};

exports.generatePrompts = async (sentence, shotCount = 6, styleOverride) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const geminiTextModel = process.env.GEMINI_TEXT_MODEL || "gemini-3-pro-preview";
  const appliedStyle = styleOverride && styleOverride.trim() !== '' ? styleOverride.trim() : BASE_IMAGE_STYLE;

  // Check if API key is not set OR if it's empty OR if it's still the placeholder value
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('your_')) {
    log('storyboard_llm_fallback_no_key', { requestedShots: shotCount });
    return resizeStoryboard(FALLBACK_STORYBOARD, shotCount);
  }

  log('storyboard_llm_start', { model: geminiTextModel, requestedShots: shotCount });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: geminiTextModel,
      // Gemini 3 Pro defaults to 'high' thinking level, which is good for complex reasoning like storyboarding.
    });

    const promptParts = [
      { text: `
        Role: You are a film storyboard artist.
        Context: You are creating prompts for Google's Veo video generation model.
        
        IMPORTANT SAFETY GUIDELINES:
        `
      },
      { text: PROMPT_GUIDE_CONTENT },
      { text: `
        Goal: Create a continuous storyboard with EXACTLY ${shotCount} shots for the story: "${sentence}".
        Global visual style: ${appliedStyle}.

        *** CRITICAL NARRATIVE REQUIREMENTS ***
        1. **Continuous Story Arc**: The shots must form a single, unbroken chronological narrative. Do not generate disconnected scenes. 
           - Use the total shot count (${shotCount}) to pace the story:
             * Beginning (approx first 25%): Set the scene and introduce the subject.
             * Middle (approx middle 50%): Action, movement, conflict, or transformation.
             * End (approx last 25%): Resolution, calm, or final visual statement.
        2. **Visual Consistency**: 
           - Define a specific "Hero Subject" (character or object) that appears or is implied in consecutive shots.
           - Maintain consistent lighting, color palette, and weather unless the story explicitly changes them.
        3. **Seamless Flow**: 
           - Write each prompt as if it picks up IMMEDIATELY where the previous shot left off.
           - Use "connective tissue" in your descriptions (e.g., "Continuing from the previous angle...", "The character turns...", "Following the object...").
        4. **Causal Relationship (因果关系)**: 
           - Each shot MUST have a clear cause-and-effect relationship with the previous shot.
           - Explain WHY the transition happens (e.g., "Because the rain stopped...", "As a result of...", "This leads to...").
           - Avoid random scene jumps; every shot should be a logical consequence of the previous one.
        5. **Temporal Continuity (时间顺序)**:
           - Maintain strict chronological order. No flashbacks or time jumps unless explicitly requested.
           - Use time markers in shotStory (e.g., "紧接着", "随后", "与此同时", "最终").

        Output format: ONLY a raw JSON array (no code fences).
        Required fields per shot:
        - shot: integer (1..${shotCount})
        - prompt: detailed image generation prompt that includes the shared style, visual anchors, and clear action. MUST BE SAFE.
        - duration: integer, MUST be exactly 4, 6, or 8 (seconds). No other values allowed.
        - description: 简洁的中文动作摘要，明确说明叙事进展（必须是中文）。
        - shotStory: A narrative description in Chinese (2-3 sentences) that tells the story of this shot with clear causal connection to the previous shot. Use connective words like "因此"、"于是"、"紧接着"、"随后" to show cause-and-effect.
        - heroSubject: (ONLY in shot 1) A detailed character/subject description for visual consistency across all shots. Include: species/type, skin/fur color, body build, clothing, distinctive features, accessories. Example: "A muscular purple-skinned man with a bald head, wearing a tattered white lab coat, carrying a giant syringe with green glowing liquid, has stitches on his face and arms". This will be prepended to all subsequent shot prompts to maintain character consistency.
      `}
    ];

    const result = await retry(() => model.generateContent(promptParts));
    const response = await result.response;
    let text = response.text();

    // Clean up potential markdown formatting
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const storyboard = resizeStoryboard(JSON.parse(text), shotCount);
    return storyboard;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    log('storyboard_llm_error', { message: error.message });
    if (apiKey) {
      // If we have a real key but the request failed, propagate so frontend can show an error instead of stale fallback.
      throw error;
    }
    log('storyboard_llm_fallback_error', { reason: 'api_error', requestedShots: shotCount });
    return resizeStoryboard(FALLBACK_STORYBOARD, shotCount);
  }
};
