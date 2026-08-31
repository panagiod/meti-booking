export interface Country {
  code: string;
  name: string;
  dialCode: string;
  mask: string;
  placeholder: string;
}

export const latinAmericanCountries: Country[] = [
  {
    code: "AR",
    name: "Argentina",
    dialCode: "+54",
    mask: "XX XXXX-XXXX",
    placeholder: "11 2345-6789",
  },
  {
    code: "BO",
    name: "Bolivia",
    dialCode: "+591",
    mask: "XXXX-XXXX",
    placeholder: "7012-3456",
  },
  {
    code: "BR",
    name: "Brasil",
    dialCode: "+55",
    mask: "XX XXXXX-XXXX",
    placeholder: "11 91234-5678",
  },
  {
    code: "CL",
    name: "Chile",
    dialCode: "+56",
    mask: "X XXXX-XXXX",
    placeholder: "9 1234-5678",
  },
  {
    code: "CO",
    name: "Colombia",
    dialCode: "+57",
    mask: "XXX XXX-XXXX",
    placeholder: "300 123-4567",
  },
  {
    code: "CR",
    name: "Costa Rica",
    dialCode: "+506",
    mask: "XXXX-XXXX",
    placeholder: "8123-4567",
  },
  {
    code: "CU",
    name: "Cuba",
    dialCode: "+53",
    mask: "XXXX-XXXX",
    placeholder: "5123-4567",
  },
  {
    code: "DO",
    name: "Dominican Republic",
    dialCode: "+1",
    mask: "XXX XXX-XXXX",
    placeholder: "809 123-4567",
  },
  {
    code: "EC",
    name: "Ecuador",
    dialCode: "+593",
    mask: "XX XXX-XXXX",
    placeholder: "99 123-4567",
  },
  {
    code: "SV",
    name: "El Salvador",
    dialCode: "+503",
    mask: "XXXX-XXXX",
    placeholder: "7123-4567",
  },
  {
    code: "GT",
    name: "Guatemala",
    dialCode: "+502",
    mask: "XXXX-XXXX",
    placeholder: "5123-4567",
  },
  {
    code: "HN",
    name: "Honduras",
    dialCode: "+504",
    mask: "XXXX-XXXX",
    placeholder: "9123-4567",
  },
  {
    code: "MX",
    name: "Mexico",
    dialCode: "+52",
    mask: "XX XXXX-XXXX",
    placeholder: "55 1234-5678",
  },
  {
    code: "NI",
    name: "Nicaragua",
    dialCode: "+505",
    mask: "XXXX-XXXX",
    placeholder: "8123-4567",
  },
  {
    code: "PA",
    name: "Panama",
    dialCode: "+507",
    mask: "XXXX-XXXX",
    placeholder: "6123-4567",
  },
  {
    code: "PY",
    name: "Paraguay",
    dialCode: "+595",
    mask: "XXX XXX-XXXX",
    placeholder: "981 123-456",
  },
  {
    code: "PE",
    name: "Peru",
    dialCode: "+51",
    mask: "XXX XXX-XXXX",
    placeholder: "999 123-456",
  },
  {
    code: "PR",
    name: "Puerto Rico",
    dialCode: "+1",
    mask: "XXX XXX-XXXX",
    placeholder: "787 123-4567",
  },
  {
    code: "UY",
    name: "Uruguay",
    dialCode: "+598",
    mask: "X XXX-XXXX",
    placeholder: "9 123-456",
  },
  {
    code: "VE",
    name: "Venezuela",
    dialCode: "+58",
    mask: "XXX XXX-XXXX",
    placeholder: "412 123-4567",
  },
];

export function getCountryByCode(code: string): Country | undefined {
  return latinAmericanCountries.find((c) => c.code === code);
}

export function getCountryByDialCode(dialCode: string): Country | undefined {
  return latinAmericanCountries.find((c) => c.dialCode === dialCode);
}

export function parsePhoneValue(fullPhone: string): { countryCode: string; number: string } {
  if (!fullPhone) return { countryCode: "CO", number: "" };

  const country = latinAmericanCountries.find((c) => fullPhone.startsWith(c.dialCode));
  if (country) {
    return {
      countryCode: country.code,
      number: fullPhone.slice(country.dialCode.length),
    };
  }

  return { countryCode: "CO", number: fullPhone };
}

export function formatFullPhone(dialCode: string, number: string): string {
  const cleanNumber = number.replace(/[^0-9]/g, "");
  return `${dialCode}${cleanNumber}`;
}
