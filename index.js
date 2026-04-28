// index.js - Dynamic blog content loader from GitHub CDN
(function() {
    'use strict';

    var CFG = window.CFG || { CDN: 'https://cdn.jsdelivr.net/gh/LYT-6-666/my-blog@main' };

    // Scroll progress & back to top
    window.addEventListener('scroll', function() {
        var el = document.getElementById('scrollProgress');
        if (el) el.style.width = (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + '%';
        var btn = document.getElementById('backToTop');
        if (btn) btn.style.display = window.scrollY > 300 ? 'block' : 'none';
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
            fetch(CFG.CDN + '/config.json').then(function(r) { return r.json(); }),
            fetch(CFG.CDN + '/hero.json').then(function(r) { return r.json(); }),
            fetch(CFG.CDN + '/projects.json').then(function(r) { return r.json(); }),
            fetch(CFG.CDN + '/gallery.json').then(function(r) { return r.json(); }),
            fetch(CFG.CDN + '/articles.json').then(function(r) { return r.json(); }),
            fetch(CFG.CDN + '/about.json').then(function(r) { return r.json(); }),
            fetch(CFG.CDN + '/contact.json').then(function(r) { return r.json(); })
        ]).then(function(results) {
            var cfg = results[0], hero = results[1], projects = results[2];
            var gallery = results[3], articles = results[4];
            var about = results[5], contact = results[6];

            // Page title & logo
            document.getElementById('page-title').textContent = cfg.siteName || 'My Blog';
            document.getElementById('nav-logo').textContent = cfg.logo || cfg.siteName || 'My Blog';
            document.getElementById('footer-text').innerHTML = cfg.footer || '&copy; 2024 All rights reserved.';

            // Hero
            document.getElementById('hero-title').textContent = hero.title || '';
            document.getElementById('hero-subtitle').textContent = hero.subtitle || '';
            var badge = document.getElementById('hero-badge');
            if (badge && hero.badge) badge.textContent = hero.badge;
            var tagsEl = document.getElementById('hero-tags');
            if (tagsEl && hero.tags) {
                tagsEl.innerHTML = hero.tags.map(function(t) { return '<span class="tag">' + t + '</span>'; }).join('');
            }
            var statsEl = document.getElementById('hero-stats');
            if (statsEl && hero.stats) {
                statsEl.innerHTML = hero.stats.map(function(s) {
                    return '<div class="stat"><span class="stat-value">' + s.value + '</span><span class="stat-label">' + s.label + '</span></div>';
                }).join('');
            }
            var actionsEl = document.getElementById('hero-actions');
            if (actionsEl && hero.actions) {
                actionsEl.innerHTML = hero.actions.map(function(a) {
                    var cls = a.primary ? 'btn btn-primary' : 'btn btn-outline';
                    return '<a href="' + (a.href || '#') + '" class="' + cls + '">' + a.text + '</a>';
                }).join('');
            }
            var heroBg = document.getElementById('hero-bg');
            if (heroBg && hero.background) {
                heroBg.style.backgroundImage = 'url(' + hero.background + ')';
            }

            // Projects
            var projGrid = document.getElementById('projects-grid');
            if (projGrid) {
                var catEmoji = { 'CAD': '\ud83d\udccad', 'Web': '\ud83d\udcbb', 'Tool': '\ud83d\udd27', 'Other': '\ud83d\udcda' };
                var catColor = { 'CAD': '#6366f1', 'Web': '#10b981', 'Tool': '#f59e0b', 'Other': '#8b5cf6' };
                projGrid.innerHTML = projects.map(function(p) {
                    var color = catColor[p.category] || '#6366f1';
                    var emoji = catEmoji[p.category] || '\ud83d\udcc4';
                    var tags = (p.tags || []).slice(0, 3).map(function(t) { return '<span class="tag">' + t + '</span>'; }).join('');
                    return '<div class="project-card fade-in">' +
                        '<div class="project-thumb" style="background:' + color + '20;">' +
                        '<span style="font-size:3rem;">' + emoji + '</span></div>' +
                        '<div class="project-info"><h3>' + p.name + '</h3>' +
                        '<p>' + p.description + '</p>' +
                        '<div class="project-tags">' + tags + '</div>' +
                        '<div class="project-links">' +
                        (p.github ? '<a href="' + p.github + '" target="_blank" class="project-link">GitHub</a>' : '') +
                        (p.demo ? '<a href="' + p.demo + '" target="_blank" class="project-link">Demo</a>' : '') +
                        '</div></div></div>';
                }).join('');
                projGrid.querySelectorAll('.fade-in').forEach(function(el) { io.observe(el); });
            }

            // Gallery
            var galGrid = document.getElementById('gallery-grid');
            var galFilters = document.getElementById('gallery-filters');
            var galData = gallery || [];
            var categories = ['All'];
            galData.forEach(function(g) { if (categories.indexOf(g.category) < 0) categories.push(g.category); });
            if (galFilters) {
                galFilters.innerHTML = categories.map(function(c, i) {
                    return '<button class="filter-tab' + (i === 0 ? ' active' : '') + '" onclick="filterGallery(\'' + c + '\')">' + c + '</button>';
                }).join('');
            }
            window._galData = galData;
            if (galGrid) renderGallery('All');

            // Articles
            var artGrid = document.getElementById('articles-grid');
            if (artGrid) {
                var published = articles.filter(function(a) { return a.published !== false; });
                var catE = { 'Tech': '\ud83d\udcd6', 'Tutorial': '\ud83d\udcd8', 'Notes': '\ud83d\udcdd', 'Other': '\ud83d\udcd4' };
                var catC = { 'Tech': '#6366f1', 'Tutorial': '#10b981', 'Notes': '#f59e0b', 'Other': '#8b5cf6' };
                artGrid.innerHTML = published.map(function(a) {
                    var color = catC[a.category] || '#6366f1';
                    var emoji = catE[a.category] || '\ud83d\udcd4';
                    var date = new Date(a.updated_at || a.created_at || Date.now()).toLocaleDateString('zh-CN');
                    var summary = a.summary || (a.content || '').replace(/[#>*`\n]/g, '').slice(0, 80) + '...';
                    return '<article class="article-card fade-in" style="cursor:pointer" onclick="openArticle(\'' + a.id + '\')">' +
                        '<div class="article-thumb" style="background:none;position:relative;overflow:hidden;">' +
                        '<div style="width:100%;height:100%;background:linear-gradient(135deg,' + color + ',' + color + '88);display:flex;align-items:center;justify-content:center;font-size:2.5rem;">' + emoji + '</div></div>' +
                        '<div class="article-body"><div class="article-meta"><span class="cat">' + a.category + '</span><span>' + date + '</span></div>' +
                        '<h3>' + a.title + '</h3><p>' + summary + '</p></div></article>';
                }).join('');
                artGrid.querySelectorAll('.fade-in').forEach(function(el) { io.observe(el); });
            }

            // About
            var aboutEl = document.getElementById('about-content');
            if (aboutEl && about) {
                var html = '<div class="about-intro"><p>' + (about.intro || '') + '</p></div>';
                html += '<div class="skills-grid">';
                if (about.skills) {
                    about.skills.forEach(function(s) {
                        html += '<div class="skill-item"><div class="skill-header"><span>' + s.name + '</span><span>' + s.level + '%</span></div>' +
                            '<div class="skill-bar"><div class="skill-progress" style="width:' + s.level + '%;background:' + (s.color || '#6366f1') + ';"></div></div></div>';
                    });
                }
                html += '</div>';
                if (about.timeline) {
                    html += '<div class="timeline">';
                    about.timeline.forEach(function(t) {
                        html += '<div class="timeline-item fade-in"><div class="timeline-dot"></div>' +
                            '<div class="timeline-content"><span class="timeline-date">' + t.date + '</span>' +
                            '<h4>' + t.title + '</h4><p>' + t.description + '</p></div></div>';
                    });
                    html += '</div>';
                }
                aboutEl.innerHTML = html;
                aboutEl.querySelectorAll('.fade-in').forEach(function(el) { io.observe(el); });
            }

            // Contact
            var contactEl = document.getElementById('contact-grid');
            if (contactEl && contact) {
                contactEl.innerHTML = contact.map(function(c) {
                    return '<div class="contact-card fade-in"><div class="contact-icon">' + (c.icon || '\ud83d\udcde') + '</div>' +
                        '<h3>' + c.title + '</h3>' +
                        '<p>' + c.value + '</p>' +
                        (c.link ? '<a href="' + c.link + '" target="_blank" class="contact-link">Visit</a>' : '') + '</div>';
                }).join('');
                contactEl.querySelectorAll('.fade-in').forEach(function(el) { io.observe(el); });
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
        document.querySelectorAll('.filter-tab').forEach(function(b) {
            b.classList.toggle('active', b.textContent === cat);
        });
        renderGallery(cat);
    };

    function renderGallery(cat) {
        var galGrid = document.getElementById('gallery-grid');
        if (!galGrid || !window._galData) return;
        var filtered = cat === 'All' ? window._galData : window._galData.filter(function(g) { return g.category === cat; });
        galGrid.innerHTML = filtered.map(function(g) {
            return '<div class="gallery-item fade-in" onclick="openGalleryItem(\'' + g.id + '\')">' +
                '<img src="' + g.url + '" alt="' + g.title + '" loading="lazy">' +
                '<div class="gallery-overlay"><h4>' + g.title + '</h4><p>' + g.category + '</p></div></div>';
        }).join('');
        galGrid.querySelectorAll('.fade-in').forEach(function(el) { io.observe(el); });
    }

    // Gallery modal
    window.openGalleryItem = function(id) {
        var item = window._galData.find(function(g) { return g.id === id; });
        if (!item) return;
        var modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = 'display:flex;align-items:center;justify-content:center;';
        modal.innerHTML = '<div style="max-width:90vw;max-height:90vh;background:#000;border-radius:8px;overflow:hidden;position:relative;">' +
            '<button onclick="this.closest(\'.modal\').remove()" style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.8);color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;">Close</button>' +
            '<img src="' + item.url + '" style="max-width:100%;max-height:85vh;display:block;">' +
            '<div style="padding:16px;color:#fff;text-align:center;"><h3>' + item.title + '</h3><p>' + (item.description || '') + '</p></div></div>';
        modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
        document.body.appendChild(modal);
    };

    // Article modal
    window.openArticle = function(id) {
        fetch(CFG.CDN + '/articles.json').then(function(r) { return r.json(); }).then(function(data) {
            var a = null;
            for (var i = 0; i < data.length; i++) {
                if (data[i].id === id) { a = data[i]; break; }
            }
            if (!a) return;
            var modal = document.getElementById('articleModal');
            var content = document.getElementById('article-content');
            var date = new Date(a.updated_at || a.created_at || Date.now()).toLocaleDateString('zh-CN');
            content.innerHTML = '<div class="article-full">' +
                '<span class="article-date">' + date + '</span>' +
                '<h1>' + a.title + '</h1>' +
                '<div class="article-body">' + simpleMarkdown(a.content || '') + '</div></div>';
            modal.style.display = 'flex';
        });
    };

    window.closeArticle = function() {
        document.getElementById('articleModal').style.display = 'none';
    };

    // Simple markdown to HTML
    function simpleMarkdown(text) {
        return text
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.+)$/gm, function(m) {
                if (m.startsWith('<')) return m;
                return '<p>' + m + '</p>';
            });
    }

    // Close modal on escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeArticle();
            document.querySelectorAll('.modal').forEach(function(m) { m.style.display = 'none'; });
        }
    });

    init();
})();
