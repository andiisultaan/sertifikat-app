<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Sertifikat UKK - {{ $nama }}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4 portrait; margin: 0; }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
    }

    body {
      font-family: 'Source Sans 3', Arial, sans-serif;
      color: #2c3e50;
      background: #ffffff;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
    }
    
    /* ── PAGE CONTAINER ── */
    .page {
      width: 100%;
      height: 296mm;
      position: relative;
      overflow: hidden;
      background: #ffffff;
    }
    .page-break {
      page-break-before: always;
    }

    /* ── BACKGROUND (SVG absolute layer) ── */
    .bg {
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
    }
    .bg-custom {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: -1;
    }

    /* ── DOUBLE BORDER FRAME ── */
    .frame-outer {
      position: absolute;
      top: 10mm; left: 10mm; right: 10mm; bottom: 10mm;
      border: 2pt solid #1e3a5f;
      z-index: 1;
    }
    .frame-inner {
      position: absolute;
      top: 12mm; left: 12mm; right: 12mm; bottom: 12mm;
      border: 1pt solid #d4af37;
      z-index: 1;
    }

    /* ── MAIN CONTENT WRAPPER ── */
    .content {
      position: absolute;
      top: 15mm; left: 15mm; right: 15mm; bottom: 15mm;
      z-index: 2;
      text-align: center;
      padding-bottom: 68mm;
    }

    /* ── HEADER BAR ── */
    .header-center {
      text-align: center;
      margin-bottom: 2.5mm;
    }
    .header-center-logo {
      width: 25mm;
      height: 25mm;
      margin: 0 auto 3mm auto;
      object-fit: contain;
    }
    .header-logo-fallback {
      width: 25mm;
      height: 25mm;
      border: 1pt solid #1e3a5f;
      margin: 0 auto 3mm auto;
      font-size: 7.5pt;
      font-weight: 700;
      color: #1e3a5f;
      line-height: 25mm;
      text-align: center;
    }
    .header-instansi {
      font-size: 11pt;
      font-weight: 700;
      color: #d4af37;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .header-address {
      font-size: 8.5pt;
      color: #718096;
      margin-top: 1.5mm;
    }

    /* ── GOLD DIVIDER ── */
    .gold-divider {
      width: 100%;
      border-top: 1pt solid #d4af37;
      margin: 3mm 0;
    }

    /* ── CERTIFICATE TITLE ── */
    .cert-label {
      margin-top: 4mm;
      font-size: 9pt;
      font-weight: 700;
      letter-spacing: 3px;
      color: #d4af37;
      text-transform: uppercase;
    }
    /* ── TITLE & TEXT ── */
    .cert-title {
      margin-top: 2mm;
      font-family: 'Playfair Display', serif;
      font-size: 14pt;
      font-weight: 700;
      color: #1e3a5f;
    }
    .cert-subtitle {
      margin-top: 1mm;
      font-size: 8.5pt;
      font-style: italic;
      color: #718096;
    }
    .cert-no-wrap {
      margin-top: 3.5mm;
      text-align: center;
    }
    .cert-no {
      font-size: 10pt;
      font-weight: bold;
      color: #1e3a5f;
    }

    /* ── BODY TEXT ── */
    .certify-text {
      margin-top: 4mm;
      font-size: 10pt;
      color: #4a5568;
    }

    /* ── NAME BOX ── */
    .name-box {
      margin-top: 3mm;
      margin-bottom: 1mm;
      padding: 1.5mm 0;
    }
    .name {
      font-family: 'Playfair Display', serif;
      font-size: 14pt;
      font-weight: 700;
      color: #1e3a5f;
      text-transform: uppercase;
    }
    .nis {
      margin-top: 2mm;
      font-size: 10pt;
      color: #4a5568;
    }

    /* ── INFO ROWS ── */
    .info-row {
      margin-top: 3mm;
      font-size: 10pt;
      color: #4a5568;
      line-height: 1.4;
    }
    .info-en {
      display: inline-block;
      margin-top: 0.5mm;
      font-style: italic;
      color: #718096;
      font-size: 8.5pt;
    }

    .jurusan-text {
      margin-top: 2mm;
      font-family: 'Playfair Display', serif;
      font-size: 14pt;
      font-weight: 700;
      color: #1e3a5f;
    }

    /* ── JUDUL BOX ── */
    .judul-outer {
      margin-top: 3mm;
      text-align: center;
    }
    .judul-label {
      font-size: 10pt;
      color: #4a5568;
    }
    .judul-main {
      margin-top: 1mm;
      font-size: 14pt;
      font-weight: 700;
      color: #1e3a5f;
      line-height: 1.4;
    }
    .judul-en {
      display: inline-block;
      margin-top: 1mm;
      font-style: italic;
      color: #718096;
      font-size: 8.5pt;
    }

    /* ── PREDIKAT ── */
    .predikat-section {
      margin-top: 4mm;
    }
    .predikat-label {
      font-size: 10pt;
      color: #4a5568;
    }
    .predikat-badge-wrap {
      margin-top: 2.5mm;
    }
    .predikat-badge {
      font-family: 'Playfair Display', serif;
      font-size: 14pt;
      font-weight: 700;
      color: #d4af37;
    }
    .nilai-text {
      margin-top: 2.5mm;
      font-size: 10pt;
      color: #4a5568;
    }
    .nilai-text strong {
      color: #1e3a5f;
      font-size: 10pt;
    }

    /* ── SIGNATURE WRAPPER ── */
    .signature-wrapper {
      position: absolute;
      bottom: 14mm;
      left: 15mm;
      right: 15mm;
      width: calc(100% - 30mm);
    }

    /* ── VALIDITY ── */
    .valid-section {
      text-align: center;
      font-size: 9pt;
      color: #718096;
      font-style: italic;
      margin-bottom: 2mm;
    }

    /* ── SIGNATURE DATE ── */
    .sig-date-section {
      text-align: center;
      font-size: 10pt;
      color: #1e3a5f;
      margin-bottom: 2mm;
    }

    /* ── SIGNATURE TABLE ── */
    table.sig1 {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    table.sig1 td {
      width: 50%;
      vertical-align: top;
      text-align: center;
    }
    /* QR dalam sel signature */
    .sig-qr-wrap {
      margin: 2mm auto 2mm auto;
      display: inline-block;
    }
    .sig-qr-img {
      width: 24mm;
      height: 24mm;
      display: block;
      border: 1pt solid #d4af37;
      padding: 1mm;
      background: #fff;
    }
    .sig-qr-label {
      font-size: 6pt;
      color: #718096;
      margin-top: 0.5mm;
      line-height: 1.3;
    }
    .sig-qr-algo {
      font-size: 5.5pt;
      color: #2d3748;
      font-family: 'Courier New', monospace;
      display: block;
      margin-top: 0.3mm;
    }
    .sig-unsigned-label {
      font-size: 7pt;
      color: #a0aec0;
      font-style: italic;
      margin: 3mm auto;
    }
    /* ── ELECTRONIC SIGNATURE BOX (referensi: QR kiri + teks kanan) ── */
    .esig-box {
      display: table;
      width: 88%;
      margin: 1.5mm auto 3mm auto;
      border: 0.8pt solid #2d3748;
      border-radius: 1.5mm;
      padding: 1.5mm 2mm;
      background: #fff;
      font-size: 7pt;
    }
    .esig-qr-cell {
      display: table-cell;
      width: 18mm;
      vertical-align: middle;
      padding-right: 2mm;
    }
    .esig-qr-cell img {
      width: 18mm;
      height: 18mm;
      display: block;
      background: #fff;
    }
    .esig-text-cell {
      display: table-cell;
      vertical-align: middle;
      text-align: left;
      line-height: 1.5;
    }
    .esig-label {
      font-size: 6.5pt;
      color: #4a5568;
      display: block;
    }
    .esig-jabatan {
      font-size: 7pt;
      font-weight: 700;
      color: #1e3a5f;
      display: block;
      text-transform: uppercase;
    }
    .esig-nama {
      font-size: 7.5pt;
      font-weight: 700;
      color: #1e3a5f;
      display: block;
      text-decoration: underline;
    }
    .esig-algo {
      font-size: 5.5pt;
      color: #718096;
      font-family: 'Courier New', monospace;
      display: block;
      margin-top: 0.5mm;
    }
    .sig-role {
      font-size: 10pt;
      color: #1e3a5f;
      font-weight: 600;
      height: 10mm;
    }
    .sig-role em {
      font-size: 8.5pt;
      font-weight: 400;
    }
    .sig-name {
      font-family: 'Playfair Display', serif;
      font-size: 10pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #1e3a5f;
      text-decoration: underline;
    }
    .sig-sub {
      margin-top: 1mm;
      font-size: 10pt;
      color: #4a5568;
    }
    .sig-sub em {
      font-size: 8.5pt;
    }

    /* ── QR CODE (tanda tangan digital) ── */
    .qr-sig-wrap {
      margin: 2mm auto 2mm auto;
      display: block;
      width: 26mm;
    }
    .qr-sig-img {
      width: 26mm;
      height: 26mm;
      display: block;
      margin: 0 auto;
      border: 0.5pt solid #d4af37;
      padding: 1mm;
    }
    .qr-sig-label {
      margin-top: 1mm;
      font-size: 6.5pt;
      color: #718096;
      text-align: center;
      line-height: 1.4;
    }
    .qr-sig-label strong {
      display: block;
      font-size: 7pt;
      color: #1e3a5f;
      font-weight: 700;
    }
    
    /* ── PAGE 2 ── */
    .p2-content {
      position: absolute;
      top: 15mm;
      left: 15mm;
      right: 15mm;
      bottom: 15mm;
      z-index: 2;
    }
    
    .page2-header {
      text-align: center;
      margin-bottom: 5mm;
    }
    .page2-title {
      font-family: 'Playfair Display', serif;
      font-size: 16pt;
      font-weight: 700;
      color: #1e3a5f;
      text-transform: uppercase;
    }
    .page2-sub {
      font-size: 10pt;
      font-style: italic;
      color: #718096;
    }
    .page2-student {
      font-size: 9.5pt;
      color: #4a5568;
      margin-top: 3mm;
    }
    .page2-student strong { color: #1e3a5f; }

    table.komp {
      width: 100%;
      border-collapse: collapse;
    }
    table.komp thead tr {
      background: #1e3a5f;
    }
    table.komp th {
      padding: 2.5mm;
      font-weight: 700;
      text-align: center;
      border: 1pt solid #1e3a5f;
      font-size: 9pt;
      color: #ffffff;
    }
    .th-en {
      display: block;
      font-size: 7.5pt;
      font-weight: 400;
      font-style: italic;
      opacity: 0.8;
      margin-top: 0.5mm;
    }
    .td-kriteria {
      background: #e8edf4;
      color: #1e3a5f;
      font-weight: 700;
      font-size: 9pt;
      padding: 2mm 3mm;
      border: 1pt solid #1e3a5f;
    }
    .td-sub {
      background: #f5f5f5;
      color: #1c1c1c;
      font-weight: 700;
      font-size: 9pt;
      padding: 2mm 3mm;
      border: 1pt solid #1e3a5f;
      text-transform: uppercase;
      letter-spacing: 0.3pt;
    }
    table.komp td {
      border: 1pt solid #1e3a5f;
      padding: 2.5mm;
      vertical-align: middle;
      font-size: 9pt;
    }
    table.komp tbody tr:nth-child(even) td:not(.td-kriteria):not(.td-sub) { background: #f8f9fa; }
    .td-no      { width: 10mm; text-align: center; font-weight: 600; }

    .td-section { font-weight: 700; font-size: 9pt; vertical-align: middle; }

    /* ── ASSESSORS (page 2 footer) ── */
    table.assessors {
      margin-top: 8mm;
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
    }
    table.assessors td {
      padding: 2.5mm 0;
      vertical-align: top;
      color: #2c3e50;
    }
    .assessor-role {
      width: 50mm;
      font-weight: 700;
      color: #1e3a5f;
    }
    .assessor-role em {
      display: block;
      font-weight: 400;
      font-style: italic;
      color: #718096;
      margin-top: 0.6mm;
      font-size: 8.5pt;
    }

    /* ── CENTERED QR CODE BLOCK (kolom tengah tabel) ── */
    .qr-center-block {
      text-align: center;
    }
    .qr-center-img {
      width: 22mm;
      height: 22mm;
      display: inline-block;
      border: 1pt solid #d4af37;
      padding: 1mm;
      background: #fff;
    }
    .qr-center-label {
      margin-top: 1mm;
      font-size: 6.5pt;
      color: #718096;
      text-align: center;
      line-height: 1.4;
    }
    .qr-center-label strong {
      display: block;
      font-size: 7pt;
      color: #1e3a5f;
      font-weight: 700;
    }

    /* ── DIGITAL SIGNATURE STAMP (in sig cells) ── */
    .dig-sig-stamp {
      display: block;
      margin: 2mm auto 2mm auto;
      border: 1pt dashed #1e3a5f;
      border-radius: 2mm;
      padding: 2mm 3mm;
      background: #f0f4f8;
      text-align: left;
      width: 80%;
    }
    .dig-sig-stamp-header {
      font-size: 7.5pt;
      font-weight: 700;
      color: #1e3a5f;
      display: block;
      margin-bottom: 1mm;
      background: #1e3a5f;
      color: #fff;
      padding: 0.5mm 2mm;
      border-radius: 1mm;
      letter-spacing: 0.2px;
    }
    .dig-sig-stamp-row {
      font-size: 6.5pt;
      color: #4a5568;
      display: block;
      line-height: 1.5;
    }
    .dig-sig-stamp-hash {
      font-size: 6pt;
      color: #2d3748;
      font-family: 'Courier New', monospace;
      letter-spacing: 0.3px;
      word-break: break-all;
      display: block;
      margin-top: 0.5mm;
    }
    .dig-sig-unsigned {
      font-size: 7pt;
      color: #a0aec0;
      font-style: italic;
      text-align: center;
      border-color: #cbd5e0;
      background: #f7fafc;
    }
  </style>
</head>
<body>
@php $backgroundPath = !empty($background_template_path) ? public_path('storage/' . ltrim($background_template_path, '/')) : null; @endphp

{{-- ============================================================
     HALAMAN 1 — SERTIFIKAT (A4)
============================================================ --}}
<div class="page">

  @if(!empty($backgroundPath) && file_exists($backgroundPath))
    <img src="{{ $backgroundPath }}" alt="Background Sertifikat" class="bg-custom">
  @else
    {{-- Background SVG: border stripes + corner ornaments --}}
    <div class="bg">
      <svg width="210mm" height="297mm" viewBox="0 0 794 1123" xmlns="http://www.w3.org/2000/svg">
       
        {{-- Top/Bottom gold stripe --}}
        <rect x="0" y="0"    width="794" height="11" fill="#d4af37"/>
        <rect x="0" y="1112" width="794" height="11" fill="#d4af37"/>
        {{-- Left/Right gold stripe --}}
        <rect x="0"   y="0" width="11"  height="1123" fill="#1e5a8e" opacity="0.3"/>
        <rect x="783" y="0" width="11"  height="1123" fill="#1e5a8e" opacity="0.3"/>
        {{-- Corner L-ornaments (top-left) --}}
        <path d="M0,0 L114,0 L114,11 L11,11 L11,114 L0,114 Z" fill="#d4af37" opacity="0.8"/>
        {{-- Corner L-ornaments (top-right) --}}
        <path d="M794,0 L680,0 L680,11 L783,11 L783,114 L794,114 Z" fill="#d4af37" opacity="0.8"/>
        {{-- Corner L-ornaments (bottom-left) --}}
        <path d="M0,1123 L114,1123 L114,1112 L11,1112 L11,1009 L0,1009 Z" fill="#d4af37" opacity="0.8"/>
        {{-- Corner L-ornaments (bottom-right) --}}
        <path d="M794,1123 L680,1123 L680,1112 L783,1112 L783,1009 L794,1009 Z" fill="#d4af37" opacity="0.8"/>
      </svg>
    </div>
  @endif

  {{-- Double frame --}}
  <div class="frame-outer"></div>
  <div class="frame-inner"></div>

  {{-- QR kini dirender di dalam kolom tengah tabel signature --}}

  {{-- Main content --}}
  <div class="content">

    {{-- Header bar --}}
    <div class="header-center">
      @php $logoPath = !empty($logo_path) ? public_path('storage/' . ltrim($logo_path, '/')) : public_path('images/logo-dinas-pendidikan.png'); @endphp
      @if(file_exists($logoPath))
        <img src="{{ $logoPath }}" alt="Logo Dinas" class="header-center-logo">
      @else
        <div class="header-logo-fallback">LOGO<br>DINAS</div>
      @endif
    </div>

    {{-- Certificate title --}}
    <div class="cert-title" style="font-size: 24pt;">Sertifikat Uji Kompetensi</div>
    <div class="cert-subtitle" style="font-size: 14pt;">Certificate of Competency Assessment</div>
    <div class="cert-no-wrap">
      <span class="cert-no">Nomor : <span class="nowrap">{{ $nomor_sertifikat }}</span></span>
    </div>

    {{-- Certify text --}}
    <div class="certify-text">
      Dengan bangga diberikan kepada<br>
      <span class="info-en">This certificate is proudly presented to</span>
    </div>

    {{-- Name box --}}
    <div class="name-box">
      <div class="name">{{ $nama }}</div>
      <div class="nis">NISN &nbsp;&bull;&nbsp; {{ $nis }}</div>
    </div>

    {{-- Info rows --}}
    <div class="info-row">
      Telah mengikuti Uji Kompetensi Keahlian<br>
      <span class="info-en">has taken the competency test</span><br><br>
      pada Kompetensi Keahlian<br>
      <span class="info-en">in Competency of</span>
    </div>

    <div class="jurusan-text">{{ $jurusan }}</div>

    @if(!empty($judul_pengujian))
      <div class="judul-outer">
        <div class="judul-label">pada Judul Penugasan <br><span class="info-en">on Assignment</span></div>
        <div class="judul-main">{{ $judul_pengujian }}</div>
        @if(!empty($judul_pengujian_en))
          <div class="judul-en">{{ $judul_pengujian_en }}</div>
        @endif
      </div>
    @endif

    {{-- Predikat --}}
    <div class="predikat-section">
      <div class="predikat-label">
        dengan predikat<br>
        <span class="info-en">with achievement level</span>
      </div>
      <div class="predikat-badge-wrap">
        <span class="predikat-badge">{{ $predikat }}</span>
      </div>
      <div class="nilai-text">
        Nilai Akhir :&nbsp;<strong>{{ $nilai_akhir }}</strong><br>
        <span class="info-en">Final Score</span>
      </div>
    </div>

  </div>{{-- /content --}}

  {{-- Signatures Wrapper --}}
  <div class="signature-wrapper">
    {{-- Validity --}}
    <div class="valid-section">
      Sertifikat ini berlaku untuk : 3 (tiga) Tahun<br>
      <span class="info-en">This certificate is valid for : 3 (three) Years</span>
    </div>

    {{-- Date --}}
    <div class="sig-date-section">
      {{ $kota ?? '' }}{{ ($kota ?? '') ? ', ' : '' }}{{ \Carbon\Carbon::parse($tanggal_terbit)->translatedFormat('d F Y') }}
    </div>

    {{-- Signatures --}}
    <table class="sig1">
      <tr>
        {{-- Kepala Sekolah --}}
        <td style="width:50%">
          <div class="sig-role">
            Atas Nama {{ $nama_sekolah ?? 'Sekolah' }}<br>
            <em>On Behalf of the School</em>
          </div>
          {{-- QR Tanda Tangan Digital Kepala Sekolah --}}
          @if(!empty($is_signed_kepsek) && !empty($qr_base64))
            <div class="esig-box">
              <div class="esig-qr-cell">
                <img src="data:image/svg+xml;base64,{{ $qr_base64 }}" alt="QR Tanda Tangan Kepsek">
              </div>
              <div class="esig-text-cell">
                <span class="esig-label">Ditandatangani secara elektronik oleh:</span>
                <span class="esig-jabatan">Kepala Sekolah</span>
                <span class="esig-nama">{{ $nama_kepsek ?? '' }}</span>
                @if(!empty($signature_fingerprint))
                  <span class="esig-algo">{{ $signature_algorithm ?? 'RSA-SHA256' }} &bull; {{ implode(' ', str_split(substr($signature_fingerprint, 0, 16), 8)) }}</span>
                @endif
              </div>
            </div>
          @else
            <div class="sig-unsigned-label">Belum ditandatangani digital</div>
          @endif
          {{-- Nama hanya tampil jika belum ditandatangani kepsek --}}
          @if(empty($is_signed_kepsek) || empty($qr_base64))
            <div class="sig-name">{{ $nama_kepsek ?? '____________________________' }}</div>
          @endif
          <div class="sig-sub">
            Kepala Sekolah<br>
            <em>School Principal</em>
          </div>
        </td>

        {{-- Penguji Eksternal --}}
        <td style="width:50%">
          <div class="sig-role">
            @if(!empty($nama_universitas))
              {{ $nama_universitas }}<br>
              <em>{{ $nama_universitas }}</em>
            @else
              &nbsp;<br><em>&nbsp;</em>
            @endif
          </div>
          {{-- QR Tanda Tangan Digital Penguji Eksternal --}}
          @if(!empty($is_signed_penguji) && !empty($qr_base64_penguji))
            <div class="esig-box">
              <div class="esig-qr-cell">
                <img src="data:image/svg+xml;base64,{{ $qr_base64_penguji }}" alt="QR Tanda Tangan Penguji">
              </div>
              <div class="esig-text-cell">
                <span class="esig-label">Ditandatangani secara elektronik oleh:</span>
                <span class="esig-jabatan">Penguji Eksternal</span>
                <span class="esig-nama">{{ $nama_penguji_external ?? '' }}</span>
                @if(!empty($signature_fingerprint_penguji))
                  <span class="esig-algo">{{ $signature_algorithm ?? 'RSA-SHA256' }} &bull; {{ implode(' ', str_split(substr($signature_fingerprint_penguji, 0, 16), 8)) }}</span>
                @endif
              </div>
            </div>
          @else
            <div class="sig-unsigned-label">Belum ditandatangani digital</div>
          @endif
          {{-- Nama hanya tampil jika belum ditandatangani penguji --}}
          @if(empty($is_signed_penguji) || empty($qr_base64_penguji))
            <div class="sig-name">{{ $nama_penguji_external ?? '____________________________' }}</div>
          @endif
          <div class="sig-sub">
            Penguji Eksternal<br>
            <em>External Assessor</em>
          </div>
        </td>
      </tr>
    </table>
  </div>{{-- /signature-wrapper --}}
</div>{{-- /page 1 --}}

<div class="page-break"></div>

{{-- ============================================================
     HALAMAN 2 — DAFTAR KOMPETENSI (A4)
============================================================ --}}
<div class="page">

  @if(!empty($backgroundPath) && file_exists($backgroundPath))
    <img src="{{ $backgroundPath }}" alt="Background Sertifikat" class="bg-custom">
  @else
    <div class="bg">
      <svg width="210mm" height="297mm" viewBox="0 0 794 1123" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0"    width="794" height="11" fill="#d4af37"/>
        <rect x="0" y="1112" width="794" height="11" fill="#d4af37"/>
        <rect x="0"   y="0" width="11"  height="1123" fill="#1e5a8e" opacity="0.3"/>
        <rect x="783" y="0" width="11"  height="1123" fill="#1e5a8e" opacity="0.3"/>
        <path d="M0,0 L114,0 L114,11 L11,11 L11,114 L0,114 Z"         fill="#d4af37" opacity="0.8"/>
        <path d="M794,0 L680,0 L680,11 L783,11 L783,114 L794,114 Z"   fill="#d4af37" opacity="0.8"/>
        <path d="M0,1123 L114,1123 L114,1112 L11,1112 L11,1009 L0,1009 Z"       fill="#d4af37" opacity="0.8"/>
        <path d="M794,1123 L680,1123 L680,1112 L783,1112 L783,1009 L794,1009 Z" fill="#d4af37" opacity="0.8"/>
      </svg>
    </div>
  @endif

  <div class="frame-outer"></div>
  <div class="frame-inner"></div>

  <div class="p2-content">
    <div class="page2-header">
      <div class="page2-title">Daftar Kompetensi yang Diuji</div>
      <div class="page2-sub">List of Assessed Competencies</div>
      <div class="page2-student">
        Peserta : <strong>{{ $nama }}</strong>
        &nbsp;&bull;&nbsp; NISN: <strong>{{ $nis }}</strong>
        &nbsp;&bull;&nbsp; {{ $jurusan }}
      </div>
    </div>

    <table class="komp">
      <thead>
        <tr>
          <th class="td-no">No<span class="th-en">No.</span></th>
          <th style="width: 36mm;">KODE KOMPETEN<span class="th-en">Competency Code</span></th>
          <th>JUDUL KOMPETEN<span class="th-en">Competency Title</span></th>
        </tr>
      </thead>
      <tbody>
        @php
          $rows = [];
          if (is_array($kompetensi)) {
            // New grouped format: [{sub_judul, items}]
            $isNewGroupFormat = !empty($kompetensi) && isset($kompetensi[0]['items']);
            // Old object format: {utama: {...}, pendukung: [...]}
            $isOldGroupFormat = isset($kompetensi['utama']) || isset($kompetensi['pendukung']);

            if ($isNewGroupFormat) {
              $itemNo = 0;
              foreach ($kompetensi as $group) {
                $subJudul = $group['sub_judul'] ?? '';
                $items = $group['items'] ?? [];
                if ($subJudul !== '') {
                  $rows[] = ['_type' => 'header', 'label' => $subJudul];
                }
                foreach ($items as $item) {
                  if (is_array($item)) {
                    $itemNo++;
                    $rows[] = ['_type' => 'item', 'no' => $itemNo, 'kode' => $item['kode'] ?? '-', 'judul' => $item['judul'] ?? '-'];
                  }
                }
              }
            } elseif ($isOldGroupFormat) {
              $utama = $kompetensi['utama'] ?? [];
              $groupKeys = ['perencanaan_persiapan', 'implementasi', 'pengujian_dokumentasi'];
              $groupLabels = ['Perencanaan dan Persiapan', 'Implementasi', 'Pengujian & Dokumentasi'];
              $itemNo = 0;
              foreach ($groupKeys as $ki => $key) {
                $items = $utama[$key] ?? [];
                if (!empty($items)) {
                  $rows[] = ['_type' => 'header', 'label' => $groupLabels[$ki]];
                  foreach ($items as $item) {
                    if (is_array($item)) {
                      $itemNo++;
                      $rows[] = ['_type' => 'item', 'no' => $itemNo, 'kode' => $item['kode'] ?? '-', 'judul' => $item['judul'] ?? '-'];
                    }
                  }
                }
              }
              $pendukung = $kompetensi['pendukung'] ?? [];
              if (!empty($pendukung)) {
                $rows[] = ['_type' => 'header', 'label' => 'Kompetensi Pendukung'];
                foreach ($pendukung as $item) {
                  if (is_array($item)) {
                    $itemNo++;
                    $rows[] = ['_type' => 'item', 'no' => $itemNo, 'kode' => $item['kode'] ?? '-', 'judul' => $item['judul'] ?? '-'];
                  }
                }
              }
            } else {
              $itemNo = 0;
              foreach ($kompetensi as $item) {
                if (is_array($item)) {
                  $itemNo++;
                  $rows[] = ['_type' => 'item', 'no' => $itemNo, 'kode' => $item['kode'] ?? '-', 'judul' => $item['judul'] ?? '-'];
                }
              }
            }
          }
        @endphp
        @forelse($rows as $row)
          @if($row['_type'] === 'header')
            <tr>
              <td colspan="3" style="background:#2d3748; color:#fff; font-size:8pt; font-weight:600; padding:4px 6px;">
                {{ $row['label'] }}
              </td>
            </tr>
          @else
            <tr>
              <td class="td-no">{{ $row['no'] }}</td>
              <td>{{ $row['kode'] }}</td>
              <td>{{ $row['judul'] }}</td>
            </tr>
          @endif
        @empty
          <tr>
            <td colspan="3" style="padding:10mm 0; text-align:center; font-style:italic; color:#718096;">
              Data kompetensi belum diisi.
            </td>
          </tr>
        @endforelse
      </tbody>
    </table>

    <table class="assessors">
      <tr>
        <td class="assessor-role">
          Penguji Internal
          <em>Internal Assessor</em>
        </td>
        <td style="text-align: left;">
          : <strong>{{ $nama_penguji_internal ?? '________________________________' }}</strong>
          @if(!empty($nama_sekolah))
            <br><span style="color:#718096; padding-left: 2mm;"> &mdash; {{ $nama_sekolah }}</span>
          @endif
        </td>
      </tr>
      <tr>
        <td class="assessor-role">
          Penguji Eksternal
          <em>External Assessor</em>
        </td>
        <td style="text-align: left;">
          : <strong>{{ $nama_penguji_external ?? '________________________________' }}</strong>
          @if(!empty($nama_universitas))
            <br><span style="color:#718096; padding-left: 2mm;"> &mdash; {{ $nama_universitas }}</span>
          @endif
        </td>
      </tr>
    </table>

  </div>

</div>{{-- /page 2 --}}

</body>
</html>
