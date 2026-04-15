// ============================================
// CLIC Rotary — Script Principal
// Connecté à ITA-CORE (multi-tenant)
// L'ancien projet Supabase est désormais inutilisé.
// ============================================

let clubsData = [];
let newsData = [];
let actionsData = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Initialisation du client ITA-CORE (défini dans supabase-config.js)
    const supabaseClient = initItaCoreClient();
    const PLATFORM_ID = ITA_CORE_CONFIG.PLATFORM_ID;

    if (!supabaseClient) {
        console.warn('[CLIC Rotary] ⚠️ Client Supabase ITA-CORE non disponible.');
    }

    // --- Smart Page Detection: only fetch what this page needs ---
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const needsClubs   = ['index.html', 'clubs.html', 'club-detail.html', 'actions.html', ''].includes(page);
    const needsActions = ['index.html', 'actions.html', 'action-detail.html', ''].includes(page);
    const needsNews    = ['index.html', 'actualites.html', 'actualite-detail.html', ''].includes(page);

    const fetches = [];
    if (supabaseClient) {
        // Toutes les requêtes filtrent par platform_id (multi-tenant ITA-CORE)
        if (needsClubs)   fetches.push(supabaseClient.from('clubs').select('*').eq('platform_id', PLATFORM_ID).order('name'));
        if (needsActions) fetches.push(supabaseClient.from('actions').select('*, clubs(name)').eq('platform_id', PLATFORM_ID).eq('is_approved', true).order('year', { ascending: false }));
        if (needsNews)    fetches.push(supabaseClient.from('news').select('*').eq('platform_id', PLATFORM_ID).order('created_at', { ascending: false }));
    }

    // Run all needed queries in parallel
    const results = await Promise.all(fetches);
    let idx = 0;
    if (needsClubs)   { 
        clubsData = (results[idx++]?.data || []).sort((a, b) => {
            if (a.type === 'Rotary' && b.type !== 'Rotary') return -1;
            if (a.type !== 'Rotary' && b.type === 'Rotary') return 1;
            return (a.name || '').localeCompare(b.name || '');
        });
    }
    if (needsActions) { actionsData = results[idx++]?.data || []; }
    if (needsNews)    { newsData    = results[idx++]?.data || []; }

    // Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            const icon = mobileToggle.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    // --- DOM Elements ---
    const clubsGrid = document.getElementById('clubs-grid');
    const actionsGrid = document.getElementById('actions-grid');
    const newsGrid = document.getElementById('news-grid');

    // --- CLUB DATA & FILTERING ---
    const searchInput = document.getElementById('search-input');
    const cityFilter = document.getElementById('city-filter');
    const typeFilter = document.getElementById('type-filter');

    window.renderClubs = function(clubs) {
        if (!clubsGrid) return;
        clubsGrid.innerHTML = '';
        if (!clubs || clubs.length === 0) {
            clubsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Aucun club trouvé.</p>';
            return;
        }

        // Sort: Rotary first, then alphabetical
        const sortedClubs = [...clubs].sort((a, b) => {
            if (a.type === 'Rotary' && b.type !== 'Rotary') return -1;
            if (a.type !== 'Rotary' && b.type === 'Rotary') return 1;
            return (a.name || '').localeCompare(b.name || '');
        });

        sortedClubs.forEach(club => {
            const card = document.createElement('div');
            card.className = 'club-card';

            let typeColor = 'var(--color-rotary-blue)';
            let typeBg = 'rgba(0, 93, 170, 0.1)';
            let iconClass = 'fa-cog';

            if (club.type === 'Rotary') {
                typeColor = '#005DAA'; 
                typeBg = 'rgba(0, 93, 170, 0.1)';
                iconClass = 'fa-cog';
            } else if (club.type === 'Rotaract') {
                typeColor = '#D91B5C'; 
                typeBg = 'rgba(217, 27, 92, 0.1)';
                iconClass = 'fa-hands-helping';
            } else if (club.type === 'Interact') {
                typeColor = '#00B5E2'; 
                typeBg = 'rgba(0, 181, 226, 0.1)';
                iconClass = 'fa-seedling';
            }

            card.innerHTML = `
                <div class="club-card-header">
                    <div class="club-type-badge" style="background-color: ${typeBg}; color: ${typeColor};">
                        <i class="fas ${iconClass}"></i> ${club.type}
                    </div>
                    <h3 class="club-name">${club.name}</h3>
                    <p class="club-city"><i class="fas fa-map-marker-alt"></i> ${club.city}</p>
                </div>
                
                <div class="club-card-body">
                    <div class="club-info-grid">
                        <div class="club-info-item">
                            <span class="label">Création</span>
                            <span class="value">${club.creation_date || 'N/A'}</span>
                        </div>
                        <div class="club-info-item">
                            <span class="label">N° RI</span>
                            <span class="value">${club.ri_number || 'N/A'}</span>
                        </div>
                        <div class="club-info-item">
                            <span class="label">Membres</span>
                            <span class="value">${club.members || '0'}</span>
                        </div>
                    </div>

                    <div class="club-meeting-info">
                        <i class="far fa-clock"></i>
                        <div>
                            <strong>Réunion :</strong> ${club.meeting_day || '-'} à ${club.meeting_time || '-'}<br>
                            <span style="font-size: 0.85rem; color: #666;">${club.meeting_place || '-'}</span>
                        </div>
                    </div>
                </div>

                <div class="club-card-footer">
                    <a href="club-detail.html?id=${club.id}" class="btn btn-outline-primary btn-sm btn-block">
                        Voir détails
                    </a>
                </div>
            `;
            clubsGrid.appendChild(card);
        });
    }

    window.filterClubs = function() {
        if (!clubsGrid) return;
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCity = cityFilter ? cityFilter.value : '';
        const selectedType = typeFilter ? typeFilter.value : '';

        const filtered = clubsData.filter(club => {
            const matchSearch = club.name.toLowerCase().includes(searchTerm) || (club.city && club.city.toLowerCase().includes(searchTerm));
            const matchCity = selectedCity === "" || club.city === selectedCity;
            const matchType = selectedType === "" || club.type === selectedType;
            return matchSearch && matchCity && matchType;
        });

        window.renderClubs(filtered);
    };

    if (clubsGrid) {
        // Event Listeners
        if (searchInput) searchInput.addEventListener('input', window.filterClubs);
        if (cityFilter) cityFilter.addEventListener('change', window.filterClubs);
        if (typeFilter) typeFilter.addEventListener('change', window.filterClubs);

        // --- TABS LOGIC ---
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;

                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                btn.classList.add('active');
                document.getElementById(`${target}-tab`).classList.add('active');
            });
        });

        // Trigger Render
        window.renderClubs(clubsData);
    }

    // Club Details Logic
    const urlParams = new URLSearchParams(window.location.search);
    const clubId = urlParams.get('id');

    const clubDetailContainer = document.getElementById('club-detail-container');
    if (clubId && clubDetailContainer) {
        // Find club by ID
        const club = clubsData.find(c => String(c.id) === String(clubId));

        if (club) {
            // Header Info
            setText('club-name', club.name);
            setText('club-type', club.type);
            setText('club-city', club.city);
            setText('club-ri', club.ri_number || 'N/A');

            // Key Stats
            setText('club-creation', club.creation_date || 'N/A');
            setText('club-members', (club.members || '0') + (club.members ? ' membres' : ''));

            // Meeting Info
            setText('club-meeting-day', club.meeting_day || '-');
            setText('club-meeting-time', club.meeting_time || '-');
            setText('club-meeting-place', club.meeting_place || '-');

            // Contact Info
            updateLink('club-email', club.email, 'mailto:' + club.email);
            updateLink('club-phone', club.phone, 'tel:' + (club.phone || '').replace(/\s/g, ''));
            setText('club-phone', club.phone || 'Non renseigné');

            // President
            const presNameEl = document.getElementById('president-name');
            if (club.president && presNameEl) {
                presNameEl.textContent = club.president.name || 'Non renseigné';
                updateLink('president-phone', club.president.phone, 'tel:' + (club.president.phone || '').replace(/\s/g, ''));
                setText('president-phone', club.president.phone || '-');
                updateLink('president-email', club.president.email, 'mailto:' + club.president.email);
                setText('president-email', club.president.email || '-');
            }

            // Secretary
            const secNameEl = document.getElementById('secretary-name');
            if (club.secretary && secNameEl) {
                secNameEl.textContent = club.secretary.name || 'Non renseigné';
                updateLink('secretary-phone', club.secretary.phone, 'tel:' + (club.secretary.phone || '').replace(/\s/g, ''));
                setText('secretary-phone', club.secretary.phone || '-');
            }
        } else {
            clubDetailContainer.innerHTML = '<div class="container" style="padding: 5rem 0; text-align: center;"><h2>Club non trouvé</h2><a href="clubs.html" class="btn btn-primary">Retour à la liste</a></div>';
        }
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function updateLink(id, text, href) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = text || '-';
            el.href = href || '#';
        }
    }

    // ------ ACTIONS DATA & LOGIC ------
    const actionFilterType = document.getElementById('filter-type');
    const actionFilterClub = document.getElementById('filter-club');
    const actionFilterYear = document.getElementById('filter-year');
    const actionFilterStatus = document.getElementById('filter-status');

    window.renderActions = function(actions) {
        if (!actionsGrid) return;
        actionsGrid.innerHTML = '';

        if (!actions || actions.length === 0) {
            actionsGrid.innerHTML = '<p style="text-align:center; width:100%; grid-column:1/-1;">Aucune action trouvée.</p>';
            return;
        }

        actions.forEach(action => {
            const card = document.createElement('div');
            card.className = 'action-card';

            let statusClass = '';
            if (action.status === 'Réalisée') statusClass = 'status-realisee';
            if (action.status === 'En cours') statusClass = 'status-encours';
            if (action.status === 'À venir') statusClass = 'status-avenir';

            // club naming
            const clubName = action.clubs ? action.clubs.name : (action.club_id || 'Rotary Club');
            const imageUrl = action.image || 'https://via.placeholder.com/600x400?text=Pas+d%27image';

            card.innerHTML = `
            <div class="action-image" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center; height: 200px;"> 
                <div class="action-status ${statusClass}">${action.status || 'En cours'}</div>
            </div>
            <div class="action-content">
                <div class="action-meta">
                    <span>${action.year || 'N/A'}</span>
                    <span>${action.location || 'N/A'}</span>
                </div>
                <h3 class="action-title">${action.title}</h3>
                <div class="action-domain">${action.type || '-'}</div>
                <p class="action-club"><i class="fas fa-users"></i> ${clubName}</p>
                
                <div class="action-footer">
                    <a href="action-detail.html?id=${action.id}" class="btn btn-secondary" style="border-color: #ddd; color: #333; padding: 0.5rem 1rem; font-size: 0.9rem;">Voir le projet</a>
                </div>
            </div>
        `;
            actionsGrid.appendChild(card);
        });
    }

    window.filterActions = function() {
        if (!actionsGrid || !actionFilterType || !actionFilterClub || !actionFilterYear || !actionFilterStatus) return;
        const typeVal = actionFilterType.value;
        const clubVal = actionFilterClub.value;
        const yearVal = actionFilterYear.value;
        const statusVal = actionFilterStatus.value;

        const filtered = actionsData.filter(action => {
            const clubName = action.clubs ? action.clubs.name : (action.club_id || '');
            const matchType = typeVal === "" || action.type === typeVal;
            const matchClub = clubVal === "" || clubName === clubVal;
            const matchYear = yearVal === "" || (action.year && action.year.toString() === yearVal);
            const matchStatus = statusVal === "" || action.status === statusVal;
            return matchType && matchClub && matchYear && matchStatus;
        });

        window.renderActions(filtered);
    }

    if (actionsGrid) {
        if (actionFilterClub) {
            clubsData.forEach(club => {
                const opt = document.createElement('option');
                opt.value = club.name;
                opt.textContent = club.name;
                actionFilterClub.appendChild(opt);
            });
        }
        if (actionFilterType) actionFilterType.addEventListener('change', window.filterActions);
        if (actionFilterClub) actionFilterClub.addEventListener('change', window.filterActions);
        if (actionFilterYear) actionFilterYear.addEventListener('change', window.filterActions);
        if (actionFilterStatus) actionFilterStatus.addEventListener('change', window.filterActions);
        
        // Trigger Render
        window.renderActions(actionsData);
    }

    // Action Detail Page Logic
    const actionId = urlParams.get('id');
    const actionDetailContainer = document.getElementById('action-detail-container');

    if (actionId && actionDetailContainer) {
        const action = actionsData.find(a => String(a.id) === String(actionId));
        if (action) {
            document.getElementById('loading-message').style.display = 'none';
            document.getElementById('action-content').style.display = 'block';

            const clubName = action.clubs ? action.clubs.name : (action.club_id || '');

            // Hero image
            const imgEl = document.getElementById('detail-image');
            if (imgEl) imgEl.src = action.image || 'https://via.placeholder.com/1200x500?text=CLIC+Rotary';

            // Title, Club
            setText('detail-title', action.title);
            setText('detail-club', clubName);

            // Hero badges
            const statusEl = document.getElementById('detail-status');
            if (statusEl) statusEl.textContent = action.status || '';

            setText('detail-domain', action.type || '');
            setText('detail-year-text', action.year || '');
            const detailYearEl = document.getElementById('detail-year');
            if (detailYearEl && !action.year) detailYearEl.style.display = 'none';

            // Meta cards
            setText('detail-location', action.location || 'Non précisé');
            setText('detail-date', action.year || 'N/A');
            setText('detail-beneficiaries-short', action.beneficiaries ? action.beneficiaries.substring(0, 30) + (action.beneficiaries.length > 30 ? '...' : '') : 'N/A');
            setText('detail-domain-card', action.type || 'N/A');

            // Description formatting
            let desc = action.description || '';
            
            // Format the "Proposed by" metadata if present
            if (desc.startsWith('[')) {
                const endBracket = desc.indexOf(']');
                if (endBracket > 0) {
                    const meta = desc.substring(0, endBracket + 1);
                    desc = `<span class="desc-by">${meta}</span>` + desc.substring(endBracket + 1);
                }
            }
            
            // Replace text markers with styled headings
            desc = desc.replace('--- PROBLÈME IDENTIFIÉ ---', '<h3 class="desc-heading problem">PROBLÈME IDENTIFIÉ</h3>');
            desc = desc.replace('--- DESCRIPTION ---', '<h3 class="desc-heading description">DESCRIPTION</h3>');

            const descEl = document.getElementById('detail-description');
            if (descEl) descEl.innerHTML = desc;

            // Impact section (show items conditionally)
            if (action.beneficiaries) {
                setText('detail-beneficiaries', action.beneficiaries);
                const li = document.getElementById('li-beneficiaries');
                if (li) li.style.display = 'flex';
            }
            if (action.results) {
                setText('detail-results', action.results);
                const li = document.getElementById('li-results');
                if (li) li.style.display = 'flex';
            }

            // Partners
            if (action.partners) {
                setText('detail-partners', action.partners);
                const card = document.getElementById('partners-card');
                if (card) card.style.display = 'block';
            }

            // Photo gallery (photo2, photo3, photo4)
            const extraPhotos = [action.photo2, action.photo3, action.photo4].filter(Boolean);
            if (extraPhotos.length > 0) {
                const gallerySection = document.getElementById('gallery-section');
                const gallery = document.getElementById('photo-gallery');
                if (gallerySection && gallery) {
                    gallerySection.style.display = 'block';
                    gallery.innerHTML = extraPhotos.map(src => `
                        <div class="photo-gallery-item" onclick="openLightbox('${src}')">
                            <img src="${src}" alt="Photo de l'action" loading="lazy">
                        </div>
                    `).join('');
                }
            }

        } else {
            const loadingEl = document.getElementById('loading-message');
            if (loadingEl) loadingEl.textContent = 'Action non trouvée.';
        }
    }

    // --- NEWS DATA & LOGIC ---
    window.renderNews = function(news) {
        if (!newsGrid) return;
        newsGrid.innerHTML = '';
        if(!news || news.length === 0) {
           newsGrid.innerHTML = '<p style="text-align:center; width:100%; grid-column:1/-1;">Aucune actualité trouvée.</p>';
           return; 
        }
        news.forEach(item => {
            const card = document.createElement('div');
            card.className = 'action-card';
            const imageUrl = item.image || 'https://via.placeholder.com/600x400?text=Actualit%C3%A9';
            // Assume date format is YYYY-MM-DD
            const formattedDate = item.date || new Date().toISOString().split('T')[0];
            card.innerHTML = `
                <div class="action-image" style="height: 200px; overflow: hidden;">
                    <img src="${imageUrl}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="action-status status-avenir" style="background: var(--color-rotary-blue);">${item.category || 'Actualité'}</div>
                </div>
                <div class="action-content">
                    <div class="action-meta">
                        <span>${formattedDate}</span>
                    </div>
                    <h3 class="action-title" style="min-height: auto;">${item.title}</h3>
                    <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1rem; line-height: 1.5;">${item.summary}</p>
                    <div class="action-footer">
                        <a href="actualite-detail.html?id=${item.id}" class="btn btn-secondary" style="border-color: #ddd; color: #333; padding: 0.5rem 1rem; font-size: 0.9rem;">Lire l'article</a>
                    </div>
                </div>
            `;
            newsGrid.appendChild(card);
        });

        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active', 'btn-secondary'));
                filterBtns.forEach(b => {
                    b.style.color = 'var(--color-text-main)';
                    b.style.borderColor = '#ddd';
                });

                btn.classList.add('active');
                btn.style.color = 'var(--color-rotary-blue)';
                btn.style.borderColor = 'var(--color-rotary-blue)';

                const filter = btn.getAttribute('data-filter');
                const cards = newsGrid.children;

                Array.from(cards).forEach(card => {
                    const category = card.querySelector('.action-status').textContent.trim();
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    if (newsGrid) {
        window.renderNews(newsData);
    }

    // --- PRODUCTS: Chargement automatique depuis ITA-CORE ---
    if (typeof loadProducts === 'function') {
        loadProducts().catch(err => {
            console.error('[CLIC Rotary] ⚠️ Erreur chargement produits (non bloquant):', err);
        });
    }

    // Render News Detail
    const newsDetailContainer = document.getElementById('news-detail-container');
    if (newsDetailContainer) {
        const newsId = urlParams.get('id');

        if (newsId) {
            const item = newsData.find(n => String(n.id) === String(newsId));
            if (item) {
                const loadingMsgEl = document.getElementById('loading-message');
                const newsContentEl = document.getElementById('news-content');
                if (loadingMsgEl) loadingMsgEl.style.display = 'none';
                if (newsContentEl) newsContentEl.style.display = 'block';

                setText('detail-category', item.category || 'Actualité');
                setText('detail-date', item.date || new Date().toISOString().split('T')[0]);
                setText('detail-title', item.title);

                const imgEl = document.getElementById('detail-image');
                if (imgEl) imgEl.src = item.image || 'https://via.placeholder.com/800x400?text=Actualit%C3%A9';

                const textEl = document.getElementById('detail-text');
                if (textEl) textEl.innerHTML = item.content; // Use innerHTML for text editor content
            } else {
                const loadingMsgEl = document.getElementById('loading-message');
                if (loadingMsgEl) loadingMsgEl.textContent = 'Article non trouvé.';
            }
        }
    }

});
