const languageToggle = document.querySelector("[data-language-toggle]");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const translatableNodes = document.querySelectorAll("[data-i18n]");
const ariaTranslatableNodes = document.querySelectorAll("[data-i18n-aria-label]");
const projectGrid = document.querySelector("[data-projects]");
const projectFilters = document.querySelector("[data-project-filters]");
const projectEmpty = document.querySelector("[data-project-empty]");
const researchMount = document.querySelector("[data-research]");

const PROJECT_FILTERS = ["ALL", "Game", "White Box", "Document", "Other"];

let currentLanguage = localStorage.getItem("portfolioLanguage") || "zh";
let currentProjectFilter = "ALL";

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

function getItemFilters(item, fallback) {
  return Array.isArray(item.filters) && item.filters.length ? item.filters : fallback;
}

function renderProjectFilters(language) {
  if (!projectFilters || !window.portfolioContent) return;

  const dictionary = window.portfolioContent.ui[language] || window.portfolioContent.ui.en;
  projectFilters.setAttribute("aria-label", dictionary.projectFiltersLabel);
  projectFilters.replaceChildren(
    ...PROJECT_FILTERS.map((filter) => {
      const button = createTextElement("button", "project-filter", filter);
      const isActive = filter === currentProjectFilter;
      button.type = "button";
      button.dataset.projectFilter = filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      return button;
    }),
  );
}

function createProjectCard(project, language) {
  const content = getLocalizedContent(project, language);
  const card = document.createElement("a");
  const itemFilters = getItemFilters(project, ["Game"]);
  card.className = ["project-card", project.visualClass].filter(Boolean).join(" ");
  card.href = project.href;
  card.dataset.projectFilters = itemFilters.join(",");
  card.setAttribute("aria-label", content.ariaLabel);

  const visual = document.createElement("span");
  visual.className = ["project-visual", project.coverClass].filter(Boolean).join(" ");
  visual.setAttribute("aria-hidden", "true");
  if (project.cover) {
    visual.style.backgroundImage = `url("${project.cover}")`;
  }

  const projectYear = String(project.date || "").slice(0, 4);
  if (projectYear) {
    visual.append(createTextElement("span", "project-year", projectYear));
  }

  const cardContent = document.createElement("span");
  cardContent.className = "project-content";

  const cardHeader = document.createElement("span");
  cardHeader.className = "project-card-header";
  cardHeader.append(createTextElement("span", "project-title", content.title));

  const cardMeta = document.createElement("span");
  cardMeta.className = "project-meta";
  cardMeta.append(createTextElement("span", "project-role", content.role));

  if (project.tools?.length) {
    const toolList = document.createElement("span");
    toolList.className = "project-tools";
    toolList.append(...project.tools.map((tool) => createTextElement("span", "project-tool", tool)));
    cardMeta.append(toolList);
  }

  const cardSummary = createTextElement("span", "project-summary", content.summary);
  cardContent.append(cardHeader, cardMeta, cardSummary);

  if (project.tags?.length) {
    const tagList = document.createElement("span");
    tagList.className = "project-tags";
    tagList.append(...project.tags.map((tag) => createTextElement("span", "project-tag", tag)));
    cardContent.append(tagList);
  }

  card.append(visual, cardContent);
  return card;
}

function createDocumentCard(documentItem, language) {
  const content = getLocalizedContent(documentItem, language);
  const itemFilters = getItemFilters(documentItem, ["Document"]);
  const card = document.createElement("a");
  card.className = "project-card document-card";
  card.href = documentItem.href;
  card.dataset.projectFilters = itemFilters.join(",");
  card.setAttribute("aria-label", `${content.title}: ${content.summary}`);

  const visual = document.createElement("span");
  visual.className = "project-visual document-cover";
  visual.setAttribute("aria-hidden", "true");
  visual.append(createTextElement("span", "document-cover-label", content.type));

  const cardContent = document.createElement("span");
  cardContent.className = "project-content";

  const cardHeader = document.createElement("span");
  cardHeader.className = "project-card-header";
  cardHeader.append(createTextElement("span", "project-title", content.title));

  const cardMeta = document.createElement("span");
  cardMeta.className = "project-meta";
  cardMeta.append(createTextElement("span", "project-role", content.type));

  const tagList = document.createElement("span");
  tagList.className = "project-tags";
  tagList.append(
    ...itemFilters.map((filter) => createTextElement("span", "project-tag", filter)),
    createTextElement("span", "project-link", content.linkLabel),
  );

  cardContent.append(
    cardHeader,
    cardMeta,
    createTextElement("span", "project-summary", content.summary),
    tagList,
  );
  card.append(visual, cardContent);
  return card;
}

function renderProjects(language) {
  if (!projectGrid || !window.portfolioContent) return;

  const visibleProjects = (window.portfolioContent.projects || [])
    .filter((project) => project.featured !== false);

  const allItems = [
    ...visibleProjects.map((project) => ({ item: project, type: "project", filters: getItemFilters(project, ["Game"]) })),
    ...(window.portfolioContent.designDocs || []).map((documentItem) => ({
      item: documentItem,
      type: "document",
      filters: getItemFilters(documentItem, ["Document"]),
    })),
  ];
  const filteredItems = currentProjectFilter === "ALL"
    ? allItems
    : allItems.filter(({ filters }) => filters.includes(currentProjectFilter));
  const cards = filteredItems.map(({ item, type }) => (
    type === "document" ? createDocumentCard(item, language) : createProjectCard(item, language)
  ));

  projectGrid.replaceChildren(...cards);

  if (projectEmpty) {
    const dictionary = window.portfolioContent.ui[language] || window.portfolioContent.ui.en;
    projectEmpty.textContent = dictionary.projectFilterEmpty;
    projectEmpty.hidden = cards.length > 0;
  }
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

function renderPortfolioContent(language) {
  renderProjectFilters(language);
  renderProjects(language);
  renderResearch(language);
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

projectFilters?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-project-filter]");
  if (!button || !projectFilters.contains(button)) return;

  const selectedFilter = button.dataset.projectFilter;
  if (!PROJECT_FILTERS.includes(selectedFilter)) return;

  currentProjectFilter = selectedFilter;
  projectFilters.querySelectorAll("[data-project-filter]").forEach((filterButton) => {
    const isActive = filterButton.dataset.projectFilter === currentProjectFilter;
    filterButton.classList.toggle("is-active", isActive);
    filterButton.setAttribute("aria-pressed", String(isActive));
  });
  renderProjects(currentLanguage);
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
