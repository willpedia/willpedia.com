document.addEventListener("DOMContentLoaded", function () {
    // 1. Buat element loader secara otomatis agar tidak perlu ngetik di HTML
    const loaderHTML = `
        <div id="testiLoader" style="
            display: none; 
            position: fixed; 
            top: 0; left: 0; 
            width: 100%; height: 100%; 
            background: rgba(0, 0, 0, 0.95); 
            z-index: 10000; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            color: #f2f200; 
            font-family: 'Inter', sans-serif;">
            <div style="
                width: 50px; height: 50px; 
                border: 5px solid rgba(242, 242, 0, 0.1); 
                border-left-color: #f2f200; 
                border-radius: 50%; 
                animation: spin-loader 1s linear infinite; 
                margin-bottom: 15px;">
            </div>
            <span style="font-weight: 800; letter-spacing: 2px; text-transform: uppercase; font-size: 14px;">Memuat Testimoni...</span>
            <style>
                @keyframes spin-loader { to { transform: rotate(360deg); } }
            </style>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', loaderHTML);
    const loader = document.getElementById('testiLoader');

    // 2. Ambil semua link yang mengarah ke testimoni.html
    const testiLinks = document.querySelectorAll('a[href="testimoni.html"]');

    testiLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Cek jika saat ini sudah di halaman testimoni
            if (window.location.pathname.includes('testimoni.html') || window.location.href.endsWith('testimoni.html')) {
                e.preventDefault(); // Stop perpindahan halaman
                
                // Tampilkan loading
                loader.style.display = 'flex';

                // Tutup drawer/menu samping (untuk versi Mobile)
                const drawer = document.getElementById('drawer');
                const overlay = document.getElementById('overlay');
                if (drawer) drawer.classList.remove('active');
                if (overlay) overlay.style.display = 'none';

                // Hilangkan loading setelah 1.2 detik
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 1200);
            }
        });
    });
});