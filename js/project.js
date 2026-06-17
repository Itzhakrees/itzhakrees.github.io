const pageRoot = "../../";
const languageToggle = document.querySelector("[data-language-toggle]");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const translatableNodes = document.querySelectorAll("[data-i18n]");
const ariaTranslatableNodes = document.querySelectorAll("[data-i18n-aria-label]");
const projectPage = document.querySelector("[data-project-page]");
const projectRole = document.querySelector("[data-project-role]");
const projectTitle = document.querySelector("[data-project-title]");
const projectSummary = document.querySelector("[data-project-summary]");
const projectArticle = document.querySelector("[data-project-article]");

let currentLanguage = localStorage.getItem("portfolioLanguage") || "en";
let currentRequest = 0;

function getLocalizedContent(item, language) {
  return item[language] || item.en;
}

function getCurrentProjectId() {
  if (document.body.dataset.projectId) {
    return document.body.dataset.projectId;
  }

  const pathParts = window.location.pathname.split("/").filter(Boolean);
  return pathParts[pathParts.length - 1] || "";
}

function getCurrentProject() {
  if (!window.portfolioContent || !window.portfolioContent.projects) {
    return null;
  }

  const projectId = getCurrentProjectId();
  return window.portfolioContent.projects.find((project) => project.id === projectId);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function extractVideoShortcodes(markdown) {
  const videos = [];
  const source = markdown.replace(
    /\{\{\s*video\s+(youtube|bilibili):([A-Za-z0-9_-]+)(?:\s+title="([^"]*)")?\s*\}\}/g,
    (_, provider, id, title = "") => {
      const index = videos.push({ provider, id, title }) - 1;
      return `\n\n[[VIDEO_EMBED_${index}]]\n\n`;
    },
  );

  return { source, videos };
}

function isSafeMarkdownUrl(url) {
  return /^(https?:\/\/|mailto:|#|\/|\.\/|\.\.\/|[A-Za-z0-9._/-])/.test(url) && !/^\s*javascript:/i.test(url);
}

function renderInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, url) => {
      if (!isSafeMarkdownUrl(url)) return alt;
      return `<img src="${url}" alt="${alt}" loading="lazy">`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
      if (!isSafeMarkdownUrl(url)) return label;
      return `<a href="${url}">${label}</a>`;
    });
}

function renderBasicMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let listItems = [];

  function flushList() {
    if (!listItems.length) return;
    html.push(`<ul>${listItems.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`);
    listItems = [];
  }

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
      return;
    }

    flushList();

    if (trimmed.startsWith("### ")) {
      html.push(`<h3>${renderInlineMarkdown(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith("## ")) {
      html.push(`<h2>${renderInlineMarkdown(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith("# ")) {
      html.push(`<h1>${renderInlineMarkdown(trimmed.slice(2))}</h1>`);
    } else {
      html.push(`<p>${renderInlineMarkdown(trimmed)}</p>`);
    }
  });

  flushList();
  return html.join("");
}

function injectVideoPlaceholders(html, videos) {
  return html.replace(/<p>\s*\[\[VIDEO_EMBED_(\d+)]]\s*<\/p>|\[\[VIDEO_EMBED_(\d+)]]/g, (_, paragraphIndex, inlineIndex) => {
    const index = Number(paragraphIndex || inlineIndex);
    const video = videos[index];
    if (!video) return "";

    return [
      '<div class="video-embed" data-video-embed',
      ` data-provider="${escapeHtml(video.provider)}"`,
      ` data-video-id="${escapeHtml(video.id)}"`,
      ` data-title="${escapeHtml(video.title)}"`,
      "></div>",
    ].join("");
  });
}

function renderMarkdown(markdown) {
  const { source, videos } = extractVideoShortcodes(markdown);
  const canUseMarkdownLibrary = window.marked && window.DOMPurify;
  const unsafeHtml = canUseMarkdownLibrary ? window.marked.parse(source) : renderBasicMarkdown(source);
  const safeHtml = canUseMarkdownLibrary ? window.DOMPurify.sanitize(unsafeHtml) : unsafeHtml;
  return injectVideoPlaceholders(safeHtml, videos);
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\s*[\r\n][\s\S]*?[\r\n]---\s*/, "");
}

function hasUrlScheme(value) {
  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function isAnchor(value) {
  return value.startsWith("#");
}

function isRootRelative(value) {
  return value.startsWith("/");
}

function resolveProjectAssetUrl(project, value) {
  if (!value || hasUrlScheme(value) || isAnchor(value) || isRootRelative(value)) {
    return value;
  }

  const assetBase = project.assetBase || `content/projects/${project.id}/`;
  const cleanValue = value.replace(/^\.?\//, "");
  return `${pageRoot}${assetBase}${cleanValue}`;
}

function rewriteMarkdownAssetUrls(container, project) {
  container.querySelectorAll("img[src], video[src], source[src], a[href]").forEach((element) => {
    const attr = element.hasAttribute("src") ? "src" : "href";
    const value = element.getAttribute(attr);

    if (!value) return;

    element.setAttribute(attr, resolveProjectAssetUrl(project, value));
  });
}

function getVideoEmbedUrl(provider, id) {
  if (provider === "youtube") {
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;
  }

  if (provider === "bilibili") {
    return `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(id)}&page=1&high_quality=1&autoplay=0`;
  }

  return "";
}

function hydrateVideoEmbeds(container) {
  container.querySelectorAll("[data-video-embed]").forEach((mount) => {
    const provider = mount.dataset.provider;
    const id = mount.dataset.videoId;
    const title = mount.dataset.title || `${provider} video`;
    const src = getVideoEmbedUrl(provider, id);
    if (!src) return;

    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = title;
    iframe.loading = "lazy";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allow = "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    mount.replaceChildren(iframe);
  });
}

async function loadProjectArticle(project, language) {
  const dictionary = window.portfolioContent.ui[language] || window.portfolioContent.ui.en;
  const requestId = ++currentRequest;
  const markdownUrl = `${pageRoot}${project.markdownBase}.${language}.md`;

  projectArticle.classList.add("is-loading");
  projectArticle.textContent = dictionary.projectLoading;

  try {
    const response = await fetch(markdownUrl);
    if (!response.ok) {
      throw new Error(`Unable to load ${markdownUrl}`);
    }

    const markdown = stripFrontmatter(await response.text());
    if (requestId !== currentRequest) return;

    projectArticle.innerHTML = renderMarkdown(markdown);
    rewriteMarkdownAssetUrls(projectArticle, project);
    hydrateVideoEmbeds(projectArticle);
  } catch (error) {
    if (requestId !== currentRequest) return;
    projectArticle.textContent = dictionary.projectLoadError;
  } finally {
    if (requestId === currentRequest) {
      projectArticle.classList.remove("is-loading");
    }
  }
}

function renderProject(language) {
  const project = getCurrentProject();
  const dictionary = window.portfolioContent.ui[language] || window.portfolioContent.ui.en;

  if (!project) {
    projectPage.classList.add("is-missing");
    projectTitle.textContent = dictionary.projectNotFound;
    projectSummary.textContent = "";
    projectArticle.textContent = dictionary.projectNotFound;
    document.title = `${dictionary.projectNotFound} | Itzhak Rees`;
    return;
  }

  const content = getLocalizedContent(project, language);
  projectPage.classList.remove("is-missing");
  projectRole.textContent = content.role;
  projectTitle.textContent = content.title;
  projectSummary.textContent = content.summary;
  document.title = `${content.title} | Itzhak Rees`;
  loadProjectArticle(project, language);
}

function applyLanguage(language) {
  const dictionary = window.portfolioContent.ui[language] || window.portfolioContent.ui.en;

  translatableNodes.forEach((node) => {
    const key = node.dataset.i18n;
    if (dictionary[key]) {
      node.textContent = dictionary[key];
    }
  });

  ariaTranslatableNodes.forEach((node) => {
    const key = node.dataset.i18nAriaLabel;
    if (dictionary[key]) {
      node.setAttribute("aria-label", dictionary[key]);
    }
  });

  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  languageToggle.textContent = dictionary.languageToggle;
  languageToggle.setAttribute("aria-pressed", String(language === "zh"));
  localStorage.setItem("portfolioLanguage", language);
  currentLanguage = language;
  renderProject(language);
}

languageToggle.addEventListener("click", () => {
  applyLanguage(currentLanguage === "en" ? "zh" : "en");
});

navToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navMenu.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

applyLanguage(currentLanguage);
