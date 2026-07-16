-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Anamakine: 127.0.0.1
-- Üretim Zamanı: 16 Tem 2026, 10:30:25
-- Sunucu sürümü: 10.4.32-MariaDB
-- PHP Sürümü: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Veritabanı: `help_desk`
--

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `departmanlar`
--

CREATE TABLE `departmanlar` (
  `id` int(11) NOT NULL,
  `ad` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `aktif` tinyint(1) DEFAULT 1,
  `olusturma_tarihi` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

--
-- Tablo döküm verisi `departmanlar`
--

INSERT INTO `departmanlar` (`id`, `ad`, `email`, `aktif`, `olusturma_tarihi`) VALUES
(1, 'IT', 'elifkarakus248@gmail.com', 1, '2026-07-13 14:28:43'),
(2, 'Muhasebe', 'elifkarakus248@gmail.com', 1, '2026-07-13 14:28:43'),
(3, 'Depo', 'elifkarakus248@gmail.com', 1, '2026-07-13 14:28:43'),
(4, 'İnsan Kaynakları', 'elifkarakus248@gmail.com', 1, '2026-07-13 14:28:43');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `kullanicilar`
--

CREATE TABLE `kullanicilar` (
  `id` int(11) NOT NULL,
  `kullanici_adi` varchar(50) NOT NULL,
  `ad` varchar(100) NOT NULL,
  `soyad` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `sifre` varchar(255) NOT NULL,
  `rol` enum('admin','personel','departman_yetkilisi') NOT NULL DEFAULT 'personel',
  `departman_id` int(11) DEFAULT NULL,
  `aktif` tinyint(1) DEFAULT 1,
  `olusturma_tarihi` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

--
-- Tablo döküm verisi `kullanicilar`
--

INSERT INTO `kullanicilar` (`id`, `kullanici_adi`, `ad`, `soyad`, `email`, `sifre`, `rol`, `departman_id`, `aktif`, `olusturma_tarihi`) VALUES
(1, '01EK34', 'Elif', 'IT Kullanıcısı', 'elif.it@helpdesk.local', '$2b$12$3wdpEw9qA3ms8mmZb/XQJ.zriNUBtmawCV6JcyxBLLeEceuu9p8Xu', 'departman_yetkilisi', 1, 1, '2026-07-14 06:00:48'),
(2, '02EK23', 'İK', 'Kullanıcısı', 'ik@helpdesk.local', '$2b$12$499SWlu.0N5JOPLoU4fh1OHCBGAEKjsQcVcOz/uax357MstSTXLZK', 'departman_yetkilisi', 4, 1, '2026-07-14 08:28:21'),
(3, '03EK12', 'Depo', 'Kullanıcısı', 'depo@helpdesk.local', '$2b$12$xxapR36nBPQvQDwbcXUyoOZjcJTrJpWM7Vk0UWQnqADcrwVvha.WS', 'departman_yetkilisi', 3, 1, '2026-07-14 08:28:22'),
(4, '04EK56', 'Muhasebe', 'Kullanıcısı', 'muhasebe@helpdesk.local', '$2b$12$5sBw49VbQ8rwHAOzr.K18eYo1DvozUCXBe8TxWISKbs3lk1bQ9o1a', 'departman_yetkilisi', 2, 1, '2026-07-14 08:28:22');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `talepler`
--

CREATE TABLE `talepler` (
  `id` int(11) NOT NULL,
  `ticket_no` varchar(50) NOT NULL,
  `baslik` varchar(255) NOT NULL,
  `aciklama` text NOT NULL,
  `departman_id` int(11) NOT NULL,
  `oncelik` enum('dusuk','orta','yuksek','kritik') NOT NULL DEFAULT 'orta',
  `durum` enum('bekliyor','islemde','tamamlandi') NOT NULL DEFAULT 'bekliyor',
  `olusturan_kullanici_id` int(11) DEFAULT NULL,
  `atanan_kullanici_id` int(11) DEFAULT NULL,
  `olusturma_tarihi` timestamp NOT NULL DEFAULT current_timestamp(),
  `guncelleme_tarihi` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

--
-- Tablo döküm verisi `talepler`
--

INSERT INTO `talepler` (`id`, `ticket_no`, `baslik`, `aciklama`, `departman_id`, `oncelik`, `durum`, `olusturan_kullanici_id`, `atanan_kullanici_id`, `olusturma_tarihi`, `guncelleme_tarihi`) VALUES
(1, 'TK-2026-00001', 'Bilgisayar ekran sorunu', 'Bilgisayar a�iliyor ancak monit�re g�r�nt� gelmiyor.', 1, 'kritik', 'tamamlandi', NULL, NULL, '2026-07-14 05:18:07', '2026-07-14 08:03:14'),
(2, 'TK-2026-00002', 'Yazıcı bağlantı problemi', 'Muhasebe departmanındaki ağ yazıcısına bağlantı kurulamıyor.', 1, 'yuksek', 'tamamlandi', NULL, NULL, '2026-07-14 05:26:48', '2026-07-14 09:34:13'),
(3, 'TK-2026-00003', 'bilgisayarım mavi ekran', 'bilgisayraım mavi ekran verdi', 1, 'yuksek', 'tamamlandi', NULL, NULL, '2026-07-14 05:31:16', '2026-07-14 05:40:27'),
(4, 'TK-2026-00004', 'kablo', 'kablo lazım', 3, 'orta', 'bekliyor', NULL, NULL, '2026-07-14 06:14:51', '2026-07-14 06:14:51'),
(5, 'TK-2026-00005', 'bilgisayarım açılmıyor', 'açılmıyorrr', 1, 'yuksek', 'tamamlandi', 1, NULL, '2026-07-14 08:07:35', '2026-07-14 08:08:06'),
(6, 'TK-2026-00006', 'sistem', 'sistemde sıkıntı var', 4, 'orta', 'tamamlandi', 1, NULL, '2026-07-14 08:41:42', '2026-07-14 11:38:24'),
(7, 'TK-2026-00007', 'sistem', 'sistemde sıkıntı var', 4, 'orta', 'tamamlandi', 1, NULL, '2026-07-14 08:41:56', '2026-07-14 11:38:22'),
(8, 'TK-2026-00008', 'kutu eksik', 'kutu eksik', 4, 'orta', 'tamamlandi', 3, NULL, '2026-07-14 09:30:36', '2026-07-14 11:38:20'),
(9, 'TK-2026-00009', 'fatura', 'fatura kesimi', 2, 'dusuk', 'tamamlandi', 1, NULL, '2026-07-14 09:35:21', '2026-07-14 09:41:50'),
(10, 'TK-2026-00010', 'bilgisayarım açılmıyor', 'bilgisayarım açılmıyor', 1, 'orta', 'tamamlandi', 4, NULL, '2026-07-14 09:44:40', '2026-07-14 09:49:43'),
(11, 'TK-2026-00011', 'bilgisayarım açılmıyor', 'bilgisayarım açılmıyor', 1, 'kritik', 'tamamlandi', 3, NULL, '2026-07-14 09:54:30', '2026-07-14 10:33:28'),
(12, 'TK-2026-00012', 'klavyem bozuldu', 'klavyem çalışmıyor', 1, 'kritik', 'tamamlandi', 4, NULL, '2026-07-14 11:06:01', '2026-07-14 11:07:03'),
(13, 'TK-2026-00013', 'klavyenin faturası', 'klavyenin faturası', 2, 'orta', 'islemde', 1, NULL, '2026-07-14 11:11:48', '2026-07-14 11:16:55'),
(14, 'TK-2026-00014', 'Bilgisayar sorunu', 'bilgisayarım açılmıyor', 1, 'kritik', 'tamamlandi', 2, NULL, '2026-07-14 11:38:42', '2026-07-16 05:14:27'),
(15, 'TK-2026-00015', 'Bilgisayar sorunu', 'bilgisayarda uygulama açılmıyor', 1, 'dusuk', 'islemde', 2, NULL, '2026-07-14 12:09:32', '2026-07-16 08:21:42'),
(16, 'TK-2026-00016', 'Kullanıcı hesabı veya şifre sorunu', 'şifre oluşturulmamış', 4, 'yuksek', 'islemde', 1, NULL, '2026-07-16 05:57:49', '2026-07-16 05:58:40');

--
-- Dökümü yapılmış tablolar için indeksler
--

--
-- Tablo için indeksler `departmanlar`
--
ALTER TABLE `departmanlar`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ad` (`ad`);

--
-- Tablo için indeksler `kullanicilar`
--
ALTER TABLE `kullanicilar`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `kullanici_adi` (`kullanici_adi`),
  ADD KEY `fk_kullanici_departman` (`departman_id`);

--
-- Tablo için indeksler `talepler`
--
ALTER TABLE `talepler`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ticket_no` (`ticket_no`),
  ADD KEY `fk_talep_departman` (`departman_id`),
  ADD KEY `fk_talep_olusturan` (`olusturan_kullanici_id`),
  ADD KEY `fk_talep_atanan` (`atanan_kullanici_id`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `departmanlar`
--
ALTER TABLE `departmanlar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Tablo için AUTO_INCREMENT değeri `kullanicilar`
--
ALTER TABLE `kullanicilar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Tablo için AUTO_INCREMENT değeri `talepler`
--
ALTER TABLE `talepler`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Dökümü yapılmış tablolar için kısıtlamalar
--

--
-- Tablo kısıtlamaları `kullanicilar`
--
ALTER TABLE `kullanicilar`
  ADD CONSTRAINT `fk_kullanici_departman` FOREIGN KEY (`departman_id`) REFERENCES `departmanlar` (`id`) ON DELETE SET NULL;

--
-- Tablo kısıtlamaları `talepler`
--
ALTER TABLE `talepler`
  ADD CONSTRAINT `fk_talep_atanan` FOREIGN KEY (`atanan_kullanici_id`) REFERENCES `kullanicilar` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_talep_departman` FOREIGN KEY (`departman_id`) REFERENCES `departmanlar` (`id`),
  ADD CONSTRAINT `fk_talep_olusturan` FOREIGN KEY (`olusturan_kullanici_id`) REFERENCES `kullanicilar` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
