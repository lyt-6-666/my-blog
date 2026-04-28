// index.js - Dynamic blog content loader from local API
(function() {
    'use strict';

    var API_BASE = '/api';

    // Scroll progress & back to top
    window.addEventListener('scroll', function() {
        var el = document.getElementById('scrollProgress');
        if (el) el.style.width = (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + '%';
        var btn = document.getElementById('backToTop');
        if (btn) btn.classList.toggle('visible', window.scrollY > 300);
    });
    document.getElementById('backToTop') && (document.getElementById('backToTop').onclick = function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Intersection Observer for fade-in
    var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });

    // Load all data in parallel
    function init() {
        Promise.all([
            fetch(API_BASE + '/config.json').then(function(r) { return r.ok ? r.json() : {}; }),
            fetch(API_BASE + '/hero.json').then(function(r) { return r.ok ? r.json() : {}; }),
            fetch(API_BASE + '/projects.json').then(function(r) { return r.ok ? r.json() : []; }),
            fetch(API_BASE + '/gallery.json').then(function(r) { return r.ok ? r.json() : []; }),
            fetch(API_BASE + '/articles.json').then(function(r) { return r.ok ? r.json() : []; }),
            fetch(API_BASE + '/about.json').then(function(r) { return r.ok ? r.json() : {}; }),
            fetch(API_BASE + '/contact.json').then(function(r) { return r.ok ? r.json() : {}; })
        ]).then(function(results) {
            var cfg = results[0], hero = results[1], projects = results[2];
            var gallery = results[3], articles = results[4];
            var about = results[5], contact = results[6];

            // Page title & logo
            if (cfg.site) {
                document.title = cfg.site.title || '我的博客';
                document.getElementById('nav-logo').textContent = cfg.site.logo || '我的博客';
                document.getElementById('footer-text').innerHTML = cfg.site.footer_bottom || '&copy; 2026';
            }

            // Hero
            var heroTitle = document.getElementById('hero-title');
            if (heroTitle) {
                heroTitle.innerHTML = (hero.headline_1 || '') + ' <span class="highlight">' + (hero.headline_2 || '') + '</span> ' + (hero.headline_3 || '') + ' ' + (hero.headline_4 || '');
            }
            var badge = document.getElementById('hero-badge');
            if (badge && hero.badge) badge.innerHTML = '<span class="dot"></span>' + hero.badge;
            var heroSubtitle = document.getElementById('hero-subtitle');
            if (heroSubtitle && hero.description) heroSubtitle.textContent = hero.description;
            var statsEl = document.getElementById('hero-stats');
            if (statsEl && hero.stats && hero.stats.length > 0) {
                statsEl.innerHTML = hero.stats.map(function(s) {
                    return '<div class="stat-item"><div class="stat-number">' + s.number + (s.suffix || '') + '</div><div class="stat-label">' + s.label + '</div></div>';
                }).join('');
            }
            var actionsEl = document.getElementById('hero-actions');
            if (actionsEl) {
                var btns = [];
                if (hero.btn_1_text) btns.push('<a href="' + (hero.btn_1_link || '#') + '" class="btn btn-primary">' + hero.btn_1_text + '</a>');
                if (hero.btn_2_text) btns.push('<a href="' + (hero.btn_2_link || '#') + '" class="btn btn-outline">' + hero.btn_2_text + '</a>');
                actionsEl.innerHTML = btns.join('');
            }

            // Projects
            var projGrid = document.getElementById('projects-grid');
            if (projGrid && Array.isArray(projects)) {
                if (projects.length === 0) {
                    projGrid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">暂无作品</p>';
                } else {
                    projects.sort(function(a, b) { return (a.order || 99) - (b.order || 99); });
                    projGrid.innerHTML = projects.map(function(p) {
                        var tags = (p.tags || []).slice(0, 3).map(function(t) { return '<span class="project-tag">' + t + '</span>'; }).join('');
                        return '<div class="project-card fade-in">' +
                            '<div class="project-thumb" style="background:' + (p.gradient || 'var(--gradient-1)') + ';">' +
                            '<span style="font-size:4rem;">' + (p.emoji || '📦') + '</span></div>' +
                            '<div class="project-info"><h3>' + p.title + '</h3>' +
                            '<p>' + (p.description || '') + '</p>' +
                            '<div class="project-tags">' + tags + '</div>' +
                            '<a href="' + (p.link || '#') + '" class="project-link">查看详情 →</a></div></div>';
                    }).join('');
                    projGrid.querySelectorAll('.fade-in').forEach(function(el) { io.observe(el); });
                }
            }

            // Gallery
            var galGrid = document.getElementById('gallery-grid');
            var galFilters = document.getElementById('gallery-filters');
            var galData = gallery || [];
            if (galData.length === 0) {
                if (galGrid) galGrid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">暂无图片</p>';
            } else {
                var categories = ['All'];
                galData.forEach(function(g) { if (categories.indexOf(g.category) < 0) categories.push(g.category); });
                if (galFilters) {
                    galFilters.innerHTML = categories.map(function(c, i) {
                        return '<button class="filter-btn' + (i === 0 ? ' active' : '') + '" onclick="filterGallery(\'' + c + '\')">' + c + '</button>';
                    }).join('');
                }
                window._galData = galData;
                if (galGrid) renderGallery('All');
            }

            // Articles
            var artGrid = document.getElementById('articles-grid');
            if (artGrid) {
                var published = (articles || []).filter(function(a) { return a.published !== false; });
                if (published.length === 0) {
                    artGrid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">暂无文章</p>';
                } else {
                    published.sort(function(a, b) { return new Date(b.updated_at || 0) - new Date(a.updated_at || 0); });
                    artGrid.innerHTML = published.map(function(a) {
                        var date = new Date(a.updated_at || a.created_at || Date.now()).toLocaleDateString('zh-CN');
                        var summary = a.summary || (a.content || '').replace(/[#>*`\n]/g, '').slice(0, 80) + '...';
                        return '<article class="article-card fade-in" style="cursor:pointer" onclick="openArticle(\'' + a.id + '\')">' +
                            '<div class="article-thumb"><span style="position:relative;z-index:1;font-size:2.5rem;">📄</span></div>' +
                            '<div class="article-body"><div class="article-meta"><span class="cat">' + (a.category || '其他') + '</span><span>' + date + '</span></div>' +
                            '<h3>' + a.title + '</h3><p>' + summary + '</p></div></article>';
                    }).join('');
                    artGrid.querySelectorAll('.fade-in').forEach(function(el) { io.observe(el); });
                }
            }

            // About
            var aboutEl = document.getElementById('about-content');
            if (aboutEl && about && about.title) {
                var html = '<div class="about-avatar-wrapper"><div class="about-avatar">' + (about.avatar || '👤') + '</div></div>';
                html += '<div class="about-text">';
                html += '<h3>' + about.title + '</h3>';
                if (about.subtitle) html += '<p style="color:var(--accent);margin-bottom:1rem;">' + about.subtitle + '</p>';
                if (about.paragraphs && about.paragraphs.length > 0) {
                    about.paragraphs.forEach(function(p) { html += '<p>' + p + '</p>'; });
                }
                if (about.skills && about.skills.length > 0) {
                    html += '<div class="skills">';
                    about.skills.forEach(function(s) { html += '<span class="skill-tag">' + s + '</span>'; });
                    html += '</div>';
                }
                html += '</div>';
                if (about.timeline && about.timeline.length > 0) {
                    html += '<div class="section"><h3 style="margin-bottom:1.5rem;">经历</h3><div class="timeline">';
                    about.timeline.forEach(function(t) {
                        html += '<div class="timeline-item fade-in"><div class="timeline-dot"></div>' +
                            '<div class="timeline-content"><span class="timeline-year">' + (t.year || '') + '</span>' +
                            '<h4>' + (t.title || '') + '</h4><p>' + (t.description || '') + '</p></div></div>';
                    });
                    html += '</div></div>';
                }
                aboutEl.innerHTML = html;
                aboutEl.querySelectorAll('.fade-in').forEach(function(el) { io.observe(el); });
            }

            // Contact
            var contactEl = document.getElementById('contact-grid');
            if (contactEl && contact.cards && contact.cards.length > 0) {
                contactEl.innerHTML = contact.cards.map(function(c) {
                    return '<div class="contact-card fade-in"><div class="contact-icon">' + (c.icon || '📧') + '</div>' +
                        '<div><h4>' + (c.title || '') + '</h4><p>' + (c.value || '') + '</p></div></div>';
                }).join('');
                contactEl.querySelectorAll('.fade-in').forEach(function(el) { io.observe(el); });
            } else if (contactEl) {
                contactEl.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;padding:2rem;">暂无联系方式</p>';
            }

            // Nav active state
            var sections = document.querySelectorAll('section[id]');
            window.addEventListener('scroll', function() {
                var cur = '';
                sections.forEach(function(s) {
                    if (window.scrollY >= s.offsetTop - 100) cur = s.getAttribute('id');
                });
                document.querySelectorAll('.nav-links a').forEach(function(a) {
                    a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
                });
            });

        }).catch(function(err) {
            console.error('Failed to load data:', err);
        });
    }

    // Gallery filter
    window.filterGallery = function(cat) {
        document.querySelectorAll('.filter-btn').forEach(function(b) {
            b.classList.toggle('active', b.textContent === cat);
        });
        renderGallery(cat);
    };

    function renderGallery(cat) {
        var galGrid = document.getElementById('gallery-grid');
        if (!galGrid || !window._galData) return;
        var filtered = cat === 'All' ? window._galData : window._galData.filter(function(g) { return g.category === cat; });
        if (filtered.length === 0) {
            galGrid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;grid-column:1/-1;">该分类暂无图片</p>';
            return;
        }
        galGrid.innerHTML = filtered.map(function(g) {
            return '<div class="gallery-item fade-in" onclick="openGalleryItem(\'' + g.id + '\')">' +
                '<img src="' + (g.image_url || '') + '" alt="' + (g.title || '') + '" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=img-placeholder>🖼️</div><div class=gallery-overlay><h4>' + (g.title || '') + '</h4></div>\'">' +
                '<div class="gallery-overlay"><h4>' + (g.title || '') + '</h4><p>' + (g.description || '') + '</p></div></div>';
        }).join('');
        galGrid.querySelectorAll('.fade-in').forEach(function(el) { io.observe(el); });
    }

    // Gallery modal
    window.openGalleryItem = function(id) {
        var item = window._galData.find(function(g) { return g.id === id; });
        if (!item) return;
        var lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = '<button class="lightbox-close" onclick="this.closest(\'.lightbox\').classList.remove(\'show\')">×</button>' +
            '<img src="' + (item.image_url || '') + '" alt="' + (item.title || '') + '">' +
            '<div class="lightbox-caption"><strong>' + (item.title || '') + '</strong>' + (item.description ? '<br>' + item.description : '') + '</div>';
        lightbox.onclick = function(e) { if (e.target === lightbox) lightbox.classList.remove('show'); };
        document.body.appendChild(lightbox);
        lightbox.classList.add('show');
    };

    // Article modal
    window.openArticle = function(id) {
        fetch(API_BASE + '/articles.json').then(function(r) { return r.json(); }).then(function(data) {
            var a = data.find(function(item) { return item.id === id; });
            if (!a) return;
            var modal = document.getElementById('articleModal');
            var content = document.getElementById('article-content');
            var date = new Date(a.updated_at || a.created_at || Date.now()).toLocaleDateString('zh-CN');
            content.innerHTML = '<div style="max-width:800px;margin:0 auto;padding:2rem;">' +
                '<span style="color:var(--text-muted);font-size:0.9rem;">' + date + ' · ' + (a.category || '其他') + '</span>' +
                '<h1 style="margin:1rem 0;font-size:2rem;">' + a.title + '</h1>' +
                '<div style="color:var(--text-secondary);line-height:1.8;">' + simpleMarkdown(a.content || '') + '</div></div>';
            modal.classList.add('show');
        });
    };

    window.closeArticle = function() {
        document.getElementById('articleModal').classList.remove('show');
    };

    // Simple markdown to HTML
    function simpleMarkdown(text) {
        if (!text) return '';
        return text
            .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:#1e1e2e;color:#cdd6f4;padding:1rem;border-radius:8px;overflow-x:auto;"><code>$2</code></pre>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code style="background:#f0f0f0;padding:2px 6px;border-radius:4px;">$1</code>')
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:1rem 0;">')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--accent);">$1</a>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul style="margin:1rem 0;padding-left:1.5rem;">$1</ul>')
            .replace(/\n\n/g, '</p><p style="margin:1rem 0;">');
    }

    // Close modal on escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeArticle();
            document.querySelectorAll('.lightbox').forEach(function(m) { m.classList.remove('show'); });
        }
    });

    init();
})();
