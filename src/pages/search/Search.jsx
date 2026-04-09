import "./Search.css";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SEARCH_ITEMS = [
  {
    id: "tu-nhien",
    to: "/tu-nhien",
    image: "/images/dia_ly_2.svg",
    group: "geography",
    groupLabelKey: "header.geography",
    titleKey: "header.sub_geo_nature",
    descriptionKey: "search_page.items.tu_nhien_desc",
    keywords: ["dia ly", "địa lý", "địa lí", "tu nhien", "tự nhiên", "geography", "nature"],
    aliases: ["địa lý", "địa lí", "dia ly", "tự nhiên", "tu nhien", "geography", "nature"],
  },
  {
    id: "dan-cu",
    to: "/dan-cu",
    image: "/images/dia_ly_4.jpg",
    group: "geography",
    groupLabelKey: "header.geography",
    titleKey: "header.sub_geo_population",
    descriptionKey: "search_page.items.dan_cu_desc",
    keywords: ["dia ly", "địa lý", "địa lí", "dan cu", "dân cư", "geography", "population"],
    aliases: ["địa lý", "địa lí", "dia ly", "dân cư", "dan cu", "geography", "population"],
  },
  {
    id: "vi-tri",
    to: "/vi-tri",
    image: "/images/dia_ly_1.jfif",
    group: "geography",
    groupLabelKey: "header.geography",
    titleKey: "header.sub_geo_location",
    descriptionKey: "search_page.items.vi_tri_desc",
    keywords: ["dia ly", "địa lý", "địa lí", "vi tri", "vị trí", "geography", "location"],
    aliases: ["địa lý", "địa lí", "dia ly", "vị trí", "vi tri", "geography", "location"],
  },
  {
    id: "kinh-te",
    to: "/kinh-te",
    image: "/images/dia_ly_3.jpg",
    group: "geography",
    groupLabelKey: "header.geography",
    titleKey: "header.sub_geo_economy",
    descriptionKey: "search_page.items.kinh_te_desc",
    keywords: ["dia ly", "địa lý", "địa lí", "kinh te", "kinh tế", "geography", "economy"],
    aliases: ["địa lý", "địa lí", "dia ly", "kinh tế", "kinh te", "geography", "economy"],
  },
  {
    id: "di-tich",
    to: "/di-tich",
    image: "/images/lich_su_2.jpg",
    group: "history",
    groupLabelKey: "header.history",
    titleKey: "header.sub_his_relics",
    descriptionKey: "search_page.items.di_tich_desc",
    keywords: ["lich su", "lịch sử", "di tich", "di tích", "history", "relics"],
    aliases: ["lịch sử", "lich su", "di tích", "di tich", "history", "relics"],
  },
  {
    id: "nhan-vat",
    to: "/nhan-vat",
    image: "/images/lich_su_3.jpg",
    group: "history",
    groupLabelKey: "header.history",
    titleKey: "header.sub_his_figures",
    descriptionKey: "search_page.items.nhan_vat_desc",
    keywords: ["lich su", "lịch sử", "nhan vat", "nhân vật", "history", "figures"],
    aliases: ["lịch sử", "lich su", "nhân vật", "nhan vat", "history", "figures"],
  },
  {
    id: "am-thuc",
    to: "/am-thuc",
    image: "/images/vanhoa_xahoi_1.jpg",
    group: "culture",
    groupLabelKey: "header.culture",
    titleKey: "header.sub_cul_food",
    descriptionKey: "search_page.items.am_thuc_desc",
    keywords: ["van hoa", "văn hóa", "am thuc", "ẩm thực", "culture", "food"],
    aliases: ["văn hóa", "van hoa", "ẩm thực", "am thuc", "culture", "food"],
  },
  {
    id: "lang-nghe",
    to: "/lang-nghe",
    image: "/images/vanhoa_xahoi_4.svg",
    group: "culture",
    groupLabelKey: "header.culture",
    titleKey: "header.sub_cul_crafts",
    descriptionKey: "search_page.items.lang_nghe_desc",
    keywords: ["van hoa", "văn hóa", "lang nghe", "làng nghề", "culture", "craft"],
    aliases: ["văn hóa", "van hoa", "làng nghề", "lang nghe", "culture", "craft"],
  },
  {
    id: "le-hoi",
    to: "/le-hoi",
    image: "/images/vanhoa_xahoi_3.svg",
    group: "culture",
    groupLabelKey: "header.culture",
    titleKey: "header.sub_cul_festivals",
    descriptionKey: "search_page.items.le_hoi_desc",
    keywords: ["van hoa", "văn hóa", "le hoi", "lễ hội", "culture", "festival"],
    aliases: ["văn hóa", "van hoa", "lễ hội", "le hoi", "culture", "festival"],
  },
  {
    id: "tai-lieu",
    to: "/tai-lieu",
    image: "/images/tailieu_hoctap_1.jpg",
    group: "learning",
    groupLabelKey: "header.learning",
    titleKey: "header.sub_learn_documents",
    descriptionKey: "search_page.items.tai_lieu_desc",
    keywords: ["hoc tap", "học tập", "tai lieu", "tài liệu", "learning", "documents"],
    aliases: ["học tập", "hoc tap", "tài liệu", "tai lieu", "learning", "documents"],
  },
  {
    id: "bai-tap",
    to: "/bai-tap",
    image: "/images/tailieu_hoctap_2.jpg",
    group: "learning",
    groupLabelKey: "header.learning",
    titleKey: "header.sub_learn_games",
    descriptionKey: "search_page.items.bai_tap_desc",
    keywords: [
      "hoc tap",
      "học tập",
      "tro choi",
      "trò chơi",
      "on tap",
      "ôn tập",
      "bai tap",
      "bài tập",
      "learning",
      "games",
      "quiz",
    ],
    aliases: [
      "trò chơi ôn tập",
      "tro choi on tap",
      "trò chơi",
      "tro choi",
      "bài tập",
      "bai tap",
      "quiz",
    ],
  },
];

function normalizeText(value = "") {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function Search() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(queryFromUrl);

  useEffect(() => {
    document.body.classList.add("page-search-active");
    return () => {
      document.body.classList.remove("page-search-active");
    };
  }, []);

  useEffect(() => {
    setInputValue(queryFromUrl);
  }, [queryFromUrl]);

  const normalizedQuery = useMemo(() => normalizeText(queryFromUrl), [queryFromUrl]);

  const mappedItems = useMemo(() => {
    return SEARCH_ITEMS.map((item) => {
      const title = t(item.titleKey);
      const description = t(item.descriptionKey);
      const groupLabel = t(item.groupLabelKey);
      const normalizedBlob = normalizeText([title, description, groupLabel, ...item.keywords].join(" "));

      return {
        ...item,
        title,
        description,
        groupLabel,
        normalizedBlob,
      };
    });
  }, [t]);

  const filteredResults = useMemo(() => {
    if (!normalizedQuery) {
      return mappedItems;
    }

    const tokens = normalizedQuery.split(" ").filter(Boolean);

    return mappedItems
      .map((item) => {
        let score = 0;

        if (item.normalizedBlob.includes(normalizedQuery)) {
          score += 10;
        }

        tokens.forEach((token) => {
          if (item.normalizedBlob.includes(token)) {
            score += 2;
          }
        });

        if (item.aliases.some((alias) => normalizeText(alias) === normalizedQuery)) {
          score += 8;
        }

        return {
          ...item,
          score,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  }, [mappedItems, normalizedQuery]);

  const isEmpty = Boolean(normalizedQuery) && filteredResults.length === 0;
  const visibleResults = normalizedQuery ? filteredResults : mappedItems;

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextValue = inputValue.trim();
    const nextParams = new URLSearchParams(searchParams);

    if (nextValue) {
      nextParams.set("q", nextValue);
    } else {
      nextParams.delete("q");
    }

    setSearchParams(nextParams);
  };

  const clearSearch = () => {
    setInputValue("");
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("q");
    setSearchParams(nextParams);
  };

  return (
    <div className="search-page">
      <div className="container search-shell">
        <nav className="search-breadcrumb" aria-label={t("search_page.breadcrumb")}>
          <Link to="/">{t("header.home")}</Link>
          <span>/</span>
          <span>{t("search_page.breadcrumb")}</span>
        </nav>

        <div className="search-header-block">
          <h1>{queryFromUrl ? t("search_page.query_heading", { query: queryFromUrl }) : t("search_page.all_content_heading")}</h1>
          <p>{t("search_page.page_desc")}</p>
        </div>

        <div className="search-toolbar">
          <form className="search-query-form" onSubmit={handleSubmit}>
            <button type="submit" aria-label={t("search_page.submit_aria")}>
              <i className="fas fa-search"></i>
            </button>
            <input
              type="text"
              placeholder={t("search_page.form_placeholder")}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </form>

          <button type="button" className="search-clear-btn" onClick={clearSearch}>
            {t("search_page.clear_button")}
          </button>
        </div>

        <p className="search-result-count">
          {queryFromUrl
            ? t("search_page.result_count", { count: visibleResults.length })
            : t("search_page.result_count_all", { count: visibleResults.length })}
        </p>

        <section className="search-result-section">
          <h2>{t("search_page.results_title")}</h2>

          {isEmpty ? (
            <div className="search-empty">
              <h3>{t("search_page.empty_title")}</h3>
              <p>{t("search_page.empty_desc")}</p>
            </div>
          ) : (
            <div className="search-result-grid">
              {visibleResults.map((item) => (
                <Link key={item.id} to={item.to} className="search-result-card">
                  <div className="search-result-thumb">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="search-result-body">
                    <span className="search-result-tag">{item.groupLabel}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <span className="search-result-link">{t("search_page.view_detail")}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
