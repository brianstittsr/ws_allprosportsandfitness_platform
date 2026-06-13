/**
 * Hermes AI Response Engine
 * Processes incoming messages and returns helpful fitness-related responses.
 * Designed to be plugged into an LLM (OpenAI, Claude, etc.) when an API key is available.
 */

export interface HermesContext {
  userId?: string;
  userName?: string;
  organizationId?: string;
  channel: "telegram" | "facebook" | "slack" | "in_app";
  previousMessages?: { role: "user" | "assistant"; content: string }[];
}

export interface HermesResponse {
  text: string;
  quickReplies?: string[];
  actions?: { type: string; payload: unknown }[];
}

const fitnessKnowledgeBase: Record<string, string> = {
  membership: "You can view and manage your membership through the Member Portal. For new sign-ups, visit our Programs page or contact the front desk.",
  schedule: "Our class schedule is updated weekly. You can view current offerings in the Programs section of our platform.",
  pricing: "We offer flexible pricing: drop-in rates, monthly memberships, and annual packages. Contact us for current promotions.",
  coach: "Our certified coaches specialize in strength training, yoga, cardio, and sports conditioning. You can book sessions through the platform.",
  program: "We offer youth athletics, adult fitness, senior wellness, team training, and specialized camps. Check the Programs tab for details.",
  location: "We have multiple locations across North Carolina. Hours vary by location. Check the Locations page for addresses and schedules.",
  hours: "Most locations are open Mon-Fri 5am-10pm, Sat 7am-8pm, Sun 8am-6pm. Holiday hours may vary.",
  contact: "You can reach us by phone, email, or through this chat. Our staff typically responds within a few hours during business hours.",
  help: "I am Hermes, your AI assistant for NC Fitness Club. I can help with membership, programs, scheduling, coaching, and general questions. What would you like to know?",
};

function keywordMatch(message: string): string | null {
  const lower = message.toLowerCase();
  for (const [keyword, response] of Object.entries(fitnessKnowledgeBase)) {
    if (lower.includes(keyword)) return response;
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hello! I'm Hermes, your AI assistant for NC Fitness Club. How can I help you today?";
  }
  if (lower.includes("thank")) {
    return "You're welcome! Let me know if you need anything else.";
  }
  if (lower.includes("bye") || lower.includes("goodbye")) {
    return "Goodbye! Stay active and have a great day!";
  }
  return null;
}

/**
 * Generate a Hermes response. If an OPENAI_API_KEY is configured,
 * this can be swapped to call the OpenAI API instead.
 */
export async function askHermes(
  message: string,
  context: HermesContext
): Promise<HermesResponse> {
  const matched = keywordMatch(message);

  if (matched) {
    return {
      text: matched,
      quickReplies: context.channel === "facebook"
        ? ["Membership", "Programs", "Schedule", "Contact Us"]
        : undefined,
    };
  }

  const fallback = `I'm not sure I understand. I can help with questions about memberships, programs, class schedules, coaching, locations, and hours. What would you like to know?`;

  return {
    text: fallback,
    quickReplies: context.channel === "facebook"
      ? ["Membership", "Programs", "Schedule", "Contact Us"]
      : undefined,
  };
}

/**
 * Log Hermes interaction for analytics and improvement.
 */
export async function logHermesInteraction(
  input: string,
  response: HermesResponse,
  context: HermesContext
): Promise<void> {
  console.log(`[Hermes][${context.channel}] ${context.userName || "User"}: ${input}`);
  console.log(`[Hermes][${context.channel}] Response: ${response.text}`);
}
