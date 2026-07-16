<p align="center">
  <img src="public/icons/AgestLogo.png" width="220">
</p>

<h1 align="center">AGEST Desk</h1>

<p align="center">
Kurumsal Help Desk & Ticket Yönetim Sistemi
</p>

# AGEST Desk

Şirket içi departmanlar arasında talep oluşturma, takip etme ve yönetme amacıyla geliştirilen Help Desk (Ticket) uygulaması.

---

## Proje Hakkında

AGEST Desk; şirket içerisindeki departmanların birbirlerine destek talepleri gönderebildiği modern bir Help Desk sistemidir.

Kullanıcılar;

- Yeni talep oluşturabilir.
- Gelen talepleri görüntüleyebilir.
- Gönderdiği talepleri takip edebilir.
- Talepleri İşlemde veya Tamamlandı durumuna getirebilir.
- Yanlış yapılan işlemleri geri alabilir.
- Otomatik e-posta bildirimleri alabilir.

---

## Özellikler

- JWT Authentication
- Güvenli kullanıcı girişi
- Rol bazlı yetkilendirme
- Departman bazlı talep yönetimi
- Öncelik sistemi
- Ticket numarası oluşturma
- Bekliyor / İşlemde / Tamamlandı durumları
- Durum geri alma özelliği
- Gelen Talepler ekranı
- Gönderilen Talepler ekranı
- Dashboard
- Otomatik e-posta bildirimi
- Mobil uyumlu arayüz

---

## Kullanılan Teknolojiler

### Frontend

- React
- TypeScript
- Ant Design Pro
- Ant Design
- Umi Max

### Backend

- Node.js
- Express.js
- JWT
- Nodemailer

### Database

- MySQL

---

## Proje Yapısı

```
help-desk
│
├── backend
│   ├── server.js
│   ├── db.js
│   ├── authMiddleware.js
│   ├── mailService.js
│   └── package.json
│
├── database
│   └── help_desk.sql
│
├── public
├── src
├── package.json
└── README.md
```

---

## Kurulum

### 1. Repository'i indir

```bash
git clone https://github.com/elif-ks/agest-desk.git
```

---

### 2. Frontend

```bash
npm install

npm start
```

---

### 3. Backend

```bash
cd backend

npm install

node server.js
```

---

### 4. Veritabanı

database klasörü içerisindeki

```
help_desk.sql
```

dosyasını phpMyAdmin üzerinden içe aktarın.

---

### 5. Ortam Değişkenleri

Backend klasörü içerisine

```
.env
```

dosyası oluşturun.

Örnek yapı:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=help_desk

JWT_SECRET=ornek_jwt_anahtari

MAIL_USER=mail@gmail.com
MAIL_PASSWORD=google_uygulama_parolasi
```

---

## Talep Durum Akışı

```
Bekliyor
     │
     ▼
 İşlemde
     │
     ▼
Tamamlandı

İşlemde → Bekliyor

Tamamlandı → İşlemde
```

---

## Ekran Görüntüleri

Yakında eklenecektir.

---

## Geliştirici

**Elif Karakuş**

GitHub

https://github.com/elif-ks

---

## Lisans

Bu proje eğitim ve staj amacıyla geliştirilmiştir.