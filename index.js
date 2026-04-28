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
  // CDN 前缀：GitHub Pages 环境直接用 jsDelivr CDN 读取图片（最快）
  var CDN = 'https://cdn.jsdelivr.net/gh/LYT-6-666/my-blog@main';
  // 判断是否为本地环境（localhost）
  var IS_LOCAL = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  // 获取图片完整 URL：本地用相对路径，线上用 CDN
  function getImgUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return IS_LOCAL ? (BASE ? BASE + '/' + path : path) : (CDN + '/' + path);
  }

  // ===========================
  // 国际化（i18n）系统
  // ===========================
  var I18N = {
    zh: {
      // 导航
      nav_home: '首页',
      nav_projects: '作品',
      nav_gallery: '相册',
      nav_articles: '文章',
      nav_about: '关于',
      nav_contact: '联系',
      // 主题面板
      theme_label: '选择主题',
      // 语言按钮
      lang_switch: 'EN',
      // 徽章
      badge_projects: '// 作品',
      badge_gallery: '// 相册',
      badge_articles: '// 文章',
      badge_about: '// 关于我',
      badge_contact: '// 联系',
      // 标题
      title_projects: '作品展示',
      title_gallery: '相册',
      title_articles: '技术文章',
      title_about: '关于我',
      title_contact: '联系方式',
      // 描述
      desc_projects: '精心打磨的 CAD 自动化工具，让效率翻倍',
      desc_gallery: '记录开发历程，留存每一个灵感瞬间',
      desc_articles: '分享 CAD 二次开发经验与实用技巧',
      // 空状态
      empty_projects: '暂无作品，快去后台添加吧 🚀',
      empty_gallery: '暂无图片，去后台上传第一张吧 📷',
      empty_articles: '暂无文章，去后台写第一篇吧 ✏️',
      empty_contact: '暂无联系方式',
      empty_gal_cat: '该分类暂无图片',
      // 按钮
      btn_view_details: '查看详情 →',
      btn_watch_video: '观看视频',
      btn_docs: '使用说明',
      btn_pdf: 'PDF说明',
      btn_download: '下载PDF',
      // 加载状态
      loading: '加载中...',
      load_error: '加载失败',
      doc_error: '文档加载失败',
      pdf_loading: '正在加载 PDF...',
      pdf_error: 'PDF 加载失败',
      // PDF 翻页
      pdf_page: '页',
      pdf_prev: '‹',
      pdf_next: '›',
      // 视频弹窗
      video_title: '观看视频',
      // 关于页
      timeline_title: '经历',
      // 主题名称
      theme_indigo: '靛蓝',
      theme_rose: '玫瑰',
      theme_emerald: '翡翠',
      theme_amber: '琥珀',
      theme_ocean: '海洋',
      theme_purple: '紫色',
      theme_sunset: '日落',
      theme_mint: '薄荷',
      theme_dark: '暗黑',
    },
    en: {
      // 导航
      nav_home: 'Home',
      nav_projects: 'Projects',
      nav_gallery: 'Gallery',
      nav_articles: 'Articles',
      nav_about: 'About',
      nav_contact: 'Contact',
      // 主题面板
      theme_label: 'Choose Theme',
      // 语言按钮
      lang_switch: '中',
      // 徽章
      badge_projects: '// PROJECTS',
      badge_gallery: '// GALLERY',
      badge_articles: '// ARTICLES',
      badge_about: '// ABOUT ME',
      badge_contact: '// CONTACT',
      // 标题
      title_projects: 'Projects',
      title_gallery: 'Gallery',
      title_articles: 'Articles',
      title_about: 'About Me',
      title_contact: 'Contact',
      // 描述
      desc_projects: 'Carefully crafted CAD automation tools for maximum efficiency',
      desc_gallery: 'Documenting the development journey, capturing every inspiration',
      desc_articles: 'Sharing CAD secondary development experience and practical tips',
      // 空状态
      empty_projects: 'No projects yet. Add some in the admin panel 🚀',
      empty_gallery: 'No images yet. Upload your first photo 📷',
      empty_articles: 'No articles yet. Write your first post ✏️',
      empty_contact: 'No contact information',
      empty_gal_cat: 'No images in this category',
      // 按钮
      btn_view_details: 'View Details →',
      btn_watch_video: 'Watch Video',
      btn_docs: 'Documentation',
      btn_pdf: 'PDF Guide',
      btn_download: 'Download PDF',
      // 加载状态
      loading: 'Loading...',
      load_error: 'Load failed',
      doc_error: 'Failed to load document',
      pdf_loading: 'Loading PDF...',
      pdf_error: 'PDF load failed',
      // PDF 翻页
      pdf_page: '',
      pdf_prev: '‹',
      pdf_next: '›',
      // 视频弹窗
      video_title: 'Watch Video',
      // 关于页
      timeline_title: 'Experience',
      // 主题名称
      theme_indigo: 'Indigo',
      theme_rose: 'Rose',
      theme_emerald: 'Emerald',
      theme_amber: 'Amber',
      theme_ocean: 'Ocean',
      theme_purple: 'Purple',
      theme_sunset: 'Sunset',
      theme_mint: 'Mint',
      theme_dark: 'Dark',
    }
  };

  var currentLang = localStorage.getItem('blog-lang') || 'zh';

  function t(key) {
    return I18N[currentLang][key] || key;
  }

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('blog-lang', lang);

    // 更新语言切换按钮
    var langBtn = document.getElementById('lang-btn');
    if (langBtn) langBtn.textContent = t('lang_switch');

    // 更新导航链接文本
    var navLinks = document.querySelectorAll('.nav-links a');
    var navMap = ['nav_home', 'nav_projects', 'nav_gallery', 'nav_articles', 'nav_about', 'nav_contact'];
    navLinks.forEach(function(a, i) {
      if (navMap[i]) a.textContent = t(navMap[i]);
    });

    // 更新主题面板标签
    var tpLabel = document.getElementById('tp-label');
    if (tpLabel) tpLabel.textContent = t('theme_label');

    // 更新主题选项 title
    var themeMap = {
      'indigo': 'theme_indigo', 'rose': 'theme_rose', 'emerald': 'theme_emerald',
      'amber': 'theme_amber', 'ocean': 'theme_ocean', 'purple': 'theme_purple',
      'sunset': 'theme_sunset', 'mint': 'theme_mint', 'dark': 'theme_dark'
    };
    document.querySelectorAll('.tp-opt').forEach(function(o) {
      var tKey = themeMap[o.getAttribute('data-t')];
      if (tKey) o.title = t(tKey);
    });

    // 更新 data-i18n 元素
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (I18N[lang][key]) el.textContent = I18N[lang][key];
    });

    // 更新 PDF 弹窗按钮
    var pdfPrev = document.querySelector('#pdf-prev [data-i18n]');
    if (pdfPrev) pdfPrev.textContent = t('pdf_prev');
    var pdfNext = document.querySelector('#pdf-next [data-i18n]');
    if (pdfNext) pdfNext.textContent = t('pdf_next');
    var pdfDl = document.getElementById('pdf-download');
    if (pdfDl) pdfDl.textContent = t('btn_download');

    // 更新页码显示
    updatePdfPageInfo();
  }

  function updatePdfPageInfo() {
    var pageInfo = document.getElementById('pdf-page-info');
    if (pageInfo && window._pdfPage && window._pdfTotal) {
      if (currentLang === 'en') {
        pageInfo.textContent = window._pdfPage + ' / ' + window._pdfTotal;
      } else {
        pageInfo.textContent = '第 ' + window._pdfPage + ' / ' + window._pdfTotal + ' 页';
      }
    }
  }

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
  var THEMES = ['indigo', 'rose', 'emerald', 'amber', 'ocean', 'purple', 'sunset', 'mint', 'dark'];
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
    applyLanguage(currentLang);

    // 语言切换
    var langBtn = document.getElementById('lang-btn');
    if (langBtn) {
      langBtn.addEventListener('click', function () {
        var newLang = currentLang === 'zh' ? 'en' : 'zh';
        applyLanguage(newLang);
        // 重新渲染动态内容
        if (_galData.length > 0) renderGalGrid(document.querySelector('.filter-btn.active')?.getAttribute('data-cat') || '全部');
        renderContact(window._contactData || {});
      });
    }

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
      el.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1;padding:3rem;">' + t('empty_projects') + '</p>';
      return;
    }
    list.sort(function (a, b) { return (a.order || 99) - (b.order || 99); });
    el.innerHTML = list.map(function (p) {
      var tags = (p.tags || []).slice(0, 4).map(function (t) { return '<span class="proj-tag">' + esc(t) + '</span>'; }).join('');
      var gradient = p.gradient || 'var(--g1)';
      var href = p.link && p.link !== '#' ? ' href="' + p.link + '" target="_blank"' : '';
      // 视频链接按钮：从 video_url 提取 BV/av 号，生成弹窗播放
      var videoBtn = '';
      if (p.video_url) {
        var bvMatch = (p.video_url + '').match(/BV[a-zA-Z0-9]+/);
        var avMatch = (p.video_url + '').match(/av(\d+)/i);
        var vidId = '';
        var vidUrl = '';
        if (bvMatch) {
          vidId = bvMatch[0];
          vidUrl = 'https://www.bilibili.com/video/' + vidId;
        } else if (avMatch) {
          vidId = 'av' + avMatch[1];
          vidUrl = 'https://www.bilibili.com/video/av' + avMatch[1];
        } else if (p.video_url.match(/^https?:\/\//)) {
          vidUrl = p.video_url;
        }
        if (vidUrl) {
          var src = '';
          if (bvMatch) {
            src = '//player.bilibili.com/player.html?bvid=' + bvMatch[0] + '&high_quality=1&autoplay=0';
          } else if (avMatch) {
            src = '//player.bilibili.com/player.html?aid=' + avMatch[1] + '&high_quality=1&autoplay=0';
          }
          if (src) {
            videoBtn = '<a onclick="openVideoPlayer(\'' + src + '\',\'' + esc(p.title) + '\')" class="proj-video-link" style="cursor:pointer"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> ' + t('btn_watch_video') + '</a>';
          } else {
            videoBtn = '<a href="' + esc(vidUrl) + '" target="_blank" class="proj-video-link"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> ' + t('btn_watch_video') + '</a>';
          }
        }
      }
      // 使用说明按钮
      var docBtn = '';
      if (p.doc_url) {
        docBtn = '<a onclick="openProjectDoc(\'' + esc(p.doc_url) + '\',\'' + esc(p.title) + '\')" class="proj-doc-link"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6zm2-7h8v1.5H8V13zm0 3h5v1.5H8V16z"/></svg> ' + t('btn_docs') + '</a>';
      }
      // PDF 使用说明按钮
      var pdfBtn = '';
      if (p.pdf_url) {
        pdfBtn = '<a onclick="openProjectPDF(\'' + esc(p.pdf_url) + '\',\'' + esc(p.title) + '\')" class="proj-pdf-link"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg> ' + t('btn_pdf') + '</a>';
      }
      // 图标：有图片时铺满顶部，否则 emoji 居中显示
      var iconHtml = '';
      if (p.icon_url) {
        iconHtml = '<img src="' + BASE + '/' + p.icon_url + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;" alt="' + esc(p.title) + '">';
      } else {
        iconHtml = '<span style="position:relative;z-index:1;font-size:4rem;">' + (p.emoji || '📦') + '</span>';
      }
      return '<div class="proj-card fade-in">' +
        '<div class="proj-thumb" style="background:' + (p.icon_url ? '#000' : gradient) + '">' +
          iconHtml +
        '</div>' +
        '<div class="proj-body">' +
          '<div class="proj-tags">' + tags + '</div>' +
          '<h3>' + esc(p.title) + '</h3>' +
          '<p>' + esc(p.description || '') + '</p>' +
          '<div class="proj-actions">' +
            (href ? '<a' + href + ' class="proj-link">' + t('btn_view_details') + '</a>' : '') +
            videoBtn +
            docBtn +
            pdfBtn +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
    observeAll(el);
  }

  // ===========================
  // B站视频播放弹窗
  // ===========================
  window.openVideoPlayer = function (src, title) {
    // 移除已有的视频弹窗（如有）
    var old = document.getElementById('video-modal');
    if (old) old.remove();
    var modal = document.createElement('div');
    modal.id = 'video-modal';
    modal.className = 'video-modal';
    modal.innerHTML =
      '<div class="video-modal-backdrop"></div>' +
      '<div class="video-modal-box">' +
        '<div class="video-modal-header"><span>' + (title || t('video_title')) + '</span><button class="video-modal-close" onclick="closeVideoPlayer()">&times;</button></div>' +
        '<div class="video-modal-body"><iframe src="' + src + '" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" sandbox="allow-same-origin allow-scripts allow-popups allow-forms"></iframe></div>' +
      '</div>';
    document.body.appendChild(modal);
    // 下一帧添加 show 类触发动画
    requestAnimationFrame(function () { modal.classList.add('show'); });
    // 点击遮罩关闭
    modal.querySelector('.video-modal-backdrop').addEventListener('click', window.closeVideoPlayer);
    // ESC 关闭
    document.addEventListener('keydown', videoEscHandler);
  };
  window.closeVideoPlayer = function () {
    var modal = document.getElementById('video-modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(function () { modal.remove(); }, 300);
    }
    document.removeEventListener('keydown', videoEscHandler);
  };
  function videoEscHandler(e) { if (e.key === 'Escape') window.closeVideoPlayer(); }

  // ===========================
  // 使用说明弹窗（加载 MD/TXT 文件并渲染）
  // ===========================
  window.openProjectDoc = function (docUrl, title) {
    // 移除已有弹窗
    var old = document.getElementById('doc-modal');
    if (old) old.remove();
    // 创建弹窗
    var modal = document.createElement('div');
    modal.id = 'doc-modal';
    modal.className = 'modal';
    modal.innerHTML =
      '<div class="modal-box" style="max-width:860px">' +
        '<button class="modal-close" onclick="closeDocModal()">&times;</button>' +
        '<div class="modal-body">' +
          '<h2 style="margin-bottom:1rem;font-size:1.4rem">' + esc(title) + ' - ' + t('btn_docs') + '</h2>' +
          '<div id="doc-modal-loading" style="text-align:center;padding:3rem;color:var(--text2)">' + t('loading') + '</div>' +
          '<div id="doc-modal-content" class="md-content" style="display:none"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    requestAnimationFrame(function () { modal.classList.add('show'); });
    modal.addEventListener('click', function (e) { if (e.target === modal) closeDocModal(); });
    document.addEventListener('keydown', docEscHandler);
    // 加载文档内容
    fetch(BASE + '/' + docUrl)
      .then(function (r) { return r.ok ? r.text() : null; })
      .then(function (text) {
        var loading = document.getElementById('doc-modal-loading');
        var content = document.getElementById('doc-modal-content');
        if (!text) {
          if (loading) loading.textContent = t('doc_error');
          return;
        }
        content.innerHTML = md2html(text);
        loading.style.display = 'none';
        content.style.display = 'block';
      })
      .catch(function () {
        var loading = document.getElementById('doc-modal-loading');
        if (loading) loading.textContent = t('doc_error');
      });
  };
  window.closeDocModal = function () {
    var modal = document.getElementById('doc-modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(function () { modal.remove(); }, 300);
    }
    document.removeEventListener('keydown', docEscHandler);
  };
  function docEscHandler(e) { if (e.key === 'Escape') window.closeDocModal(); }

  // ===========================
  // PDF 使用说明弹窗（使用 PDF.js 在线预览）
  // ===========================
  window.openProjectPDF = function (pdfUrl, title) {
    var modal = document.getElementById('pdf-modal');
    if (!modal) return;

    // 重置状态：隐藏 canvas/controls，显示 loading
    var loadingEl = document.getElementById('pdf-loading');
    var canvas = document.getElementById('pdf-canvas');
    var pageInfo = document.getElementById('pdf-page-info');
    var prevBtn = document.getElementById('pdf-prev');
    var nextBtn = document.getElementById('pdf-next');
    var downloadBtn = document.getElementById('pdf-download');
    var titleEl = document.getElementById('pdf-title');

    if (titleEl) titleEl.textContent = title;
    if (canvas) canvas.style.display = 'none';
    if (loadingEl) { loadingEl.textContent = t('pdf_loading'); loadingEl.style.display = 'block'; }
    if (pageInfo) {
      if (currentLang === 'en') {
        pageInfo.textContent = '0 / 0';
      } else {
        pageInfo.textContent = '0 / 0 页';
      }
    }
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;

    // 构造完整 URL
    var fullPdfUrl = pdfUrl.startsWith('http') ? pdfUrl : (BASE ? BASE + '/' + pdfUrl : pdfUrl);
    if (downloadBtn) { downloadBtn.href = fullPdfUrl; downloadBtn.target = '_blank'; }

    // 重置 PDF 全局状态
    _pdfDoc = null;
    _pdfPage = 1;
    _pdfTotal = 1;

    // 显示弹窗
    modal.classList.add('show');

    // 点击背景关闭
    var backdrop = modal.querySelector('.pdf-modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', window.closePDFModal);

    // ESC 关闭
    document.addEventListener('keydown', pdfEscHandler);

    // 加载 PDF.js 并渲染（从本地同源加载，避免跨域 worker 问题）
    loadPDFJS(fullPdfUrl);
  };

  // PDF.js 预加载标志（由 index.html 预加载脚本设置为 true）
  var _pdfJsPreloaded = false;
  // PDF 文档缓存：同一 URL 不重复 fetch+parse，命中则秒开
  var _pdfDocCache = {};

  // 动态加载 PDF.js（仅在未预加载时使用）
  function loadPDFJS(pdfUrl) {
    // 预加载已完成，直接渲染
    if ((_pdfJsPreloaded || window._pdfJsPreloaded) && typeof pdfjsLib !== 'undefined') {
      renderPDF(pdfUrl);
      return;
    }
    // 已动态加载过，直接渲染
    if (typeof pdfjsLib !== 'undefined') {
      renderPDF(pdfUrl);
      return;
    }
    var script = document.createElement('script');
    script.src = (BASE ? BASE + '/' : '') + 'pdf.min.js';
    script.onload = function () {
      console.log('[PDF] pdf.min.js 加载成功');
      // 指向本地同源 worker 文件
      pdfjsLib.GlobalWorkerOptions.workerSrc = (BASE ? BASE + '/' : '') + 'pdf.worker.min.js';
      renderPDF(pdfUrl);
    };
    script.onerror = function () {
      showPDFError(t('pdf_error'));
    };
    document.head.appendChild(script);
  }

  // PDF.js 全局变量（保存当前 PDF 状态）
  var _pdfDoc = null;
  var _pdfPage = 1;
  var _pdfTotal = 1;
  var _pdfScale = 1.5;

  // 渲染 PDF（带缓存：同一 URL 命中缓存则直接渲染，不重复 fetch+parse）
  function renderPDF(pdfUrl) {
    var loadingEl = document.getElementById('pdf-loading');
    var canvas = document.getElementById('pdf-canvas');

    if (typeof pdfjsLib === 'undefined') {
      showPDFError(t('pdf_error'));
      return;
    }

    // 检查缓存：同一 PDF 不重复解析，命中则秒开
    if (_pdfDocCache[pdfUrl]) {
      console.log('[PDF] 命中缓存:', pdfUrl);
      _pdfDoc = _pdfDocCache[pdfUrl];
      _pdfTotal = _pdfDoc.numPages;
      _pdfPage = 1;
      if (loadingEl) loadingEl.style.display = 'none';
      if (canvas) canvas.style.display = 'block';
      renderPDFPage(_pdfPage);
      return;
    }

    // 显示加载中
    if (loadingEl) {
      loadingEl.textContent = t('pdf_loading');
      loadingEl.style.cssText = 'color:var(--muted);font-size:.92rem;text-align:center;padding:3rem';
      loadingEl.style.display = 'block';
    }
    if (canvas) canvas.style.display = 'none';

    // 用 fetch 加载 PDF 为 ArrayBuffer，绕过 worker 的跨域问题
    fetch(pdfUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.arrayBuffer();
      })
      .then(function (buf) {
        console.log('[PDF] fetch 成功，buffer 大小:', buf.byteLength);
        return pdfjsLib.getDocument({ data: buf }).promise;
      })
      .then(function (pdf) {
        console.log('[PDF] 解析成功，页数:', pdf.numPages);
        _pdfDoc = pdf;
        _pdfTotal = pdf.numPages;
        _pdfPage = 1;

        // 缓存解析后的 PDF 对象（同一 URL 再次打开直接用，不重复 fetch+parse）
        _pdfDocCache[pdfUrl] = pdf;

        if (loadingEl) loadingEl.style.display = 'none';
        if (canvas) canvas.style.display = 'block';

        renderPDFPage(_pdfPage);
      })
      .catch(function (err) {
        console.error('[PDF] 加载失败:', err);
        showPDFError(t('pdf_error') + ': ' + (err.message || err.name || '未知错误'));
      });
  }

  // 显示错误
  function showPDFError(msg) {
    var loadingEl = document.getElementById('pdf-loading');
    if (loadingEl) {
      loadingEl.textContent = '❌ ' + msg;
      loadingEl.style.display = 'block';
      loadingEl.style.color = 'var(--err)';
      loadingEl.style.fontSize = '1rem';
      // 移除旋转动画，避免和错误状态混淆
      loadingEl.style.cssText = 'color:var(--err);font-size:1rem;text-align:center;padding:3rem;background:none';
    }
  }

  // 渲染指定页
  function renderPDFPage(pageNum) {
    var canvas = document.getElementById('pdf-canvas');
    var pageInfo = document.getElementById('pdf-page-info');
    var prevBtn = document.getElementById('pdf-prev');
    var nextBtn = document.getElementById('pdf-next');

    if (!_pdfDoc || !canvas) return;

    _pdfDoc.getPage(pageNum).then(function (page) {
      var viewport = page.getViewport({ scale: _pdfScale });
      var context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      var renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      page.render(renderContext);

      // 更新页码显示
      window._pdfPage = pageNum;
      window._pdfTotal = _pdfTotal;
      if (pageInfo) {
        if (currentLang === 'en') {
          pageInfo.textContent = pageNum + ' / ' + _pdfTotal;
        } else {
          pageInfo.textContent = '第 ' + pageNum + ' / ' + _pdfTotal + ' 页';
        }
      }
      if (prevBtn) prevBtn.disabled = pageNum <= 1;
      if (nextBtn) nextBtn.disabled = pageNum >= _pdfTotal;
    });
  }

  // 翻页
  window.pdfChangePage = function (delta) {
    var newPage = _pdfPage + delta;
    if (newPage >= 1 && newPage <= _pdfTotal) {
      _pdfPage = newPage;
      renderPDFPage(_pdfPage);
    }
  };

  // 关闭 PDF 弹窗
  window.closePDFModal = function () {
    var modal = document.getElementById('pdf-modal');
    if (modal) modal.classList.remove('show');
    document.removeEventListener('keydown', pdfEscHandler);
  };
  function pdfEscHandler(e) { if (e.key === 'Escape') window.closePDFModal(); }

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
      gridEl.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1;padding:3rem;">' + t('empty_gallery') + '</p>';
      return;
    }

    // 分类
    var cats = [currentLang === 'zh' ? '全部' : 'All'];
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
    renderGalGrid(cats[0]);
  }

  function renderGalGrid(cat) {
    var gridEl = document.getElementById('gallery-grid');
    if (!gridEl) return;
    var allLabel = currentLang === 'zh' ? '全部' : 'All';
    var filtered = cat === allLabel ? _galData : _galData.filter(function (g) { return g.category === cat; });
    if (filtered.length === 0) {
      gridEl.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1;padding:2rem;">' + t('empty_gal_cat') + '</p>';
      return;
    }
    gridEl.innerHTML = filtered.map(function (g) {
      var imgSrc = getImgUrl(g.image_url);
      var img = imgSrc ? '<img src="' + imgSrc + '" alt="' + esc(g.title || '') + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling&&(this.nextElementSibling.style.display=\'flex\')">' : '';
      var ph = !imgSrc ? '<div class="gal-ph">🖼️</div>' : '<div class="gal-ph" style="display:none">🖼️</div>';
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
      el.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1;padding:3rem;">' + t('empty_articles') + '</p>';
      return;
    }
    published.sort(function (a, b) { return new Date(b.updated_at || 0) - new Date(a.updated_at || 0); });
    el.innerHTML = published.map(function (a) {
      var date = new Date(a.updated_at || a.created_at || Date.now()).toLocaleDateString('zh-CN');
      var summary = a.summary || (a.content || '').replace(/[#>*`\[\]\n]/g, '').trim().slice(0, 80) + '…';
      var thumb = a.cover_image
        ? '<img src="' + (a.cover_image.startsWith('http') ? a.cover_image : (BASE ? BASE + '/' + a.cover_image : a.cover_image)) + '" alt="">'
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
      tlEl.innerHTML = '<h3 style="text-align:center;margin-bottom:2rem;font-size:1.4rem;">' + t('timeline_title') + '</h3>' +
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
    window._contactData = contact; // 保存用于语言切换重渲染
    var el = document.getElementById('contact-grid');
    if (!el) return;
    var cards = (contact.cards || []).filter(function (c) { return c.title; });
    if (cards.length === 0) {
      el.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1;padding:3rem;">' + t('empty_contact') + '</p>';
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
    // 优先从 doc_url 加载文档内容
    if (a.doc_url) {
      content.innerHTML = '<div style="color:var(--muted);font-size:.88rem;">' + t('loading') + '</div>';
      fetchDocContent(a.doc_url, function(docContent) {
        content.innerHTML =
          '<p style="color:var(--muted);font-size:.88rem;">' + date + ' · ' + esc(a.category || '其他') + '</p>' +
          '<h1 style="margin:.6rem 0 1rem;font-size:1.8rem;line-height:1.3">' + esc(a.title) + '</h1>' +
          (tags ? '<div style="margin-bottom:1.5rem;display:flex;gap:.4rem;flex-wrap:wrap;">' + tags + '</div>' : '') +
          (docContent ? md2html(docContent) : '<p style="color:var(--err);">' + t('doc_error') + '</p>');
      });
    } else {
      content.innerHTML =
        '<p style="color:var(--muted);font-size:.88rem;">' + date + ' · ' + esc(a.category || '其他') + '</p>' +
        '<h1 style="margin:.6rem 0 1rem;font-size:1.8rem;line-height:1.3">' + esc(a.title) + '</h1>' +
        (tags ? '<div style="margin-bottom:1.5rem;display:flex;gap:.4rem;flex-wrap:wrap;">' + tags + '</div>' : '') +
        md2html(a.content || '');
    }
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  // 加载外部文档内容
  function fetchDocContent(docUrl, callback) {
    var fullUrl = (docUrl.startsWith('http') ? '' : BASE + '/') + docUrl;
    fetch(fullUrl)
      .then(function(r) { return r.text(); })
      .then(function(text) { callback(text); })
      .catch(function() { callback(null); });
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
    img.src = getImgUrl(item.image_url);
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
  // Markdown → HTML（使用 marked.js）
  // ===========================
  function md2html(text) {
    if (!text) return '';
    if (typeof marked === 'undefined') {
      console.error('marked.js 未加载');
      return '<pre>' + esc(text) + '</pre>';
    }
    var html = marked.parse(text, { breaks: true, gfm: true });
    // 所有链接新窗口打开
    html = html.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
    return html;
  }

  // ===========================
  // 工具函数
  // ===========================
  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();
