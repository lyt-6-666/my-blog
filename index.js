/**
 * index.js - 博客前端数据加载器
 * 从 data/*.json 读取内容，动态渲染页面
 * 与 admin.html 的数据字段一一对应
 */
(function () {
  'use strict';

  // 自动适配本地 localhost 和 GitHub Pages 子目录
  var BASE = (function () {
    var p = location.pathname.replace(/\/[^/]*$/, '');
    // GitHub Pages 子目录：/my-blog 等
    return p || '';
  })();
  var DATA = BASE + '/data';

  // ===========================
  // IntersectionObserver 淡入
  // ===========================
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });

  function observe(el) { if (el) io.observe(el); }
  function observeAll(parent) {
    if (!parent) return;
    parent.querySelectorAll('.fade-in').forEach(function (el) { io.observe(el); });
  }

  // ===========================
  // 主题切换
  // ===========================
  var THEMES = ['indigo', 'rose', 'emerald', 'amber', 'ocean', 'dark'];
  var curTheme = localStorage.getItem('blog-theme') || 'indigo';

  function applyTheme(t) {
    curTheme = t;
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('blog-theme', t);
    document.querySelectorAll('.tp-opt').forEach(function (o) {
      o.classList.toggle('active', o.getAttribute('data-t') === t);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(curTheme);

    // 主题面板切换
    var btn = document.getElementById('theme-btn');
    var panel = document.getElementById('theme-panel');
    if (btn && panel) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        panel.classList.toggle('show');
      });
      document.addEventListener('click', function () { panel.classList.remove('show'); });
      panel.addEventListener('click', function (e) { e.stopPropagation(); });
      document.querySelectorAll('.tp-opt').forEach(function (o) {
        o.addEventListener('click', function () { applyTheme(o.getAttribute('data-t')); });
      });
    }

    // 汉堡菜单
    var ham = document.getElementById('hamburger');
    var nav = document.getElementById('nav-links');
    if (ham && nav) {
      ham.addEventListener('click', function () {
        ham.classList.toggle('open');
        nav.classList.toggle('show');
      });
    }

    // 导航高亮 & 缩小
    var navbar = document.getElementById('navbar');
    var sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', function () {
      // 进度条
      var sb = document.getElementById('scroll-bar');
      if (sb) sb.style.width = (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + '%';
      // 返回顶部
      var bt = document.getElementById('back-top');
      if (bt) bt.classList.toggle('show', window.scrollY > 300);
      // 导航缩小
      if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
      // 导航高亮
      var cur = '';
      sections.forEach(function (s) {
        if (window.scrollY >= s.offsetTop - 120) cur = s.id;
      });
      document.querySelectorAll('.nav-links a').forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
      });
    });

    // 返回顶部
    var bt = document.getElementById('back-top');
    if (bt) bt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    // Esc 关闭弹窗
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeArticle(); closeLightbox(); }
    });

    // 文章 Modal 关闭
    var artClose = document.getElementById('art-close');
    var artModal = document.getElementById('art-modal');
    if (artClose) artClose.addEventListener('click', closeArticle);
    if (artModal) artModal.addEventListener('click', function (e) { if (e.target === artModal) closeArticle(); });

    // 灯箱关闭
    var lbClose = document.getElementById('lb-close');
    var lightbox = document.getElementById('lightbox');
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lightbox) lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });

    // 加载数据
    loadAll();
  });

  // ===========================
  // 加载所有数据
  // ===========================
  function loadAll() {
    var files = ['config', 'hero', 'projects', 'gallery', 'articles', 'about', 'contact'];
    var promises = files.map(function (f) {
      return fetch(DATA + '/' + f + '.json')
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    });
    Promise.all(promises).then(function (res) {
      var cfg      = res[0] || {};
      var hero     = res[1] || {};
      var projects = res[2] || [];
      var gallery  = res[3] || [];
      var articles = res[4] || [];
      var about    = res[5] || {};
      var contact  = res[6] || {};

      renderConfig(cfg);
      renderHero(hero);
      renderProjects(projects);
      renderGallery(gallery);
      renderArticles(articles);
      renderAbout(about);
      renderContact(contact);

      // 观察所有淡入元素
      document.querySelectorAll('.fade-in').forEach(function (el) { io.observe(el); });
    }).catch(function (err) {
      console.error('[博客] 数据加载失败:', err);
    });
  }

  // ===========================
  // 站点配置  (config.json → site)
  // ===========================
  function renderConfig(cfg) {
    var site = cfg.site || {};
    if (site.title) {
      document.title = site.title;
      var pt = document.getElementById('page-title');
      if (pt) pt.textContent = site.title;
    }
    var logo = document.getElementById('nav-logo');
    if (logo && site.logo) logo.textContent = site.logo;
    var footer = document.getElementById('footer-text');
    if (footer) footer.innerHTML = site.footer_bottom || '&copy; 2026';
  }

  // ===========================
  // Hero (hero.json)
  // ===========================
  function renderHero(hero) {
    // 角标
    var badgeEl = document.getElementById('hero-badge');
    var badgeText = document.getElementById('badge-text');
    if (hero.badge && badgeEl && badgeText) {
      badgeText.textContent = hero.badge;
      badgeEl.style.display = '';
    }

    // 标题：headline_1 + highlight(headline_2) + headline_3 + headline_4
    var titleEl = document.getElementById('hero-title');
    if (titleEl) {
      var parts = [];
      if (hero.headline_1) parts.push(hero.headline_1);
      if (hero.headline_2) parts.push('<span class="hl">' + esc(hero.headline_2) + '</span>');
      if (hero.headline_3) parts.push(hero.headline_3);
      if (hero.headline_4) parts.push(hero.headline_4);
      titleEl.innerHTML = parts.join(' ');
    }

    // 描述
    var descEl = document.getElementById('hero-desc');
    if (descEl && hero.description) descEl.textContent = hero.description;

    // 按钮
    var btnsEl = document.getElementById('hero-btns');
    if (btnsEl) {
      var html = '';
      if (hero.btn_1_text) html += '<a href="' + (hero.btn_1_link || '#') + '" class="btn btn-primary">' + esc(hero.btn_1_text) + '</a>';
      if (hero.btn_2_text) html += '<a href="' + (hero.btn_2_link || '#') + '" class="btn btn-outline">' + esc(hero.btn_2_text) + '</a>';
      btnsEl.innerHTML = html;
    }

    // 统计
    var statsEl = document.getElementById('hero-stats');
    if (statsEl && hero.stats && hero.stats.length > 0) {
      statsEl.innerHTML = hero.stats.map(function (s) {
        return '<div class="stat-item"><div class="stat-num">' + s.number + (s.suffix || '') + '</div><div class="stat-lbl">' + esc(s.label) + '</div></div>';
      }).join('');
      statsEl.style.display = '';
    }
  }

  // ===========================
  // 作品 (projects.json → array)
  // ===========================
  function renderProjects(list) {
    var el = document.getElementById('projects-grid');
    if (!el) return;
    if (!Array.isArray(list) || list.length === 0) {
      el.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1;padding:3rem;">暂无作品，快去后台添加吧 🚀</p>';
      return;
    }
    list.sort(function (a, b) { return (a.order || 99) - (b.order || 99); });
    el.innerHTML = list.map(function (p) {
      var tags = (p.tags || []).slice(0, 4).map(function (t) { return '<span class="proj-tag">' + esc(t) + '</span>'; }).join('');
      var gradient = p.gradient || 'var(--g1)';
      var href = p.link && p.link !== '#' ? ' href="' + p.link + '" target="_blank"' : '';
      // 图标：优先使用图片，否则 emoji
      var iconHtml = '';
      if (p.icon_url) {
        iconHtml = '<img src="' + BASE + '/' + p.icon_url + '" style="position:relative;z-index:1;width:72px;height:72px;object-fit:contain;" alt="' + esc(p.title) + '">';
      } else {
        iconHtml = '<span style="position:relative;z-index:1;font-size:4rem;">' + (p.emoji || '📦') + '</span>';
      }
      return '<div class="proj-card fade-in">' +
        '<div class="proj-thumb" style="background:' + gradient + '">' +
          iconHtml +
        '</div>' +
        '<div class="proj-body">' +
          '<div class="proj-tags">' + tags + '</div>' +
          '<h3>' + esc(p.title) + '</h3>' +
          '<p>' + esc(p.description || '') + '</p>' +
          (href ? '<a' + href + ' class="proj-link">查看详情 →</a>' : '') +
        '</div>' +
      '</div>';
    }).join('');
    observeAll(el);
  }

  // ===========================
  // 相册 (gallery.json → array)
  // ===========================
  var _galData = [];
  function renderGallery(list) {
    _galData = Array.isArray(list) ? list : [];
    var filtersEl = document.getElementById('gal-filters');
    var gridEl = document.getElementById('gallery-grid');
    if (!gridEl) return;

    if (_galData.length === 0) {
      if (filtersEl) filtersEl.innerHTML = '';
      gridEl.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1;padding:3rem;">暂无图片，去后台上传第一张吧 📷</p>';
      return;
    }

    // 分类
    var cats = ['全部'];
    _galData.forEach(function (g) {
      if (g.category && cats.indexOf(g.category) < 0) cats.push(g.category);
    });
    if (filtersEl) {
      filtersEl.innerHTML = cats.map(function (c, i) {
        return '<button class="filter-btn' + (i === 0 ? ' active' : '') + '" data-cat="' + c + '">' + c + '</button>';
      }).join('');
      filtersEl.addEventListener('click', function (e) {
        var btn = e.target.closest('.filter-btn');
        if (!btn) return;
        filtersEl.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderGalGrid(btn.getAttribute('data-cat'));
      });
    }
    renderGalGrid('全部');
  }

  function renderGalGrid(cat) {
    var gridEl = document.getElementById('gallery-grid');
    if (!gridEl) return;
    var filtered = cat === '全部' ? _galData : _galData.filter(function (g) { return g.category === cat; });
    if (filtered.length === 0) {
      gridEl.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1;padding:2rem;">该分类暂无图片</p>';
      return;
    }
    gridEl.innerHTML = filtered.map(function (g) {
      var img = g.image_url ? '<img src="' + g.image_url + '" alt="' + esc(g.title || '') + '" loading="lazy" onerror="this.parentElement.querySelector(\'.gal-ph\')&&(this.style.display=\'none\')">' : '';
      var ph = !g.image_url ? '<div class="gal-ph">🖼️</div>' : '<div class="gal-ph" style="display:none">🖼️</div>';
      return '<div class="gal-item fade-in" data-id="' + g.id + '">' +
        ph + img +
        '<div class="gal-overlay"><h4>' + esc(g.title || '') + '</h4><p>' + esc(g.description || '') + '</p></div>' +
      '</div>';
    }).join('');
    gridEl.querySelectorAll('.gal-item').forEach(function (el) {
      io.observe(el);
      el.addEventListener('click', function () {
        var id = el.getAttribute('data-id');
        var item = _galData.find(function (g) { return g.id == id; });
        if (item && item.image_url) openLightbox(item);
      });
    });
  }

  // ===========================
  // 文章 (articles.json → array)
  // ===========================
  var _articles = [];
  function renderArticles(list) {
    _articles = Array.isArray(list) ? list : [];
    var el = document.getElementById('articles-grid');
    if (!el) return;
    var published = _articles.filter(function (a) { return a.published !== false; });
    if (published.length === 0) {
      el.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1;padding:3rem;">暂无文章，去后台写第一篇吧 ✏️</p>';
      return;
    }
    published.sort(function (a, b) { return new Date(b.updated_at || 0) - new Date(a.updated_at || 0); });
    el.innerHTML = published.map(function (a) {
      var date = new Date(a.updated_at || a.created_at || Date.now()).toLocaleDateString('zh-CN');
      var summary = a.summary || (a.content || '').replace(/[#>*`\[\]\n]/g, '').trim().slice(0, 80) + '…';
      var thumb = a.cover_image
        ? '<img src="' + a.cover_image + '" alt="">'
        : '<span style="position:relative;z-index:1;font-size:2.5rem;">📄</span>';
      return '<article class="art-card fade-in" data-id="' + a.id + '">' +
        '<div class="art-thumb">' + thumb + '</div>' +
        '<div class="art-body">' +
          '<div class="art-meta"><span class="cat">' + esc(a.category || '其他') + '</span><span>' + date + '</span></div>' +
          '<h3>' + esc(a.title) + '</h3>' +
          '<p>' + esc(summary) + '</p>' +
        '</div>' +
      '</article>';
    }).join('');
    el.querySelectorAll('.art-card').forEach(function (card) {
      io.observe(card);
      card.addEventListener('click', function () { openArticle(card.getAttribute('data-id')); });
    });
  }

  // ===========================
  // 关于 (about.json)
  // ===========================
  function renderAbout(about) {
    var titleEl = document.getElementById('about-title');
    if (titleEl && about.title) titleEl.textContent = about.title;

    var layout = document.getElementById('about-layout');
    if (layout && about.title) {
      var avatarContent = '';
      if (about.avatar_url) {
        avatarContent = '<img src="' + BASE + '/' + about.avatar_url + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="avatar">';
      } else {
        avatarContent = (about.avatar || '👤');
      }
      var avatarHtml = '<div class="about-ava-wrap fade-in"><div class="about-ava">' + avatarContent + '</div></div>';
      var textHtml = '<div class="about-text fade-in">';
      if (about.subtitle) textHtml += '<p style="color:var(--accent);font-size:1.05rem;margin-bottom:1rem;">' + esc(about.subtitle) + '</p>';
      if (about.paragraphs && about.paragraphs.length > 0) {
        about.paragraphs.forEach(function (p) { textHtml += '<p>' + esc(p) + '</p>'; });
      }
      if (about.skills && about.skills.length > 0) {
        textHtml += '<div class="skills">' + about.skills.map(function (s) {
          return '<span class="skill-tag">' + esc(s) + '</span>';
        }).join('') + '</div>';
      }
      textHtml += '</div>';
      layout.innerHTML = avatarHtml + textHtml;
      observeAll(layout);
    }

    // 时间线
    var tlEl = document.getElementById('timeline');
    if (tlEl && about.timeline && about.timeline.length > 0) {
      tlEl.style.display = '';
      tlEl.innerHTML = '<h3 style="text-align:center;margin-bottom:2rem;font-size:1.4rem;">经历</h3>' +
        about.timeline.map(function (t) {
          return '<div class="tl-item fade-in"><div class="tl-dot"></div>' +
            '<div class="tl-body"><div class="tl-year">' + esc(t.year || '') + '</div>' +
            '<h4>' + esc(t.title || '') + '</h4>' +
            '<p>' + esc(t.description || '') + '</p></div></div>';
        }).join('');
      observeAll(tlEl);
    }
  }

  // ===========================
  // 联系方式 (contact.json → cards)
  // ===========================
  function renderContact(contact) {
    var el = document.getElementById('contact-grid');
    if (!el) return;
    var cards = (contact.cards || []).filter(function (c) { return c.title; });
    if (cards.length === 0) {
      el.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1;padding:3rem;">暂无联系方式</p>';
      return;
    }
    el.innerHTML = cards.map(function (c) {
      return '<div class="contact-card fade-in">' +
        '<div class="contact-icon">' + (c.icon || '📧') + '</div>' +
        '<div><h4>' + esc(c.title) + '</h4><p>' + esc(c.value || '') + '</p></div>' +
      '</div>';
    }).join('');
    observeAll(el);
  }

  // ===========================
  // 文章 Modal
  // ===========================
  function openArticle(id) {
    var a = _articles.find(function (x) { return x.id == id; });
    if (!a) return;
    var modal = document.getElementById('art-modal');
    var content = document.getElementById('art-modal-content');
    if (!modal || !content) return;
    var date = new Date(a.updated_at || a.created_at || Date.now()).toLocaleDateString('zh-CN');
    var tags = (a.tags || []).map(function (t) { return '<span style="background:var(--soft);color:var(--accent);padding:2px 8px;border-radius:6px;font-size:.78rem;">' + esc(t) + '</span>'; }).join(' ');
    content.innerHTML =
      '<p style="color:var(--muted);font-size:.88rem;">' + date + ' · ' + esc(a.category || '其他') + '</p>' +
      '<h1 style="margin:.6rem 0 1rem;font-size:1.8rem;line-height:1.3">' + esc(a.title) + '</h1>' +
      (tags ? '<div style="margin-bottom:1.5rem;display:flex;gap:.4rem;flex-wrap:wrap;">' + tags + '</div>' : '') +
      md2html(a.content || '');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeArticle() {
    var modal = document.getElementById('art-modal');
    if (modal) modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  // ===========================
  // 灯箱
  // ===========================
  function openLightbox(item) {
    var lb = document.getElementById('lightbox');
    var img = document.getElementById('lb-img');
    var cap = document.getElementById('lb-caption');
    if (!lb || !img) return;
    img.src = item.image_url;
    img.alt = item.title || '';
    if (cap) cap.innerHTML = '<strong>' + esc(item.title || '') + '</strong>' + (item.description ? '<br>' + esc(item.description) : '');
    lb.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    var lb = document.getElementById('lightbox');
    if (lb) lb.classList.remove('show');
    document.body.style.overflow = '';
  }

  // ===========================
  // Markdown → HTML（简版）
  // ===========================
  function md2html(text) {
    if (!text) return '';
    // 代码块
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, function (_, lang, code) {
      return '<pre><code>' + escHtml(code.trim()) + '</code></pre>';
    });
    // 行内转义
    text = text
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^\> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/^- (.+)$/gm, '<li>$1</li>');
    // 列表包装
    text = text.replace(/(<li>[\s\S]*?<\/li>)/g, function (m) { return '<ul>' + m + '</ul>'; });
    // 段落
    var lines = text.split('\n');
    var out = '';
    lines.forEach(function (line) {
      line = line.trim();
      if (!line) return;
      if (/^<(h[1-6]|ul|ol|li|pre|blockquote|img)/.test(line)) out += line;
      else out += '<p>' + line + '</p>';
    });
    return out;
  }

  // ===========================
  // 工具函数
  // ===========================
  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function escHtml(s) { return esc(s); }

})();
