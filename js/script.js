const translations = {
  en: {
    skipLink: "Skip to main content",
    navOpen: "Open navigation",
    navProjects: "Project",
    navResearch: "Research",
    navDesignDocs: "Design Docs",
    introEyebrow: "Game design portfolio",
    introRole: "Game Systems & Level Designer",
    introCopy:
      "I design readable systems, expressive mechanics, and levels that make player choices feel intentional from the first minute.",
    introAsideLabel: "Contact and focus",
    introFocusLabel: "Focus",
    introFocus: "Systems, gameplay, level flow, and iteration",
    introEmail: "Email",
    introLinkedin: "LinkedIn",
    introResume: "Resume",
    projectsEyebrow: "Selected work",
    projectsTitle: "Project",
    projectsIntro:
      "Compact case-study placeholders for design leads: what the project is, what I owned, and where the full breakdown will live.",
    researchEyebrow: "Research",
    researchTitle: "Thesis research",
    researchIntro:
      "Research is presented as design evidence: how I frame questions, evaluate player experience, and translate findings into practical design choices.",
    docsEyebrow: "Documentation",
    docsTitle: "Design Docs",
    docsIntro:
      "Placeholder documents for the way I communicate systems, levels, balance, and production-ready design intent.",
    footerCopyright: "© 2026 Itzhak Rees. Game design portfolio.",
    footerCredit: "Static portfolio adapted from an MIT-licensed HTML portfolio template structure.",
  },
  zh: {
    skipLink: "跳到主要内容",
    navOpen: "打开导航",
    navProjects: "项目",
    navResearch: "研究",
    navDesignDocs: "设计文档",
    introEyebrow: "游戏设计作品集",
    introRole: "游戏系统与关卡设计师",
    introCopy:
      "我关注清晰可读的系统、有表达力的机制，以及能让玩家选择从第一分钟起就显得有意图的关卡体验。",
    introAsideLabel: "联系方式与方向",
    introFocusLabel: "方向",
    introFocus: "系统、玩法、关卡流线与迭代",
    introEmail: "邮箱",
    introLinkedin: "LinkedIn",
    introResume: "简历",
    projectsEyebrow: "精选作品",
    projectsTitle: "项目",
    projectsIntro:
      "为设计负责人准备的紧凑案例占位：项目是什么、我负责什么，以及后续完整拆解的位置。",
    researchEyebrow: "研究",
    researchTitle: "论文研究",
    researchIntro:
      "研究部分作为设计证据呈现：如何提出问题、评估玩家体验，并把发现转化为可执行的设计选择。",
    docsEyebrow: "文档",
    docsTitle: "设计文档",
    docsIntro: "展示我如何沟通系统、关卡、平衡和可落地设计意图的文档占位。",
    footerCopyright: "© 2026 Itzhak Rees。游戏设计作品集。",
    footerCredit: "静态作品集结构改编自 MIT 许可的 HTML portfolio 模板。",
  },
};

const languageToggle = document.querySelector("[data-language-toggle]");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const translatableNodes = document.querySelectorAll("[data-i18n]");
const ariaTranslatableNodes = document.querySelectorAll("[data-i18n-aria-label]");
const projectGrid = document.querySelector("[data-projects]");
const researchMount = document.querySelector("[data-research]");
const docsGrid = document.querySelector("[data-design-docs]");

let currentLanguage = localStorage.getItem("portfolioLanguage") || "en";

function getLocalizedContent(item, language) {
  return item[language] || item.en;
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  element.textContent = text;
  return element;
}

function renderProjects(language) {
  if (!projectGrid || !window.portfolioContent) return;

  projectGrid.replaceChildren(
    ...window.portfolioContent.projects.map((project) => {
      const content = getLocalizedContent(project, language);
      const card = document.createElement("a");
      card.className = ["project-card", project.visualClass].filter(Boolean).join(" ");
      card.href = project.href;
      card.setAttribute("aria-label", content.ariaLabel);

      const visual = document.createElement("span");
      visual.className = ["project-visual", project.coverClass].filter(Boolean).join(" ");
      visual.setAttribute("aria-hidden", "true");
      if (project.cover) {
        visual.style.backgroundImage = `url("${project.cover}")`;
      }

      const cardContent = document.createElement("span");
      cardContent.className = "project-content";

      const cardHeader = document.createElement("span");
      cardHeader.className = "project-card-header";
      cardHeader.append(
        createTextElement("span", "project-role", content.role),
        createTextElement("span", "project-title", content.title),
      );

      const cardReveal = document.createElement("span");
      cardReveal.className = "project-card-reveal";
      cardReveal.append(createTextElement("span", "project-summary", content.summary));

      cardContent.append(cardHeader, cardReveal);

      card.append(visual, cardContent);
      return card;
    }),
  );
}

function renderResearch(language) {
  if (!researchMount || !window.portfolioContent) return;

  const research = window.portfolioContent.research;
  const content = getLocalizedContent(research, language);
  const article = document.createElement("article");
  article.className = "research-card";

  const main = document.createElement("div");
  main.className = "research-main";
  main.append(
    createTextElement("p", "research-label", content.label),
    createTextElement("h3", "", content.title),
    createTextElement("p", "", content.summary),
  );

  const details = document.createElement("div");
  details.className = "research-details";

  const question = document.createElement("div");
  question.append(createTextElement("h4", "", content.questionLabel), createTextElement("p", "", content.question));

  const methods = document.createElement("div");
  methods.append(createTextElement("h4", "", content.methodsLabel), createTextElement("p", "", content.methods));

  const link = document.createElement("a");
  link.className = "text-link";
  link.href = research.href;
  link.textContent = content.linkLabel;

  details.append(question, methods, link);
  article.append(main, details);
  researchMount.replaceChildren(article);
}

function renderDesignDocs(language) {
  if (!docsGrid || !window.portfolioContent) return;

  docsGrid.replaceChildren(
    ...window.portfolioContent.designDocs.map((doc) => {
      const content = getLocalizedContent(doc, language);
      const card = document.createElement("a");
      card.className = "doc-card";
      card.href = doc.href;
      card.append(
        createTextElement("span", "doc-type", content.type),
        createTextElement("span", "doc-title", content.title),
        createTextElement("span", "doc-summary", content.summary),
        createTextElement("span", "project-link", content.linkLabel),
      );
      return card;
    }),
  );
}

function renderPortfolioContent(language) {
  renderProjects(language);
  renderResearch(language);
  renderDesignDocs(language);
}

function applyLanguage(language) {
  const dictionary = translations[language] || translations.en;

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
  document.title =
    language === "zh"
      ? "Itzhak Rees | 游戏系统与关卡设计师"
      : "Itzhak Rees | Game Systems & Level Designer";

  languageToggle.textContent = language === "zh" ? "EN" : "中文";
  languageToggle.setAttribute("aria-pressed", String(language === "zh"));
  localStorage.setItem("portfolioLanguage", language);
  currentLanguage = language;
  renderPortfolioContent(language);
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
