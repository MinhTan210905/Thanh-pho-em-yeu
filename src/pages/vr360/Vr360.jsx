import { useEffect, useRef, useState } from "react";
import './Vr360.css';

const scenes = {
  myScene: {
    type: "equirectangular",
    panorama: "/images/360_1.jpg",
    title: "Bưu Điện Trung Tâm Sài Gòn",
    hfov: 110,
    pitch: 0,
    yaw: 0,
  },
};

export default function Vr360() {
  const panoramaRef = useRef(null);
  const viewerRef = useRef(null);
  const [activeScene, setActiveScene] = useState("myScene");

  useEffect(() => {
    document.body.classList.add("vr360-body");
    return () => document.body.classList.remove("vr360-body");
  }, []);

  useEffect(() => {
    if (!window.pannellum || !panoramaRef.current) return;

    viewerRef.current = window.pannellum.viewer(panoramaRef.current, {
      default: {
        firstScene: "myScene",
        autoLoad: true,
        autoRotate: -1.5,
        compass: false,
        showControls: false,
      },
      scenes,
    });

    return () => {
      try {
        viewerRef.current?.destroy?.();
      } catch {
        // no-op
      }
    };
  }, []);

  const changeScene = (sceneId) => {
    setActiveScene(sceneId);
    if (viewerRef.current?.loadScene) {
      viewerRef.current.loadScene(sceneId);
    }
  };

  return (
    <>
      <div id="panorama" ref={panoramaRef}></div>

      <div className="ui-container">
        <div className="top-bar ui-element">
          <h1 className="page-title">
            <i className="fas fa-globe-asia" style={{ color: "#00c6ff" }}></i>
            Sài Gòn Toàn Cảnh
          </h1>
          <button className="menu-toggle-btn" type="button">
            <i className="fas fa-bars"></i>
          </button>
        </div>

        <div className="sidebar ui-element">
          <button className="sidebar-btn active" title="Trang chủ" type="button">
            <i className="fas fa-home"></i>
          </button>
          <button className="sidebar-btn" title="Danh sách địa điểm" type="button">
            <i className="fas fa-list-ul"></i>
          </button>
          <button className="sidebar-btn" title="Bản đồ" type="button">
            <i className="far fa-map"></i>
          </button>
          <button className="sidebar-btn" title="Thông tin" type="button">
            <i className="fas fa-info"></i>
          </button>
        </div>
      </div>

      <div className="bottom-bar-container ui-element">
        <div className="bottom-bar">
          <div
            className={`thumb-card ${activeScene === "myScene" ? "active" : ""}`}
            onClick={() => changeScene("myScene")}
          >
            <img src="/images/360_1.jpg" alt="Ảnh của bạn" />
            <span className="thumb-title">Bưu Điện Trung Tâm</span>
          </div>
        </div>
      </div>
    </>
  );
}
