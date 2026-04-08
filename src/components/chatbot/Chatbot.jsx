import { useEffect, useRef, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";
import { useTranslation } from "react-i18next";
import { CHATBOT_KNOWLEDGE_BASE as KB_VI } from "../../constants/chatbotKnowledge";
import { CHATBOT_KNOWLEDGE_BASE as KB_EN } from "../../constants/chatbotKnowledgeEn";
import "./Chatbot.css";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const MODEL_FALLBACKS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const MAX_WORD_EXTRACT_CHARS = 50000;
const OUT_OF_KB_MARKER = "__OUT_OF_KB__";

function getCurrentTime() {
  const now = new Date();
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function formatBotMessage(text) {
  if (!text) {
    return text;
  }

  let formattedText = text.replace(/### (.*)/g, "<br><b style='font-size: 16px; color: #e65100;'>$1</b>");
  formattedText = formattedText.replace(/## (.*)/g, "<br><b style='font-size: 18px; color: #e65100;'>$1</b>");
  formattedText = formattedText.replace(/(?:^|\n)[*-] (.*)/g, "<br>&bull; $1");
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
  formattedText = formattedText.replace(/\n/g, "<br>");
  formattedText = formattedText.replace(/^(<br>)+/, "");

  return formattedText;
}

export default function Chatbot() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || "vi").split("-")[0];
  const knowledgeBase = currentLang === "en" ? KB_EN : KB_VI;
  const greetings = t("chatbot.greetings", { returnObjects: true }) || [];
  const rejections = t("chatbot.rejections", { returnObjects: true }) || [];
  const systemPrompt = t("chatbot.system_prompt");
  const previousLangRef = useRef(currentLang);
  const chatBoxRef = useRef(null);
  const fileInputRef = useRef(null);

  const getRandomGreeting = () =>
    greetings[Math.floor(Math.random() * greetings.length)] || t("chatbot.no_response");

  const [messages, setMessages] = useState(() => [
    {
      type: "bot",
      content: getRandomGreeting(),
      time: getCurrentTime(),
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [fileData, setFileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  function isQuotaOrRateLimitError(error) {
    const status = error?.status;
    const message = (error?.message || "").toLowerCase();

    return (
      status === 429 ||
      message.includes("429") ||
      message.includes("quota") ||
      message.includes("rate limit")
    );
  }

  async function fetchAIResponse(userText) {
    if (!genAI) {
      return t("chatbot.error_config");
    }

    const fullPrompt =
      `${systemPrompt}\n\n` +
      `${t("chatbot.prompt_knowledge_label")}:\n${knowledgeBase}\n\n` +
      `${t("chatbot.prompt_user_request_label")}: ${userText}\n\n` +
      `${t("chatbot.prompt_reminder")} ${OUT_OF_KB_MARKER}`;

    for (const modelName of MODEL_FALLBACKS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(fullPrompt);
        const responseText = result?.response?.text?.();

        if (responseText && responseText.trim()) {
          return responseText;
        }

        throw new Error("Model returned empty response");
      } catch (error) {
        if (isQuotaOrRateLimitError(error)) {
          console.warn(`[Fallback] ${modelName} rate limited, switching...`, error);
          continue;
        }

        console.warn(`[Fallback] ${modelName} error, switching...`, error);
      }
    }

    return t("chatbot.error_msg");
  }

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (previousLangRef.current === currentLang) {
      return;
    }

    previousLangRef.current = currentLang;

    setMessages((prev) => {
      if (prev.length !== 1 || prev[0]?.type !== "bot") {
        return prev;
      }

      return [
        {
          ...prev[0],
          content: getRandomGreeting(),
          time: getCurrentTime(),
        },
      ];
    });
  }, [currentLang, greetings]);

  async function handleFileSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(t("chatbot.limit_file_size"));
      return;
    }

    const fileName = file.name.toLowerCase();
    const isDocx =
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx");
    const isLegacyDoc = file.type === "application/msword" || fileName.endsWith(".doc");

    if (isLegacyDoc && !isDocx) {
      alert(t("chatbot.limit_doc_format"));
      return;
    }

    if (isDocx) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const extractedText = result.value?.trim();

        if (!extractedText) {
          alert(t("chatbot.limit_word_parse"));
          return;
        }

        setFileData({
          name: file.name,
          mimeType: file.type,
          isImage: false,
          isWordText: true,
          extractedText,
        });
      } catch (error) {
        console.error("DOCX parse error:", error);
        alert(t("chatbot.limit_word_error"));
      }

      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64 = loadEvent.target?.result?.split(",")[1];
      setFileData({
        base64,
        mimeType: file.type,
        name: file.name,
        isImage: file.type.startsWith("image/"),
      });
    };
    reader.readAsDataURL(file);
  }

  function removeFile() {
    setFileData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSendMessage() {
    const text = userInput.trim();
    if (!text && !fileData) return;

    let userDisplayContent = text;

    if (fileData) {
      if (fileData.isImage) {
        userDisplayContent = (
          <>
            <img
              src={`data:${fileData.mimeType};base64,${fileData.base64}`}
              style={{ maxWidth: "100%", borderRadius: "10px", marginBottom: "5px" }}
              alt="uploaded"
            />
            <br />
            {text}
          </>
        );
      } else {
        userDisplayContent = (
          <>
            <div
              style={{
                background: "rgba(255,255,255,0.2)",
                padding: "5px 10px",
                borderRadius: "5px",
                display: "inline-block",
                marginBottom: "5px",
              }}
            >
              {t("chatbot.file_sent_prefix")} {fileData.name}
            </div>
            <br />
            {text}
          </>
        );
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: userDisplayContent,
        time: getCurrentTime(),
      },
    ]);

    setUserInput("");
    const fileDataToSend = fileData;
    removeFile();
    setIsLoading(true);

    try {
      let userQuestion = text || t("chatbot.default_summary_request");

      if (fileDataToSend?.isWordText) {
        userQuestion += `\n\n${t("chatbot.word_document_label")}:\n${fileDataToSend.extractedText.slice(0, MAX_WORD_EXTRACT_CHARS)}`;
      } else if (fileDataToSend) {
        userQuestion += `\n\n${t("chatbot.attached_file_label")}: ${fileDataToSend.name}. ${t("chatbot.attached_file_instruction")}`;
      }

      let aiText = await fetchAIResponse(userQuestion);

      if (typeof aiText === "string" && aiText.includes(OUT_OF_KB_MARKER)) {
        aiText = rejections[Math.floor(Math.random() * rejections.length)] || t("chatbot.error_msg");
      }

      const fallbackText = t("chatbot.no_response");
      const formattedText = aiText ? formatBotMessage(aiText) : fallbackText;

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: formattedText || fallbackText,
          time: getCurrentTime(),
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: t("chatbot.error_process"),
          time: getCurrentTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleEnter(event) {
    if (event.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
  }

  return (
    <>
      <div
        className="chatbot-toggler-wrapper"
        onClick={() => document.body.classList.toggle("show-chatbot")}
      >
        <button className="chatbot-toggler">
          <img src="/images/chat_bot.svg" alt={t("chatbot.name")} />
        </button>
      </div>

      <div className="chatbot-window">
        <div className="chat-header">
          <div className="bot-avatar">
            <img src="/images/chat_bot.svg" alt={t("chatbot.name")} />
          </div>
          <div>
            <h3>{t("chatbot.name")}</h3>
            <p className="chat-status">
              <span className="status-dot"></span>
              <span className="status-text">{t("chatbot.status_online")}</span>
            </p>
          </div>
          <div
            className="close-chat"
            onClick={() => document.body.classList.remove("show-chatbot")}
            title={t("chatbot.close_tooltip")}
          >
            <i className="fas fa-times"></i>
          </div>
        </div>

        <div className="chat-box" ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.type}-wrapper`}>
              <div className={`message ${msg.type}-msg`}>
                {typeof msg.content === "string" ? (
                  <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                ) : (
                  msg.content
                )}
              </div>
              <div className="msg-time">{msg.time}</div>
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper bot-wrapper">
              <div className="message bot-msg typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        {fileData && (
          <div
            style={{
              padding: "10px 15px",
              background: "#f1f5f9",
              borderTop: "1px solid #e2e8f0",
              fontSize: "13px",
              color: "#555",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#fff",
                padding: "5px 10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                width: "fit-content",
              }}
            >
              <span>{fileData.isImage ? "🖼️" : "📄"}</span>
              <span
                style={{
                  maxWidth: "150px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {fileData.name}
              </span>
              <button
                onClick={removeFile}
                style={{
                  background: "none",
                  border: "none",
                  color: "#999",
                  cursor: "pointer",
                  fontSize: "16px",
                  marginLeft: "5px",
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="chat-input">
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*, application/pdf, text/plain, .docx, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileSelect}
          />
          <button
            className="attach-btn"
            onClick={() => fileInputRef.current?.click()}
            title={t("chatbot.attach_tooltip")}
          >
            <i className="fas fa-paperclip"></i>
          </button>
          <input
            type="text"
            value={userInput}
            onChange={(event) => setUserInput(event.target.value)}
            onKeyDown={handleEnter}
            placeholder={t("chatbot.input_placeholder")}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading}
            title={t("chatbot.send_tooltip")}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </>
  );
}
