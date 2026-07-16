# AGEST Desk

AGEST Desk, şirket içindeki departmanların birbirlerine destek ve işlem talepleri gönderebilmesi amacıyla geliştirilen bir Help Desk uygulamasıdır.

## Özellikler

- Kullanıcı adı ve şifre ile güvenli giriş
- JWT tabanlı oturum yönetimi
- Departman bazlı yetkilendirme
- Yeni talep oluşturma
- Kendi departmanına talep gönderememe
- Bana gelen talepleri görüntüleme
- Gönderilen talepleri takip etme
- Talep önceliği belirleme
- Bekliyor, İşlemde ve Tamamlandı durum yönetimi
- Talep durumunu önceki aşamaya geri alma
- Hedef departmana otomatik e-posta bildirimi
- Kullanıcıya özel dashboard
- Mobil uyumlu arayüz

## Kullanılan Teknolojiler

### Frontend

- React
- TypeScript
- Umi Max
- Ant Design
- Ant Design Pro Components

### Backend

- Node.js
- Express.js
- MySQL
- JWT
- bcryptjs
- Nodemailer

## Departmanlar

Sistemde başlangıç olarak aşağıdaki departmanlar bulunmaktadır:

- IT
- İnsan Kaynakları
- Depo
- Muhasebe

Departmanlar veritabanından dinamik olarak alınmaktadır.

## Talep Durum Akışı

```text
Bekliyor ⇄ İşlemde ⇄ Tamamlandı