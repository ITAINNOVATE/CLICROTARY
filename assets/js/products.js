// ============================================
// Products Module — CLIC Rotary × ITA-CORE
// ============================================
// Chargement et affichage des produits depuis
// le backend centralisé ITA-CORE (multi-tenant).
// ============================================

let productsData = [];
let productsLoading = false;
let productsError = null;

/**
 * Charge les produits depuis ITA-CORE au démarrage.
 * Appelé automatiquement dans le DOMContentLoaded.
 */
async function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return; // Pas de section produits sur cette page

    productsLoading = true;
    renderProductsLoading(productsGrid);

    try {
        const { data, error } = await fetchProducts();

        if (error) {
            productsError = error;
            console.warn('[PRODUCTS] ⚠️ Erreur de chargement, affichage du fallback.');
            renderProductsFallback(productsGrid, 'Impossible de charger les produits pour le moment.');
            return;
        }

        productsData = data;

        if (productsData.length === 0) {
            renderProductsFallback(productsGrid, 'Aucun produit disponible pour le moment. Revenez bientôt !');
            return;
        }

        renderProducts(productsGrid, productsData);
    } catch (err) {
        console.error('[PRODUCTS] ❌ Exception:', err);
        renderProductsFallback(productsGrid, 'Une erreur est survenue lors du chargement.');
    } finally {
        productsLoading = false;
    }
}

/**
 * Affiche un état de chargement animé.
 */
function renderProductsLoading(container) {
    container.innerHTML = `
        <div class="products-loading" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
            <div class="loading-spinner" style="
                width: 48px; height: 48px; margin: 0 auto 1.5rem;
                border: 4px solid rgba(0, 93, 170, 0.15);
                border-top-color: var(--color-rotary-blue);
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            "></div>
            <p style="color: var(--color-text-muted); font-size: 1rem;">Chargement des produits...</p>
        </div>
    `;
}

/**
 * Affiche un message fallback élégant (aucun produit ou erreur).
 */
function renderProductsFallback(container, message) {
    container.innerHTML = `
        <div class="products-fallback" style="
            grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem;
            background: linear-gradient(135deg, rgba(0,93,170,0.04), rgba(243,168,33,0.04));
            border-radius: 16px; border: 1px dashed rgba(0,93,170,0.2);
        ">
            <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.6;">🛍️</div>
            <p style="color: var(--color-text-muted); font-size: 1.1rem; max-width: 400px; margin: 0 auto; line-height: 1.6;">
                ${message}
            </p>
        </div>
    `;
}

/**
 * Affiche les produits dans une grille.
 */
function renderProducts(container, products) {
    container.innerHTML = '';

    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = `${index * 0.1}s`;

        const imageUrl = product.image_url || 'assets/images/placeholder-product.png';
        const price = product.price
            ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(product.price)
            : 'Prix sur demande';
        const description = product.description
            ? (product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description)
            : '';

        card.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${imageUrl}" alt="${product.name || 'Produit'}" loading="lazy"
                    onerror="this.src='assets/images/placeholder-product.png'; this.onerror=null;">
                ${product.category ? `<span class="product-badge">${product.category}</span>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name || 'Produit sans nom'}</h3>
                ${description ? `<p class="product-description">${description}</p>` : ''}
                <div class="product-footer">
                    <span class="product-price">${price}</span>
                    ${product.collection ? `<span class="product-collection">${product.collection}</span>` : ''}
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

/**
 * Filtre les produits par catégorie.
 */
function filterProductsByCategory(category) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    if (!category || category === 'all') {
        renderProducts(productsGrid, productsData);
    } else {
        const filtered = productsData.filter(p => p.category === category);
        if (filtered.length === 0) {
            renderProductsFallback(productsGrid, `Aucun produit dans la catégorie "${category}".`);
        } else {
            renderProducts(productsGrid, filtered);
        }
    }
}
