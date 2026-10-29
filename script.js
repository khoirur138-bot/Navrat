const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];

const menuToggle = $('#menuToggle');
const mainNav = $('#mainNav');
menuToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.textContent = open ? '✕' : '☰';
});
$$('#mainNav a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.textContent = '☰';
}));

$('#themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('theme-dark');
  const dark = document.body.classList.contains('theme-dark');
  $('#themeToggle').innerHTML = dark ? '☀ <span>Tema</span>' : '◐ <span>Tema</span>';
  try { localStorage.setItem('navrat-theme', dark ? 'dark' : 'light'); } catch(e) {}
});
try { if (localStorage.getItem('navrat-theme') === 'dark') document.body.classList.add('theme-dark'); } catch(e) {}

const watchedSections = ['peta','kompas','teknik','gps','praktik','latihan','sumber'];
const seen = new Set();
const progressBar = $('#progressBar');
const progressText = $('#progressText');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        seen.add(entry.target.id);
        const pct = Math.round(seen.size / watchedSections.length * 100);
        progressBar.style.width = `${pct}%`;
        progressText.textContent = `${pct}%`;
      }
    });
  }, { threshold: 0.18 });
  watchedSections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
}

const quizData = [
  {q:'Apa fungsi utama peta topografi dalam navigasi darat?', options:['Menampilkan relief dan unsur medan untuk membantu perencanaan rute','Menentukan cuaca secara pasti','Menggantikan seluruh perlengkapan navigasi','Menjamin rute selalu aman'], answer:0, explain:'Peta topografi menunjukkan relief melalui kontur serta berbagai unsur alam dan buatan. Kondisi lapangan tetap harus diverifikasi.'},
  {q:'Pada skala 1:25.000, jarak 4 cm di peta setara dengan jarak lurus berapa di lapangan?', options:['100 meter','250 meter','1 kilometer','10 kilometer'], answer:2, explain:'4 × 25.000 cm = 100.000 cm = 1.000 m = 1 km.'},
  {q:'Garis kontur menghubungkan titik-titik yang memiliki ...', options:['Jarak yang sama dari utara','Ketinggian yang sama','Jenis tanah yang sama','Jarak yang sama dari sungai'], answer:1, explain:'Setiap garis kontur menghubungkan titik dengan elevasi/ketinggian yang sama.'},
  {q:'Azimut umumnya diukur searah jarum jam mulai dari ...', options:['Selatan','Barat','Timur','Utara acuan'], answer:3, explain:'Azimut adalah sudut dari utara acuan, diukur searah jarum jam.'},
  {q:'Berapa back azimuth dari azimut 70°?', options:['70°','110°','250°','290°'], answer:2, explain:'Karena 70° kurang dari 180°, tambahkan 180°: hasilnya 250°.'},
  {q:'Tujuan utama resection dalam navigasi peta-kompas adalah ...', options:['Menentukan posisi pengamat pada peta','Mengukur suhu udara','Menentukan umur peta','Mengukur kecepatan angin'], answer:0, explain:'Resection digunakan untuk memperkirakan posisi pengamat dengan bantuan tanda medan yang dikenal pada peta dan lapangan.'},
  {q:'Intersection digunakan untuk memperkirakan ...', options:['Ketinggian awan','Posisi sasaran dari dua atau lebih titik pengamatan','Skala peta yang hilang','Arah utara sejati tanpa referensi'], answer:1, explain:'Arah dari titik pengamatan yang diketahui diplot ke peta; perpotongannya memperkirakan posisi sasaran.'},
  {q:'Apa yang dapat mengganggu pembacaan kompas magnetik?', options:['Membaca legenda peta','Benda logam atau sumber magnetik di dekat kompas','Mencatat hasil bidikan','Menggunakan pensil di atas kertas'], answer:1, explain:'Benda logam tertentu, magnet, kendaraan, atau kabel berarus dapat memengaruhi pembacaan kompas.'},
  {q:'Manakah pernyataan paling tepat tentang GPS?', options:['Selalu akurat sempurna di semua tempat','Tidak memerlukan daya perangkat','Bermanfaat sebagai alat bantu, tetapi perlu diverifikasi dengan peta dan pengamatan','Bisa menggantikan penilaian risiko'], answer:2, explain:'Sinyal, halangan, perangkat, dan pengaturan koordinat memengaruhi hasil. GPS sebaiknya menjadi bagian dari sistem navigasi, bukan satu-satunya sandaran.'},
  {q:'Saat tim tidak yakin dengan posisi atau rute, tindakan paling aman adalah ...', options:['Berpisah agar lebih cepat mencari jalan','Terus berjalan tanpa memeriksa peta','Mengikuti orang yang tidak dikenal','Berhenti di tempat aman, menilai situasi, berkomunikasi, dan mengikuti prosedur pembina'], answer:3, explain:'Utamakan keselamatan: berhenti di tempat aman, jangan berpencar, komunikasikan keadaan, dan ikuti rencana darurat yang disepakati.'}
];

const questionsEl = $('#questions');
quizData.forEach((item, index) => {
  const card = document.createElement('fieldset');
  card.className = 'question-card';
  card.innerHTML = `<legend class="question-title"><span>${String(index+1).padStart(2,'0')}</span>${item.q}</legend>` +
    item.options.map((option, optionIndex) => `<label class="option"><input type="radio" name="q${index}" value="${optionIndex}"><span>${String.fromCharCode(65+optionIndex)}. ${option}</span></label>`).join('') +
    `<div class="explanation" hidden></div>`;
  questionsEl.appendChild(card);
});

$('#quizForm').addEventListener('submit', event => {
  event.preventDefault();
  let score = 0;
  const cards = $$('.question-card');
  cards.forEach((card, index) => {
    const selected = $(`input[name="q${index}"]:checked`, card);
    const explanation = $('.explanation', card);
    const labels = $$('.option', card);
    labels.forEach((label, optionIndex) => {
      label.classList.remove('correct','incorrect');
      if (optionIndex === quizData[index].answer) label.classList.add('correct');
      if (selected && Number(selected.value) === optionIndex && optionIndex !== quizData[index].answer) label.classList.add('incorrect');
    });
    explanation.hidden = false;
    explanation.textContent = `Pembahasan: ${quizData[index].explain}`;
    if (selected && Number(selected.value) === quizData[index].answer) score++;
  });
  const result = $('#quizResult');
  result.hidden = false;
  const percent = Math.round(score / quizData.length * 100);
  let message = percent >= 90 ? 'Hebat! Pemahaman dasarmu sangat kuat.' : percent >= 70 ? 'Bagus! Tinjau kembali beberapa konsep yang masih keliru.' : 'Terus berlatih. Baca pembahasan, lalu coba lagi.';
  result.innerHTML = `<h3>Nilai kamu: ${score}/${quizData.length} (${percent}%)</h3><p>${message}</p><p>Gunakan hasil ini untuk belajar, bukan sebagai pengganti penilaian praktik bersama instruktur.</p>`;
  result.scrollIntoView({behavior:'smooth', block:'center'});
});

$('#resetQuiz').addEventListener('click', () => {
  $('#quizForm').reset();
  $$('.option').forEach(label => label.classList.remove('correct','incorrect'));
  $$('.explanation').forEach(el => { el.hidden = true; el.textContent = ''; });
  $('#quizResult').hidden = true;
  $('#quizForm').scrollIntoView({behavior:'smooth', block:'start'});
});
