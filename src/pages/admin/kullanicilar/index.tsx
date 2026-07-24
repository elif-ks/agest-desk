import {
  Button,
  ConfirmAction,
  type DataTableColumn,
  FormField,
  FormModal,
  Input,
  ManagedDataTable,
  PageHeader,
  PasswordInput,
  Select,
  Switch,
  Tag,
  Text,
  ToastHost,
  toast,
} from '@/components/ui';
import {
  EditIcon,
  KeyIcon,
  PlusIcon,
  ReloadIcon,
} from '@/components/ui/icons';
import { useEffect, useState } from 'react';

type Kullanici = {
  id: number;
  kullaniciAdi: string;
  ad: string;
  soyad: string;
  email: string;
  rol: 'admin' | 'kullanici';
  departmanId: number | null;
  departman: string | null;
  aktif: number | boolean;
};

type Departman = {
  id: number;
  ad: string;
  email?: string;
  aktif: number | boolean;
};

type YeniKullaniciFormu = {
  ad: string;
  soyad: string;
  email: string;
  kullaniciAdi: string;
  sifre: string;
  departmanId: number;
  rol: 'admin' | 'kullanici';
  aktif: boolean;
};

type KullaniciDuzenlemeFormu = {
  ad: string;
  soyad: string;
  email: string;
  kullaniciAdi: string;
  departmanId: number;
  rol: 'admin' | 'kullanici';
  aktif: boolean;
};

type SifreFormu = {
  yeniSifre: string;
  yeniSifreTekrar: string;
};

type TabloAramaDegerleri = {
  arama?: string;
  departmanId?: number;
  rol?: 'admin' | 'kullanici';
  aktif?: 'aktif' | 'pasif';
};

const API_URL = 'http://localhost:5000/api';

export default function KullaniciYonetimi() {
  const [kullanicilar, setKullanicilar] =
    useState<Kullanici[]>([]);

  const [departmanlar, setDepartmanlar] =
    useState<Departman[]>([]);

  const [yukleniyor, setYukleniyor] =
    useState<boolean>(false);

  const [
    yeniKullaniciModalAcik,
    setYeniKullaniciModalAcik,
  ] = useState<boolean>(false);

  const [
    duzenlemeModalAcik,
    setDuzenlemeModalAcik,
  ] = useState<boolean>(false);

  const [
    sifreModalAcik,
    setSifreModalAcik,
  ] = useState<boolean>(false);

  const [
    seciliKullanici,
    setSeciliKullanici,
  ] = useState<Kullanici | null>(null);

  const [aramaDegerleri, setAramaDegerleri] =
    useState<TabloAramaDegerleri>({});
  const [sayfa, setSayfa] =
    useState(1);
  const [sayfaBoyutu, setSayfaBoyutu] =
    useState(10);

  const tokenGetir = () => {
    return localStorage.getItem('helpDeskToken');
  };

  const hataMesajiGetir = (
    error: unknown,
    varsayilanMesaj: string,
  ) => {
    return error instanceof Error
      ? error.message
      : varsayilanMesaj;
  };

  const kullanicilariGetir = async () => {
    setYukleniyor(true);

    try {
      const token = tokenGetir();

      const response = await fetch(
        `${API_URL}/admin/kullanicilar`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Kullanıcılar alınamadı.',
        );
      }

      setKullanicilar(data);
    } catch (error) {
      toast.error(
        hataMesajiGetir(
          error,
          'Kullanıcılar alınamadı.',
        ),
      );
    } finally {
      setYukleniyor(false);
    }
  };

  const departmanlariGetir = async () => {
    try {
      const token = tokenGetir();

      const response = await fetch(
        `${API_URL}/admin/departmanlar`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Departmanlar alınamadı.',
        );
      }

      const aktifDepartmanlar = data.filter(
        (departman: Departman) =>
          Boolean(departman.aktif),
      );

      setDepartmanlar(aktifDepartmanlar);
    } catch (error) {
      toast.error(
        hataMesajiGetir(
          error,
          'Departmanlar alınamadı.',
        ),
      );
    }
  };

  useEffect(() => {
    kullanicilariGetir();
    departmanlariGetir();
  }, []);

  const filtrelenmisKullanicilar =
    kullanicilar.filter((kullanici) => {
      const arama = String(
        aramaDegerleri.arama || '',
      )
        .trim()
        .toLocaleLowerCase('tr-TR');

      const tamAd = `${kullanici.ad} ${kullanici.soyad}`
        .trim()
        .toLocaleLowerCase('tr-TR');

      const kullaniciAdi =
        kullanici.kullaniciAdi.toLocaleLowerCase(
          'tr-TR',
        );

      const email =
        kullanici.email.toLocaleLowerCase(
          'tr-TR',
        );

      const aramaUyuyor =
        !arama ||
        tamAd.includes(arama) ||
        kullaniciAdi.includes(arama) ||
        email.includes(arama);

      const departmanUyuyor =
        !aramaDegerleri.departmanId ||
        Number(kullanici.departmanId) ===
          Number(aramaDegerleri.departmanId);

      const rolUyuyor =
        !aramaDegerleri.rol ||
        kullanici.rol === aramaDegerleri.rol;

      const kullaniciAktif =
        Boolean(kullanici.aktif);

      const durumUyuyor =
        !aramaDegerleri.aktif ||
        (aramaDegerleri.aktif === 'aktif' &&
          kullaniciAktif) ||
        (aramaDegerleri.aktif === 'pasif' &&
          !kullaniciAktif);

      return (
        aramaUyuyor &&
        departmanUyuyor &&
        rolUyuyor &&
        durumUyuyor
      );
    });

  const yeniKullaniciOlustur = async (
    degerler: YeniKullaniciFormu,
  ) => {
    try {
      const token = tokenGetir();

      const response = await fetch(
        `${API_URL}/admin/kullanicilar`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ad: degerler.ad.trim(),
            soyad: degerler.soyad.trim(),
            email: degerler.email
              .trim()
              .toLowerCase(),
            kullaniciAdi:
              degerler.kullaniciAdi.trim(),
            sifre: degerler.sifre,
            departmanId: Number(
              degerler.departmanId,
            ),
            rol: degerler.rol,
            aktif: degerler.aktif,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Kullanıcı oluşturulamadı.',
        );
      }

      toast.success(
        data.message ||
          'Kullanıcı başarıyla oluşturuldu.',
      );

      setYeniKullaniciModalAcik(false);

      await kullanicilariGetir();

      return true;
    } catch (error) {
      toast.error(
        hataMesajiGetir(
          error,
          'Kullanıcı oluşturulamadı.',
        ),
      );

      return false;
    }
  };

  const duzenlemeModaliniAc = (
    kullanici: Kullanici,
  ) => {
    setSeciliKullanici(kullanici);
    setDuzenlemeModalAcik(true);
  };

  const duzenlemeModaliniKapat = () => {
    setDuzenlemeModalAcik(false);
    setSeciliKullanici(null);
  };

  const kullaniciyiGuncelle = async (
    degerler: KullaniciDuzenlemeFormu,
  ) => {
    if (!seciliKullanici) {
      toast.error(
        'Güncellenecek kullanıcı seçilmedi.',
      );

      return false;
    }

    try {
      const token = tokenGetir();

      const response = await fetch(
        `${API_URL}/admin/kullanicilar/${seciliKullanici.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ad: degerler.ad.trim(),
            soyad: degerler.soyad.trim(),
            email: degerler.email
              .trim()
              .toLowerCase(),
            kullaniciAdi:
              degerler.kullaniciAdi.trim(),
            departmanId: Number(
              degerler.departmanId,
            ),
            rol: degerler.rol,
            aktif: degerler.aktif,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Kullanıcı güncellenemedi.',
        );
      }

      toast.success(
        data.message ||
          'Kullanıcı başarıyla güncellendi.',
      );

      duzenlemeModaliniKapat();

      await kullanicilariGetir();

      return true;
    } catch (error) {
      toast.error(
        hataMesajiGetir(
          error,
          'Kullanıcı güncellenemedi.',
        ),
      );

      return false;
    }
  };

  const aktifDurumunuDegistir = async (
    kullanici: Kullanici,
  ) => {
    const yeniDurum =
      !Boolean(kullanici.aktif);

    try {
      const token = tokenGetir();

      const response = await fetch(
        `${API_URL}/admin/kullanicilar/${kullanici.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            aktif: yeniDurum,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Kullanıcı durumu değiştirilemedi.',
        );
      }

      toast.success(
        yeniDurum
          ? 'Kullanıcı aktif yapıldı.'
          : 'Kullanıcı pasif yapıldı.',
      );

      await kullanicilariGetir();
    } catch (error) {
      toast.error(
        hataMesajiGetir(
          error,
          'Kullanıcı durumu değiştirilemedi.',
        ),
      );
    }
  };

  const sifreModaliniAc = (
    kullanici: Kullanici,
  ) => {
    setSeciliKullanici(kullanici);
    setSifreModalAcik(true);
  };

  const sifreModaliniKapat = () => {
    setSifreModalAcik(false);
    setSeciliKullanici(null);
  };

  const sifreyiGuncelle = async (
    degerler: SifreFormu,
  ) => {
    if (!seciliKullanici) {
      toast.error(
        'Şifresi değiştirilecek kullanıcı seçilmedi.',
      );

      return false;
    }

    if (
      degerler.yeniSifre !==
      degerler.yeniSifreTekrar
    ) {
      toast.error(
        'Girilen şifreler aynı değil.',
      );

      return false;
    }

    try {
      const token = tokenGetir();

      const response = await fetch(
        `${API_URL}/admin/kullanicilar/${seciliKullanici.id}/sifre`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            yeniSifre: degerler.yeniSifre,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Şifre güncellenemedi.',
        );
      }

      toast.success(
        data.message ||
          'Şifre başarıyla güncellendi.',
      );

      sifreModaliniKapat();

      return true;
    } catch (error) {
      toast.error(
        hataMesajiGetir(
          error,
          'Şifre güncellenemedi.',
        ),
      );

      return false;
    }
  };

  const columns: DataTableColumn<Kullanici>[] = [
    {
      key: 'kullaniciAdi',
      title: 'Kullanıcı Adı',
      dataIndex: 'kullaniciAdi',
      render: (value) => (
        <Text copyable>{String(value)}</Text>
      ),
      sorter: (a, b) =>
        a.kullaniciAdi.localeCompare(
          b.kullaniciAdi,
          'tr',
        ),
    },
    {
      key: 'adSoyad',
      title: 'Ad Soyad',
      render: (_, kayit) =>
        `${kayit.ad} ${kayit.soyad}`,
      sorter: (a, b) =>
        `${a.ad} ${a.soyad}`.localeCompare(
          `${b.ad} ${b.soyad}`,
          'tr',
        ),
    },
    {
      key: 'email',
      title: 'E-posta',
      dataIndex: 'email',
      render: (value) => (
        <Text copyable>{String(value)}</Text>
      ),
    },
    {
      key: 'departman',
      title: 'Departman',
      render: (_, kayit) =>
        kayit.departman || (
          <Tag>Departmansız</Tag>
        ),
      sorter: (a, b) =>
        String(a.departman || '').localeCompare(
          String(b.departman || ''),
          'tr',
        ),
    },
    {
      key: 'rol',
      title: 'Rol',
      render: (_, kayit) =>
        kayit.rol === 'admin' ? (
          <Tag tone="red">Yönetici</Tag>
        ) : (
          <Tag tone="blue">Kullanıcı</Tag>
        ),
    },
    {
      key: 'aktif',
      title: 'Durum',
      render: (_, kayit) => (
        <ConfirmAction
          title={
            Boolean(kayit.aktif)
              ? 'Kullanıcı pasif yapılsın mı?'
              : 'Kullanıcı aktif yapılsın mı?'
          }
          description={
            Boolean(kayit.aktif)
              ? 'Pasif kullanıcı sisteme giriş yapamaz.'
              : 'Kullanıcı yeniden sisteme giriş yapabilir.'
          }
          onConfirm={() =>
            aktifDurumunuDegistir(kayit)
          }
          confirmText="Evet"
          cancelText="Hayır"
        >
          {(open) => (
            <span onClick={open}>
              <Switch
                checked={Boolean(kayit.aktif)}
              />
            </span>
          )}
        </ConfirmAction>
      ),
      sorter: (a, b) =>
        Number(Boolean(a.aktif)) -
        Number(Boolean(b.aktif)),
    },
    {
      key: 'islemler',
      title: 'İşlemler',
      width: 210,
      render: (_, kayit) => (
        <div className="ui-inline">
          <Button
            variant="link"
            icon={<EditIcon />}
            onClick={() =>
              duzenlemeModaliniAc(kayit)
            }
          >
            Düzenle
          </Button>
          <Button
            variant="link"
            icon={<KeyIcon />}
            onClick={() =>
              sifreModaliniAc(kayit)
            }
          >
            Şifre
          </Button>
        </div>
      ),
    },
  ];

  const departmanSecenekleri = [
    { label: 'Departman seçin', value: '' },
    ...departmanlar.map((departman) => ({
      label: departman.ad,
      value: departman.id,
    })),
  ];
  const rolSecenekleri = [
    { label: 'Kullanıcı', value: 'kullanici' },
    { label: 'Yönetici', value: 'admin' },
  ];

  return (
    <div className="ui-page-content">
      <ToastHost />
      <PageHeader
        title="Kullanıcı Yönetimi"
        description="Kullanıcıları ekleyin, düzenleyin, filtreleyin ve yönetin."
        actions={
          <Button
            variant="primary"
            icon={<PlusIcon />}
            onClick={() =>
              setYeniKullaniciModalAcik(true)
            }
          >
            Yeni Kullanıcı
          </Button>
        }
      />

      <form
        className="ui-filter-panel"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(
            event.currentTarget,
          );
          const departmanId =
            String(data.get('departmanId') || '');
          setAramaDegerleri({
            arama: String(data.get('arama') || ''),
            departmanId: departmanId
              ? Number(departmanId)
              : undefined,
            rol:
              (String(data.get('rol') || '') ||
                undefined) as
                | 'admin'
                | 'kullanici'
                | undefined,
            aktif:
              (String(data.get('aktif') || '') ||
                undefined) as
                | 'aktif'
                | 'pasif'
                | undefined,
          });
          setSayfa(1);
        }}
        onReset={() => {
          setAramaDegerleri({});
          setSayfa(1);
        }}
      >
        <div className="ui-filter-grid">
          <FormField label="Arama">
            <Input
              name="arama"
              placeholder="Ad, kullanıcı adı veya e-posta ara"
            />
          </FormField>
          <FormField label="Departman">
            <Select
              name="departmanId"
              options={[
                {
                  label: 'Tüm departmanlar',
                  value: '',
                },
                ...departmanlar.map(
                  (departman) => ({
                    label: departman.ad,
                    value: departman.id,
                  }),
                ),
              ]}
            />
          </FormField>
          <FormField label="Rol">
            <Select
              name="rol"
              options={[
                { label: 'Tüm roller', value: '' },
                ...rolSecenekleri,
              ]}
            />
          </FormField>
          <FormField label="Durum">
            <Select
              name="aktif"
              options={[
                { label: 'Tüm durumlar', value: '' },
                { label: 'Aktif', value: 'aktif' },
                { label: 'Pasif', value: 'pasif' },
              ]}
            />
          </FormField>
        </div>
        <div className="ui-filter-actions">
          <Button type="reset">Temizle</Button>
          <Button type="submit" variant="primary">
            Filtrele
          </Button>
        </div>
      </form>

      <ManagedDataTable<Kullanici>
        rowKey="id"
        columns={columns}
        data={filtrelenmisKullanicilar}
        loading={yukleniyor}
        minWidth={1100}
        emptyText="Kullanıcı bulunamadı."
        page={sayfa}
        pageSize={sayfaBoyutu}
        onPageChange={setSayfa}
        onPageSizeChange={(size) => {
          setSayfaBoyutu(size);
          setSayfa(1);
        }}
        title={`${filtrelenmisKullanicilar.length} kullanıcı`}
        actions={
          <Button
            icon={<ReloadIcon />}
            onClick={kullanicilariGetir}
          >
            Yenile
          </Button>
        }
      />

      <FormModal
        key={
          yeniKullaniciModalAcik
            ? 'yeni-acik'
            : 'yeni-kapali'
        }
        open={yeniKullaniciModalAcik}
        title="Yeni Kullanıcı Ekle"
        width={600}
        submitText="Kullanıcıyı Kaydet"
        onClose={() =>
          setYeniKullaniciModalAcik(false)
        }
        onSubmit={async (data) => {
          await yeniKullaniciOlustur({
            ad: String(data.get('ad') || ''),
            soyad: String(data.get('soyad') || ''),
            email: String(data.get('email') || ''),
            kullaniciAdi: String(
              data.get('kullaniciAdi') || '',
            ),
            sifre: String(data.get('sifre') || ''),
            departmanId: Number(
              data.get('departmanId'),
            ),
            rol: String(
              data.get('rol'),
            ) as YeniKullaniciFormu['rol'],
            aktif: data.get('aktif') === 'on',
          });
        }}
      >
        <FormField label="Ad" required>
          <Input name="ad" required minLength={2} placeholder="Kullanıcının adını yazın" requiredMessage="Ad alanı zorunludur." minLengthMessage="Ad en az 2 karakter olmalıdır." />
        </FormField>
        <FormField label="Soyad" required>
          <Input name="soyad" required minLength={2} placeholder="Kullanıcının soyadını yazın" requiredMessage="Soyad alanı zorunludur." minLengthMessage="Soyad en az 2 karakter olmalıdır." />
        </FormField>
        <FormField label="E-posta Adresi" required>
          <Input name="email" type="email" required placeholder="ornek@agest.com.tr" requiredMessage="E-posta alanı zorunludur." emailMessage="Geçerli bir e-posta adresi yazın." />
        </FormField>
        <FormField label="Departman" required>
          <Select name="departmanId" required options={departmanSecenekleri} requiredMessage="Departman seçimi zorunludur." />
        </FormField>
        <FormField label="Kullanıcı Adı" required>
          <Input name="kullaniciAdi" required minLength={3} autoComplete="off" placeholder="Örnek: 02EK23" requiredMessage="Kullanıcı adı zorunludur." minLengthMessage="Kullanıcı adı en az 3 karakter olmalıdır." />
        </FormField>
        <FormField label="Şifre" required>
          <PasswordInput name="sifre" required minLength={6} autoComplete="new-password" placeholder="En az 6 karakter" requiredMessage="Şifre zorunludur." minLengthMessage="Şifre en az 6 karakter olmalıdır." />
        </FormField>
        <FormField label="Kullanıcı Rolü" required>
          <Select name="rol" required defaultValue="kullanici" options={rolSecenekleri} requiredMessage="Kullanıcı rolü zorunludur." />
        </FormField>
        <FormField label="Hesap Durumu">
          <Switch name="aktif" defaultChecked />
        </FormField>
      </FormModal>

      <FormModal
        key={seciliKullanici ? `duzenle-${seciliKullanici.id}` : 'duzenle-bos'}
        open={duzenlemeModalAcik}
        title={seciliKullanici ? `${seciliKullanici.ad} ${seciliKullanici.soyad} Kullanıcısını Düzenle` : 'Kullanıcıyı Düzenle'}
        width={600}
        submitText="Değişiklikleri Kaydet"
        onClose={duzenlemeModaliniKapat}
        onSubmit={async (data) => {
          await kullaniciyiGuncelle({
            ad: String(data.get('ad') || ''),
            soyad: String(data.get('soyad') || ''),
            email: String(data.get('email') || ''),
            kullaniciAdi: String(data.get('kullaniciAdi') || ''),
            departmanId: Number(data.get('departmanId')),
            rol: String(data.get('rol')) as KullaniciDuzenlemeFormu['rol'],
            aktif: data.get('aktif') === 'on',
          });
        }}
      >
        <FormField label="Ad" required><Input name="ad" required defaultValue={seciliKullanici?.ad} requiredMessage="Ad alanı zorunludur." /></FormField>
        <FormField label="Soyad" required><Input name="soyad" required defaultValue={seciliKullanici?.soyad} requiredMessage="Soyad alanı zorunludur." /></FormField>
        <FormField label="E-posta Adresi" required><Input name="email" type="email" required defaultValue={seciliKullanici?.email} requiredMessage="E-posta alanı zorunludur." emailMessage="Geçerli bir e-posta adresi yazın." /></FormField>
        <FormField label="Kullanıcı Adı" required><Input name="kullaniciAdi" required defaultValue={seciliKullanici?.kullaniciAdi} requiredMessage="Kullanıcı adı zorunludur." /></FormField>
        <FormField label="Departman" required><Select name="departmanId" required defaultValue={seciliKullanici?.departmanId ?? ''} options={departmanSecenekleri} requiredMessage="Departman seçimi zorunludur." /></FormField>
        <FormField label="Kullanıcı Rolü" required><Select name="rol" required defaultValue={seciliKullanici?.rol ?? 'kullanici'} options={rolSecenekleri} requiredMessage="Kullanıcı rolü zorunludur." /></FormField>
        <FormField label="Hesap Durumu"><Switch name="aktif" defaultChecked={Boolean(seciliKullanici?.aktif)} /></FormField>
      </FormModal>

      <FormModal
        key={seciliKullanici ? `sifre-${seciliKullanici.id}` : 'sifre-bos'}
        open={sifreModalAcik}
        title={seciliKullanici ? `${seciliKullanici.kullaniciAdi} Şifresini Değiştir` : 'Şifreyi Değiştir'}
        width={500}
        submitText="Şifreyi Güncelle"
        onClose={sifreModaliniKapat}
        onSubmit={async (data, form) => {
          const yeniSifre = String(data.get('yeniSifre') || '');
          const yeniSifreTekrar = String(data.get('yeniSifreTekrar') || '');
          if (yeniSifre !== yeniSifreTekrar) {
            const tekrarAlani =
              form.elements.namedItem(
                'yeniSifreTekrar',
              );
            if (
              tekrarAlani instanceof
              HTMLInputElement
            ) {
              tekrarAlani.setCustomValidity(
                'Girilen şifreler aynı olmalıdır.',
              );
              tekrarAlani.reportValidity();
            }
            return;
          }
          await sifreyiGuncelle({ yeniSifre, yeniSifreTekrar });
        }}
      >
        <FormField label="Yeni Şifre" required><PasswordInput name="yeniSifre" required minLength={6} autoComplete="new-password" placeholder="En az 6 karakter" requiredMessage="Yeni şifre zorunludur." minLengthMessage="Şifre en az 6 karakter olmalıdır." /></FormField>
        <FormField label="Yeni Şifre Tekrar" required><PasswordInput name="yeniSifreTekrar" required autoComplete="new-password" placeholder="Yeni şifreyi tekrar yazın" requiredMessage="Şifre tekrar alanı zorunludur." /></FormField>
      </FormModal>
    </div>
  );
}
