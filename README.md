# Block Blast Clone

Sebuah game puzzle web-based yang diinspirasi dari game populer Block Blast. Proyek ini dibuat menggunakan React, TypeScript, dan Tailwind CSS dengan fokus pada performa animasi yang mulus menggunakan GSAP serta memberikan pengalaman bermain yang memuaskan melalui efek suara dan selebrasi confetti.

Live Preview: [https://block-blast-clone-tau.vercel.app/](https://block-blast-clone-tau.vercel.app/)

---

## Fitur Utama

- **Papan Klasik 8x8:** Sistem grid yang responsif untuk perangkat mobile maupun desktop.
- **Sistem Skor:** Skor bertambah setiap menaruh balok (+10) dan menghancurkan baris/kolom (+100 per baris).
- **Animasi Angka Melayang (GSAP):** Efek pop-up skor yang dinamis, membesar, dan memudar ke atas saat balok pecah.
- **Efek Suara Imersif (Audio API):** Efek suara ketukan saat menaruh balok (`place.mp3`) dan suara ledakan saat baris hancur (`pop.mp3`).
- **Selebrasi Combo (Canvas Confetti):** Efek kembang api kertas otomatis muncul ketika pemain berhasil menghancurkan 2 atau lebih baris/kolom sekaligus.
- **Optimasi Performa (Derived State):** Logika penentuan Game Over dihitung secara real-time saat render untuk menghindari cascading render dan menjaga performa tetap stabil.

---

## Tech Stack & Library

Proyek ini dibangun menggunakan kombinasi teknologi berikut:

- **React 18** - Library utama untuk membangun antarmuka komponen.
- **TypeScript** - Memastikan keamanan tipe data dan meminimalkan bug saat pengembangan.
- **Tailwind CSS** - Framework CSS untuk desain UI yang modern dan responsif.
- **Vite** - Build tool cepat untuk pengalaman pengembangan lokal.
- **GSAP & @gsap/react** - Library untuk animasi performa tinggi pada teks skor melayang.
- **Canvas Confetti** - Efek selebrasi visual saat mencapai combo.

---

## Cara Bermain

1. **Pilih Balok:** Klik salah satu dari 3 pilihan balok acak di bagian bawah papan. Balok yang terpilih akan mendapatkan efek bingkai bercahaya kuning.
2. **Tempatkan di Papan:** Arahkan kursor ke area papan 8x8 untuk melihat pratinjau posisi balok:
   - **Hijau:** Posisi valid dan balok bisa ditaruh.
   - **Merah:** Posisi terhalang atau keluar batas papan.
3. **Hancurkan Baris/Kolom:** Isi penuh satu baris horizontal atau satu kolom vertikal secara utuh untuk menghancurkannya dan mengosongkan ruang kembali.
4. **Dapatkan Combo:** Hancurkan lebih dari 1 baris atau kolom secara bersamaan untuk memicu efek Confetti Combo.
5. **Game Over:** Game berakhir jika ketiga balok yang tersedia sudah tidak memiliki ruang yang muat di dalam papan. Klik "Main Lagi" untuk mengulang permainan.

---

## Instalasi & Menjalankan di Lokal

### 1. Clone Repositori
```bash
git clone https://github.com/username-kamu/block_blast_clone.git
cd block_blast_clone
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka alamat yang tertera di terminal (biasanya `http://localhost:5173`).

---

## Struktur Folder

```text
block_blast_clone/
├── public/
│   ├── place.mp3          # Efek suara saat menaruh balok
│   └── pop.mp3            # Efek suara saat baris pecah
├── src/
│   ├── App.tsx            # Komponen utama & seluruh logika game
│   ├── main.tsx           # Entry point aplikasi React
│   └── index.css          # Setup Tailwind CSS directives
├── package.json           # Manifest project & daftar library
└── tsconfig.json          # Konfigurasi TypeScript
```

---