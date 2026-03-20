import { formatDate } from '../../utils/deadlineUtils'

/* ── Jurisdiction configs ───────────────────────────── */
const OFFICE_CONFIG = {
  'United States': {
    officeName: 'United States Patent and Trademark Office',
    officeShort: 'USPTO',
    register: 'Principal Register',
    registrationLabel: 'Registration No.',
    regPrefix: 'Reg. No.',
    commissioner: 'Director of the United States Patent and Trademark Office',
    seal: '🦅',
    headerBg: '#003087',
    headerText: '#FFFFFF',
    accentColor: '#C8960C',
    borderColor: '#003087',
    certTitle: 'Certificate of Registration',
    intro: 'This is to certify that the mark shown in this certificate has been duly registered in the United States Patent and Trademark Office on the Principal Register established by the Act of July 5, 1946, as amended.',
    footer: 'In testimony whereof I have hereunto set my hand and caused the seal of The Patent and Trademark Office to be affixed.',
    flag: '🇺🇸',
  },
  'Kenya': {
    officeName: 'Kenya Industrial Property Institute',
    officeShort: 'KIPI',
    register: 'Register of Trade Marks',
    registrationLabel: 'Registration Number',
    regPrefix: 'TM No.',
    commissioner: 'Director General, Kenya Industrial Property Institute',
    seal: '🛡️',
    headerBg: '#006600',
    headerText: '#FFFFFF',
    accentColor: '#CC0000',
    borderColor: '#006600',
    certTitle: 'Certificate of Registration of a Trade Mark',
    intro: 'This is to certify that pursuant to the Trade Marks Act (Cap. 506), the trade mark described herein has been registered in the Register of Trade Marks kept at the Kenya Industrial Property Institute.',
    footer: 'Given under my hand and the Seal of the Kenya Industrial Property Institute.',
    flag: '🇰🇪',
    country: 'Republic of Kenya',
    ministry: 'Ministry of Investments, Trade and Industry',
  },
  'European Union': {
    officeName: 'European Union Intellectual Property Office',
    officeShort: 'EUIPO',
    register: 'European Union Trade Mark Register',
    registrationLabel: 'EUTM Number',
    regPrefix: 'EUTM',
    commissioner: 'Executive Director, EUIPO',
    seal: '⭐',
    headerBg: '#003399',
    headerText: '#FFCC00',
    accentColor: '#FFCC00',
    borderColor: '#003399',
    certTitle: 'Certificate of Registration of a European Union Trade Mark',
    intro: 'This is to certify that the trade mark described herein has been registered as a European Union Trade Mark in accordance with Regulation (EU) 2017/1001 of the European Parliament and of the Council.',
    footer: 'Given under the seal of the European Union Intellectual Property Office.',
    flag: '🇪🇺',
    country: 'European Union',
  },
  'United Kingdom': {
    officeName: 'Intellectual Property Office',
    officeShort: 'UKIPO',
    register: 'UK Trade Mark Register',
    registrationLabel: 'Trade Mark Number',
    regPrefix: 'UK No.',
    commissioner: 'Comptroller-General of Patents, Designs and Trade Marks',
    seal: '👑',
    headerBg: '#012169',
    headerText: '#FFFFFF',
    accentColor: '#CF142B',
    borderColor: '#012169',
    certTitle: 'Certificate of Registration',
    intro: 'This is to certify that pursuant to the Trade Marks Act 1994, the trade mark described in this Certificate has been registered in the Register of Trade Marks.',
    footer: 'Given under the seal of the Intellectual Property Office.',
    flag: '🇬🇧',
    country: 'United Kingdom',
  },
  'Germany': {
    officeName: 'Deutsches Patent- und Markenamt',
    officeShort: 'DPMA',
    register: 'Markenregister',
    registrationLabel: 'Registernummer',
    regPrefix: 'DE',
    commissioner: 'Präsidentin des Deutschen Patent- und Markenamtes',
    seal: '⚖️',
    headerBg: '#000000',
    headerText: '#FFCC00',
    accentColor: '#CC0000',
    borderColor: '#000000',
    certTitle: 'Markenurkunde',
    intro: 'Hiermit wird bestätigt, dass die nachstehend beschriebene Marke gemäß dem Markengesetz in das beim Deutschen Patent- und Markenamt geführte Markenregister eingetragen worden ist.',
    footer: 'Gegeben unter dem Siegel des Deutschen Patent- und Markenamtes.',
    flag: '🇩🇪',
    country: 'Bundesrepublik Deutschland',
  },
  'France': {
    officeName: "Institut National de la Propriété Industrielle",
    officeShort: 'INPI',
    register: 'Registre National des Marques',
    registrationLabel: 'Numéro d\'enregistrement',
    regPrefix: 'FR',
    commissioner: "Directeur Général de l'INPI",
    seal: '⚜️',
    headerBg: '#002395',
    headerText: '#FFFFFF',
    accentColor: '#ED2939',
    borderColor: '#002395',
    certTitle: "Certificat d'Enregistrement de Marque",
    intro: "Certifions que la marque décrite dans le présent certificat a été enregistrée au Registre National des Marques conformément au Code de la propriété intellectuelle.",
    footer: "Donné sous le sceau de l'Institut National de la Propriété Industrielle.",
    flag: '🇫🇷',
    country: 'République Française',
  },
  'Australia': {
    officeName: 'IP Australia',
    officeShort: 'IPA',
    register: 'Australian Trade Mark Register',
    registrationLabel: 'Trade Mark Number',
    regPrefix: 'AU',
    commissioner: 'Registrar of Trade Marks',
    seal: '🦘',
    headerBg: '#00008B',
    headerText: '#FFFFFF',
    accentColor: '#FFD700',
    borderColor: '#00008B',
    certTitle: 'Certificate of Registration of Trade Mark',
    intro: 'This is to certify that pursuant to the Trade Marks Act 1995, the trade mark described herein has been registered in the Australian Trade Mark Register.',
    footer: 'Given under my hand and the seal of IP Australia.',
    flag: '🇦🇺',
    country: 'Commonwealth of Australia',
  },
  'Japan': {
    officeName: 'Japan Patent Office',
    officeShort: 'JPO',
    register: 'Trade Mark Register',
    registrationLabel: 'Registration Number',
    regPrefix: 'JP',
    commissioner: 'Commissioner of the Japan Patent Office',
    seal: '⛩️',
    headerBg: '#8B0000',
    headerText: '#FFFFFF',
    accentColor: '#C0392B',
    borderColor: '#8B0000',
    certTitle: 'Certificate of Trademark Registration',
    intro: 'This is to certify that the trademark described herein has been registered in the Trade Mark Register pursuant to the Trademark Act of Japan.',
    footer: 'Given under the seal of the Japan Patent Office.',
    flag: '🇯🇵',
    country: 'Japan',
  },
  'Singapore': {
    officeName: 'Intellectual Property Office of Singapore',
    officeShort: 'IPOS',
    register: 'Singapore Trade Marks Register',
    registrationLabel: 'Trade Mark No.',
    regPrefix: 'SG',
    commissioner: 'Registrar of Trade Marks, IPOS',
    seal: '🦁',
    headerBg: '#EF3340',
    headerText: '#FFFFFF',
    accentColor: '#FFFFFF',
    borderColor: '#EF3340',
    certTitle: 'Certificate of Registration of Trade Mark',
    intro: 'This is to certify that pursuant to the Trade Marks Act (Cap. 332), the trade mark described herein has been registered in the Register of Trade Marks.',
    footer: 'Given under the seal of the Intellectual Property Office of Singapore.',
    flag: '🇸🇬',
    country: 'Republic of Singapore',
  },
}

const DEFAULT_CONFIG = {
  officeName: 'National Intellectual Property Office',
  officeShort: 'NIPO',
  register: 'Trade Mark Register',
  registrationLabel: 'Registration Number',
  regPrefix: 'TM',
  commissioner: 'Registrar of Trade Marks',
  seal: '⚖️',
  headerBg: '#1F2937',
  headerText: '#FFFFFF',
  accentColor: '#FFA600',
  borderColor: '#1F2937',
  certTitle: 'Certificate of Registration of Trade Mark',
  intro: 'This is to certify that the trade mark described herein has been duly registered in the Register of Trade Marks.',
  footer: 'Given under the seal of the Intellectual Property Office.',
  flag: '🏛️',
}

function niceClassDescription(cls) {
  const descriptions = {
    9: 'Scientific and technological apparatus and instruments',
    35: 'Advertising; business management; business administration',
    36: 'Insurance; financial affairs; monetary affairs',
    38: 'Telecommunications',
    42: 'Scientific and technological services and research',
    45: 'Legal services; security services',
  }
  return descriptions[cls] || `Class ${cls} goods and services`
}

export function CertificatePreview({ doc, trademark }) {
  const cfg = OFFICE_CONFIG[trademark?.jurisdiction] || DEFAULT_CONFIG

  const regNumber = trademark?.applicationNumber
    ? trademark.applicationNumber.split('-').slice(-1)[0] + ',' + Math.floor(Math.random() * 900 + 100)
    : Math.floor(Math.random() * 9000000 + 1000000).toString()

  const classes = trademark?.niceClasses || []

  return (
    <div className="font-serif bg-white" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Outer decorative border */}
      <div style={{ border: `8px double ${cfg.borderColor}`, padding: '4px' }}>
        <div style={{ border: `2px solid ${cfg.accentColor}`, padding: '0' }}>

          {/* Header */}
          <div style={{ backgroundColor: cfg.headerBg, color: cfg.headerText, padding: '20px 24px', textAlign: 'center' }}>
            {cfg.country && (
              <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px', opacity: 0.85 }}>
                {cfg.country}
              </p>
            )}
            {cfg.ministry && (
              <p style={{ fontSize: '10px', letterSpacing: '2px', marginBottom: '8px', opacity: 0.75 }}>
                {cfg.ministry}
              </p>
            )}
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>{cfg.seal} {cfg.flag}</div>
            <h1 style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 4px 0' }}>
              {cfg.officeName}
            </h1>
            <div style={{ width: '60px', height: '2px', backgroundColor: cfg.accentColor, margin: '8px auto' }} />
            <h2 style={{ fontSize: '13px', letterSpacing: '4px', textTransform: 'uppercase', margin: '0', color: cfg.accentColor }}>
              {cfg.certTitle}
            </h2>
          </div>

          {/* Body */}
          <div style={{ padding: '24px 32px', backgroundColor: '#FAFAFA' }}>

            {/* Intro text */}
            <p style={{ fontSize: '12px', lineHeight: '1.8', color: '#333', textAlign: 'justify', marginBottom: '20px', fontStyle: 'italic' }}>
              {cfg.intro}
            </p>

            <div style={{ width: '100%', height: '1px', backgroundColor: cfg.accentColor, margin: '0 0 20px 0' }} />

            {/* Registration number — prominent */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#666', margin: '0 0 4px 0' }}>
                {cfg.registrationLabel}
              </p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: cfg.headerBg, margin: '0', letterSpacing: '4px' }}>
                {cfg.regPrefix} {trademark?.applicationNumber || regNumber}
              </p>
            </div>

            <div style={{ width: '100%', height: '1px', backgroundColor: '#E5E7EB', margin: '0 0 20px 0' }} />

            {/* Details grid */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
              <tbody>
                <DetailRow label="Trade Mark" value={trademark?.markName} bold cfg={cfg} />
                <DetailRow label="Type of Mark" value={trademark?.markType} cfg={cfg} />
                <DetailRow label={cfg.register} value="Registered" cfg={cfg} />
                <DetailRow label="Proprietor" value={trademark?.owner} cfg={cfg} />
                {trademark?.filingDate && <DetailRow label="Date of Application" value={formatDate(trademark.filingDate)} cfg={cfg} />}
                {trademark?.registrationDate && <DetailRow label="Date of Registration" value={formatDate(trademark.registrationDate)} cfg={cfg} />}
                {trademark?.renewalDate && <DetailRow label="Date of Expiry" value={formatDate(trademark.renewalDate)} cfg={cfg} />}
              </tbody>
            </table>

            {/* Nice classes */}
            {classes.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>
                  Specification of Goods and Services
                </p>
                {classes.map(cls => (
                  <div key={cls} style={{ display: 'flex', gap: '8px', marginBottom: '4px', fontSize: '11px', color: '#333' }}>
                    <span style={{ fontWeight: 'bold', minWidth: '60px', color: cfg.headerBg }}>Class {cls}:</span>
                    <span>{niceClassDescription(cls)}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ width: '100%', height: '1px', backgroundColor: cfg.accentColor, margin: '0 0 20px 0' }} />

            {/* Footer / signature */}
            <p style={{ fontSize: '11px', lineHeight: '1.7', color: '#555', textAlign: 'center', fontStyle: 'italic', marginBottom: '24px' }}>
              {cfg.footer}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '140px', borderTop: `1px solid #333`, paddingTop: '4px' }}>
                  <p style={{ fontSize: '10px', color: '#555', margin: '0' }}>{cfg.commissioner}</p>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '100px', height: '100px', border: `3px double ${cfg.borderColor}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: cfg.headerBg + '15' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px' }}>{cfg.seal}</div>
                    <div style={{ fontSize: '8px', color: cfg.headerBg, fontWeight: 'bold', letterSpacing: '1px' }}>{cfg.officeShort}</div>
                    <div style={{ fontSize: '7px', color: '#666' }}>OFFICIAL SEAL</div>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '140px', borderTop: `1px solid #333`, paddingTop: '4px' }}>
                  <p style={{ fontSize: '10px', color: '#555', margin: '0' }}>
                    {trademark?.registrationDate ? formatDate(trademark.registrationDate) : '—'}
                  </p>
                  <p style={{ fontSize: '9px', color: '#888', margin: '2px 0 0 0' }}>Date of Issue</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer bar */}
          <div style={{ backgroundColor: cfg.headerBg, color: cfg.headerText, padding: '8px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '9px', letterSpacing: '2px', margin: '0', opacity: 0.7 }}>
              THIS CERTIFICATE IS AN OFFICIAL DOCUMENT — {cfg.officeShort} · {trademark?.applicationNumber}
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value, bold, cfg }) {
  return (
    <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
      <td style={{ padding: '6px 8px', color: '#555', fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase', width: '38%', verticalAlign: 'top' }}>
        {label}
      </td>
      <td style={{ padding: '6px 8px', color: bold ? cfg.headerBg : '#111', fontWeight: bold ? 'bold' : 'normal', fontSize: bold ? '14px' : '12px', verticalAlign: 'top' }}>
        {value || '—'}
      </td>
    </tr>
  )
}
