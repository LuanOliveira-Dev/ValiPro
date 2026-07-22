const CACHE_NAME = 'valipro-v93'; // Mantenha a versão v91

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './painel.html',
  './style/style.css',
  './script/app.js',
  './script/firebase.js',
  './script/auth.js',
  './script/produtos.js',
  './script/setores.js',
  './script/colaboradores.js',
  './script/cards.js',
  './script/filtros.js',
  './script/theme.js',
  './script/notificacoes.js',
  './script/scanner.js',
  './script/utils.js'
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
