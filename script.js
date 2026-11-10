const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");


function initClickEffects() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("a, button");
    if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "click-ripple";
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    target.append(ripple);
    window.setTimeout(() => ripple.remove(), 560);
  });
}

function initDynamicHome() {
  const hero = document.querySelector(".home-hero");
  const title = document.querySelector("[data-hero-story-title]");
  const copy = document.querySelector("[data-hero-story-copy]");
  const clock = document.querySelector("[data-hero-clock]");
  if (!hero || !title || !copy) return;
  const stories = [
    { name: "单依纯 · 情绪从停顿开始", copy: "从《中国好声音》舞台到个人单曲，她把细腻的气息变成可以被记住的情绪线条。", image: "images/111.jpg" },
    { name: "宋雨琦 · 低音让舞台有重心", copy: "从《FREAK》的复古质感到《Giant》的开阔旋律，能量与自我表达始终在场。", image: "images/yuqi-photo.jpg" },
    { name: "李荣浩 · 把生活写成旋律", copy: "他把普通人的犹豫、错过和自嘲写进简洁耐听的歌里，留白也成为一种表达。", image: "images/lrh-photo.jpg" }
  ];
  let index = 0;
  const render = () => {
    const story = stories[index];
    title.classList.add("is-swapping"); copy.classList.add("is-swapping");
    window.setTimeout(() => {
      title.textContent = story.name; copy.textContent = story.copy;
      hero.style.setProperty("--hero-image", `url('${story.image}')`);
      // 直接写 background-image：自定义属性里的相对路径会被解析到 css/ 目录，导致背景图 404
      hero.style.backgroundImage = `url("${story.image}")`;
      title.classList.remove("is-swapping"); copy.classList.remove("is-swapping");
    }, 180);
    index = (index + 1) % stories.length;
  };
  render();
  window.setInterval(render, 5600);
  if (clock) {
    const started = Date.now();
    window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      clock.textContent = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
    }, 1000);
  }
}


initClickEffects();
initDynamicHome();

document.querySelectorAll(".music-video-copy").forEach((panel) => {
  const video = panel.querySelector("video");
  if (video) video.setAttribute("aria-label", "播放对应歌手视频");
});

document.querySelectorAll(".photo-credit").forEach((credit) => credit.remove());
document.querySelectorAll(".video-source-note").forEach((note) => note.remove());
document.querySelectorAll(".footer-brand p, .footer-bottom span:last-child").forEach((node) => {
  if (/非官方|仅作学习|仅用于|来源/.test(node.textContent)) node.remove();
});

function initMusicPlayer() {
  // 整张作品卡都可点击播放，避免用户点卡片没反应
  document.querySelectorAll(".music-card").forEach((card) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) return;
      card.querySelector(".play-track")?.click();
    });
  });
  const player = document.querySelector("[data-player]");
  if (!player) return;
  const title = player.querySelector("[data-player-title]");
  const status = player.querySelector("[data-player-status]");
  const art = player.querySelector("[data-player-art]");
  const progress = player.querySelector("[data-player-progress]");
  const audio = player.querySelector("[data-local-audio]");
  const cards = [...document.querySelectorAll(".music-card")];
  document.querySelectorAll(".play-track").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".music-card");
      cards.forEach((item) => item.classList.toggle("is-playing", item === card));
      if (title) title.textContent = `${button.dataset.artist} · ${button.dataset.title}`;
      if (status) status.textContent = "已选中，正在载入本地音频……";
      if (audio && button.dataset.localAudio) {
        audio.src = button.dataset.localAudio;
        audio.load();
        audio.play().then(() => {
          if (status) status.textContent = "正在播放本地音频 · 约 1 分钟试听";
        }).catch(() => {
          if (status) status.textContent = "本地音频已载入，点击播放器播放";
        });
        audio.onplay = () => player.classList.add("is-playing");
        audio.onpause = () => player.classList.remove("is-playing");
        audio.ontimeupdate = () => {
          if (progress && audio.duration) progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
        };
        audio.onended = () => { player.classList.remove("is-playing"); if (progress) progress.style.width = "0%"; };
      }
      if (art) {
        art.replaceChildren();
        const image = document.createElement("img");
        image.src = button.dataset.cover;
        image.alt = `${button.dataset.title} 封面`;
        art.append(image);
      }
      player.classList.add("is-playing");
    });
  });
}

function initVideoArchive() {
  const video = document.querySelector("[data-artist-video]");
  const playBadge = document.querySelector(".music-video-play");
  const title = document.querySelector("[data-video-title]");
  const poster = document.querySelector("[data-video-poster]");
  const sourceLink = document.querySelector("[data-video-source-link]");
  if (!video) return;
  playBadge?.addEventListener("click", () => {
    video.play().catch(() => {
      video.controls = true;
      video.focus();
    });
  });
  const sourceMap = {
    "media/shanyichun-yongbu.mp4": "https://www.bilibili.com/video/BV11HXvBzEyv",
    "media/songyuqi-freak.mp4": "https://www.bilibili.com/video/BV11b421Y7Bo",
    "media/lironghao-nian-shaoyouwei.mp4": "https://www.bilibili.com/video/BV1gs411M7LM"
  };
  document.querySelectorAll(".video-switch").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".video-switch").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      const wasPlaying = !video.paused;
      video.pause();
      video.src = button.dataset.videoSrc;
      video.poster = button.dataset.videoPoster;
      if (poster) {
        poster.src = button.dataset.videoPoster;
        poster.alt = `${button.dataset.videoTitle} 视频封面`;
      }
      if (title) title.textContent = button.dataset.videoTitle;
      if (sourceLink) sourceLink.href = sourceMap[button.dataset.videoSrc] || "#";
      video.load();
      if (wasPlaying) video.play().catch(() => {});
    });
  });
}

initMusicPlayer();
initVideoArchive();

function closeMenu() {
  if (!navToggle || !navLinks) return;
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.querySelector("[aria-hidden]").textContent = "☰";
  navLinks.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const willOpen = navToggle.getAttribute("aria-expanded") !== "true";
    navToggle.setAttribute("aria-expanded", String(willOpen));
    navToggle.querySelector("[aria-hidden]").textContent = willOpen ? "×" : "☰";
    navLinks.classList.toggle("is-open", willOpen);
    document.body.classList.toggle("menu-open", willOpen);
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) closeMenu();
  });
}

function initArtistNavigation() {
  const artistProfiles = [...document.querySelectorAll(".inline-artist-profile[id]")];
  const artistCards = [...document.querySelectorAll(".artist-card[href^='#']")];
  if (!artistProfiles.length) return;

  document.querySelectorAll(".artist-card .photo-credit a").forEach((sourceLink) => {
    sourceLink.addEventListener("click", (event) => event.stopPropagation());
  });

  const highlight = (id, shouldScroll = true) => {
    const target = document.getElementById(id);
    if (!target) return;
    artistCards.forEach((card) => card.classList.toggle("is-selected", card.getAttribute("href") === `#${id}`));
    target.classList.remove("is-highlighted");
    void target.offsetWidth;
    target.classList.add("is-highlighted");
    window.setTimeout(() => target.classList.remove("is-highlighted"), 900);
    if (shouldScroll) {
      const navHeight = document.querySelector(".site-nav")?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  document.querySelectorAll("a[href^='#']").forEach((link) => {
    const id = link.getAttribute("href")?.slice(1);
    if (!id || !artistProfiles.some((profile) => profile.id === id)) return;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      link.blur();
      history.replaceState(null, "", `#${id}`);
      highlight(id);
    });
  });

  const hash = window.location.hash.slice(1);
  if (hash && artistProfiles.some((profile) => profile.id === hash)) {
    window.requestAnimationFrame(() => highlight(hash));
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".artist-roster .artist-card, .inline-artist-profile .inline-artist-head, .inline-artist-profile .inline-artist-works").forEach((element) => observer.observe(element));
}

initArtistNavigation();

function initSongCovers() {
  const coverMap = {
    "永不失联的爱": "covers/cover-shan-yongbu.jpg",
    "照片": "covers/cover-shan-zhaopian.jpg",
    "想你时风起": "covers/cover-shan-xiangni.jpg",
    "FREAK": "covers/cover-yuqi-freak.jpg",
    "Bonnie & Clyde": "covers/cover-yuqi-bonnie.jpg",
    "Giant": "covers/cover-yuqi-giant.jpg",
    "李白": "covers/cover-lrh-libai.jpg",
    "年少有为": "covers/cover-lrh-nian.jpg",
    "模特": "covers/cover-lrh-mote.jpg"
  };
  document.querySelectorAll(".song-list li").forEach((item) => {
    const title = item.querySelector("h3")?.textContent.trim();
    const source = coverMap[title];
    if (!source || item.querySelector(".song-cover")) return;
    const image = document.createElement("img");
    image.className = "song-cover";
    image.src = source;
    image.alt = `${title} 原版专辑封面`;
    image.loading = "lazy";
    item.prepend(image);
  });
}

initSongCovers();

function initPageMotion() {
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.prepend(progress);
  const hero = document.querySelector(".home-hero");
  const cards = document.querySelectorAll(".artist-card, .music-card");
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    if (hero) hero.style.setProperty("--hero-shift", `${Math.min(window.scrollY * 0.08, 42)}px`);
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${(y * -2).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 2).toFixed(2)}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });

  const revealItems = document.querySelectorAll(".section, .page-masthead, .music-card, .artist-card, .artist-work-card, .comments-feed");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  revealItems.forEach((item) => revealObserver.observe(item));
}


function initNavHighlight() {
  const links = [...document.querySelectorAll(".nav-links a")];
  if (!links.length) return;

  const here = decodeURIComponent((location.pathname.split("/").pop() || "index.html"));
  const navHeight = () => document.querySelector(".site-nav")?.offsetHeight || 0;

  const targets = links.map((link) => {
    const href = link.getAttribute("href") || "";
    const [rawPath, hash] = href.split("#");
    if (hash) return { link, hash, el: document.getElementById(hash) };
    if (rawPath) return { link, page: rawPath.split("/").pop() };
    return { link };
  });

  const activate = (link) => {
    links.forEach((item) => { if (item !== link) item.removeAttribute("aria-current"); });
    if (link) link.setAttribute("aria-current", "page");
  };

  const update = () => {
    const line = window.scrollY + navHeight() + 90;
    let current = null;
    targets.forEach((item) => {
      if (!item.el) return;
      const top = item.el.getBoundingClientRect().top + window.scrollY;
      if (top <= line) current = item.link;
    });
    if (current) { activate(current); return; }
    const pageMatch = targets.find((item) => item.page && item.page === here);
    if (pageMatch) { activate(pageMatch.link); return; }
    // 人物页 / 单依纯专题页：归到“音乐人阵容”这一项高亮
    const rosterPages = ["about.html", "concert.html", "awards.html"];
    if (here.indexOf("artist-") === 0 || rosterPages.indexOf(here) !== -1) {
      const roster = targets.find((item) => item.hash === "artists");
      if (roster) { activate(roster.link); return; }
    }
    activate(links[0]);
  };

  links.forEach((link) => link.addEventListener("click", () => activate(link)));
  window.addEventListener("scroll", () => window.requestAnimationFrame(update), { passive: true });
  window.addEventListener("hashchange", update);
  update();
}

initNavHighlight();
initPageMotion();

document.documentElement.classList.add("page-ready");
document.querySelectorAll("a[href]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || link.target === "_blank" || href.startsWith("http")) return;
    event.preventDefault();
    document.body.classList.add("is-leaving");
    window.setTimeout(() => { window.location.href = href; }, 180);
  });
});

document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

function getCommentsClientId() {
  try {
    const saved = localStorage.getItem("voice-archive-client-id");
    if (saved) return saved;

    const randomPart = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const clientId = `client-${randomPart}`;
    localStorage.setItem("voice-archive-client-id", clientId);
    return clientId;
  } catch (error) {
    return `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

const commentsClientId = getCommentsClientId();

document.querySelectorAll("[data-comment-section]").forEach((section) => {
  const form = section.querySelector("[data-comment-form]");
  const list = section.querySelector("[data-comment-list]");
  const emptyState = section.querySelector("[data-comment-empty]");
  const status = section.querySelector("[data-comment-status]");
  const count = section.querySelector("[data-comment-count]");
  const textarea = section.querySelector("textarea[name='comment']");
  const counter = section.querySelector("[data-character-count]");
  const apiUrl = section.dataset.apiUrl === "index.html" ? "index.php" : section.dataset.apiUrl;
  const artistKey = section.dataset.artistKey;
  const staticPreview = window.location.protocol === "file:" || /\.html$/i.test(apiUrl || "");

  if (!form || !list || !apiUrl || !artistKey) return;

  const seedElement = section.querySelector("[data-comment-seeds]");
  let comments = [];

  try {
    comments = JSON.parse(seedElement?.textContent || "[]");
  } catch (error) {
    comments = [];
  }

  async function requestComments(payload = null) {
    if (staticPreview) {
      if (payload) throw new Error("静态预览模式下暂不支持评论修改。");
      return comments;
    }

    const url = new URL(apiUrl, window.location.href);
    url.searchParams.set("api", "comments");
    url.searchParams.set("artist", artistKey);
    url.searchParams.set("client", commentsClientId);

    const options = payload
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, clientId: commentsClientId })
        }
      : { method: "GET" };

    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "评论服务暂时不可用。");
    return Array.isArray(data.comments) ? data.comments : [];
  }

  function createComment(comment) {
    const item = document.createElement("article");
    item.className = "comment-item";
    item.dataset.commentId = comment.id;

    const avatar = document.createElement("span");
    avatar.className = "comment-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = (comment.name || "乐").trim().slice(0, 1).toUpperCase();

    const content = document.createElement("div");
    content.className = "comment-content";

    const header = document.createElement("div");
    header.className = "comment-header";

    const identity = document.createElement("div");
    const author = document.createElement("strong");
    author.textContent = comment.name;
    const time = document.createElement("time");
    time.textContent = comment.date;
    identity.append(author, time);

    const actions = document.createElement("div");
    actions.className = "comment-actions";

    const likeButton = document.createElement("button");
    likeButton.type = "button";
    likeButton.className = "comment-action";
    likeButton.dataset.action = "like";
    likeButton.setAttribute("aria-label", `${comment.liked ? "取消点赞" : "点赞"}，当前 ${comment.likes || 0} 个赞`);
    likeButton.innerHTML = `<span aria-hidden="true">${comment.liked ? "♥" : "♡"}</span> <span>${comment.likes || 0}</span>`;
    if (comment.liked) likeButton.classList.add("is-liked");
    actions.append(likeButton);

    if (comment.isOwn) {
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "comment-action comment-delete";
      deleteButton.dataset.action = "delete";
      deleteButton.textContent = "删除";
      actions.append(deleteButton);
    }

    header.append(identity, actions);

    const body = document.createElement("p");
    body.textContent = comment.text;
    content.append(header, body);
    item.append(avatar, content);
    return item;
  }

  function renderComments() {
    list.replaceChildren(...comments.map(createComment));
    if (emptyState) emptyState.hidden = comments.length > 0;
    if (count) count.textContent = `${comments.length} 条留言`;
  }

  textarea?.addEventListener("input", () => {
    if (counter) counter.textContent = `${textarea.value.length} / 280`;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const text = String(formData.get("comment") || "").trim();
    const submitButton = form.querySelector("button[type='submit']");

    if (!name || !text) {
      if (status) status.textContent = "请填写昵称和评论内容。";
      return;
    }

    if (submitButton) submitButton.disabled = true;
    if (status) status.textContent = "正在发布……";

    try {
      comments = await requestComments({ action: "create", name, text });
      renderComments();
      form.reset();
      if (counter) counter.textContent = "0 / 280";
      if (status) status.textContent = "评论发布成功，其他访客现在也能看到。";
    } catch (error) {
      if (status) status.textContent = error.message;
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });

  list.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    const item = event.target.closest("[data-comment-id]");
    if (!button || !item) return;

    const comment = comments.find((entry) => String(entry.id) === item.dataset.commentId);
    if (!comment) return;

    button.disabled = true;
    try {
      comments = await requestComments({ action: button.dataset.action, id: comment.id });
      renderComments();
      if (status) status.textContent = button.dataset.action === "delete" ? "评论已删除。" : "点赞状态已更新。";
    } catch (error) {
      button.disabled = false;
      if (status) status.textContent = error.message;
    }
  });

  renderComments();
  if (staticPreview) {
    if (status) status.textContent = "静态预览模式：评论仅供浏览。";
  } else {
    if (status) status.textContent = "正在同步最新评论……";
    requestComments()
      .then((serverComments) => {
        comments = serverComments;
        renderComments();
        if (status) status.textContent = "";
      })
      .catch((error) => {
        if (status) status.textContent = `${error.message} 当前显示页面预置内容。`;
      });
  }
});




function initNavShadow() {
  const nav = document.querySelector(".site-nav");
  if (!nav) return;
  const sync = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", sync, { passive: true });
  sync();
}

initNavShadow();


function initCustomPlayerControls() {
  const audio = document.querySelector("[data-local-audio]");
  if (!audio) return;
  const bar = document.querySelector(".music-player-progress");
  const fill = document.querySelector("[data-player-progress]");
  if (!bar || !fill) return;

  audio.removeAttribute("controls");

  const wrap = document.createElement("div");
  wrap.className = "player-controls";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "player-toggle";
  toggle.setAttribute("aria-label", "播放");
  toggle.textContent = "▶";

  const time = document.createElement("span");
  time.className = "player-time";
  time.textContent = "0:00 / 0:00";

  wrap.append(toggle, time);
  const copy = document.querySelector("[data-player] .music-player-copy") || document.querySelector("[data-player]");
  copy.appendChild(wrap);

  const fmt = (s) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return m + ":" + String(r).padStart(2, "0");
  };

  const sync = () => {
    const dur = audio.duration || 0;
    time.textContent = fmt(audio.currentTime) + " / " + fmt(dur);
    fill.style.width = dur ? (audio.currentTime / dur) * 100 + "%" : "0%";
    toggle.textContent = audio.paused ? "▶" : "❘❘";
    toggle.setAttribute("aria-label", audio.paused ? "播放" : "暂停");
  };

  toggle.addEventListener("click", () => {
    if (!audio.currentSrc) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  });

  bar.addEventListener("click", (event) => {
    const rect = bar.getBoundingClientRect();
    if (!audio.duration) return;
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = ratio * audio.duration;
    sync();
  });

  audio.addEventListener("timeupdate", sync);
  audio.addEventListener("play", sync);
  audio.addEventListener("pause", sync);
  audio.addEventListener("ended", sync);
  audio.addEventListener("loadedmetadata", sync);
  sync();
}

initCustomPlayerControls();
