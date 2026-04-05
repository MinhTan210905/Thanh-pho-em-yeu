// Nhớ tạo file .env với VITE_GEMINI_API_KEY=... và thêm .env vào .gitignore.
import { useState, useRef, useEffect } from "react";
import "./Chatbot.css";
import mammoth from "mammoth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CHATBOT_KNOWLEDGE_BASE } from "../../constants/chatbotKnowledge";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const MODEL_FALLBACKS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];
const MAX_WORD_EXTRACT_CHARS = 50000;
const OUT_OF_KB_MARKER = "__OUT_OF_KB__";
const SYSTEM_PROMPT = `
Bạn là "Trợ lí Sài Gòn" - một hướng dẫn viên du lịch người bản địa cực kỳ am hiểu, thân thiện, xưng hô "mình" và "bạn".

QUY TẮC TRẢ LỜI:

KIẾN THỨC CỐT LÕI: Luôn âm thầm ưu tiên dùng thông tin trong CHATBOT_KNOWLEDGE_BASE. Trả lời tự nhiên, tuyệt đối KHÔNG ĐƯỢC dùng các từ như "Theo dữ liệu nội bộ", "Theo CHATBOT_KNOWLEDGE_BASE" hay "Tài liệu cho biết".

KIẾN THỨC MỞ RỘNG (ẨM THỰC, ĐỊA ĐIỂM HOT): Nếu người dùng hỏi về quán ăn, món ngon, lịch trình đi chơi... mà trong dữ liệu không có, BẠN ĐƯỢC PHÉP tự tin dùng kiến thức ngoài để gợi ý nhiệt tình như một người Sài Gòn thứ thiệt!

CHỐNG LẠC ĐỀ: CHỈ KHI người dùng hỏi những chủ đề hoàn toàn không liên quan đến TP.HCM (ví dụ: giải toán, viết code, chính trị, địa lí nước ngoài...), bạn mới trả về ĐÚNG MỘT CHUỖI DUY NHẤT: OUT_OF_KB

Trình bày dễ nhìn, in đậm các ý chính, ngắn gọn.
`.trim();

const GREETINGS = [
  "Xin chào! Mình là 'Thành phố kể em nghe' - trợ lí thông tin TP.HCM đây. Hôm nay bạn muốn khám phá ngõ ngách nào của Sài Gòn nè?",
  "Chào bạn nha! Cần tìm chỗ ăn chơi, lặn lội di tích hay hóng chuyện lịch sử Sài Gòn thì cứ hú 'Thành phố kể em nghe' một tiếng!",
  "Hello bạn! 'Thành phố kể em nghe' đã sẵn sàng. Bạn đang tò mò về địa danh hay món ngon nào ở Sài Gòn vậy?",
  "Dạ chào bạn! Mình là thổ địa Sài Gòn đây. Bạn muốn đi đâu, ăn gì hay nghe kể chuyện ngày xưa thì cứ nhắn mình nha!"
];

const REJECTIONS = [
  "Trời ơi, câu này hơi nằm ngoài vùng phủ sóng của mình rồi! 😅 Mình là Trợ lí Sài Gòn nên chỉ rành về du lịch, văn hóa và ẩm thực thôi. Hỏi chủ đề khác nha!",
  "Món này khó quá mình xin lùi bước nha! 🤣 Tui chỉ là 'thổ địa' Sài Gòn thôi, rành ăn rành chơi chứ mấy vụ này tui mù tịt. Hỏi tui đi chơi đâu ngon đi!",
  "Ây da, vụ này hông thuộc chuyên môn của mình rồi! 🥲 Bạn hỏi gì về đường sá, di tích hay đồ ăn Sài Gòn thì mình bao cân hết nha!",
  "Chết dở, câu này làm khó thổ địa Sài Gòn rồi! 😂 Mình chỉ biết kể chuyện thành phố thôi, mấy cái khác mình hông dám chém gió đâu nha bạn ơi."
];

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content: GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
      time: getCurrentTime(),
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [fileData, setFileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);
  const fileInputRef = useRef(null);

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
      return "Thiếu cấu hình API Key. Bạn hãy tạo VITE_GEMINI_API_KEY trong file .env.";
    }

    const fullPrompt =
      `${SYSTEM_PROMPT}\n\n` +
      `KIẾN THỨC NỀN CỦA TRỢ LÝ:\n${CHATBOT_KNOWLEDGE_BASE}\n\n` +
      `Yêu cầu của người dùng: ${userText}\n\n` +
      `Nhắc nhở: Trả lời tự nhiên, không nhắc đến tài liệu. Nếu câu hỏi hoàn toàn lạc đề khỏi TP.HCM, chỉ trả về chuỗi: ${OUT_OF_KB_MARKER}`;

    // Thuật toán fallback "vét máng" 2 tầng:
    // - Duyệt model theo thứ tự ưu tiên từ cao xuống thấp.
    // - Nếu model hiện tại bị quota/rate limit thì tự động rơi xuống model tiếp theo.
    // - Chỉ cần một model trả kết quả thành công thì dừng ngay và trả về cho UI.
    for (const modelName of MODEL_FALLBACKS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(fullPrompt);
        const responseText = result?.response?.text?.();

        if (responseText && responseText.trim()) {
          return responseText;
        }

        throw new Error("Model trả về phản hồi rỗng");
      } catch (error) {
        if (isQuotaOrRateLimitError(error)) {
          console.warn(`[Fallback] ${modelName} bị giới hạn lượt (quota/rate limit), chuyển model kế tiếp...`, error);
          continue;
        }

        console.warn(`[Fallback] ${modelName} lỗi không phải quota, chuyển model kế tiếp...`, error);
      }
    }

    return "Hệ thống trợ lý ảo đang tạm thời quá tải lượt truy cập, bạn vui lòng thử lại sau ít phút nhé!";
  }

  function getCurrentTime() {
    const now = new Date();
    return now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0");
  }

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Vui lòng chọn file nhỏ hơn 5MB.");
      return;
    }

    const fileName = file.name.toLowerCase();
    const isDocx =
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx");
    const isLegacyDoc = file.type === "application/msword" || fileName.endsWith(".doc");

    if (isLegacyDoc && !isDocx) {
      alert("Định dạng .doc hiện chưa hỗ trợ trực tiếp. Bạn hãy lưu sang .docx hoặc .pdf rồi gửi lại.");
      return;
    }

    if (isDocx) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const extractedText = result.value?.trim();

        if (!extractedText) {
          alert("Không đọc được nội dung file Word. Bạn thử file khác hoặc chuyển sang PDF.");
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
        alert("Có lỗi khi đọc file Word. Bạn thử lại hoặc chuyển sang PDF.");
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = function (ev) {
      const base64 = ev.target?.result?.split(",")[1];
      setFileData({
        base64: base64,
        mimeType: file.type,
        name: file.name,
        isImage: file.type.startsWith("image/"),
      });
    };
    reader.readAsDataURL(file);
  }

  function removeFile() {
    setFileData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
            <div style={{ background: "rgba(255,255,255,0.2)", padding: "5px 10px", borderRadius: "5px", display: "inline-block", marginBottom: "5px" }}>
              📄 Đã gửi tài liệu: {fileData.name}
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
      let userQuestion = text || "Hãy tóm tắt tài liệu và nêu các ý chính.";
      if (fileDataToSend?.isWordText) {
        userQuestion += `\n\nNội dung tài liệu Word người dùng gửi:\n${fileDataToSend.extractedText.slice(0, MAX_WORD_EXTRACT_CHARS)}`;
      } else if (fileDataToSend) {
        userQuestion += `\n\nNgười dùng có đính kèm file: ${fileDataToSend.name}. Hãy phản hồi lịch sự và hỏi thêm nếu cần làm rõ nội dung file.`;
      }

      let aiText = await fetchAIResponse(userQuestion);

      if (typeof aiText === "string" && aiText.includes("OUT_OF_KB")) {
        aiText = REJECTIONS[Math.floor(Math.random() * REJECTIONS.length)];
      }

      let formattedText = aiText || "Không có phản hồi";
      if (formattedText !== "Không có phản hồi") {
        // 1. Dịch dấu ### và ## thành tiêu đề in đậm, cỡ chữ to hơn, có màu
        formattedText = formattedText.replace(/### (.*)/g, "<br><b style='font-size: 16px; color: #e65100;'>$1</b>");
        formattedText = formattedText.replace(/## (.*)/g, "<br><b style='font-size: 18px; color: #e65100;'>$1</b>");

        // 2. Dịch dấu * hoặc - ở đầu dòng thành dấu chấm tròn (bullet point)
        formattedText = formattedText.replace(/(?:^|\n)[*-] (.*)/g, "<br>• $1");

        // 3. Dịch dấu ** thành in đậm bình thường
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

        // 4. Đổi toàn bộ dấu xuống dòng còn lại thành thẻ <br>
        formattedText = formattedText.replace(/\n/g, "<br>");

        // 5. Dọn dẹp mấy thẻ <br> dư thừa ở đầu câu
        formattedText = formattedText.replace(/^(<br>)+/, "");
      }
      const botReply = formattedText;

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: botReply,
          time: getCurrentTime(),
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: "Mình chưa xử lí được yêu cầu này. Bạn thử lại hoặc kiểm tra kết nối mạng nhé.",
          time: getCurrentTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleEnter(e) {
    if (e.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
  }

  return (
    <>
      <div className="chatbot-toggler-wrapper" onClick={() => document.body.classList.toggle("show-chatbot")}>
        <button className="chatbot-toggler">
          <img src="/images/chat_bot.svg" alt="Thành phố kể em nghe" />
        </button>
      </div>

      <div className="chatbot-window">
        <div className="chat-header">
          <div className="bot-avatar">
            <img src="/images/chat_bot.svg" alt="Thành phố kể em nghe" />
          </div>
          <div>
            <h3>Thành phố kể em nghe</h3>
            <p className="chat-status">
              <span className="status-dot"></span>
              <span className="status-text">Sẵn sàng hỗ trợ</span>
            </p>
          </div>
          <div className="close-chat" onClick={() => document.body.classList.remove("show-chatbot")}>
            <i className="fas fa-times"></i>
          </div>
        </div>

        <div className="chat-box" ref={chatBoxRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.type}-wrapper`}>
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
          <div style={{ padding: "10px 15px", background: "#f1f5f9", borderTop: "1px solid #e2e8f0", fontSize: "13px", color: "#555" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff", padding: "5px 10px", borderRadius: "8px", border: "1px solid #ddd", width: "fit-content" }}>
              <span>{fileData.isImage ? "🖼️" : "📄"}</span>
              <span style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {fileData.name}
              </span>
              <button
                onClick={removeFile}
                style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: "16px", marginLeft: "5px" }}
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
          <button className="attach-btn" onClick={() => fileInputRef.current?.click()}>
            <i className="fas fa-paperclip"></i>
          </button>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleEnter}
            placeholder="Nhập câu hỏi..."
            disabled={isLoading}
          />
          <button onClick={handleSendMessage} disabled={isLoading}>
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </>
  );
} 