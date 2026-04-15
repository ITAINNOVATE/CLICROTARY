// ============================================
// ITA-CORE Supabase Configuration (Multi-Tenant)
// ============================================
// Ce fichier centralise la configuration Supabase
// pour l'architecture multi-tenant ITA-CORE.
// La clé publique (anon) est safe côté client.
// NE JAMAIS exposer la clé secrète (service_role) ici.
// ============================================

const ITA_CORE_CONFIG = Object.freeze({
    SUPABASE_URL: 'https://eqqdjqdbbwmshllqesdt.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcWRqcWRiYndtc2hsbHFlc2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDEwMjcsImV4cCI6MjA5MTc3NzAyN30._DzQtFyU5Hz8trB1b86cxxHarmy5t35kZHdg2_2a4_o',
    PLATFORM_ID: '219dab14-b1e2-4594-834e-e09dd0930b2a', // CLIC Rotary
    PLATFORM_NAME: 'CLIC Rotary'
});

// Client Supabase ITA-CORE (initialisé au chargement)
let itaCoreClient = null;

/**
 * Initialise le client Supabase ITA-CORE.
 * @returns {object|null} Le client Supabase ou null si la lib n'est pas chargée.
 */
function initItaCoreClient() {
    if (itaCoreClient) return itaCoreClient;

    if (typeof supabase === 'undefined' && typeof window.supabase === 'undefined') {
        console.warn('[ITA-CORE] ⚠️ Supabase library not loaded. Products will use fallback data.');
        return null;
    }

    const sb = window.supabase || supabase;
    try {
        itaCoreClient = sb.createClient(
            ITA_CORE_CONFIG.SUPABASE_URL,
            ITA_CORE_CONFIG.SUPABASE_ANON_KEY
        );
        console.log('[ITA-CORE] ✅ Client Supabase initialisé avec succès');
        console.log('[ITA-CORE] 📌 Platform:', ITA_CORE_CONFIG.PLATFORM_NAME, '| ID:', ITA_CORE_CONFIG.PLATFORM_ID);
        return itaCoreClient;
    } catch (error) {
        console.error('[ITA-CORE] ❌ Erreur d\'initialisation du client Supabase:', error);
        return null;
    }
}

/**
 * Récupère les produits depuis ITA-CORE, filtrés par platform_id.
 * @param {object} [options] - Options de requête
 * @param {string} [options.category] - Filtrer par catégorie
 * @param {string} [options.collection] - Filtrer par collection
 * @param {number} [options.limit] - Nombre max de produits
 * @param {string} [options.orderBy='created_at'] - Colonne de tri
 * @param {boolean} [options.ascending=false] - Ordre de tri
 * @returns {Promise<{data: Array, error: object|null}>}
 */
async function fetchProducts(options = {}) {
    const client = initItaCoreClient();
    if (!client) {
        console.warn('[ITA-CORE] ⚠️ Client non disponible, retour de données vides.');
        return { data: [], error: { message: 'Client Supabase non initialisé' } };
    }

    try {
        const {
            category,
            collection,
            limit,
            orderBy = 'created_at',
            ascending = false
        } = options;

        // Construction de la requête avec filtre multi-tenant obligatoire
        let query = client
            .from('products')
            .select('*')
            .eq('platform_id', ITA_CORE_CONFIG.PLATFORM_ID);

        // Filtres optionnels
        if (category) query = query.eq('category', category);
        if (collection) query = query.eq('collection', collection);

        // Tri
        query = query.order(orderBy, { ascending });

        // Limite
        if (limit) query = query.limit(limit);

        console.log(`[ITA-CORE] 🔍 Fetching products for platform: ${ITA_CORE_CONFIG.PLATFORM_NAME}`);
        const { data, error } = await query;

        if (error) {
            console.error('[ITA-CORE] ❌ Erreur fetch products:', error.message);
            return { data: [], error };
        }

        console.log(`[ITA-CORE] ✅ ${data.length} produit(s) chargé(s) pour ${ITA_CORE_CONFIG.PLATFORM_NAME}`);
        return { data, error: null };

    } catch (err) {
        console.error('[ITA-CORE] ❌ Exception lors du fetch:', err);
        return { data: [], error: err };
    }
}

/**
 * Récupère un produit par son ID (vérifie le platform_id pour la sécurité).
 * @param {string} productId - L'ID du produit
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
async function fetchProductById(productId) {
    const client = initItaCoreClient();
    if (!client) {
        return { data: null, error: { message: 'Client Supabase non initialisé' } };
    }

    try {
        const { data, error } = await client
            .from('products')
            .select('*')
            .eq('id', productId)
            .eq('platform_id', ITA_CORE_CONFIG.PLATFORM_ID)
            .single();

        if (error) {
            console.error('[ITA-CORE] ❌ Erreur fetch product by ID:', error.message);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (err) {
        console.error('[ITA-CORE] ❌ Exception:', err);
        return { data: null, error: err };
    }
}
