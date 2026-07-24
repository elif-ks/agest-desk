import {
  Button,
  ConfirmAction,
  type DataTableColumn,
  FormField,
  FormModal,
  Input,
  ManagedDataTable,
  PageHeader,
  Select,
  Switch,
  Tag,
  Text,
  ToastHost,
  toast,
} from '@/components/ui';
import {
  EditIcon,
  PlusIcon,
  ReloadIcon,
} from '@/components/ui/icons';
import { useEffect, useState } from 'react';

type Departman = {
  id: number;
  ad: string;
  email: string;
  aktif: number | boolean;
  kullaniciSayisi: number | string;
  talepSayisi: number | string;
};

type YeniDepartmanFormu = {
  ad: string;
  email: string;
  aktif: boolean;
};

type DepartmanDuzenlemeFormu = {
  ad: string;
  email: string;
  aktif: boolean;
};

type AramaDegerleri = {
  arama?: string;
  aktif?: 'aktif' | 'pasif';
};

const API_URL = 'http://localhost:5000/api';

export default function DepartmanYonetimi() {
  const [departmanlar, setDepartmanlar] =
    useState<Departman[]>([]);

  const [yukleniyor, setYukleniyor] =
    useState<boolean>(false);

  const [
    yeniDepartmanModalAcik,
    setYeniDepartmanModalAcik,
  ] = useState<boolean>(false);

  const [
    duzenlemeModalAcik,
    setDuzenlemeModalAcik,
  ] = useState<boolean>(false);

  const [
    seciliDepartman,
    setSeciliDepartman,
  ] = useState<Departman | null>(null);

  const [aramaDegerleri, setAramaDegerleri] =
    useState<AramaDegerleri>({});
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

  const departmanlariGetir = async () => {
    setYukleniyor(true);

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

      setDepartmanlar(data);
    } catch (error) {
      toast.error(
        hataMesajiGetir(
          error,
          'Departmanlar alınamadı.',
        ),
      );
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    departmanlariGetir();
  }, []);

  const filtrelenmisDepartmanlar =
    departmanlar.filter((departman) => {
      const arama = String(
        aramaDegerleri.arama || '',
      )
        .trim()
        .toLocaleLowerCase('tr-TR');

      const ad = String(departman.ad || '')
        .toLocaleLowerCase('tr-TR');

      const email = String(
        departman.email || '',
      ).toLocaleLowerCase('tr-TR');

      const aramaUyuyor =
        !arama ||
        ad.includes(arama) ||
        email.includes(arama);

      const aktifMi = Boolean(
        departman.aktif,
      );

      const durumUyuyor =
        !aramaDegerleri.aktif ||
        (aramaDegerleri.aktif ===
          'aktif' &&
          aktifMi) ||
        (aramaDegerleri.aktif ===
          'pasif' &&
          !aktifMi);

      return aramaUyuyor && durumUyuyor;
    });

  const yeniDepartmanOlustur = async (
    degerler: YeniDepartmanFormu,
  ) => {
    try {
      const token = tokenGetir();

      const response = await fetch(
        `${API_URL}/admin/departmanlar`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ad: degerler.ad.trim(),
            email: degerler.email
              .trim()
              .toLowerCase(),
            aktif: degerler.aktif,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Departman oluşturulamadı.',
        );
      }

      toast.success(
        data.message ||
          'Departman başarıyla oluşturuldu.',
      );

      setYeniDepartmanModalAcik(false);

      await departmanlariGetir();

      return true;
    } catch (error) {
      toast.error(
        hataMesajiGetir(
          error,
          'Departman oluşturulamadı.',
        ),
      );

      return false;
    }
  };

  const duzenlemeModaliniAc = (
    departman: Departman,
  ) => {
    setSeciliDepartman(departman);
    setDuzenlemeModalAcik(true);
  };

  const duzenlemeModaliniKapat = () => {
    setDuzenlemeModalAcik(false);
    setSeciliDepartman(null);
  };

  const departmaniGuncelle = async (
    degerler: DepartmanDuzenlemeFormu,
  ) => {
    if (!seciliDepartman) {
      toast.error(
        'Güncellenecek departman seçilmedi.',
      );

      return false;
    }

    try {
      const token = tokenGetir();

      const response = await fetch(
        `${API_URL}/admin/departmanlar/${seciliDepartman.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ad: degerler.ad.trim(),
            email: degerler.email
              .trim()
              .toLowerCase(),
            aktif: degerler.aktif,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Departman güncellenemedi.',
        );
      }

      toast.success(
        data.message ||
          'Departman başarıyla güncellendi.',
      );

      duzenlemeModaliniKapat();

      await departmanlariGetir();

      return true;
    } catch (error) {
      toast.error(
        hataMesajiGetir(
          error,
          'Departman güncellenemedi.',
        ),
      );

      return false;
    }
  };

  const aktifDurumunuDegistir = async (
    departman: Departman,
  ) => {
    const yeniDurum =
      !Boolean(departman.aktif);

    try {
      const token = tokenGetir();

      const response = await fetch(
        `${API_URL}/admin/departmanlar/${departman.id}`,
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
            'Departman durumu değiştirilemedi.',
        );
      }

      toast.success(
        yeniDurum
          ? 'Departman aktif yapıldı.'
          : 'Departman pasif yapıldı.',
      );

      await departmanlariGetir();
    } catch (error) {
      toast.error(
        hataMesajiGetir(
          error,
          'Departman durumu değiştirilemedi.',
        ),
      );
    }
  };

  const columns: DataTableColumn<Departman>[] = [
    {
      key: 'ad',
      title: 'Departman Adı',
      dataIndex: 'ad',
      render: (value) => (
        <Text copyable>{String(value)}</Text>
      ),
      sorter: (a, b) =>
        String(a.ad).localeCompare(
          String(b.ad),
          'tr',
        ),
    },
    {
      key: 'email',
      title: 'E-posta',
      render: (_, kayit) =>
        kayit.email ? (
          <Text copyable>{kayit.email}</Text>
        ) : (
          <Tag>E-posta yok</Tag>
        ),
    },
    {
      key: 'kullaniciSayisi',
      title: 'Kullanıcı Sayısı',
      render: (_, kayit) => (
        <Tag tone="blue">
          {Number(
            kayit.kullaniciSayisi || 0,
          )}{' '}
          kullanıcı
        </Tag>
      ),
      sorter: (a, b) =>
        Number(a.kullaniciSayisi) -
        Number(b.kullaniciSayisi),
    },
    {
      key: 'talepSayisi',
      title: 'Talep Sayısı',
      render: (_, kayit) => (
        <Tag tone="purple">
          {Number(kayit.talepSayisi || 0)}{' '}
          talep
        </Tag>
      ),
      sorter: (a, b) =>
        Number(a.talepSayisi) -
        Number(b.talepSayisi),
    },
    {
      key: 'aktif',
      title: 'Durum',
      render: (_, kayit) => (
        <ConfirmAction
          title={
            Boolean(kayit.aktif)
              ? 'Departman pasif yapılsın mı?'
              : 'Departman aktif yapılsın mı?'
          }
          description={
            Boolean(kayit.aktif)
              ? 'Pasif departman yeni kullanıcı ve talep seçimlerinde görünmez.'
              : 'Departman yeniden kullanılabilir hâle gelecektir.'
          }
          confirmText="Evet"
          cancelText="Hayır"
          onConfirm={() =>
            aktifDurumunuDegistir(kayit)
          }
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
      width: 140,
      render: (_, kayit) => (
        <Button
          variant="link"
          icon={<EditIcon />}
          onClick={() =>
            duzenlemeModaliniAc(kayit)
          }
        >
          Düzenle
        </Button>
      ),
    },
  ];

  return (
    <div className="ui-page-content">
      <ToastHost />
      <PageHeader
        title="Departman Yönetimi"
        description="Departmanları ekleyin, düzenleyin ve yönetin."
        actions={
          <Button
            variant="primary"
            icon={<PlusIcon />}
            onClick={() =>
              setYeniDepartmanModalAcik(true)
            }
          >
            Yeni Departman
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
          setAramaDegerleri({
            arama: String(data.get('arama') || ''),
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
              placeholder="Departman adı veya e-posta ara"
            />
          </FormField>
          <FormField label="Durum">
            <Select
              name="aktif"
              options={[
                {
                  label: 'Tüm durumlar',
                  value: '',
                },
                {
                  label: 'Aktif',
                  value: 'aktif',
                },
                {
                  label: 'Pasif',
                  value: 'pasif',
                },
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

      <ManagedDataTable<Departman>
        rowKey="id"
        columns={columns}
        data={filtrelenmisDepartmanlar}
        loading={yukleniyor}
        minWidth={900}
        emptyText="Departman bulunamadı."
        page={sayfa}
        pageSize={sayfaBoyutu}
        onPageChange={setSayfa}
        onPageSizeChange={(size) => {
          setSayfaBoyutu(size);
          setSayfa(1);
        }}
        title={`${filtrelenmisDepartmanlar.length} departman`}
        actions={
          <Button
            icon={<ReloadIcon />}
            onClick={departmanlariGetir}
          >
            Yenile
          </Button>
        }
      />

      <FormModal
        key={
          yeniDepartmanModalAcik
            ? 'yeni-departman-acik'
            : 'yeni-departman-kapali'
        }
        open={yeniDepartmanModalAcik}
        title="Yeni Departman Ekle"
        width={550}
        submitText="Departmanı Kaydet"
        onClose={() =>
          setYeniDepartmanModalAcik(false)
        }
        onSubmit={async (data) => {
          await yeniDepartmanOlustur({
            ad: String(data.get('ad') || ''),
            email: String(data.get('email') || ''),
            aktif: data.get('aktif') === 'on',
          });
        }}
      >
        <FormField label="Departman Adı" required>
          <Input
            name="ad"
            required
            minLength={2}
            placeholder="Örnek: Satın Alma"
            requiredMessage="Departman adı zorunludur."
            minLengthMessage="Departman adı en az 2 karakter olmalıdır."
          />
        </FormField>
        <FormField label="Departman E-posta Adresi" required>
          <Input
            name="email"
            type="email"
            required
            placeholder="satinalma@agest.com.tr"
            requiredMessage="Departman e-posta adresi zorunludur."
            emailMessage="Geçerli bir e-posta adresi yazın."
          />
        </FormField>
        <FormField label="Departman Durumu">
          <Switch name="aktif" defaultChecked />
        </FormField>
      </FormModal>

      <FormModal
        key={
          seciliDepartman
            ? `departman-duzenle-${seciliDepartman.id}`
            : 'departman-duzenle-bos'
        }
        open={duzenlemeModalAcik}
        title={
          seciliDepartman
            ? `${seciliDepartman.ad} Departmanını Düzenle`
            : 'Departmanı Düzenle'
        }
        width={550}
        submitText="Değişiklikleri Kaydet"
        onClose={duzenlemeModaliniKapat}
        onSubmit={async (data) => {
          await departmaniGuncelle({
            ad: String(data.get('ad') || ''),
            email: String(data.get('email') || ''),
            aktif: data.get('aktif') === 'on',
          });
        }}
      >
        <FormField label="Departman Adı" required>
          <Input
            name="ad"
            required
            minLength={2}
            defaultValue={seciliDepartman?.ad}
            requiredMessage="Departman adı zorunludur."
            minLengthMessage="Departman adı en az 2 karakter olmalıdır."
          />
        </FormField>
        <FormField label="Departman E-posta Adresi" required>
          <Input
            name="email"
            type="email"
            required
            defaultValue={seciliDepartman?.email}
            requiredMessage="Departman e-posta adresi zorunludur."
            emailMessage="Geçerli bir e-posta adresi yazın."
          />
        </FormField>
        <FormField label="Departman Durumu">
          <Switch
            name="aktif"
            defaultChecked={Boolean(
              seciliDepartman?.aktif,
            )}
          />
        </FormField>
      </FormModal>
    </div>
  );
}
