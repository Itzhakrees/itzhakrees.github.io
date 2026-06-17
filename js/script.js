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

  const visibleProjects = [...(window.portfolioContent.projects || [])]
    .filter((project) => project.featured !== false)
    .sort((a, b) => {
      const orderDifference = (a.order || 999) - (b.order || 999);
      if (orderDifference) return orderDifference;
      return String(b.date || "").localeCompare(String(a.date || ""));
    });

  projectGrid.replaceChildren(
    ...visibleProjects.map((project) => {
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
  document.title = dictionary.pageTitle;

  languageToggle.textContent = dictionary.languageToggle;
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
