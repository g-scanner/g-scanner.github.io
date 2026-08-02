
// Applica il tema istantaneamente (Nessun lampo bianco)
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// Ascolta in tempo reale i cambiamenti del sistema operativo
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    // Cambia in tempo reale SOLO SE l'utente non ha forzato una scelta manuale col bottone
    if (!('theme' in localStorage)) {
        if (e.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
});