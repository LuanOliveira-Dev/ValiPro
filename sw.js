const CACHE_NAME = 'valipro-v92'; // Nome corrigido para ValiPro e versão atualizada para forçar a renovação
const urlsToCache = [
  './',
  './index.html',
  './painel.html', 
  './style/app.css',
  './style/cards.css',
  './style/forms.css',
  './style/login.css',
  './style/dashboard.css',
  './style/responsive.css',
  './style/darkmode.css',
  './style/navbar.css',
  './style/tables.css',
  './style/modals.css',
  './style/animations.css',
  './login-script.js', 
  './script.js',
  './firebase-config.js',
  './manifest.json'
];

// Instalação: Salva os arquivos essenciais no cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache aberto e arquivos mapeados');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Removendo cache antigo:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Busca (Fetch): Tenta a rede primeiro, se falhar (offline), usa o cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
