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
            videoBtn = '<a onclick="openVideoPlayer(\'' + src + '\',\'' + esc(p.title) + '\')" class="proj-video-link" style="cursor:pointer"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> 观看视频</a>';
          } else {
            videoBtn = '<a href="' + esc(vidUrl) + '" target="_blank" class="proj-video-link"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> 观看视频</a>';
          }
        }
      }
      // 使用说明按钮
      var docBtn = '';
      if (p.doc_url) {
        docBtn = '<a onclick="openProjectDoc(\'' + esc(p.doc_url) + '\',\'' + esc(p.title) + '\')" class="proj-doc-link"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6zm2-7h8v1.5H8V13zm0 3h5v1.5H8V16z"/></svg> 使用说明</a>';
      }
      // PDF 使用说明按钮
      var pdfBtn = '';
      if (p.pdf_url) {
        pdfBtn = '<a onclick="openProjectPDF(\'' + esc(p.pdf_url) + '\',\'' + esc(p.title) + '\')" class="proj-pdf-link"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg> PDF说明</a>';
      }
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
          '<div class="proj-actions">' +
            (href ? '<a' + href + ' class="proj-link">查看详情 →</a>' : '') +
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
        '<div class="video-modal-header"><span>' + (title || '观看视频') + '</span><button class="video-modal-close" onclick="closeVideoPlayer()">&times;</button></div>' +
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
          '<h2 style="margin-bottom:1rem;font-size:1.4rem">' + esc(title) + ' - 使用说明</h2>' +
          '<div id="doc-modal-loading" style="text-align:center;padding:3rem;color:var(--text2)">加载中...</div>' +
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
          if (loading) loading.textContent = '文档加载失败';
          return;
        }
        content.innerHTML = md2html(text);
        loading.style.display = 'none';
        content.style.display = 'block';
      })
      .catch(function () {
        var loading = document.getElementById('doc-modal-loading');
        if (loading) loading.textContent = '文档加载失败';
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
    if (loadingEl) { loadingEl.textContent = '正在加载 PDF...'; loadingEl.style.display = 'block'; }
    if (pageInfo) pageInfo.textContent = '0 / 0';
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

    // 加载 PDF.js 并渲染
    loadPDFJS('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js', fullPdfUrl);
  };

  // 动态加载 PDF.js
  function loadPDFJS(pdfjsSrc, pdfUrl) {

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
    script.onload = function () {
      // 设置 worker
      if (typeof pdfjsLib !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
      }
      renderPDF(pdfUrl);
    };
    script.onerror = function () {
      showPDFError('PDF.js 加载失败，请检查网络连接');
    };
    document.head.appendChild(script);
  }

  // PDF.js 全局变量（保存当前 PDF 状态）
  var _pdfDoc = null;
  var _pdfPage = 1;
  var _pdfTotal = 1;
  var _pdfScale = 1.5;

  // 渲染 PDF
  function renderPDF(pdfUrl) {
    var loadingEl = document.getElementById('pdf-loading');
    var errorEl = document.getElementById('pdf-error');
    var canvas = document.getElementById('pdf-canvas');

    if (typeof pdfjsLib === 'undefined') {
      showPDFError('PDF.js 未加载，请刷新页面重试');
      return;
    }

    pdfjsLib.getDocument(pdfUrl).promise.then(function (pdf) {
      _pdfDoc = pdf;
      _pdfTotal = pdf.numPages;
      _pdfPage = 1;

      loadingEl.style.display = 'none';
      canvas.style.display = 'block';

      renderPDFPage(_pdfPage);
    }).catch(function (err) {
      console.error('PDF 加载失败:', err);
      showPDFError('PDF 加载失败: ' + (err.message || '未知错误'));
    });
  }

  // 显示错误
  function showPDFError(msg) {
    var loadingEl = document.getElementById('pdf-loading');
    if (loadingEl) {
      loadingEl.textContent = msg;
      loadingEl.style.display = 'block';
      loadingEl.style.color = 'var(--err)';
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
    if (pageInfo) pageInfo.textContent = '第 ' + pageNum + ' / ' + _pdfTotal + ' 页';
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
    // 优先从 doc_url 加载文档内容
    if (a.doc_url) {
      content.innerHTML = '<div style="color:var(--muted);font-size:.88rem;">加载中...</div>';
      fetchDocContent(a.doc_url, function(docContent) {
        content.innerHTML =
          '<p style="color:var(--muted);font-size:.88rem;">' + date + ' · ' + esc(a.category || '其他') + '</p>' +
          '<h1 style="margin:.6rem 0 1rem;font-size:1.8rem;line-height:1.3">' + esc(a.title) + '</h1>' +
          (tags ? '<div style="margin-bottom:1.5rem;display:flex;gap:.4rem;flex-wrap:wrap;">' + tags + '</div>' : '') +
          (docContent ? md2html(docContent) : '<p style="color:var(--err);">文档加载失败</p>');
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
