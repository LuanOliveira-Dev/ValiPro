import { renderAVencerTable } from "./produtos.js";

let currentSectorFilter = 'todos';

export function getCurrentSectorFilter() {
    return currentSectorFilter;
}

export function initFiltros() {
    const filterSectorAvencer = document.getElementById('filter-sector-avencer');
    if (filterSectorAvencer) {
        filterSectorAvencer.addEventListener('change', (e) => {
            currentSectorFilter = e.target.value;
            renderAVencerTable();
        });
    }
}