import {
  Button,
  type DataTableColumn,
  DescriptionList,
  Drawer,
  EmptyState,
  FormField,
  ImagePreview,
  Input,
  LinkButton,
  ManagedDataTable,
  PageHeader,
  Select,
  Tag,
  type TagTone,
  Text,
  ToastHost,
  toast,
} from '@/components/ui';
import {
  DownloadIcon,
  FileIcon,
  ReloadIcon,
} from '@/components/ui/icons';
import { useLocation } from '@umijs/max';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { apiRequest } from '@/services/helpDeskApi';

const BACKEND_URL = 'http://localhost:5000';

type TicketStatus =
  | 'bekliyor'
  | 'islemde'
  | 'tamamlandi';

type TicketPriority =
  | 'dusuk'
  | 'orta'
  | 'yuksek'
  | 'kritik';

type TalepDosyasi = {
  id: number;
  talepId: number;
  dosyaAdi: string;
  orijinalDosyaAdi: string;
  dosyaYolu: string;
  mimeType: string;
  dosyaBoyutu: number;
  olusturmaTarihi: string;
};

type TicketType = {
  id: number;
  ticketNo: string;
  baslik: string;
  departmanId: number;
  departman: string;
  oncelik: TicketPriority;
  durum: TicketStatus;
  aciklama: string;
  olusturmaTarihi: string;
  guncellemeTarihi: string;
  olusturanKullaniciId?: number;
  olusturanKullaniciAdi?: string;
  olusturanKullanici?: string;
  dosyalar?: TalepDosyasi[];
};

type DurumGuncelleResponse = {
  message: string;
  talep?: TicketType;
};

type AramaDegerleri = {
  ticketNo?: string;
  baslik?: string;
  departman?: string;
  oncelik?: TicketPriority;
  durum?: TicketStatus;
};

const oncelikMetni: Record<
  TicketPriority,
  string
> = {
  dusuk: 'Düşük',
  orta: 'Orta',
  yuksek: 'Yüksek',
  kritik: 'Kritik',
};

const durumMetni: Record<
  TicketStatus,
  string
> = {
  bekliyor: 'Bekliyor',
  islemde: 'İşlemde',
  tamamlandi: 'Tamamlandı',
};

const TableList = () => {
  const location = useLocation();

  const [talepler, setTalepler] = useState<
    TicketType[]
  >([]);

  const [yukleniyor, setYukleniyor] =
    useState<boolean>(true);

  const [
    durumGuncelleniyor,
    setDurumGuncelleniyor,
  ] = useState<boolean>(false);

  const [showDetail, setShowDetail] =
    useState<boolean>(false);

  const [currentTicket, setCurrentTicket] =
    useState<TicketType>();
  const [aramaDegerleri, setAramaDegerleri] =
    useState<AramaDegerleri>({});
  const [sayfa, setSayfa] =
    useState(1);
  const [sayfaBoyutu, setSayfaBoyutu] =
    useState(10);

  const gonderilenSayfasiMi =
  location.pathname.includes('/gonderilen');

const gelenSayfasiMi =
  location.pathname.includes('/gelen');

const durumSayfasiMi =
  location.pathname.includes('/bekleyen') ||
  location.pathname.includes('/islemde') ||
  location.pathname.includes('/tamamlanan');

  const talepleriGetir = async () => {
    setYukleniyor(true);

    try {
      let endpoint = '/talepler';

if (gonderilenSayfasiMi) {
  endpoint = '/talepler?tip=gonderilen';
} else if (gelenSayfasiMi || durumSayfasiMi) {
  endpoint = '/talepler?tip=gelen';
}

      const data =
        await apiRequest<TicketType[]>(
          endpoint,
        );

      setTalepler(data);
    } catch (error) {
      console.error(
        'Talep listeleme hatası:',
        error,
      );

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(
          'Talepler yüklenemedi.',
        );
      }
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    setCurrentTicket(undefined);
    setShowDetail(false);

    talepleriGetir();
  }, [location.pathname]);

  const durumGuncelle = async (
    talepId: number,
    yeniDurum: TicketStatus,
  ) => {
    setDurumGuncelleniyor(true);

    try {
      const data =
        await apiRequest<DurumGuncelleResponse>(
          `/talepler/${talepId}/durum`,
          {
            method: 'PATCH',
            body: JSON.stringify({
              durum: yeniDurum,
            }),
          },
        );

      toast.success(data.message);

      if (data.talep) {
        setTalepler((mevcutTalepler) =>
          mevcutTalepler.map((talep) =>
            talep.id === data.talep?.id
              ? data.talep
              : talep,
          ),
        );

        setCurrentTicket(data.talep);
      }
    } catch (error) {
      console.error(
        'Talep durum güncelleme hatası:',
        error,
      );

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(
          'Talep durumu güncellenirken beklenmeyen bir hata oluştu.',
        );
      }
    } finally {
      setDurumGuncelleniyor(false);
    }
  };

  const filteredTickets = useMemo(() => {
    let routeTalepleri = talepler;

    if (
      location.pathname.includes('/bekleyen')
    ) {
      routeTalepleri = talepler.filter(
        (ticket) =>
          ticket.durum === 'bekliyor',
      );
    } else if (
      location.pathname.includes('/islemde')
    ) {
      routeTalepleri = talepler.filter(
        (ticket) =>
          ticket.durum === 'islemde',
      );
    } else if (
      location.pathname.includes(
        '/tamamlanan',
      )
    ) {
      routeTalepleri = talepler.filter(
        (ticket) =>
          ticket.durum === 'tamamlandi',
      );
    }

    const normalize = (value: unknown) =>
      String(value ?? '')
        .trim()
        .toLocaleLowerCase('tr-TR');

    return routeTalepleri.filter(
      (ticket) =>
        (!aramaDegerleri.ticketNo ||
          normalize(ticket.ticketNo).includes(
            normalize(
              aramaDegerleri.ticketNo,
            ),
          )) &&
        (!aramaDegerleri.baslik ||
          normalize(ticket.baslik).includes(
            normalize(aramaDegerleri.baslik),
          )) &&
        (!aramaDegerleri.departman ||
          normalize(ticket.departman).includes(
            normalize(
              aramaDegerleri.departman,
            ),
          )) &&
        (!aramaDegerleri.oncelik ||
          ticket.oncelik ===
            aramaDegerleri.oncelik) &&
        (!aramaDegerleri.durum ||
          ticket.durum ===
            aramaDegerleri.durum),
    );
  }, [
    aramaDegerleri,
    location.pathname,
    talepler,
  ]);

  const pageTitle = useMemo(() => {
    if (
      location.pathname.includes('/gelen')
    ) {
      return 'Bana Gelen Talepler';
    }

    if (
      location.pathname.includes(
        '/gonderilen',
      )
    ) {
      return 'Gönderdiğim Talepler';
    }

    if (
      location.pathname.includes(
        '/bekleyen',
      )
    ) {
      return 'Bekleyen Talepler';
    }

    if (
      location.pathname.includes('/islemde')
    ) {
      return 'İşlemdeki Talepler';
    }

    if (
      location.pathname.includes(
        '/tamamlanan',
      )
    ) {
      return 'Tamamlanan Talepler';
    }

    return 'Tüm Talepler';
  }, [location.pathname]);

  const pageDescription = useMemo(() => {
    if (gonderilenSayfasiMi) {
      return 'Diğer departmanlara gönderdiğiniz talepleri ve güncel durumlarını takip edebilirsiniz.';
    }

    if (gelenSayfasiMi) {
      return 'Departmanınıza gönderilen talepleri görüntüleyebilir ve işlem yapabilirsiniz.';
    }

    return 'Help Desk sistemindeki talepleri görüntüleyebilir ve filtreleyebilirsiniz.';
  }, [
    gelenSayfasiMi,
    gonderilenSayfasiMi,
  ]);

  const oncelikRengi = (
    oncelik: TicketPriority,
  ): TagTone => {
    if (oncelik === 'dusuk') {
      return 'green';
    }

    if (oncelik === 'orta') {
      return 'gold';
    }

    if (oncelik === 'yuksek') {
      return 'orange';
    }

    return 'red';
  };

  const durumRengi = (
    durum: TicketStatus,
  ): TagTone => {
    if (durum === 'bekliyor') {
      return 'gold';
    }

    if (durum === 'islemde') {
      return 'blue';
    }

    return 'green';
  };

  const tarihFormatla = (
    tarih: string,
  ) => {
    if (!tarih) {
      return '-';
    }

    return new Date(tarih).toLocaleString(
      'tr-TR',
    );
  };

  const dosyaBoyutuFormatla = (
    boyut: number,
  ) => {
    if (!boyut) {
      return '';
    }

    if (boyut < 1024) {
      return `${boyut} B`;
    }

    if (boyut < 1024 * 1024) {
      return `${(
        boyut / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      boyut /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  const dosyaUrlOlustur = (
    dosyaYolu: string,
  ) => {
    if (!dosyaYolu) {
      return '';
    }

    if (
      dosyaYolu.startsWith('http://') ||
      dosyaYolu.startsWith('https://')
    ) {
      return dosyaYolu;
    }

    return `${BACKEND_URL}${dosyaYolu}`;
  };

  const gorselDosyasiMi = (
    mimeType: string,
  ) => {
    return mimeType?.startsWith('image/');
  };

  const columns: DataTableColumn<TicketType>[] = [
    {
      title: 'Ticket No',
      key: 'ticketNo',
      dataIndex: 'ticketNo',
      width: 160,
      render: (_, record) => (
        <Button
          variant="link"
          style={{
            padding: 0,
            fontWeight: 600,
          }}
          onClick={() => {
            setCurrentTicket(record);
            setShowDetail(true);
          }}
        >
          {record.ticketNo}
        </Button>
      ),
    },
    {
      title: 'Talep Başlığı',
      key: 'baslik',
      dataIndex: 'baslik',
      ellipsis: true,
      width: 280,
    },
    {
      title: 'Hedef Departman',
      key: 'departman',
      dataIndex: 'departman',
      width: 180,
    },
    {
      title: 'Gönderen',
      key: 'olusturanKullanici',
      dataIndex: 'olusturanKullanici',
      width: 180,
      render: (_, record) =>
        record.olusturanKullanici ||
        record.olusturanKullaniciAdi ||
        '-',
    },
    {
      title: 'Öncelik',
      key: 'oncelik',
      dataIndex: 'oncelik',
      width: 130,
      render: (_, record) => (
        <Tag
          tone={oncelikRengi(
            record.oncelik,
          )}
        >
          {oncelikMetni[record.oncelik]}
        </Tag>
      ),
    },
    {
      title: 'Durum',
      key: 'durum',
      dataIndex: 'durum',
      width: 150,
      render: (_, record) => (
        <Tag
          tone={durumRengi(record.durum)}
        >
          {durumMetni[record.durum]}
        </Tag>
      ),
    },
    {
      title: 'Oluşturma Tarihi',
      key: 'olusturmaTarihi',
      dataIndex: 'olusturmaTarihi',
      width: 190,
      render: (_, record) =>
        tarihFormatla(
          record.olusturmaTarihi,
        ),
    },
    {
      title: 'İşlem',
      key: 'islem',
      width: 120,
      render: (_, record) => (
        <Button
          variant="link"
          onClick={() => {
            setCurrentTicket(record);
            setShowDetail(true);
          }}
        >
          Görüntüle
        </Button>
      ),
    },
  ];

  const drawerKapat = () => {
    setShowDetail(false);
    setCurrentTicket(undefined);
  };

  return (
    <div className="ui-page-content">
      <ToastHost />
      <PageHeader
        title={pageTitle}
        description={pageDescription}
      />

      <form
        className="ui-filter-panel"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(
            event.currentTarget,
          );
          setAramaDegerleri({
            ticketNo: String(
              data.get('ticketNo') || '',
            ),
            baslik: String(
              data.get('baslik') || '',
            ),
            departman: String(
              data.get('departman') || '',
            ),
            oncelik:
              (String(data.get('oncelik') || '') ||
                undefined) as
                | TicketPriority
                | undefined,
            durum:
              (String(data.get('durum') || '') ||
                undefined) as
                | TicketStatus
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
          <FormField label="Ticket No">
            <Input name="ticketNo" />
          </FormField>
          <FormField label="Talep Başlığı">
            <Input name="baslik" />
          </FormField>
          <FormField label="Hedef Departman">
            <Input name="departman" />
          </FormField>
          <FormField label="Öncelik">
            <Select
              name="oncelik"
              options={[
                { label: 'Tümü', value: '' },
                { label: 'Düşük', value: 'dusuk' },
                { label: 'Orta', value: 'orta' },
                { label: 'Yüksek', value: 'yuksek' },
                { label: 'Kritik', value: 'kritik' },
              ]}
            />
          </FormField>
          <FormField label="Durum">
            <Select
              name="durum"
              options={[
                { label: 'Tümü', value: '' },
                { label: 'Bekliyor', value: 'bekliyor' },
                { label: 'İşlemde', value: 'islemde' },
                { label: 'Tamamlandı', value: 'tamamlandi' },
              ]}
            />
          </FormField>
        </div>
        <div className="ui-filter-actions">
          <Button type="reset">Temizle</Button>
          <Button type="submit" variant="primary">Ara</Button>
        </div>
      </form>

      <ManagedDataTable<TicketType>
        rowKey="id"
        loading={yukleniyor}
        title={`${pageTitle} (${filteredTickets.length})`}
        columns={columns}
        data={filteredTickets}
        emptyText="Talep bulunamadı."
        minWidth={1350}
        page={sayfa}
        pageSize={sayfaBoyutu}
        onPageChange={setSayfa}
        onPageSizeChange={(size) => {
          setSayfaBoyutu(size);
          setSayfa(1);
        }}
        totalLabel={(total) =>
          `Toplam ${total} talep`
        }
        actions={
          <Button icon={<ReloadIcon />} onClick={talepleriGetir}>
            Yenile
          </Button>
        }
      />

      <Drawer
        title="Talep Detayı"
        width={650}
        open={showDetail}
        onClose={drawerKapat}
      >
        {currentTicket && (
          <>
            <DescriptionList
              title={currentTicket.ticketNo}
              items={[
                { label: 'Talep Başlığı', value: currentTicket.baslik },
                { label: 'Hedef Departman', value: currentTicket.departman },
                {
                  label: 'Gönderen',
                  value:
                    currentTicket.olusturanKullanici ||
                    currentTicket.olusturanKullaniciAdi ||
                    '-',
                },
                {
                  label: 'Öncelik',
                  value: (
                    <Tag tone={oncelikRengi(currentTicket.oncelik)}>
                      {oncelikMetni[currentTicket.oncelik]}
                    </Tag>
                  ),
                },
                {
                  label: 'Durum',
                  value: (
                    <Tag tone={durumRengi(currentTicket.durum)}>
                      {durumMetni[currentTicket.durum]}
                    </Tag>
                  ),
                },
                {
                  label: 'Oluşturma Tarihi',
                  value: tarihFormatla(currentTicket.olusturmaTarihi),
                },
                {
                  label: 'Son Güncelleme',
                  value: tarihFormatla(currentTicket.guncellemeTarihi),
                },
              ]}
            />

            <div style={{ marginTop: 24, padding: 20, background: 'rgba(0, 0, 0, 0.02)', borderRadius: 8 }}>
              <Text strong>Talep Açıklaması</Text>
              <div style={{ marginTop: 12 }}>
                <Text>{currentTicket.aciklama}</Text>
              </div>
            </div>

            <div style={{ marginTop: 24, padding: 20, background: 'rgba(0, 0, 0, 0.02)', borderRadius: 8 }}>
              <Text strong style={{ display: 'block', marginBottom: 16 }}>
                Eklenen Dosyalar
              </Text>

              {!currentTicket.dosyalar ||
              currentTicket.dosyalar.length === 0 ? (
                <EmptyState description="Bu talebe dosya eklenmemiş." />
              ) : (
                <div className="ui-stack" style={{ gap: 16 }}>
                  {currentTicket.dosyalar.map((dosya) => {
                    const dosyaUrl = dosyaUrlOlustur(dosya.dosyaYolu);
                    const dosyaBilgisi = (
                      <div>
                        <Text strong>{dosya.orijinalDosyaAdi}</Text>
                        <div>
                          <Text secondary style={{ fontSize: 12 }}>
                            {dosyaBoyutuFormatla(dosya.dosyaBoyutu)}
                          </Text>
                        </div>
                      </div>
                    );

                    return (
                      <div
                        key={dosya.id}
                        style={{
                          padding: gorselDosyasiMi(dosya.mimeType) ? 12 : 14,
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          borderRadius: 8,
                        }}
                      >
                        {gorselDosyasiMi(dosya.mimeType) && (
                          <ImagePreview
                            src={dosyaUrl}
                            alt={dosya.orijinalDosyaAdi}
                            style={{ maxHeight: 350, objectFit: 'contain' }}
                          />
                        )}
                        <div
                          className="ui-inline"
                          style={{
                            marginTop: gorselDosyasiMi(dosya.mimeType) ? 12 : 0,
                            justifyContent: 'space-between',
                            gap: 12,
                          }}
                        >
                          <div className="ui-inline">
                            {!gorselDosyasiMi(dosya.mimeType) && <FileIcon />}
                            {dosyaBilgisi}
                          </div>
                          <LinkButton
                            icon={<DownloadIcon />}
                            href={dosyaUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Aç
                          </LinkButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {!gonderilenSayfasiMi && (
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
                <Text strong style={{ display: 'block', marginBottom: 16 }}>
                  Talep İşlemleri
                </Text>
                <div className="ui-inline">
                  {currentTicket.durum === 'bekliyor' && (
                    <Button
                      variant="primary"
                      loading={durumGuncelleniyor}
                      onClick={() => durumGuncelle(currentTicket.id, 'islemde')}
                    >
                      İşleme Al
                    </Button>
                  )}
                  {currentTicket.durum === 'islemde' && (
                    <>
                      <Button
                        loading={durumGuncelleniyor}
                        onClick={() => durumGuncelle(currentTicket.id, 'bekliyor')}
                      >
                        Bekliyora Geri Al
                      </Button>
                      <Button
                        variant="primary"
                        loading={durumGuncelleniyor}
                        onClick={() => durumGuncelle(currentTicket.id, 'tamamlandi')}
                      >
                        Tamamlandı Olarak İşaretle
                      </Button>
                    </>
                  )}
                  {currentTicket.durum === 'tamamlandi' && (
                    <>
                      <Button
                        loading={durumGuncelleniyor}
                        onClick={() => durumGuncelle(currentTicket.id, 'islemde')}
                      >
                        İşleme Geri Al
                      </Button>
                      <Tag tone="green">Bu talep tamamlandı</Tag>
                    </>
                  )}
                </div>
              </div>
            )}

            {gonderilenSayfasiMi && (
              <div style={{ marginTop: 24, padding: 16, background: 'rgba(22, 119, 255, 0.06)', borderRadius: 8 }}>
                <Text secondary>
                  Bu talebi başka bir departmana gönderdiğiniz için yalnızca durumunu takip edebilirsiniz. İşlem yapma yetkisi hedef departmandadır.
                </Text>
              </div>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default TableList;
