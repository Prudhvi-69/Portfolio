class TerminalResume {
  constructor() {
    this.output = document.getElementById("output");
    this.input = document.getElementById("command-input");
    this.terminal = document.querySelector(".terminal");
    this.terminalContainer = document.querySelector(".terminal-container");
    this.contextMenu = document.querySelector(".context-menu");
    this.terminals = [{ input: this.input, history: [], historyIndex: -1 }];
    this.activeTerminal = 0;
    this.activeTerminalContent = null;
    this.resizing = null;
    this.currentTheme = localStorage.getItem("theme") || "default";
    this.projects = [];
    this.skills = {};
    this.fileSystem = {};
    this.gameActive = false;
    this.gameHandler = null;
    this.themeModal = document.getElementById("theme-modal");
    this.projectsModal = document.getElementById("projects-modal");
    this.skillsModal = document.getElementById("skills-modal");
    this.themeToggle = document.getElementById("theme-toggle");

    this.setupEventListeners();
    this.loadProjects();
    this.loadSkills();
    this.setupFileSystem();
    this.init();
  }

  init() {
    this.handleThemeChange(this.currentTheme);
    document.querySelectorAll(".close-button").forEach((button) => {
      button.addEventListener("click", () => {
        this.closeModal(button.closest(".modal"));
      });
    });

    this.themeToggle.addEventListener("click", () => {
      this.showModal(this.themeModal);
    });

    const languageToggle = document.getElementById("language-toggle");
    if (languageToggle && languageToggle.parentElement) {
      languageToggle.parentElement.style.display = "none";
    }

    document.querySelectorAll(".theme-option").forEach((option) => {
      option.addEventListener("click", () => {
        this.handleThemeChange(option.dataset.theme);
      });
    });

    this.printWelcomeMessage();
    this.input.focus();
    this.setupContextMenu();
  }

  setupContextMenu() {
    this.terminalContainer.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const terminalContent = e.target.closest(".terminal-content");
      if (terminalContent) {
        this.activeTerminalContent = terminalContent;
        this.showContextMenu(e.clientX, e.clientY);
      }
    });

    document.addEventListener("click", () => {
      this.contextMenu.classList.remove("active");
    });

    this.contextMenu.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (action) {
        this.handleContextMenuAction(action);
      }
    });
  }

  showContextMenu(x, y) {
    this.contextMenu.style.left = `${x}px`;
    this.contextMenu.style.top = `${y}px`;
    this.contextMenu.classList.add("active");

    const closeOption = this.contextMenu.querySelector('[data-action="close-split"]');
    const isMainTerminal = this.activeTerminalContent === this.terminalContainer.firstElementChild;
    closeOption.style.display = isMainTerminal ? "none" : "block";
  }

  handleContextMenuAction(action) {
    if (!this.activeTerminalContent) return;

    switch (action) {
      case "split-h":
        this.splitTerminal("horizontal", this.activeTerminalContent);
        break;
      case "split-v":
        this.splitTerminal("vertical", this.activeTerminalContent);
        break;
      case "close-split":
        this.closeSplit(this.activeTerminalContent);
        break;
    }
    this.contextMenu.classList.remove("active");
  }

  setupEventListeners() {
    this.terminalContainer.addEventListener("click", (e) => {
      const terminalContent = e.target.closest(".terminal-content");
      if (terminalContent) {
        const input = terminalContent.querySelector("input");
        if (input) {
          input.focus();
          this.activeTerminal = this.terminals.findIndex((t) => t.input === input);
        }
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        const activeContent = this.terminals[this.activeTerminal].input.closest(".terminal-content");
        if (activeContent) this.splitTerminal("horizontal", activeContent);
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        const activeContent = this.terminals[this.activeTerminal].input.closest(".terminal-content");
        if (activeContent) this.splitTerminal("vertical", activeContent);
      }
    });

    this.setupInputHandlers(this.input);
  }

  setupInputHandlers(inputElement) {
    inputElement.addEventListener("keydown", (e) => {
      const terminal = this.terminals.find((t) => t.input === inputElement);
      if (!terminal) return;

      if (e.key === "Enter") {
        this.handleCommand(inputElement);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.navigateHistory("up", terminal);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.navigateHistory("down", terminal);
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        const outputElement = inputElement.closest(".terminal-content").querySelector("[id^='output']");
        outputElement.innerHTML = "";
        this.printWelcomeMessage(outputElement);
      } else if (e.key === "Tab") {
        e.preventDefault();
        this.handleTabCompletion(inputElement);
      }
    });
  }

  handleTabCompletion(inputElement) {
    const currentInput = inputElement.value.toLowerCase().trim();
    const commands = ["help", "about", "skills", "experience", "education", "contact", "services", "clear", "projects", "skills-visual", "game", "exit-game", "matrix", "stop-matrix", "weather", "calc", "calculate"];
    const matches = commands.filter((cmd) => cmd.startsWith(currentInput));
    if (matches.length === 1) {
      inputElement.value = matches[0];
    } else if (matches.length > 1 && currentInput) {
      const outputElement = inputElement.closest(".terminal-content").querySelector("[id^='output']");
      this.printToOutput(outputElement, `\nPossible commands:\n${matches.join("  ")}`, "info");
    }
  }

  navigateHistory(direction, terminal) {
    if (direction === "up" && terminal.historyIndex < terminal.history.length - 1) {
      terminal.historyIndex++;
    } else if (direction === "down" && terminal.historyIndex > -1) {
      terminal.historyIndex--;
    }
    if (terminal.historyIndex >= 0 && terminal.historyIndex < terminal.history.length) {
      terminal.input.value = terminal.history[terminal.history.length - 1 - terminal.historyIndex];
    } else {
      terminal.input.value = "";
    }
  }

  splitTerminal(direction, sourceTerminal) {
    const parentContainer = sourceTerminal.parentElement;
    const isAlreadySplit = parentContainer.children.length > 1;
    const splitClass = direction === "horizontal" ? "split-h" : "split-v";

    if (!isAlreadySplit || !parentContainer.classList.contains(splitClass)) {
      const newContainer = document.createElement("div");
      newContainer.className = `terminal-container ${splitClass}`;
      sourceTerminal.parentElement.insertBefore(newContainer, sourceTerminal);
      newContainer.appendChild(sourceTerminal);
      this.createNewTerminalContent(newContainer);
    } else {
      this.createNewTerminalContent(parentContainer);
    }
  }

  createNewTerminalContent(container) {
    const timestamp = Date.now();
    const newContent = document.createElement("div");
    newContent.className = "terminal-content";
    newContent.innerHTML = `
      <div id="output-${timestamp}" class="terminal-output"></div>
      <div class="input-line">
        <span class="prompt">➜</span>
        <input type="text" id="command-input-${timestamp}" class="command-input" />
      </div>
    `;

    if (container.children.length > 0) {
      const handle = document.createElement("div");
      handle.className = `resize-handle ${container.classList.contains("split-h") ? "horizontal" : "vertical"}`;
      container.lastElementChild.appendChild(handle);
      this.setupResizeHandle(handle);
    }

    container.appendChild(newContent);
    const newInput = newContent.querySelector(".command-input");
    this.setupInputHandlers(newInput);
    this.terminals.push({ input: newInput, history: [], historyIndex: -1 });
    const newOutput = newContent.querySelector(`#output-${timestamp}`);
    this.printWelcomeMessage(newOutput);
    newInput.focus();
    this.activeTerminal = this.terminals.length - 1;
  }

  setupResizeHandle(handle) {
    const isHorizontal = handle.classList.contains("horizontal");
    const startResize = (e) => {
      e.preventDefault();
      this.resizing = {
        handle,
        startX: e.clientX,
        startY: e.clientY,
        parentContainer: handle.closest(".terminal-container"),
        element: handle.parentElement,
        initialSize: isHorizontal ? handle.parentElement.offsetWidth : handle.parentElement.offsetHeight,
      };
      document.addEventListener("mousemove", this.resize);
      document.addEventListener("mouseup", this.stopResize);
    };
    const resize = (e) => {
      if (!this.resizing) return;
      const { parentContainer, element, startX, startY, initialSize } = this.resizing;
      const containerRect = parentContainer.getBoundingClientRect();
      if (isHorizontal) {
        const deltaX = e.clientX - startX;
        const newWidth = initialSize + deltaX;
        const maxWidth = containerRect.width - 150;
        if (newWidth >= 150 && newWidth <= maxWidth) {
          const percentage = (newWidth / containerRect.width) * 100;
          element.style.flex = "none";
          element.style.width = `${percentage}%`;
        }
      } else {
        const deltaY = e.clientY - startY;
        const newHeight = initialSize + deltaY;
        const maxHeight = containerRect.height - 100;
        if (newHeight >= 100 && newHeight <= maxHeight) {
          const percentage = (newHeight / containerRect.height) * 100;
          element.style.flex = "none";
          element.style.height = `${percentage}%`;
        }
      }
    };
    const stopResize = () => {
      this.resizing = null;
      document.removeEventListener("mousemove", this.resize);
      document.removeEventListener("mouseup", this.stopResize);
    };
    this.resize = resize.bind(this);
    this.stopResize = stopResize.bind(this);
    handle.addEventListener("mousedown", startResize);
  }

  printToOutput(outputElement, text, className = "", useTypewriter = false) {
    if (!text) {
      outputElement.innerHTML = "";
      return Promise.resolve();
    }

    const line = document.createElement("div");
    line.className = className;
    line.style.whiteSpace = "pre-wrap";
    line.style.marginBottom = "0.5rem";

    outputElement.appendChild(line);
    this.scrollToBottom(outputElement.closest(".terminal-content"));

    if (useTypewriter && !text.includes("<")) {
      return this.typeText(line, text, 20);
    } else if (useTypewriter && text.includes("<")) {
      return this.typeHTML(line, text, 20);
    } else {
      line.textContent = text;
      return Promise.resolve();
    }
  }

  scrollToBottom(terminalContent) {
    if (terminalContent.scrollHeight > terminalContent.clientHeight) {
      terminalContent.scrollTop = terminalContent.scrollHeight - terminalContent.clientHeight;
    }
  }

  handleCommand(inputElement) {
    const terminal = this.terminals.find((t) => t.input === inputElement);
    if (!terminal) return;

    const command = inputElement.value.trim().toLowerCase();
    const outputElement = inputElement.closest(".terminal-content").querySelector("[id^='output']");

    this.printToOutput(outputElement, `➜ ${command}`, "command");
    terminal.history.push(command);
    terminal.historyIndex = -1;
    inputElement.value = "";

    const [cmd, ...args] = command.split(" ");

    switch (cmd) {
      case "help":
        this.showHelp(outputElement);
        break;
      case "about":
        this.showAbout(outputElement);
        break;
      case "experience":
        this.showExperience(outputElement);
        break;
      case "education":
        this.showEducation(outputElement);
        break;
      case "skills":
        this.showSkills(outputElement);
        break;
      case "contact":
        this.showContact(outputElement);
        break;
      case "clear":
        outputElement.innerHTML = "";
        this.printWelcomeMessage(outputElement);
        break;
      case "projects":
        this.showProjects();
        break;
      case "skills-visual":
        this.showSkillsVisualization();
        break;
      case "game":
        this.initGame();
        break;
      case "pdf":
        this.generatePDF();
        break;
      case "linkedin-cover":
        this.generateLinkedInCover(outputElement);
        break;
      case "exit-game":
        this.endGame();
        this.printToOutput(outputElement, "Game exited.", "info");
        break;
      case "matrix":
        this.startMatrixEffect(outputElement);
        break;
      case "stop-matrix":
        this.stopMatrixEffect();
        this.printToOutput(outputElement, "Matrix effect stopped.", "info");
        break;
      case "weather":
        this.showWeather(args.join(" "), outputElement);
        break;
      case "services":
        this.showServices(outputElement);
        break;
      case "calc":
      case "calculate":
        this.calculate(args.join(" "), outputElement);
        break;
      case "":
        break;
      default:
        this.printToOutput(outputElement, `Command not found: ${command}. Type 'help' for available commands.`, "error");
    }

    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  printWelcomeMessage(outputElement = this.output) {
    const asciiArt = `███╗   ███╗ █████╗ ██████╗ ██╗ ██████╗
████╗ ████║██╔══██╗██╔══██╗██║██╔═══██╗
██╔████╔██║███████║██████╔╝██║██║   ██║
██║╚██╔╝██║██╔══██║██╔══██╗██║██║   ██║
██║ ╚═╝ ██║██║  ██║██║  ██║██║╚██████╔╝
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝ ╚═════╝ `;

    const divider = "─────────────────────────────────────────────────";

    const welcome = 
      this.wrapWithColor(asciiArt + "\n", "#66d9ef") +
      this.wrapWithColor(divider + "\n", "#555555") +
      this.wrapWithColor("              Prudhvi Sirikonda - Technical Trainer\n", "#ffd93d") +
      this.wrapWithColor("         5+ Years • 11000+ Students Trained\n", "#66d9ef") +
      this.wrapWithColor(divider + "\n\n", "#555555") +
      this.wrapWithColor("Type ", "#66d9ef") +
      this.wrapWithColor("'help'", "#a8e6cf") +
      this.wrapWithColor(" to see available commands\n", "#66d9ef") +
      this.wrapWithColor("Press ", "#66d9ef") +
      this.wrapWithColor("'tab'", "#a8e6cf") +
      this.wrapWithColor(" to auto-complete", "#66d9ef");

    const welcomeDiv = document.createElement("div");
    welcomeDiv.innerHTML = welcome;
    outputElement.appendChild(welcomeDiv);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  wrapWithColor(text, color) {
    return `<span style="color: ${color}">${text}</span>`;
  }

  showHelp(outputElement = this.output) {
    const title = this.wrapWithColor("🚀 Available Commands\n\n", "#ffd93d");

    const mainCommands = 
      this.wrapWithColor("Main Commands:\n", "#66d9ef") +
      this.wrapWithColor("• help", "#a8e6cf") + "       " + this.wrapWithColor("Show this help\n", "#ffffff") +
      this.wrapWithColor("• about", "#a8e6cf") + "      " + this.wrapWithColor("Professional summary\n", "#ffffff") +
      this.wrapWithColor("• skills", "#a8e6cf") + "     " + this.wrapWithColor("Technical expertise\n", "#ffffff") +
      this.wrapWithColor("• experience", "#a8e6cf") + " " + this.wrapWithColor("Work history\n", "#ffffff") +
      this.wrapWithColor("• education", "#a8e6cf") + "  " + this.wrapWithColor("Educational background\n", "#ffffff") +
      this.wrapWithColor("• contact", "#a8e6cf") + "    " + this.wrapWithColor("Contact information\n", "#ffffff") +
      this.wrapWithColor("• services", "#a8e6cf") + "   " + this.wrapWithColor("Services I offer\n", "#ffffff") +
      this.wrapWithColor("• clear", "#a8e6cf") + "      " + this.wrapWithColor("Clear screen\n", "#ffffff");

    const utilityCommands = "\n" +
      this.wrapWithColor("Utility Commands:\n", "#66d9ef") +
      this.wrapWithColor("• projects", "#a8e6cf") + "   " + this.wrapWithColor("Project showcase\n", "#ffffff") +
      this.wrapWithColor("• skills-visual", "#a8e6cf") + " " + this.wrapWithColor("Skills visualization\n", "#ffffff") +
      this.wrapWithColor("• game", "#a8e6cf") + "      " + this.wrapWithColor("Play Snake game\n", "#ffffff") +
      this.wrapWithColor("• matrix", "#a8e6cf") + "    " + this.wrapWithColor("Matrix rain effect\n", "#ffffff") +
      this.wrapWithColor("• weather", "#a8e6cf") + "   " + this.wrapWithColor("Check weather\n", "#ffffff") +
      this.wrapWithColor("• calc", "#a8e6cf") + "      " + this.wrapWithColor("Calculator\n", "#ffffff");

    const shortcuts = "\n" +
      this.wrapWithColor("Keyboard Shortcuts:\n", "#ffd93d") +
      this.wrapWithColor("• ↑/↓", "#66d9ef") + "         " + this.wrapWithColor("Command history\n", "#ffffff") +
      this.wrapWithColor("• Tab", "#66d9ef") + "         " + this.wrapWithColor("Autocomplete\n", "#ffffff") +
      this.wrapWithColor("• Ctrl+L", "#66d9ef") + "      " + this.wrapWithColor("Clear screen\n", "#ffffff") +
      this.wrapWithColor("• Ctrl+Shift+H/V", "#66d9ef") + " " + this.wrapWithColor("Split terminal\n", "#ffffff");

    const help = title + mainCommands + utilityCommands + shortcuts;

    const helpDiv = document.createElement("div");
    helpDiv.innerHTML = help;
    outputElement.appendChild(helpDiv);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  showAbout(outputElement = this.output) {
    const about = `<span style="color: #ffd93d; font-weight: bold;">✨ About Prudhvi</span>

${this.wrapWithColor("┌─────────────────────────────────────────────────────────┐", "#66d9ef")}
${this.wrapWithColor("│", "#66d9ef")} Result driven professional with <span style='color: #a8e6cf; font-weight: bold;'>5+ years</span>│
${this.wrapWithColor("│", "#66d9ef")} experience in training & realtime development. Trained │
${this.wrapWithColor("│", "#66d9ef")} <span style='color: #a8e6cf; font-weight: bold;'>11000+ students</span> across 30+ colleges!        │
${this.wrapWithColor("└─────────────────────────────────────────────────────────┘", "#66d9ef")}

${this.wrapWithColor("🎯 Expertise", "#ffd93d")}
• C, C++, Core Java, Python, Data Structures
• Full Stack Web Development (Java/React/Node/SQLite/SpringBoot)
• SQL, PL/SQL, DBMS, RDBMS, MySQL
• Soft Skills & Interview Preparation

${this.wrapWithColor("🏆 Achievements", "#66d9ef")}
• Trained professionals & students across India
• Corporate & College Training Programs
• Projects: Medical Store App, Amazon Clone, ML Models

${this.wrapWithColor("📍 Based in Hyderabad, Telangana", "#a8e6cf")} | ${this.wrapWithColor("Ready for new opportunities!", "#ffd93d")}`;

    const aboutDiv = document.createElement("div");
    aboutDiv.innerHTML = about;
    outputElement.appendChild(aboutDiv);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  showExperience(outputElement = this.output) {
    const experience = `<span style="color: #ffd93d; font-weight: bold;">💼 Professional Experience</span>

<span style="color: #66d9ef; font-weight: bold;">TECHNICAL TRAINER</span> ${this.wrapWithColor("(Sep 2021 - Present)", "#a8e6cf")}
${this.wrapWithColor("📍 Hyderabad, Telangana", "#ffffff")}
${this.wrapWithColor("• Trained 11000+ students across 30+ colleges", "#a8e6cf")}
${this.wrapWithColor("• SQL, Database Systems, Core Java, Python, Data Structures", "#ffffff")}
${this.wrapWithColor("• Full Stack Web Development & Soft Skills Training", "#ffffff")}
${this.wrapWithColor("• Mock Interviews & Group Discussions", "#ffffff")}

<span style="color: #66d9ef; font-weight: bold;">TEST AUTOMATION ENGINEER @ COGNIZANT</span> ${this.wrapWithColor("(Nov 2020 - Sep 2021)", "#a8e6cf")}
${this.wrapWithColor("📍 Hyderabad, India", "#ffffff")}
${this.wrapWithColor("• Automated Cognizant Tru Time Portal (TestNG, XPath)", "#a8e6cf")}
${this.wrapWithColor("• Core Java, SQL, Selenium, JavaScript", "#ffffff")}
${this.wrapWithColor("• Test Reports & Bug Reports", "#ffffff")}

<span style="color: #66d9ef; font-weight: bold;">WEB DESIGNING INTERN @ PRO IMAGINATIONS</span> ${this.wrapWithColor("(Nov 2016 - May 2017)", "#a8e6cf")}
${this.wrapWithColor("📍 Hyderabad, India", "#ffffff")}
${this.wrapWithColor("• HTML, CSS, XML, JavaScript", "#a8e6cf")}
${this.wrapWithColor("• Project Documentation", "#ffffff")}`;

    const experienceDiv = document.createElement("div");
    experienceDiv.innerHTML = experience;
    outputElement.appendChild(experienceDiv);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  showEducation(outputElement = this.output) {
    const education = `<span style="color: #ffd93d; font-weight: bold;">🎓 Education</span>

${this.wrapWithColor("┌─────────────────────────────────────┐", "#66d9ef")}
${this.wrapWithColor("│", "#66d9ef")} B.Tech Computer Science & Engineering ${this.wrapWithColor("│", "#66d9ef")}
${this.wrapWithColor("│", "#66d9ef")} Anurag University, Hyderabad          ${this.wrapWithColor("│", "#66d9ef")}
${this.wrapWithColor("└─────────────────────────────────────┘", "#66d9ef")}

${this.wrapWithColor("📍 Hyderabad, Telangana, India", "#ffffff")}`;

    const educationDiv = document.createElement("div");
    educationDiv.innerHTML = education;
    outputElement.appendChild(educationDiv);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  showSkills(outputElement = this.output) {
    const skills = `<span style="color: #ffd93d; font-weight: bold;">🛠️ Technical Skills</span>

${this.wrapWithColor("📚 Programming Languages:", "#66d9ef")}
• C++ • C • Core Java • Python

${this.wrapWithColor("🗄️ Databases:", "#a8e6cf")}
• SQL • PL/SQL • MySQL • SQLite • DBMS • RDBMS

${this.wrapWithColor("🌐 Web Development:", "#ffd93d")}
• HTML • CSS • JavaScript • ReactJS • NodeJS • SpringBoot

${this.wrapWithColor("🎯 Core Expertise:", "#66d9ef")}
• Data Structures • Full Stack Development
• Competitive Coding • Object Oriented Programming

${this.wrapWithColor("💼 Training Types:", "#a8e6cf")}
• Corporate Training • Interview Preparation
• Company Specific • Product Based Training`;

    const skillsDiv = document.createElement("div");
    skillsDiv.innerHTML = skills;
    outputElement.appendChild(skillsDiv);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  showContact(outputElement = this.output) {
    const contact = `<span style="color: #ffd93d; font-weight: bold;">📞 Contact</span>

${this.wrapWithColor("┌─────────────────────────────────────┐", "#66d9ef")}
${this.wrapWithColor("│ ✉️ Email: ", "#66d9ef")}${this.wrapWithColor('<a href="mailto:prudhvi.touch.me@gmail.com" style="color: #a8e6cf;">prudhvi.touch.me@gmail.com</a>', "#a8e6cf")}${this.wrapWithColor(" │", "#66d9ef")}
${this.wrapWithColor("│ 📱 Phone: +91 8523869512                 │", "#66d9ef")}
${this.wrapWithColor("│ 📍 Hyderabad, Telangana, India        │", "#a8e6cf")}
${this.wrapWithColor("└─────────────────────────────────────┘", "#66d9ef")}

${this.wrapWithColor("🔗 Social:", "#ffd93d")}
${this.wrapWithColor('<a href="https://github.com/Prudhvi-69" target="_blank" style="color: #a8e6cf;">GitHub</a>', "#a8e6cf")} • 
${this.wrapWithColor('<a href="https://www.linkedin.com/in/sprdj/" target="_blank" style="color: #a8e6cf;">LinkedIn</a>', "#a8e6cf")}`;

    const contactDiv = document.createElement("div");
    contactDiv.innerHTML = contact;
    outputElement.appendChild(contactDiv);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  // Rest of methods remain the same (themes, games, etc.)
  typeText(element, text, speed = 30) {
    return new Promise((resolve) => {
      let index = 0;
      element.textContent = "";
      const interval = setInterval(() => {
        if (index < text.length) {
          element.textContent += text.charAt(index);
          index++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    });
  }

  typeHTML(element, html, speed = 30) {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    const walker = document.createTreeWalker(temp, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    const nodes = [];
    let currentNode;
    while ((currentNode = walker.nextNode())) nodes.push(currentNode);
    element.innerHTML = "";
    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const span = document.createElement("span");
        element.appendChild(span);
        this.typeText(span, node.textContent, speed);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        element.appendChild(clone);
        if (!node.hasChildNodes()) clone.innerHTML = node.innerHTML;
      }
    }
    return Promise.resolve();
  }

  closeSplit(terminalContent) {
    const container = terminalContent.parentElement;
    const input = terminalContent.querySelector("input");
    const terminalIndex = this.terminals.findIndex((t) => t.input === input);
    if (terminalIndex > -1) this.terminals.splice(terminalIndex, 1);
    terminalContent.remove();
    if (container.children.length <= 1 && container !== this.terminalContainer) {
      if (container.children.length === 1) {
        const remainingContent = container.firstElementChild;
        container.parentElement.insertBefore(remainingContent, container);
      }
      container.remove();
    }
    if (this.terminals.length > 0) {
      const newActiveIndex = Math.min(terminalIndex, this.terminals.length - 1);
      this.terminals[newActiveIndex].input.focus();
    }
  }

  loadProjects() {
    this.projects = [
      {
        title: "Medical Store App",
        description: "Complete pharmacy management app with inventory, expiry tracking",
        technologies: ["Java", "ReactJS", "SQLite", "NodeJS", "SpringBoot"],
      },
      {
        title: "Amazon Web Clone",
        description: "Full shopping catalog with cart, navigation, payment gateway",
        technologies: ["HTML", "CSS", "JavaScript"],
      },
      {
        title: "Driver Distraction Detection",
        description: "IoT ML model for driver safety using SVM, CNN, OpenCV",
        technologies: ["Python", "OpenCV", "SVM", "CNN", "VGG-16"],
      }
    ];
  }

  loadSkills() {
    this.skills = {
      languages: { "C/C++": 95, Java: 90, Python: 85, SQL: 92 },
      web: { ReactJS: 80, NodeJS: 75, SpringBoot: 80 },
      training: { "11000+ Students": 100, Colleges: 95 }
    };
  }

  setupFileSystem() {
    // Minimal for demo
  }

  handleThemeChange(theme) {
    this.terminal.className = `terminal theme-${theme}`;
    localStorage.setItem("theme", theme);
    this.currentTheme = theme;
    this.closeModal(this.themeModal);
  }

  showModal(modal) { modal.classList.add("active"); }
  closeModal(modal) { modal.classList.remove("active"); }

  showProjects() {
    const container = this.projectsModal.querySelector(".projects-container");
    container.innerHTML = this.projects.map(p => 
      `<div class="project-card">
        <div class="project-details">
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          <div class="project-tech">${p.technologies.map(t => `<span class="tech-tag">${t}</span>`).join("")}</div>
        </div>
      </div>`
    ).join("");
    this.showModal(this.projectsModal);
  }

  showSkillsVisualization() {
    const container = this.skillsModal.querySelector(".skills-container");
    container.innerHTML = Object.entries(this.skills).map(([cat, sk]) => 
      `<div class="skill-category">
        <h3>${cat}</h3>
        <div class="skill-bars">
          ${Object.entries(sk).map(([skill, level]) => 
            `<div class="skill-item">
              <div class="skill-info">
                <span>${skill}</span>
                <span>${level}%</span>
              </div>
              <div class="skill-progress">
                <div class="skill-progress-bar" style="width: ${level}%"></div>
              </div>
            </div>`
          ).join("")}
        </div>
      </div>`
    ).join("");
    this.showModal(this.skillsModal);
  }

  showServices(outputElement = this.output) {
    const services = `<span style="color: #ffd93d; font-weight: bold;">🚀 Services Offered</span>

${this.wrapWithColor("┌──────────────────────────────────────────────┐", "#66d9ef")}
${this.wrapWithColor("│", "#66d9ef")} ${this.wrapWithColor("🎓 Technical Trainings", "#a8e6cf")}                       ${this.wrapWithColor("│", "#66d9ef")}
${this.wrapWithColor("│", "#66d9ef")}   C, C++, Java, Python, DSA, SQL, Full Stack   ${this.wrapWithColor("│", "#66d9ef")}
${this.wrapWithColor("├──────────────────────────────────────────────┤", "#66d9ef")}
${this.wrapWithColor("│", "#66d9ef")} ${this.wrapWithColor("🏢 Product Based Trainings", "#a8e6cf")}                   ${this.wrapWithColor("│", "#66d9ef")}
${this.wrapWithColor("│", "#66d9ef")}   Company-specific tech stacks & tools         ${this.wrapWithColor("│", "#66d9ef")}
${this.wrapWithColor("├──────────────────────────────────────────────┤", "#66d9ef")}
${this.wrapWithColor("│", "#66d9ef")} ${this.wrapWithColor("📅 Semester Trainings", "#a8e6cf")}                        ${this.wrapWithColor("│", "#66d9ef")}
${this.wrapWithColor("│", "#66d9ef")}   Structured college semester programs         ${this.wrapWithColor("│", "#66d9ef")}
${this.wrapWithColor("├──────────────────────────────────────────────┤", "#66d9ef")}
${this.wrapWithColor("│", "#66d9ef")} ${this.wrapWithColor("💻 Custom Web Applications", "#a8e6cf")}                   ${this.wrapWithColor("│", "#66d9ef")}
${this.wrapWithColor("│", "#66d9ef")}   Tailored web apps for businesses & students  ${this.wrapWithColor("│", "#66d9ef")}
${this.wrapWithColor("├──────────────────────────────────────────────┤", "#66d9ef")}
${this.wrapWithColor("│", "#66d9ef")} ${this.wrapWithColor("🧑‍💼 Custom Portfolios for Students", "#a8e6cf")}             ${this.wrapWithColor("│", "#66d9ef")}
${this.wrapWithColor("│", "#66d9ef")}   Professional portfolio websites built for you ${this.wrapWithColor("│", "#66d9ef")}
${this.wrapWithColor("└──────────────────────────────────────────────┘", "#66d9ef")}

${this.wrapWithColor("📩 Reach out: ", "#ffd93d")}${this.wrapWithColor('<a href="mailto:prudhvi.touch.me@gmail.com" style="color:#a8e6cf;">prudhvi.touch.me@gmail.com</a>', "#a8e6cf")}`;

    const servicesDiv = document.createElement("div");
    servicesDiv.innerHTML = services;
    outputElement.appendChild(servicesDiv);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  generatePDF() {
    const outputElement = this.output;
    this.printToOutput(outputElement, "PDF generation requires a server environment. Please use Ctrl+P to print this page.", "info");
  }

  generateLinkedInCover(outputElement = this.output) {
    this.printToOutput(outputElement, "LinkedIn cover generation is not available in this version.", "info");
  }

  initGame() {
    const outputElement = this.output;
    if (this.gameActive) {
      this.printToOutput(outputElement, "Game already running. Type 'exit-game' to stop.", "error");
      return;
    }
    this.gameActive = true;

    const gameDiv = document.createElement("div");
    gameDiv.id = "snake-game-container";
    gameDiv.style.cssText = "margin: 1rem 0; border: 2px solid #66d9ef; display: inline-block; background: #000;";
    const canvas = document.createElement("canvas");
    canvas.id = "snake-canvas";
    canvas.width = 300;
    canvas.height = 300;
    gameDiv.appendChild(canvas);
    outputElement.appendChild(gameDiv);

    const scoreDiv = document.createElement("div");
    scoreDiv.id = "snake-score";
    scoreDiv.style.color = "#ffd93d";
    scoreDiv.textContent = "Score: 0 | Use Arrow Keys to play | Type 'exit-game' to quit";
    outputElement.appendChild(scoreDiv);

    const ctx = canvas.getContext("2d");
    const CELL = 15;
    const COLS = canvas.width / CELL;
    const ROWS = canvas.height / CELL;
    let snake = [{ x: 10, y: 10 }];
    let dir = { x: 1, y: 0 };
    let nextDir = { x: 1, y: 0 };
    let food = { x: 5, y: 5 };
    let score = 0;

    const placeFood = () => {
      food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    };

    const draw = () => {
      ctx.fillStyle = "#0d0d0d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#66d9ef";
      snake.forEach(s => ctx.fillRect(s.x * CELL, s.y * CELL, CELL - 1, CELL - 1));
      ctx.fillStyle = "#ff6b6b";
      ctx.fillRect(food.x * CELL, food.y * CELL, CELL - 1, CELL - 1);
    };

    const keyHandler = (e) => {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const map = { ArrowUp: {x:0,y:-1}, ArrowDown: {x:0,y:1}, ArrowLeft: {x:-1,y:0}, ArrowRight: {x:1,y:0} };
        const d = map[e.key];
        if (d.x !== -dir.x || d.y !== -dir.y) nextDir = d;
      }
    };
    document.addEventListener("keydown", keyHandler);

    this.gameHandler = setInterval(() => {
      dir = nextDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || snake.some(s => s.x === head.x && s.y === head.y)) {
        this.endGame();
        document.removeEventListener("keydown", keyHandler);
        const endDiv = document.createElement("div");
        endDiv.style.color = "#ff6b6b";
        endDiv.textContent = `Game Over! Final Score: ${score}`;
        outputElement.appendChild(endDiv);
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDiv.textContent = `Score: ${score} | Use Arrow Keys to play | Type 'exit-game' to quit`;
        placeFood();
      } else {
        snake.pop();
      }
      draw();
    }, 120);

    placeFood();
    draw();
    this.printToOutput(outputElement, "🐍 Snake started! Use Arrow Keys. Type 'exit-game' to quit.", "info");
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  endGame() {
    if (this.gameHandler) {
      clearInterval(this.gameHandler);
      this.gameHandler = null;
    }
    this.gameActive = false;
    const container = document.getElementById("snake-game-container");
    if (container) container.remove();
    const score = document.getElementById("snake-score");
    if (score) score.remove();
  }

  startMatrixEffect(outputElement = this.output) {
    if (this.matrixActive) {
      this.printToOutput(outputElement, "Matrix already running. Type 'stop-matrix' to stop.", "error");
      return;
    }
    this.matrixActive = true;

    const canvas = document.createElement("canvas");
    canvas.id = "matrix-canvas";
    canvas.width = 600;
    canvas.height = 200;
    canvas.style.cssText = "display:block; margin: 0.5rem 0; border: 1px solid #333;";
    outputElement.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const cols = Math.floor(canvas.width / 16);
    const drops = Array(cols).fill(1);
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF";

    this.matrixInterval = setInterval(() => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0f0";
      ctx.font = "14px monospace";
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 16, y * 16);
        if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }, 50);

    this.printToOutput(outputElement, "🟩 Matrix rain started. Type 'stop-matrix' to stop.", "info");
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  stopMatrixEffect() {
    if (this.matrixInterval) {
      clearInterval(this.matrixInterval);
      this.matrixInterval = null;
    }
    this.matrixActive = false;
    const canvas = document.getElementById("matrix-canvas");
    if (canvas) canvas.remove();
  }

  showWeather(city = "", outputElement = this.output) {
    if (!city) {
      this.printToOutput(outputElement, "Usage: weather <city>  e.g. weather Hyderabad", "error");
      return;
    }
    this.printToOutput(outputElement, `🌍 Fetching weather for ${city}...`, "info");
    fetch(`https://wttr.in/${encodeURIComponent(city)}?format=3`)
      .then(r => r.text())
      .then(data => {
        this.printToOutput(outputElement, `🌤️ ${data.trim()}`, "info");
        this.scrollToBottom(outputElement.closest(".terminal-content"));
      })
      .catch(() => {
        this.printToOutput(outputElement, `Could not fetch weather for "${city}". Check your connection.`, "error");
      });
  }

  calculate(expr = "", outputElement = this.output) {
    if (!expr) {
      this.printToOutput(outputElement, "Usage: calc <expression>  e.g. calc 2 + 2", "error");
      return;
    }
    try {
      const sanitized = expr.replace(/[^0-9+\-*/().% ]/g, "");
      if (!sanitized) throw new Error("Invalid");
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${sanitized})`)();
      this.printToOutput(outputElement, `🧮 ${expr} = ${result}`, "info");
    } catch {
      this.printToOutput(outputElement, `Invalid expression: ${expr}`, "error");
    }
  }
}

// Initialize
new TerminalResume();

