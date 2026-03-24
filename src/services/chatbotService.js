const API_URL = import.meta.env.VITE_CHATBOT_API_URL || "/api/chat";

export const sendMessage = async (message) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Chatbot error:", error);
    throw error;
  }
};
