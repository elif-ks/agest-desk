import {
  Button,
  Card,
  DataTable,
  type DataTableColumn,
  EmptyState,
  Grid,
  GridItem,
  LoadingContainer,
  PageHeader,
  Progress,
  Statistic,
  Tag,
  type TagTone,
  Text,
  ToastHost,
  toast,
} from '@/components/ui';
import {
  ApartmentIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  FileTextIcon,
  ReloadIcon,
  TeamIcon,
  ThunderboltIcon,
  UserIcon,
} from '@/components/ui/icons';
import { useEffect, useMemo, useState } from 'react';

const API_URL = 'http://localhost:5000/api';

type DashboardOzet = {
  toplamTalep: number;
  bekleyenTalep: number;
  islemdeTalep: number;
  tamamlananTalep: number;
  kritikTalep: number;
  bugunOlusturulanTalep: number;
  toplamKullanici: number;
  aktifKullanici: number;
  pasifKullanici: number;
  yoneticiSayisi: number;
  toplamDepartman: number;
  aktifDepartman: number;
  pasifDepartman: number;
};

type OncelikDagilimi = {
  oncelik:
    | 'dusuk'
    | 'orta'
    | 'yuksek'
    | 'kritik';
  adet: number;
};

type DepartmanDagilimi = {
  departmanId: number;
  departman: string;
  aktif: boolean;
  toplamTalep: number;
  bekleyenTalep: number;
  islemdeTalep: number;
  tamamlananTalep: number;
};

type AylikTalepDagilimi = {
  ayKodu: string;
  ay: string;
  adet: number;
};

type SonTalep = {
  id: number;
  ticketNo: string;
  baslik: string;
  oncelik:
    | 'dusuk'
    | 'orta'
    | 'yuksek'
    | 'kritik';
  durum:
    | 'bekliyor'
    | 'islemde'
    | 'tamamlandi';
  olusturmaTarihi: string;
  departmanId: number;
  departman: string;
  olusturanKullaniciId: number | null;
  olusturanKullaniciAdi: string | null;
  olusturanKullanici: string | null;
};

type DashboardVerisi = {
  ozet: DashboardOzet;
  oncelikDagilimi: OncelikDagilimi[];
  departmanDagilimi: DepartmanDagilimi[];
  aylikTalepDagilimi: AylikTalepDagilimi[];
  sonTalepler: SonTalep[];
};

const bosDashboardVerisi: DashboardVerisi = {
  ozet: {
    toplamTalep: 0,
    bekleyenTalep: 0,
    islemdeTalep: 0,
    tamamlananTalep: 0,
    kritikTalep: 0,
    bugunOlusturulanTalep: 0,
    toplamKullanici: 0,
    aktifKullanici: 0,
    pasifKullanici: 0,
    yoneticiSayisi: 0,
    toplamDepartman: 0,
    aktifDepartman: 0,
    pasifDepartman: 0,
  },
  oncelikDagilimi: [],
  departmanDagilimi: [],
  aylikTalepDagilimi: [],
  sonTalepler: [],
};

const oncelikBilgileri = {
  dusuk: {
    metin: 'Düşük',
    renk: 'green',
    progressDurumu: 'success' as const,
  },
  orta: {
    metin: 'Orta',
    renk: 'blue',
    progressDurumu: 'normal' as const,
  },
  yuksek: {
    metin: 'Yüksek',
    renk: 'orange',
    progressDurumu: 'active' as const,
  },
  kritik: {
    metin: 'Kritik',
    renk: 'red',
    progressDurumu: 'exception' as const,
  },
};

const durumBilgileri = {
  bekliyor: {
    metin: 'Bekliyor',
    renk: 'gold',
  },
  islemde: {
    metin: 'İşlemde',
    renk: 'blue',
  },
  tamamlandi: {
    metin: 'Tamamlandı',
    renk: 'green',
  },
};

export default function AdminDashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardVerisi>(
      bosDashboardVerisi,
    );

  const [yukleniyor, setYukleniyor] =
    useState<boolean>(true);

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

  const dashboardVerileriniGetir =
    async () => {
      setYukleniyor(true);

      try {
        const token = tokenGetir();

        if (!token) {
          throw new Error(
            'Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.',
          );
        }

        const response = await fetch(
          `${API_URL}/admin/dashboard`,
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
              'Dashboard verileri alınamadı.',
          );
        }

        setDashboard(data);
      } catch (error) {
        toast.error(
          hataMesajiGetir(
            error,
            'Dashboard verileri alınamadı.',
          ),
        );
      } finally {
        setYukleniyor(false);
      }
    };

  useEffect(() => {
    dashboardVerileriniGetir();
  }, []);

  const tamamlanmaOrani = useMemo(() => {
    if (dashboard.ozet.toplamTalep === 0) {
      return 0;
    }

    return Math.round(
      (dashboard.ozet.tamamlananTalep /
        dashboard.ozet.toplamTalep) *
        100,
    );
  }, [
    dashboard.ozet.tamamlananTalep,
    dashboard.ozet.toplamTalep,
  ]);

  const enYuksekOncelikAdedi =
    useMemo(() => {
      if (
        dashboard.oncelikDagilimi.length === 0
      ) {
        return 0;
      }

      return Math.max(
        ...dashboard.oncelikDagilimi.map(
          (kayit) => Number(kayit.adet),
        ),
      );
    }, [dashboard.oncelikDagilimi]);

  const enYuksekAylikTalepAdedi =
    useMemo(() => {
      if (
        dashboard.aylikTalepDagilimi
          .length === 0
      ) {
        return 0;
      }

      return Math.max(
        ...dashboard.aylikTalepDagilimi.map(
          (kayit) => Number(kayit.adet),
        ),
      );
    }, [dashboard.aylikTalepDagilimi]);

  const tarihFormatla = (
    tarih: string,
  ) => {
    if (!tarih) {
      return '-';
    }

    const tarihNesnesi = new Date(tarih);

    if (
      Number.isNaN(tarihNesnesi.getTime())
    ) {
      return tarih;
    }

    return tarihNesnesi.toLocaleString(
      'tr-TR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  };

  const sonTaleplerColumns: DataTableColumn<SonTalep>[] =
    [
      {
        title: 'Ticket No',
        dataIndex: 'ticketNo',
        key: 'ticketNo',
        width: 145,
        render: (value) => (
          <Text copyable strong>
            {String(value)}
          </Text>
        ),
      },
      {
        title: 'Başlık',
        dataIndex: 'baslik',
        key: 'baslik',
        ellipsis: true,
        render: (value) => (
          <Text>{String(value)}</Text>
        ),
      },
      {
        title: 'Departman',
        dataIndex: 'departman',
        key: 'departman',
        width: 170,
        render: (value) => (
          <Tag>
            <span className="ui-inline">
              <ApartmentIcon />
              {String(value)}
            </span>
          </Tag>
        ),
      },
      {
        title: 'Öncelik',
        dataIndex: 'oncelik',
        key: 'oncelik',
        width: 110,
        render: (value) => {
          const deger =
            value as SonTalep['oncelik'];
          const bilgi =
            oncelikBilgileri[deger];

          return (
            <Tag tone={bilgi.renk as TagTone}>
              {bilgi.metin}
            </Tag>
          );
        },
      },
      {
        title: 'Durum',
        dataIndex: 'durum',
        key: 'durum',
        width: 125,
        render: (value) => {
          const deger =
            value as SonTalep['durum'];
          const bilgi =
            durumBilgileri[deger];

          return (
            <Tag tone={bilgi.renk as TagTone}>
              {bilgi.metin}
            </Tag>
          );
        },
      },
      {
        title: 'Oluşturan',
        key: 'olusturan',
        width: 170,
        render: (_, kayit) =>
          kayit.olusturanKullanici ||
          kayit.olusturanKullaniciAdi ||
          'Sistem',
      },
      {
        title: 'Oluşturma Tarihi',
        dataIndex: 'olusturmaTarihi',
        key: 'olusturmaTarihi',
        width: 175,
        render: (value) =>
          tarihFormatla(String(value)),
      },
    ];

  const ozetKartlari = [
    {
      title: 'Toplam Talep',
      value: dashboard.ozet.toplamTalep,
      icon: <FileTextIcon />,
      description: `Bugün oluşturulan: ${dashboard.ozet.bugunOlusturulanTalep}`,
    },
    {
      title: 'Bekleyen Talep',
      value: dashboard.ozet.bekleyenTalep,
      icon: <ClockIcon />,
      color: '#d48806',
      description: 'İşlem bekleyen talepler',
    },
    {
      title: 'İşlemde',
      value: dashboard.ozet.islemdeTalep,
      icon: <ThunderboltIcon />,
      color: '#1677ff',
      description: 'Üzerinde çalışılan talepler',
    },
    {
      title: 'Tamamlanan',
      value: dashboard.ozet.tamamlananTalep,
      icon: <CheckCircleIcon />,
      color: '#389e0d',
      description: `Tamamlanma oranı: %${tamamlanmaOrani}`,
    },
    {
      title: 'Kritik Açık Talep',
      value: dashboard.ozet.kritikTalep,
      icon: <ExclamationCircleIcon />,
      color: '#cf1322',
      description: 'Henüz tamamlanmamış kritik talepler',
    },
    {
      title: 'Toplam Kullanıcı',
      value: dashboard.ozet.toplamKullanici,
      icon: <TeamIcon />,
      description: `Aktif: ${dashboard.ozet.aktifKullanici} · Pasif: ${dashboard.ozet.pasifKullanici}`,
    },
    {
      title: 'Yönetici Sayısı',
      value: dashboard.ozet.yoneticiSayisi,
      icon: <UserIcon />,
      description: 'Yönetici yetkisine sahip kullanıcılar',
    },
    {
      title: 'Toplam Departman',
      value: dashboard.ozet.toplamDepartman,
      icon: <ApartmentIcon />,
      description: `Aktif: ${dashboard.ozet.aktifDepartman} · Pasif: ${dashboard.ozet.pasifDepartman}`,
    },
  ];

  return (
    <div className="ui-page-content">
      <ToastHost />
      <PageHeader
        title="Yönetici Dashboard"
        description="Help Desk sisteminin genel durumunu ve son hareketlerini görüntüleyin."
        actions={
          <Button
            icon={<ReloadIcon />}
            loading={yukleniyor}
            onClick={dashboardVerileriniGetir}
          >
            Yenile
          </Button>
        }
      />

      <LoadingContainer loading={yukleniyor}>
        <Grid gap={16} className="ui-admin-stats">
          {ozetKartlari.map((kart) => (
            <GridItem key={kart.title}>
              <Card style={{ height: '100%' }}>
                <Statistic
                  title={kart.title}
                  value={kart.value}
                  prefix={kart.icon}
                  valueStyle={kart.color ? { color: kart.color } : undefined}
                />
                <Text secondary>{kart.description}</Text>
              </Card>
            </GridItem>
          ))}
        </Grid>

        <Grid gap={16} className="ui-admin-distributions" style={{ marginTop: 16 }}>
          <GridItem>
            <Card title="Talep Tamamlanma Oranı" style={{ height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                <Progress variant="circle" percent={tamamlanmaOrani} size={180} />
              </div>
              <Grid gap={12} className="ui-three-cols">
                <GridItem><Statistic title="Bekliyor" value={dashboard.ozet.bekleyenTalep} valueStyle={{ fontSize: 20 }} /></GridItem>
                <GridItem><Statistic title="İşlemde" value={dashboard.ozet.islemdeTalep} valueStyle={{ fontSize: 20 }} /></GridItem>
                <GridItem><Statistic title="Bitti" value={dashboard.ozet.tamamlananTalep} valueStyle={{ fontSize: 20 }} /></GridItem>
              </Grid>
            </Card>
          </GridItem>

          <GridItem>
            <Card title="Önceliğe Göre Dağılım" style={{ height: '100%' }}>
              {dashboard.oncelikDagilimi.length === 0 ? (
                <EmptyState description="Talep bulunmuyor" />
              ) : (
                <div className="ui-stack">
                  {dashboard.oncelikDagilimi.map((kayit) => {
                    const bilgi = oncelikBilgileri[kayit.oncelik];
                    const yuzde = enYuksekOncelikAdedi > 0
                      ? Math.round((kayit.adet / enYuksekOncelikAdedi) * 100)
                      : 0;
                    return (
                      <div key={kayit.oncelik}>
                        <div className="ui-inline" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                          <Tag tone={bilgi.renk as TagTone}>{bilgi.metin}</Tag>
                          <Text strong>{kayit.adet} talep</Text>
                        </div>
                        <Progress percent={yuzde} status={bilgi.progressDurumu} />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </GridItem>

          <GridItem>
            <Card title="Son 6 Aylık Talep Hareketi" style={{ height: '100%' }}>
              {dashboard.aylikTalepDagilimi.length === 0 ? (
                <EmptyState description="Aylık veri bulunmuyor" />
              ) : (
                <div className="ui-stack">
                  {dashboard.aylikTalepDagilimi.map((kayit) => {
                    const yuzde = enYuksekAylikTalepAdedi > 0
                      ? Math.round((kayit.adet / enYuksekAylikTalepAdedi) * 100)
                      : 0;
                    return (
                      <div key={kayit.ayKodu}>
                        <div className="ui-inline" style={{ justifyContent: 'space-between', marginBottom: 5 }}>
                          <Text>{kayit.ay}</Text>
                          <Text strong>{kayit.adet}</Text>
                        </div>
                        <Progress percent={yuzde} />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </GridItem>
        </Grid>

        <Card title="Departmanlara Göre Talep Dağılımı" style={{ marginTop: 16 }}>
          {dashboard.departmanDagilimi.length === 0 ? (
            <EmptyState description="Departman verisi bulunmuyor" />
          ) : (
            <Grid gap={16} className="ui-admin-departments">
              {dashboard.departmanDagilimi.map((departman) => {
                const tamamlanmaYuzdesi = departman.toplamTalep > 0
                  ? Math.round((departman.tamamlananTalep / departman.toplamTalep) * 100)
                  : 0;
                return (
                  <GridItem key={departman.departmanId}>
                    <Card
                      title={<span className="ui-inline"><ApartmentIcon /><Text strong>{departman.departman}</Text></span>}
                      extra={<Tag tone={departman.aktif ? 'green' : 'default'}>{departman.aktif ? 'Aktif' : 'Pasif'}</Tag>}
                      style={{ height: '100%' }}
                    >
                      <Statistic title="Toplam Talep" value={departman.toplamTalep} />
                      <Progress percent={tamamlanmaYuzdesi} style={{ marginTop: 12 }} />
                      <div className="ui-inline" style={{ marginTop: 12 }}>
                        <Tag tone="gold">Bekleyen: {departman.bekleyenTalep}</Tag>
                        <Tag tone="blue">İşlemde: {departman.islemdeTalep}</Tag>
                        <Tag tone="green">Tamamlandı: {departman.tamamlananTalep}</Tag>
                      </div>
                    </Card>
                  </GridItem>
                );
              })}
            </Grid>
          )}
        </Card>

        <Card
          title="Son Oluşturulan Talepler"
          extra={<Text secondary>Son 5 kayıt</Text>}
          style={{ marginTop: 16 }}
        >
          <DataTable<SonTalep>
            rowKey="id"
            columns={sonTaleplerColumns}
            data={dashboard.sonTalepler}
            minWidth={1100}
            emptyText="Henüz talep bulunmuyor."
          />
        </Card>
      </LoadingContainer>
    </div>
  );
}
