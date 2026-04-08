import React from "react";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: "",
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "Unknown runtime error",
    };
  }

  componentDidCatch(error, info) {
    // Keep detailed trace in console for debugging.
    console.error("App runtime crash:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "#f8fafc",
            color: "#0f172a",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          <div
            style={{
              width: "min(680px, 100%)",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 10px 30px rgba(2, 6, 23, 0.08)",
            }}
          >
            <h1 style={{ margin: "0 0 8px", fontSize: "1.25rem" }}>
              Ứng dụng vừa gặp lỗi runtime
            </h1>
            <p style={{ margin: "0 0 12px", lineHeight: 1.5 }}>
              Đã chặn crash để tránh màn hình trắng. Bạn có thể bấm tải lại hoặc gửi nội dung lỗi bên dưới để mình sửa dứt điểm.
            </p>
            <pre
              style={{
                margin: "0 0 16px",
                background: "#0b1220",
                color: "#e2e8f0",
                padding: "12px",
                borderRadius: "8px",
                overflowX: "auto",
                fontSize: "0.85rem",
              }}
            >
{this.state.errorMessage}
            </pre>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                border: "none",
                borderRadius: "8px",
                background: "#0ea5e9",
                color: "#fff",
                padding: "10px 14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
