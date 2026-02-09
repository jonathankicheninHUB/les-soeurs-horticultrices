/* ============================================================
   CERVEAU ADMIN (admin.js)
   ============================================================ */

const SUPABASE_URL = 'https://afzjgisyaoyygoijizpq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmempnaXN5YW95eWdvaWppenBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NDYxODIsImV4cCI6MjA4NjIyMjE4Mn0.l2VchnS-LzkD34M7dnM9MAEzvoVgewEuTuvS7Kxlo04';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showDashboard();
    } else {
        showLogin();
    }
});

function showLogin() {
    document.getElementById('login-zone').classList.remove('hidden');
    document.getElementById('dashboard-zone').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('login-zone').classList.add('hidden');
    document.getElementById('dashboard-zone').classList.remove('hidden');
}

async function login() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPass').value;
    const msg = document.getElementById('login-msg');

    const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        msg.innerText = "Erreur : " + error.message;
    } else {
        showDashboard();
    }
}

async function logout() {
    await supabase.auth.signOut();
    showLogin();
}

function previewImage() {
    const file = document.getElementById('prodImage').files[0];
    const preview = document.getElementById('imgPreview');
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
}

async function addProduct() {
    const btn = document.querySelector('#dashboard-zone .btn-admin');
    const msg = document.getElementById('dashboard-msg');
    
    const nom = document.getElementById('prodName').value;
    const cat = document.getElementById('prodCat').value;
    const prix = document.getElementById('prodPrice').value;
    const file = document.getElementById('prodImage').files[0];
    const dispo = document.getElementById('prodDispo').checked;

    if (!nom || !prix || !file) {
        msg.innerText = "Remplissez tout.";
        msg.style.color = "red";
        return;
    }

    btn.disabled = true;
    btn.innerText = "Envoi...";

    try {
        const fileName = `produit_${Date.now()}_${file.name.replace(/\s/g, '')}`;
        const { error: imgError } = await supabase.storage
            .from('images-produits')
            .upload(fileName, file);

        if (imgError) throw imgError;

        const { data: { publicUrl } } = supabase.storage
            .from('images-produits')
            .getPublicUrl(fileName);

        const { error: dbError } = await supabase
            .from('produits')
            .insert([{
                nom: nom,
                categorie: cat,
                prix: prix,
                image_url: publicUrl,
                est_disponible: dispo
            }]);

        if (dbError) throw dbError;

        msg.innerText = "Produit ajouté !";
        msg.style.color = "green";
        document.getElementById('prodName').value = "";
        
    } catch (error) {
        console.error(error);
        msg.innerText = "Erreur : " + error.message;
        msg.style.color = "red";
    } finally {
        btn.disabled = false;
        btn.innerText = "Publier";
    }
}