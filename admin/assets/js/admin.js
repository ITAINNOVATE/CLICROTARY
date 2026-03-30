// Supabase Configuration
const supabaseUrl = 'https://acgwbbadiauuuazaltho.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZ3diYmFkaWF1dXVhemFsdGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MDkzMDIsImV4cCI6MjA5MDM4NTMwMn0.zCjbV8gNrbUISxASzTPx82GkjcpkTszADeErytVIb_Y';
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
