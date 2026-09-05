export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalPage = {
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
};

export type CookieRow = {
  name: string;
  key: string;
  desc: string;
};

export type CookiesPage = LegalPage & {
  cookieListTitle: string;
  storageListTitle: string;
  manageHeading: string;
  manageParagraphs: string[];
  rows: CookieRow[];
  storageRows: CookieRow[];
};

export type FaqItem = {
  q: string;
  a: string;
};

export type LegalBundle = {
  privacy: LegalPage;
  terms: LegalPage;
  cookies: CookiesPage;
  refunds: LegalPage;
  licenses: LegalPage;
  faq: {
    title: string;
    items: FaqItem[];
  };
};
