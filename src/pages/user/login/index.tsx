import { Helmet } from '@umijs/max';
import type { FormEvent } from 'react';
import { useState } from 'react';

import {
  Alert,
  Button,
  Card,
  Checkbox,
  FormField,
  Input,
  PasswordInput,
  Tag,
  Text,
  ToastHost,
  toast,
} from '@/components/ui';
import {
  KeyIcon,
  SafetyCertificateIcon,
  UserIcon,
} from '@/components/ui/icons';
import { apiRequest } from '@/services/helpDeskApi';

import Settings from '../../../../config/defaultSettings';

type LoginValues = {
  kullaniciAdi: string;
  sifre: string;
  beniHatirla: boolean;
};

type Kullanici = {
  id: number;
  kullaniciAdi: string;
  ad: string;
  soyad: string;
  email: string;
  rol: string;
  departmanId: number | null;
  departman: string | null;
};

type LoginResponse = {
  message: string;
  token?: string;
  kullanici?: Kullanici;
};

const Login = () => {
  const [values, setValues] = useState<LoginValues>({
    kullaniciAdi: '',
    sifre: '',
    beniHatirla: false,
  });
  const [hataMesaji, setHataMesaji] = useState('');
  const [girisYapiliyor, setGirisYapiliyor] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (girisYapiliyor) return;

    setGirisYapiliyor(true);
    setHataMesaji('');

    try {
      const data = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({
          kullaniciAdi: values.kullaniciAdi.trim(),
          sifre: values.sifre,
        }),
      });

      if (!data.token || !data.kullanici) {
        throw new Error('Giriş bilgileri sunucudan alınamadı.');
      }

      localStorage.setItem('helpDeskToken', data.token);
      localStorage.setItem(
        'helpDeskKullanici',
        JSON.stringify(data.kullanici),
      );

      toast.success(`Hoş geldiniz ${data.kullanici.ad}`);

      window.location.href =
        data.kullanici.rol === 'admin'
          ? '/admin/dashboard'
          : '/dashboard';
    } catch (error) {
      console.error('Giriş hatası:', error);
      setHataMesaji(
        error instanceof Error
          ? error.message
          : 'Giriş sırasında beklenmeyen bir hata oluştu.',
      );
    } finally {
      setGirisYapiliyor(false);
    }
  };

  return (
    <div className="login-page">
      <ToastHost />
      <Helmet>
        <title>
          Giriş Yap{Settings.title ? ` - ${Settings.title}` : ''}
        </title>
      </Helmet>

      <style>{`
        .login-page {
          min-height: 100vh;
          padding: 24px;
          background: linear-gradient(135deg, #eef3ff 0%, #f7f9fc 48%, #ffffff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }
        .login-wrapper { width: 100%; max-width: 1120px; }
        .login-card {
          overflow: hidden;
          border-radius: 28px;
          border: 1px solid rgba(15, 23, 42, 0.06);
          box-shadow: 0 28px 90px rgba(15, 23, 42, 0.14);
        }
        .login-card > .ui-card__body { padding: 0; }
        .login-columns { display: grid; grid-template-columns: 11fr 13fr; }
        .login-brand {
          min-height: 620px;
          padding: 56px 48px;
          background: linear-gradient(145deg, #3e649d 0%, #6076a0b0 54%, #2156a4 100%);
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
        }
        .login-logo { width: 190px; max-width: 100%; object-fit: contain; }
        .login-brand-content { max-width: 450px; }
        .login-brand-title {
          margin: 0 0 14px;
          color: #ffffff;
          font-size: 42px;
          line-height: 1.2;
          font-weight: 600;
        }
        .login-brand-text {
          color: rgba(255, 255, 255, 0.74);
          font-size: 17px;
          line-height: 1.8;
        }
        .login-features {
          margin-top: 34px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .login-feature {
          color: rgba(255, 255, 255, 0.88);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .login-copyright { color: rgba(255, 255, 255, 0.48); }
        .login-area {
          min-height: 620px;
          padding: 56px 52px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          box-sizing: border-box;
        }
        .login-form { width: 100%; max-width: 420px; margin: 0 auto; }
        .login-header { margin-bottom: 28px; }
        .login-title {
          margin: 0 0 8px;
          color: rgba(0, 0, 0, 0.88);
          font-size: 30px;
          line-height: 1.3;
          font-weight: 600;
        }
        .login-input-wrap { position: relative; }
        .login-input-wrap > svg {
          position: absolute;
          z-index: 1;
          top: 50%;
          left: 12px;
          transform: translateY(-50%);
          color: rgba(0, 0, 0, 0.45);
          font-size: 16px;
        }
        .login-input {
          min-height: 40px;
          padding-left: 38px;
          font-size: 16px;
        }
        .login-remember { margin-top: -4px; margin-bottom: 22px; }
        .login-submit {
          width: 100%;
          height: 48px;
          border-radius: 10px;
          font-weight: 600;
        }
        .login-error { margin-bottom: 24px; }
        .login-footer { margin-top: 34px; text-align: center; }
        @media (max-width: 767px) {
          .login-columns { display: block; }
          .login-brand { display: none; }
          .login-area { min-height: 620px; }
        }
      `}</style>

      <div className="login-wrapper">
        <Card className="login-card">
          <div className="login-columns">
            <section className="login-brand">
              <img
                src="/icons/AgestLogo.png"
                alt="AGEST Logo"
                className="login-logo"
              />

              <div className="login-brand-content">
                <Tag tone="blue">Kurumsal Talep Sistemi</Tag>
                <h1 className="login-brand-title">AGEST Desk</h1>
                <div className="login-brand-text">
                  Departmanlar arası destek, talep ve iş takibi için
                  geliştirilmiş şirket içi yönetim platformu.
                </div>

                <div className="login-features">
                  <div className="login-feature">
                    <SafetyCertificateIcon />
                    Güvenli kullanıcı girişi
                  </div>
                  <div className="login-feature">
                    <SafetyCertificateIcon />
                    Departman bazlı yetkilendirme
                  </div>
                  <div className="login-feature">
                    <SafetyCertificateIcon />
                    Gerçek zamanlı talep takibi
                  </div>
                </div>
              </div>

              <span className="login-copyright">© 2026 AGEST</span>
            </section>

            <section className="login-area">
              <div className="login-form">
                <div className="login-header">
                  <h2 className="login-title">Hesabınıza Giriş Yapın</h2>
                  <Text secondary>
                    Kullanıcı adınız ve şifrenizle AGEST Desk çalışma alanına
                    erişin.
                  </Text>
                </div>

                <form onSubmit={handleSubmit}>
                  {hataMesaji && (
                    <div className="login-error">
                      <Alert type="error">{hataMesaji}</Alert>
                    </div>
                  )}

                  <FormField
                    label="Kullanıcı Adı"
                    htmlFor="kullaniciAdi"
                    required
                  >
                    <div className="login-input-wrap">
                      <UserIcon />
                      <Input
                        id="kullaniciAdi"
                        name="kullaniciAdi"
                        className="login-input"
                        value={values.kullaniciAdi}
                        autoComplete="username"
                        placeholder="Kullanıcı adınızı giriniz"
                        required
                        requiredMessage="Kullanıcı adınızı giriniz."
                        disabled={girisYapiliyor}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            kullaniciAdi: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </FormField>

                  <FormField label="Şifre" htmlFor="sifre" required>
                    <div className="login-input-wrap">
                      <KeyIcon />
                      <PasswordInput
                        id="sifre"
                        name="sifre"
                        className="login-input"
                        value={values.sifre}
                        autoComplete="current-password"
                        placeholder="Şifrenizi giriniz"
                        required
                        requiredMessage="Şifrenizi giriniz."
                        disabled={girisYapiliyor}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            sifre: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </FormField>

                  <div className="login-remember">
                    <Checkbox
                      checked={values.beniHatirla}
                      disabled={girisYapiliyor}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          beniHatirla: event.target.checked,
                        }))
                      }
                    >
                      Beni Hatırla
                    </Checkbox>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="login-submit"
                    loading={girisYapiliyor}
                    disabled={girisYapiliyor}
                  >
                    Giriş Yap
                  </Button>
                </form>

                <div className="login-footer">
                  <Text secondary>
                    Yetki veya giriş sorunu yaşarsanız sistem yöneticinizle
                    iletişime geçin.
                  </Text>
                </div>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
