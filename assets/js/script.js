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

    // --- INITIALISATION DU MENU MOBILE (Globale pour iOS Safari / Sticky fix) ---
    window.toggleMobileMenu = function() {
        const navLinks = document.getElementById('nav-links');
        const toggleBtn = document.getElementById('mobile-toggle');
        if (navLinks && toggleBtn) {
            navLinks.classList.toggle('active');
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
    };

    // Solution de secours au cas où le onclick inline ne fonctionnerait pas
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#mobile-toggle');
        if (btn && !btn.hasAttribute('onclick')) {
            window.toggleMobileMenu();
        }
    });

    // Fermeture automatique du menu lors du retour arrière (bfcache)
    window.addEventListener('pageshow', () => {
        const navLinks = document.getElementById('nav-links');
        const toggleBtn = document.getElementById('mobile-toggle');
        if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            if (toggleBtn) {
                const icon = toggleBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
    });

    // Fermeture du menu lorsqu'on clique sur un lien (particulièrement utile pour les ancres ou le retour arrière)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            const navLinks = document.getElementById('nav-links');
            const toggleBtn = document.getElementById('mobile-toggle');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (toggleBtn) {
                    const icon = toggleBtn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            }
        });
    });

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

    // --- ACTUALITÉS OFFICIELLES & LOCALES ---
    const defaultNews = [
        {
            id: 1,
            title: "Octobre Rose : Le message de mobilisation de la Présidente du CLIC Rotary Bénin",
            category: "Annonces officielles",
            date: "02 Octobre 2026",
            club: "CLIC Rotary Bénin",
            image: "assets/images/presidenteannonce.jpeg",
            summary: "À l'occasion d'Octobre Rose, la Présidente Princia Bignon HOUNKANRIN rappelle qu'un simple geste peut tout changer : détecté tôt, le cancer du sein guérit dans 9 cas sur 10. Mobilisons-nous ensemble pour faire avancer la prévention.",
            content: `
                <div class="announcement-content">
                    <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(217, 27, 92, 0.1); color: #d91b5c; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 0.95rem; margin-bottom: 2rem;">
                        <i class="fas fa-ribbon"></i> Campagne Octobre Rose 2026
                    </div>

                    <p style="font-size: 1.2rem; font-weight: 600; color: var(--color-text-main); margin-bottom: 1.5rem;">
                        Chères et chers membres, Chers amis,
                    </p>

                    <p style="font-size: 1.1rem; line-height: 1.9; margin-bottom: 1.5rem;">
                        À l'occasion d'<strong>Octobre Rose</strong>, rappelons-nous qu'un simple geste peut tout changer : <strong>détecté tôt, le cancer du sein guérit dans 9 cas sur 10</strong>.
                    </p>

                    <p style="font-size: 1.1rem; line-height: 1.9; margin-bottom: 1.5rem;">
                        En tant que membres du Rotary, notre rôle est d'informer, de soutenir et d'encourager le dépistage autour de nous. Parlez-en à vos proches, arborez le ruban rose et mobilisons-nous ensemble pour faire avancer la prévention.
                    </p>

                    <p style="font-size: 1.15rem; line-height: 1.9; margin-bottom: 2rem; color: #d91b5c; font-weight: 500;">
                        Prenez soin de vous et de ceux que vous aimez.
                    </p>

                    <div style="margin-top: 2.5rem; padding: 1.8rem; background: #fff5f8; border-left: 4px solid #d91b5c; border-radius: 12px; box-shadow: 0 2px 10px rgba(217, 27, 92, 0.05);">
                        <p style="margin: 0; font-size: 1.2rem; font-weight: 700; color: var(--color-text-main);">Princia Bignon HOUNKANRIN</p>
                        <p style="margin: 0.3rem 0 0 0; color: var(--color-rotary-blue); font-weight: 600; font-size: 1rem;">Présidente 2026-2027, CLIC Rotary Bénin</p>
                    </div>
                </div>
            `,
            created_at: "2026-10-02T08:30:00Z"
        },
        {
            id: 6,
            title: "Monde Sans Polio — Votre don, votre impact !",
            category: "Temps forts nationaux",
            date: "24 Septembre 2026",
            club: "District 9103 & Clubs du Bénin",
            image: "assets/images/poliocollecte.jpeg",
            summary: "💉 525 FCFA = 1 dose de vaccin. Contribuer, c’est poser un geste concret pour soutenir la vaccination et participer à la protection de nos enfants contre la poliomyélite.",
            content: `
                <div class="announcement-content">
                    <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(220, 53, 69, 0.1); color: #dc3545; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 0.95rem; margin-bottom: 2rem;">
                        <i class="fas fa-syringe"></i> Journée Mondiale pour l'Éradication de la Polio
                    </div>

                    <h2 style="font-size: 1.4rem; font-weight: 700; color: #005DAA; margin-bottom: 1rem;">
                        MONDE SANS POLIO — VOTRE DON, VOTRE IMPACT !
                    </h2>

                    <p style="font-size: 1.2rem; font-weight: 600; color: #dc3545; margin-bottom: 1.2rem;">
                        💉 525 FCFA = 1 dose de vaccin.
                    </p>

                    <p style="font-size: 1.1rem; line-height: 1.9; margin-bottom: 1.5rem;">
                        Contribuer, c’est poser un geste concret pour soutenir la vaccination et participer à la protection de nos enfants contre la poliomyélite.
                    </p>

                    <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                        <h4 style="margin-top: 0; margin-bottom: 1rem; color: #005DAA; font-size: 1.1rem;">
                            <i class="fas fa-hand-holding-heart"></i> Barème des contributions :
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                            <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #005DAA; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                                <strong style="font-size: 1.2rem; color: #005DAA;">525 F</strong>
                                <p style="margin: 4px 0 0 0; color: #555;">→ 1 dose</p>
                            </div>
                            <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #00B5E2; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                                <strong style="font-size: 1.2rem; color: #00B5E2;">5 250 F</strong>
                                <p style="margin: 4px 0 0 0; color: #555;">→ 10 doses</p>
                            </div>
                            <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #F7A81B; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                                <strong style="font-size: 1.2rem; color: #F7A81B;">26 250 F</strong>
                                <p style="margin: 4px 0 0 0; color: #555;">→ 50 doses</p>
                            </div>
                            <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #dc3545; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                                <strong style="font-size: 1.2rem; color: #dc3545;">52 500 F</strong>
                                <p style="margin: 4px 0 0 0; color: #555;">→ 100 doses</p>
                            </div>
                        </div>
                    </div>

                    <div style="text-align: center; margin: 2.5rem 0;">
                        <a href="https://www.itaarena.com/support/monde-sans-polio" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="font-size: 1.15rem; padding: 0.9rem 2.2rem; border-radius: 30px; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 4px 15px rgba(0, 93, 170, 0.3);">
                            👉 Je contribue maintenant <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>

                    <div style="background: #eef7fc; border-left: 4px solid #005DAA; padding: 1.2rem 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                        <p style="margin: 0; font-size: 1.05rem; line-height: 1.7; color: #111;">
                            🤝 <strong>Et votre contribution ne s’arrête pas là !</strong><br>
                            Une partie de votre contribution vous sera reversée sur votre compte, en tant que contribution au Fonds Polio Plus, pour vous permettre de soutenir davantage cette cause.
                        </p>
                    </div>

                    <div style="background: #fff8eb; border-left: 4px solid #F7A81B; padding: 1.2rem 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                        <p style="margin: 0; font-size: 1.05rem; line-height: 1.7; color: #111;">
                            🎖️ <strong>Badge & Certificat :</strong> Après votre contribution, vous pourrez également télécharger votre badge de soutien et votre certificat de participation.
                        </p>
                    </div>

                    <p style="font-size: 1.15rem; font-weight: 600; line-height: 1.8; color: #005DAA; margin-bottom: 1.5rem;">
                        Chaque don compte. Chaque dose protège. Chaque geste nous rapproche d’un monde sans polio.
                    </p>

                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 1.5rem;">
                        <span style="background: #f1f3f5; color: #495057; padding: 4px 10px; border-radius: 15px; font-size: 0.85rem; font-weight: 500;">#MondeSansPolio</span>
                        <span style="background: #f1f3f5; color: #495057; padding: 4px 10px; border-radius: 15px; font-size: 0.85rem; font-weight: 500;">#EndPolioNow</span>
                        <span style="background: #f1f3f5; color: #495057; padding: 4px 10px; border-radius: 15px; font-size: 0.85rem; font-weight: 500;">#PolioPlus</span>
                        <span style="background: #f1f3f5; color: #495057; padding: 4px 10px; border-radius: 15px; font-size: 0.85rem; font-weight: 500;">#UnMondeSansPolio</span>
                        <span style="background: #f1f3f5; color: #495057; padding: 4px 10px; border-radius: 15px; font-size: 0.85rem; font-weight: 500;">#WorldPolioDay</span>
                        <span style="background: #f1f3f5; color: #495057; padding: 4px 10px; border-radius: 15px; font-size: 0.85rem; font-weight: 500;">#Ouidah2026</span>
                    </div>
                </div>
            `,
            created_at: "2026-09-24T09:00:00Z"
        },
        {
            id: 2,
            title: "Conférence All Africa Rotary Club (AFCD Lomé 2026)",
            category: "Événements",
            date: "28 Février 2026",
            club: "District 9103",
            image: "assets/images/afcd_lome_2026.jpg",
            summary: "Grande rencontre panafricaine des rotariens à Lomé pour échanger sur le leadership, la paix et l'impact des projets communautaires en Afrique.",
            content: `
                <p>La conférence panafricaine AFCD Lomé 2026 a réuni les leaders et membres des clubs Rotary de tout le continent autour des enjeux cruciaux du développement durable, de l'autonomisation des jeunes et du renforcement de la paix.</p>
                <p>La délégation des clubs du Bénin a brillamment représenté le pays avec plusieurs partages d'expériences sur des projets à fort impact social et communautaire.</p>
            `,
            created_at: "2026-02-28T10:00:00Z"
        },
        {
            id: 3,
            title: "Séminaire National sur l'Image Publique du Rotary",
            category: "Temps forts nationaux",
            date: "18 Mars 2026",
            club: "CLIC Rotary Bénin",
            image: "assets/images/seminaire_image_publique_2026.jpg",
            summary: "Formation des responsables communication des clubs pour amplifier la visibilité des actions rotariennes et valoriser l'engagement des bénévoles.",
            content: `
                <p>Organisé par la Commission Image Publique du CLIC Rotary Bénin, ce séminaire interactif a rassemblé les délégués à la communication de plus de 30 clubs du Bénin.</p>
                <p>Au programme : utilisation efficace des médias numériques, relations avec la presse, narration visuelle et cohérence de la marque Rotary pour inspirer de nouveaux membres et donateurs.</p>
            `,
            created_at: "2026-03-18T09:00:00Z"
        },
        {
            id: 4,
            title: "PolioPlus : Mobilisation pour la Journée Nationale de Vaccination",
            category: "Actualités des clubs",
            date: "24 Avril 2026",
            club: "Commission PolioPlus Bénin",
            image: "assets/images/news/polio_vacciner_pour_la_vie.jpg",
            summary: "Les clubs Rotary du Bénin réaffirment leur engagement indéfectible dans la lutte contre la poliomyélite avec de nouvelles campagnes de proximité.",
            content: `
                <p>Dans le cadre de l'initiative mondiale PolioPlus, les rotariens et rotaractiens du Bénin se sont déployés sur le terrain pour accompagner les agents de santé dans les centres de santé et les communautés rurales.</p>
                <p>Chaque enfant vacciné est un pas de plus vers un monde définitivement libéré de la polio. Ensemble, nous continuons de vacciner pour la vie.</p>
            `,
            created_at: "2026-04-24T08:00:00Z"
        },
        {
            id: 5,
            title: "Action Environnement : Restauration et préservation des mangroves",
            category: "Actualités des clubs",
            date: "05 Juin 2026",
            club: "Inter-Clubs Littoral",
            image: "assets/images/news/mangroves.jpeg",
            summary: "Mise en terre de palétuviers et sensibilisation des populations riveraines pour la sauvegarde de la biodiversité côtière.",
            content: `
                <p>À l'occasion de la Journée Mondiale de l'Environnement, les clubs Rotary et Rotaract du Sud-Bénin ont uni leurs forces pour une grande opération de restauration des mangroves dans les zones humides côtières.</p>
                <p>Cette action contribue à freiner l'érosion côtière, à préserver les frayères pour les poissons et à soutenir l'économie des communautés de pêcheurs.</p>
            `,
            created_at: "2026-06-05T07:30:00Z"
        }
    ];

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
    if (needsNews)    { 
        const fetchedNews = results[idx++]?.data || [];
        const combined = [...fetchedNews];
        defaultNews.forEach(dn => {
            if (!combined.some(n => String(n.id) === String(dn.id))) {
                combined.push(dn);
            }
        });
        newsData = combined;
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
            <div class="action-image">
                <div class="img-blur-bg" style="background-image: url('${imageUrl}');"></div>
                <img src="${imageUrl}" alt="${action.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/600x600?text=Image'">
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
            let badgeBg = 'var(--color-rotary-blue)';
            if (item.category === 'Annonces officielles') {
                badgeBg = '#D91B5C';
            } else if (item.category === 'Temps forts nationaux') {
                badgeBg = '#EAA812';
            } else if (item.category === 'Événements') {
                badgeBg = '#00B5E2';
            }

            card.innerHTML = `
                <div class="action-image">
                    <div class="img-blur-bg" style="background-image: url('${imageUrl}');"></div>
                    <img src="${imageUrl}" alt="${item.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/600x600?text=Image'">
                    <div class="action-status status-avenir" style="background: ${badgeBg};">${item.category || 'Actualité'}</div>
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

    // --- HOME NEWS TICKER (Défilement continu) ---
    const newsTickerContainer = document.getElementById('home-news-ticker');
    if (newsTickerContainer && newsData && newsData.length > 0) {
        // Pour un défilement infini sans coupure, on duplique la liste d'actualités exactement 1 fois
        // (Ou plus si on a très peu d'actualités pour remplir l'écran)
        let displayNews = [...newsData];
        while (displayNews.length < 8) {
            displayNews = [...displayNews, ...newsData];
        }
        
        // On crée un set double pour que l'animation translateX(-50%) soit parfaitement fluide
        const tickerNews = [...displayNews, ...displayNews];
        
        tickerNews.forEach((news) => {
            const imageUrl = news.image || 'https://via.placeholder.com/800x800?text=Image';
            const formattedDate = news.date || new Date().toISOString().split('T')[0];
            const summary = news.summary ? (news.summary.length > 80 ? news.summary.substring(0, 80) + '...' : news.summary) : '';
            let badgeBg = 'var(--color-rotary-blue)';
            if (news.category === 'Annonces officielles') {
                badgeBg = '#D91B5C';
            } else if (news.category === 'Temps forts nationaux') {
                badgeBg = '#EAA812';
            } else if (news.category === 'Événements') {
                badgeBg = '#00B5E2';
            }
            
            const cardHtml = `
                <div class="news-ticker-item">
                    <div class="action-card" style="margin: 0; height: 100%; display: flex; flex-direction: column;">
                        <div class="action-image">
                            <div class="img-blur-bg" style="background-image: url('${imageUrl}');"></div>
                            <img src="${imageUrl}" alt="${news.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/600x600?text=Image'">
                            <div class="action-status status-avenir" style="background: ${badgeBg};">${news.category || 'Actualité'}</div>
                        </div>
                        <div class="action-content" style="flex: 1; display: flex; flex-direction: column; padding: 1.2rem;">
                            <div class="action-meta" style="margin-bottom: 0.5rem;">
                                <span>${formattedDate}</span>
                            </div>
                            <h3 class="action-title" style="min-height: auto; font-size: 1.1rem; margin-bottom: 0.5rem;">${news.title}</h3>
                            <p style="color: var(--color-text-muted); font-size: 0.85rem; margin-bottom: 1rem; line-height: 1.4; flex: 1;">${summary}</p>
                            <div class="action-footer" style="margin-top: auto;">
                                <a href="actualite-detail.html?id=${news.id}" class="btn btn-secondary" style="border-color: #ddd; color: #333; padding: 0.4rem 0.8rem; font-size: 0.85rem;">Lire l'article</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            newsTickerContainer.innerHTML += cardHtml;
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

                document.title = `${item.title} - CLIC Rotary Bénin`;

                setText('detail-category', item.category || 'Actualité');
                setText('detail-date', item.date || new Date().toISOString().split('T')[0]);
                setText('detail-title', item.title);
                setText('detail-club', item.club || 'CLIC Rotary Bénin');

                const imgEl = document.getElementById('detail-image');
                if (imgEl) imgEl.src = item.image || 'https://via.placeholder.com/800x400?text=Actualit%C3%A9';
                const imgBlurEl = document.getElementById('detail-image-blur');
                if (imgBlurEl && item.image) imgBlurEl.style.backgroundImage = `url('${item.image}')`;

                const textEl = document.getElementById('detail-text');
                if (textEl) textEl.innerHTML = item.content; // Use innerHTML for text editor content
            } else {
                const loadingMsgEl = document.getElementById('loading-message');
                if (loadingMsgEl) loadingMsgEl.textContent = 'Article non trouvé.';
            }
        }
    }
    // --- STATS ANIMATION (Count-up) ---
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                const statNumbers = document.querySelectorAll('.stat-number.count-up');
                statNumbers.forEach(stat => {
                    const target = +stat.getAttribute('data-target');
                    const pad = stat.getAttribute('data-pad') === 'true';
                    const duration = 2000; // 2 seconds
                    const increment = target / (duration / 16); // ~60 FPS
                    let current = 0;
                    
                    const updateStat = () => {
                        current += increment;
                        if (current < target) {
                            const val = Math.ceil(current);
                            stat.textContent = '+ ' + (pad && val < 10 ? '0' + val : val);
                            requestAnimationFrame(updateStat);
                        } else {
                            stat.textContent = '+ ' + (pad && target < 10 ? '0' + target : target);
                        }
                    };
                    updateStat();
                });
                observer.disconnect(); // Animate only once
            }
        }, { threshold: 0.5 });
        
        observer.observe(statsGrid);
    }

});
