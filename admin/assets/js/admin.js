// Supabase Configuration — ITA-CORE (multi-tenant)
const supabaseUrl = 'https://eqqdjqdbbwmshllqesdt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcWRqcWRiYndtc2hsbHFlc2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDEwMjcsImV4cCI6MjA5MTc3NzAyN30._DzQtFyU5Hz8trB1b86cxxHarmy5t35kZHdg2_2a4_o';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Auth Check (Except on login page)
if (!window.location.pathname.endsWith('login.html')) {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
            window.location.href = 'login.html';
        }
    });
}

// Common Functions
async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
}

function showToast(message, type = 'success') {
    // Simple toast implementation if needed
    alert(message);
}

// Sidebar Navigation (Auto-highlight active page)
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});
