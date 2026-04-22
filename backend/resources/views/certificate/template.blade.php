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
      /* Cadangan ruang untuk area tanda tangan di bawah */
      padding-bottom: 82mm;
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
      border-radius: 50%;
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
  </style>
</head>
<body>

{{-- ============================================================
     HALAMAN 1 — SERTIFIKAT (A4)
============================================================ --}}
<div class="page">

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

  {{-- Double frame --}}
  <div class="frame-outer"></div>
  <div class="frame-inner"></div>

  {{-- Main content --}}
  <div class="content">

    {{-- Header bar --}}
    <div class="header-center">
      @php $logoPath = public_path('images/logo-dinas-pendidikan.png'); @endphp
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
        <td>
          <div class="sig-role">
            Atas Nama {{ $nama_sekolah ?? 'Sekolah' }}<br>
            <em>On Behalf of the School</em>
          </div>
          {{-- QR = Tanda Tangan Digital Kepala Sekolah --}}
          @if(!empty($qr_base64))
            <div class="qr-sig-wrap">
              <img src="data:image/svg+xml;base64,{{ $qr_base64 }}" alt="TTD Digital Kepala Sekolah" class="qr-sig-img">
              <div class="qr-sig-label">
                <strong>Tanda Tangan Digital</strong>
                Digital Signature
              </div>
            </div>
          @endif
          <div class="sig-name">{{ $nama_kepsek ?? '____________________________' }}</div>
          <div class="sig-sub">
            Kepala Sekolah<br>
            <em>School Principal</em>
          </div>
        </td>

        {{-- Penguji Eksternal --}}
        <td>
          <div class="sig-role">
            @if(!empty($nama_universitas))
              {{ $nama_universitas }}<br>
              <em>{{ $nama_universitas }}</em>
            @else
              &nbsp;<br><em>&nbsp;</em>
            @endif
          </div>
          {{-- QR = Tanda Tangan Digital Penguji Eksternal --}}
          @if(!empty($qr_base64))
            <div class="qr-sig-wrap">
              <img src="data:image/svg+xml;base64,{{ $qr_base64 }}" alt="TTD Digital Penguji Eksternal" class="qr-sig-img">
              <div class="qr-sig-label">
                <strong>Tanda Tangan Digital</strong>
                Digital Signature
              </div>
            </div>
          @endif
          <div class="sig-name">{{ $nama_penguji_external ?? '____________________________' }}</div>
          <div class="sig-sub">
            Penguji Eksternal<br>
            <em>External Assessor</em>
          </div>
        </td>
      </tr>
    </table>
  </div>
</div>{{-- /page 1 --}}

<div class="page-break"></div>

{{-- ============================================================
     HALAMAN 2 — DAFTAR KOMPETENSI (A4)
============================================================ --}}
<div class="page">

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
          <th>ELEMEN KOMPETENSI<span class="th-en">Competency Elements</span></th>
        </tr>
      </thead>
      <tbody>
        @php
          $isNewFormat = is_array($kompetensi) && (isset($kompetensi['utama']) || isset($kompetensi['pendukung']));
          $rowNum = 1;
        @endphp
        @if($isNewFormat)
          {{-- ── SECTION I: KRITERIA ELEMEN KOMPETENSI UTAMA ── --}}
          <tr>
            <td class="td-no td-section">I</td>
            <td class="td-section">Kriteria Elemen Kompetensi Utama</td>
          </tr>
          @php
            $subSections = [
              'PERENCANAAN &amp; PERSIAPAN' => ['key' => 'perencanaan_persiapan'],
              'IMPLEMENTASI'                => ['key' => 'implementasi'],
              'PENGUJIAN &amp; DOKUMENTASI' => ['key' => 'pengujian_dokumentasi'],
            ];
          @endphp
          @foreach($subSections as $subLabel => $subMeta)
            @php $items = $kompetensi['utama'][$subMeta['key']] ?? []; @endphp
            @if(count($items) > 0)
              <tr>
                <td colspan="2" class="td-sub">{!! $subLabel !!}</td>
              </tr>
              @foreach($items as $k)
                <tr>
                  <td class="td-no">{{ $rowNum++ }}</td>
                  <td>{{ $k['judul'] ?? '-' }}</td>
                </tr>
              @endforeach
            @endif
          @endforeach

          {{-- ── SECTION II: KRITERIA ELEMEN KOMPETENSI PENDUKUNG ── --}}
          @php $pendukung = $kompetensi['pendukung'] ?? []; @endphp
          @if(count($pendukung) > 0)
            <tr>
              <td class="td-no td-section">II</td>
              <td class="td-section">Kriteria Elemen Kompetensi Pendukung</td>
            </tr>
            @foreach($pendukung as $k)
              <tr>
                <td class="td-no">{{ $rowNum++ }}</td>
                <td>{{ $k['judul'] ?? '-' }}</td>
              </tr>
            @endforeach
          @endif
        @else
          {{-- ── FALLBACK: old flat array format ── --}}
          @forelse($kompetensi as $index => $k)
            <tr>
              <td class="td-no">{{ $index + 1 }}</td>
              <td>{{ $k['judul'] ?? $k['kode'] ?? '-' }}</td>
            </tr>
          @empty
            <tr>
              <td colspan="2" style="padding:10mm 0; text-align:center; font-style:italic; color:#718096;">
                Data kompetensi belum diisi.
              </td>
            </tr>
          @endforelse
        @endif
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
