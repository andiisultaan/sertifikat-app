<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Sertifikat - {{ $nama }}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }

    @page { size: A4 landscape; margin: 0; }

    body {
      font-family: Arial, sans-serif;
      width: 297mm;
      height: 210mm;
      overflow: hidden;
      background: #fff;
    }

    .wrap {
      width: 297mm;
      height: 210mm;
      display: table;
      table-layout: fixed;
    }

    /* ===================== PANEL KIRI ===================== */
    .panel-left {
      display: table-cell;
      width: 148.5mm;
      height: 210mm;
      vertical-align: top;
      position: relative;
      overflow: hidden;
      border-right: 1px solid #ccc;
    }

    /* Stripe warna kiri — 5 garis diagonal */
    .stripe-left {
      position: absolute;
      top: 0; left: 0;
      width: 18mm;
      height: 210mm;
      overflow: hidden;
    }
    .stripe-left .s1 { position:absolute; top:0;    left:0;   width:18mm; height:210mm; background:#cc1414; transform:skewX(0deg); }
    .stripe-left .s2 { position:absolute; top:0;    left:3mm; width:4mm;  height:210mm; background:#ffffff; }
    .stripe-left .s3 { position:absolute; top:0;    left:7mm; width:4mm;  height:210mm; background:#1a3faa; }
    .stripe-left .s4 { position:absolute; top:0;    left:11mm;width:4mm;  height:210mm; background:#ffffff; }
    .stripe-left .s5 { position:absolute; top:0;    left:15mm;width:18mm; height:210mm; background:#cc1414; transform:skewX(-10deg); transform-origin:top left; }

    /* Stripe warna bawah kiri */
    .stripe-bottom-left {
      position: absolute;
      bottom: 0; left: 0;
      width: 148.5mm;
      height: 10mm;
      overflow: hidden;
    }
    .stripe-bottom-left .b1 { position:absolute; bottom:0; left:0;   width:148.5mm; height:10mm; background:#cc1414; }
    .stripe-bottom-left .b2 { position:absolute; bottom:0; left:0;   width:148.5mm; height:6mm;  background:#1a3faa; }
    .stripe-bottom-left .b3 { position:absolute; bottom:0; left:0;   width:148.5mm; height:3mm;  background:#cc1414; }

    .left-content {
      position: absolute;
      top: 0; left: 18mm; right: 0; bottom: 10mm;
      padding: 6mm 5mm 4mm 4mm;
    }

    /* Logo area */
    .logo-row {
      display: table;
      width: 100%;
      margin-bottom: 2mm;
    }
    .logo-cell {
      display: table-cell;
      width: 18mm;
      vertical-align: top;
    }
    .logo-circle {
      width: 16mm;
      height: 16mm;
      border-radius: 50%;
      background: #1a3faa;
      border: 2px solid #cc1414;
      display: table;
      text-align: center;
    }
    .logo-text {
      display: table-cell;
      vertical-align: middle;
      color: #fff;
      font-size: 5pt;
      font-weight: bold;
      line-height: 1.2;
    }
    .title-cell {
      display: table-cell;
      vertical-align: middle;
      padding-left: 2mm;
    }

    .cert-title {
      font-size: 13pt;
      font-weight: bold;
      color: #cc1414;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1.1;
    }
    .cert-subtitle {
      font-size: 7pt;
      color: #1a3faa;
      font-style: italic;
    }

    .nomor {
      font-size: 6.5pt;
      color: #555;
      margin-bottom: 2mm;
    }

    .divider-red {
      height: 2px;
      background: #cc1414;
      margin: 1.5mm 0;
    }

    .body-text {
      font-size: 7pt;
      color: #333;
      text-align: center;
      line-height: 1.4;
    }

    .nama-siswa {
      font-size: 18pt;
      font-weight: bold;
      color: #cc1414;
      text-align: center;
      font-style: italic;
      margin: 1mm 0;
      line-height: 1.1;
    }

    .nis-text {
      font-size: 6.5pt;
      color: #555;
      text-align: center;
      margin-bottom: 1mm;
    }

    .jurusan-box {
      text-align: center;
      font-size: 10pt;
      font-weight: bold;
      color: #1a3faa;
      margin: 1mm 0;
    }

    .judul-pengujian {
      font-size: 6.5pt;
      color: #333;
      text-align: center;
      margin: 1mm 2mm;
      line-height: 1.4;
    }

    .predikat-row {
      text-align: center;
      margin: 1.5mm 0;
    }
    .predikat-label {
      font-size: 6.5pt;
      color: #333;
      font-style: italic;
    }
    .predikat-val {
      font-size: 12pt;
      font-weight: bold;
      color: #cc1414;
      line-height: 1.1;
    }
    .nilai-val {
      font-size: 9pt;
      font-weight: bold;
      color: #1a3faa;
    }

    .berlaku-text {
      font-size: 6pt;
      color: #555;
      text-align: center;
      font-style: italic;
      margin-top: 1.5mm;
    }

    .ttd-row {
      display: table;
      width: 100%;
      margin-top: 2mm;
    }
    .ttd-cell {
      display: table-cell;
      width: 50%;
      text-align: center;
      font-size: 6pt;
      color: #333;
      vertical-align: bottom;
    }
    .ttd-space { height: 10mm; }
    .ttd-nama  { font-weight: bold; font-size: 6.5pt; border-top: 1px solid #333; padding-top: 1mm; }
    .ttd-nip   { font-size: 5.5pt; color: #666; }
    .ttd-kota  { font-size: 6pt; color: #333; margin-bottom: 1mm; }

    /* ===================== PANEL KANAN ===================== */
    .panel-right {
      display: table-cell;
      width: 148.5mm;
      height: 210mm;
      vertical-align: top;
      position: relative;
      overflow: hidden;
    }

    /* Stripe warna kanan */
    .stripe-right {
      position: absolute;
      top: 0; right: 0;
      width: 18mm;
      height: 210mm;
      overflow: hidden;
    }
    .stripe-right .r1 { position:absolute; top:0; right:0;   width:18mm; height:210mm; background:#cc1414; }
    .stripe-right .r2 { position:absolute; top:0; right:3mm; width:4mm;  height:210mm; background:#ffffff; }
    .stripe-right .r3 { position:absolute; top:0; right:7mm; width:4mm;  height:210mm; background:#1a3faa; }
    .stripe-right .r4 { position:absolute; top:0; right:11mm;width:4mm;  height:210mm; background:#ffffff; }
    .stripe-right .r5 { position:absolute; top:0; right:15mm;width:18mm; height:210mm; background:#cc1414; transform:skewX(10deg); transform-origin:top right; }

    /* Stripe bawah kanan */
    .stripe-bottom-right {
      position: absolute;
      bottom: 0; right: 0;
      width: 148.5mm;
      height: 10mm;
      overflow: hidden;
    }
    .stripe-bottom-right .b1 { position:absolute; bottom:0; left:0; width:148.5mm; height:10mm; background:#cc1414; }
    .stripe-bottom-right .b2 { position:absolute; bottom:0; left:0; width:148.5mm; height:6mm;  background:#1a3faa; }
    .stripe-bottom-right .b3 { position:absolute; bottom:0; left:0; width:148.5mm; height:3mm;  background:#cc1414; }

    .right-content {
      position: absolute;
      top: 0; left: 0; right: 18mm; bottom: 10mm;
      padding: 6mm 4mm 4mm 5mm;
    }

    .kompetensi-title {
      font-size: 11pt;
      font-weight: bold;
      color: #1a3faa;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .kompetensi-subtitle {
      font-size: 7pt;
      color: #555;
      text-align: center;
      font-style: italic;
      margin-bottom: 2mm;
    }

    /* Tabel kompetensi */
    table.komp-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 6pt;
      margin-top: 2mm;
    }
    table.komp-table th {
      background: #1a3faa;
      color: #fff;
      padding: 1.5mm 2mm;
      text-align: center;
      border: 0.5pt solid #1a3faa;
      font-size: 6pt;
    }
    table.komp-table th.th-sub {
      font-style: italic;
      font-weight: normal;
      font-size: 5.5pt;
    }
    table.komp-table td {
      padding: 1mm 2mm;
      border: 0.5pt solid #ccc;
      vertical-align: top;
      color: #333;
    }
    table.komp-table td.no {
      text-align: center;
      width: 6mm;
    }
    table.komp-table td.kode {
      width: 28mm;
      font-family: monospace;
      font-size: 6pt;
    }
    table.komp-table tr:nth-child(even) td { background: #f5f8ff; }

    /* TTD bawah kanan */
    .ttd-right-row {
      display: table;
      width: 100%;
      margin-top: 3mm;
    }
    .ttd-right-cell {
      display: table-cell;
      width: 50%;
      font-size: 6pt;
      color: #333;
      vertical-align: bottom;
    }
    .ttd-right-cell .label { color: #555; font-style: italic; }
    .ttd-right-cell .nama  { font-weight: bold; font-size: 6.5pt; }
    .ttd-right-cell .univ  { font-size: 5.5pt; color: #666; font-style: italic; }
  </style>
</head>
<body>
<div class="wrap">

  {{-- =================== PANEL KIRI =================== --}}
  <div class="panel-left">

    {{-- Stripe dekoratif kiri --}}
    <div class="stripe-left">
      <div class="s1"></div>
      <div class="s2"></div>
      <div class="s3"></div>
      <div class="s4"></div>
    </div>

    {{-- Stripe bawah --}}
    <div class="stripe-bottom-left">
      <div class="b1"></div>
      <div class="b2"></div>
      <div class="b3"></div>
    </div>

    <div class="left-content">

      {{-- Logo + Judul --}}
      <div class="logo-row">
        <div class="logo-cell">
          <div class="logo-circle">
            <div class="logo-text">SMK</div>
          </div>
        </div>
        <div class="title-cell">
          <div class="cert-title">Sertifikat Uji Kompetensi</div>
          <div class="cert-subtitle">Certificate of Competency Assessment</div>
        </div>
      </div>

      <div class="nomor">Nomor : {{ $nomor_sertifikat }}</div>
      <div class="divider-red"></div>

      {{-- Konten utama --}}
      <div class="body-text" style="margin-top:1.5mm;">
        Dengan ini menyatakan bahwa,<br>
        <span style="font-style:italic; font-size:6pt;">This is to certify that,</span>
      </div>

      <div class="nama-siswa">{{ $nama }}</div>
      <div class="nis-text">NIS: {{ $nis }}</div>

      <div class="body-text">
        Telah mengikuti Uji Kompetensi Keahlian<br>
        <span style="font-style:italic; font-size:6pt;">has taken the competency test</span>
      </div>

      <div class="body-text" style="margin-top:1mm;">
        pada Kompetensi Keahlian / <span style="font-style:italic;">in Competency of</span>
      </div>

      <div class="jurusan-box">{{ $jurusan }}</div>

      @if(!empty($judul_pengujian))
      <div class="body-text" style="margin-top:0.5mm; font-size:6pt;">
        pada Judul Pengujian / <span style="font-style:italic;">on Assessment</span>
      </div>
      <div class="judul-pengujian">{{ $judul_pengujian }}</div>
      @endif

      <div class="predikat-row">
        <div class="predikat-label">dengan predikat / <em>with achievement level</em></div>
        <div class="predikat-val">{{ $predikat }}</div>
        <div class="nilai-val">Nilai Akhir: {{ $nilai_akhir }}</div>
      </div>

      <div class="berlaku-text">
        Sertifikat ini berlaku untuk : 3 (tiga) Tahun<br>
        <em>This certificate is valid for : 3 (three) Years</em>
      </div>

      {{-- TTD --}}
      <div class="ttd-row" style="margin-top:2mm;">
        <div class="ttd-cell">
          <div class="ttd-kota">{{ $nama_sekolah ?? 'Sekolah' }}, {{ \Carbon\Carbon::parse($tanggal_terbit)->translatedFormat('d F Y') }}</div>
          <div class="ttd-space"></div>
          <div class="ttd-nama">{{ $nama_kepsek ?? 'Kepala Sekolah' }}</div>
          <div class="ttd-nip">NIP. {{ $nip_kepsek ?? '-' }}</div>
          <div style="font-size:5.5pt; color:#555;">Kepala Sekolah / <em>School Principal</em></div>
        </div>
        <div class="ttd-cell">
          <div class="ttd-kota">&nbsp;</div>
          <div class="ttd-space"></div>
          <div class="ttd-nama">{{ $nama_penguji_external ?? 'Penguji External' }}</div>
          <div class="ttd-nip">{{ $nama_universitas ?? '' }}</div>
          <div style="font-size:5.5pt; color:#555;">Penguji External / <em>External Assessor</em></div>
        </div>
      </div>

      {{-- Nama sekolah bawah --}}
      <div style="font-size:5.5pt; color:#555; text-align:left; margin-top:1.5mm; border-top:0.5pt solid #ddd; padding-top:1mm;">
        Atas nama {{ $nama_sekolah ?? 'SMK' }}<br>
        On behalf of {{ $nama_sekolah ?? 'SMK' }}
      </div>

    </div>
  </div>

  {{-- =================== PANEL KANAN =================== --}}
  <div class="panel-right">

    <div class="stripe-right">
      <div class="r1"></div>
      <div class="r2"></div>
      <div class="r3"></div>
      <div class="r4"></div>
    </div>

    <div class="stripe-bottom-right">
      <div class="b1"></div>
      <div class="b2"></div>
      <div class="b3"></div>
    </div>

    <div class="right-content">

      <div class="kompetensi-title">Daftar Kompetensi</div>
      <div class="kompetensi-subtitle">List Of Competency</div>
      <div class="divider-red"></div>

      <table class="komp-table">
        <thead>
          <tr>
            <th rowspan="2" style="width:6mm;">No</th>
            <th rowspan="2" style="width:28mm;">
              Kode Kompetensi<br>
              <span class="th-sub">Code of Competency</span>
            </th>
            <th rowspan="2">
              Judul Kompetensi<br>
              <span class="th-sub">Title of Competency</span>
            </th>
          </tr>
        </thead>
        <tbody>
          @forelse($kompetensi as $index => $k)
          <tr>
            <td class="no">{{ $index + 1 }}.</td>
            <td class="kode">{{ $k['kode'] ?? '-' }}</td>
            <td>{{ $k['judul'] ?? '-' }}</td>
          </tr>
          @empty
          <tr>
            <td class="no">1.</td>
            <td class="kode">—</td>
            <td>Data kompetensi belum diisi pada data UKK.</td>
          </tr>
          @endforelse
        </tbody>
      </table>

      {{-- TTD kanan --}}
      <div class="ttd-right-row" style="margin-top:3mm;">
        <div class="ttd-right-cell" style="padding-right:4mm;">
          <div class="label">Penguji Internal<br><em>Internal Assessor</em></div>
          <div style="height:10mm; border-bottom:1px solid #333; margin:1mm 0;"></div>
          <div class="nama">{{ $nama_penguji_internal ?? '________________________' }}</div>
        </div>
        <div class="ttd-right-cell" style="padding-left:2mm;">
          <div class="label">Penguji External<br><em>External Assessor</em></div>
          <div style="height:10mm; border-bottom:1px solid #333; margin:1mm 0;"></div>
          <div class="nama">{{ $nama_penguji_external ?? '________________________' }}</div>
          @if(!empty($nama_universitas))
          <div class="univ">({{ $nama_universitas }})</div>
          @endif
        </div>
      </div>

    </div>
  </div>

</div>
</body>
</html>
