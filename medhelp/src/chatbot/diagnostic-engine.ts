// ============================================
// Diagnostic AI Chatbot Engine — Connected Backend
// ============================================

export interface ChatMessage {
  role: 'bot' | 'user' | 'system';
  text: string;
  quickReplies?: { label: string; value: string }[];
  isRedFlag?: boolean;
  disclaimer?: string;
}

let onMessageCb: (msg: ChatMessage) => void;

export function initChatbot(onMessage: (msg: ChatMessage) => void) {
  onMessageCb = onMessage;

  setTimeout(() => {
    onMessageCb({
      role: 'bot',
      text: "Hello! I am your AI Medical Assistant. How can I help you today? Please describe your symptoms.",
      disclaimer: "I am an AI, not a doctor. Always consult a licensed physician for medical advice."
    });
  }, 500);
}

export async function handleUserInput(input: string) {
  // Echo user message
  onMessageCb({ role: 'user', text: input });

  try {
    const response = await fetch('http://127.0.0.1:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_message: input })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    onMessageCb({
      role: 'bot',
      text: data.reply,
      disclaimer: "I am an AI, not a doctor. Always consult a licensed physician for medical advice."
    });

  } catch (error) {
    onMessageCb({
      role: 'system',
      text: `Error connecting to medical AI: ${error}`
    });
  }
}
