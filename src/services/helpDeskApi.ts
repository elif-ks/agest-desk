const API_URL = 'http://localhost:5000/api';

type ApiOptions = RequestInit & {
  auth?: boolean;
};

export const apiRequest = async <T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> => {
  const {
    auth = true,
    headers,
    ...requestOptions
  } = options;

  const token = localStorage.getItem(
    'helpDeskToken',
  );

  const requestHeaders = new Headers(
    headers,
  );

  const formDataMi =
    requestOptions.body instanceof FormData;

  if (
    !formDataMi &&
    !requestHeaders.has('Content-Type')
  ) {
    requestHeaders.set(
      'Content-Type',
      'application/json',
    );
  }

  if (
    formDataMi &&
    requestHeaders.has('Content-Type')
  ) {
    requestHeaders.delete('Content-Type');
  }

  if (auth && token) {
    requestHeaders.set(
      'Authorization',
      `Bearer ${token}`,
    );
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...requestOptions,
      headers: requestHeaders,
    },
  );

  let data: any;

  try {
    data = await response.json();
  } catch {
    data = {
      message:
        'Sunucudan geçersiz cevap alındı.',
    };
  }

  if (response.status === 401) {
    localStorage.removeItem(
      'helpDeskToken',
    );

    localStorage.removeItem(
      'helpDeskKullanici',
    );

    if (
      window.location.pathname !==
      '/user/login'
    ) {
      window.location.href =
        '/user/login';
    }

    throw new Error(
      data.message ||
        'Oturum süreniz doldu.',
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        'İşlem başarısız.',
    );
  }

  return data as T;
};

export const getToken = () => {
  return localStorage.getItem(
    'helpDeskToken',
  );
};

export const getKullanici = () => {
  const kullanici =
    localStorage.getItem(
      'helpDeskKullanici',
    );

  if (!kullanici) {
    return null;
  }

  try {
    return JSON.parse(kullanici);
  } catch {
    localStorage.removeItem(
      'helpDeskKullanici',
    );

    return null;
  }
};

export const cikisYap = () => {
  localStorage.removeItem(
    'helpDeskToken',
  );

  localStorage.removeItem(
    'helpDeskKullanici',
  );

  window.location.href =
    '/user/login';
};