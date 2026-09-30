(() => {
    const formatNumber = (value, decimals = 4) => new Intl.NumberFormat('es-AR', {
        maximumFractionDigits: decimals
    }).format(value);

    const valueOf = id => Number.parseFloat(document.getElementById(id)?.value);
    const validPositive = value => Number.isFinite(value) && value > 0;

    const showMessage = (element, message, isError = false) => {
        element.hidden = false;
        element.className = `calculation-result${isError ? ' is-error' : ''}`;
        element.innerHTML = message;
    };

    const setGeneralMode = () => {
        const mode = document.querySelector('input[name="dilutionMode"]:checked')?.value;
        const label = document.getElementById('volumeLabel');
        const input = document.getElementById('targetVolume');
        if (!label || !input) return;
        label.firstChild.textContent = mode === 'available'
            ? 'Volumen disponible (V₁)'
            : 'Volumen final deseado (V₂)';
        input.placeholder = mode === 'available' ? 'Ej. 2' : 'Ej. 5';
    };

    const calculateGeneral = () => {
        const c1 = valueOf('initialConcentration');
        const c2 = valueOf('finalConcentration');
        const volume = valueOf('targetVolume');
        const unit = document.getElementById('generalVolumeUnit')?.value || 'mL';
        const mode = document.querySelector('input[name="dilutionMode"]:checked')?.value;
        const result = document.getElementById('generalResult');

        if (!validPositive(c1) || !validPositive(c2) || !validPositive(volume)) {
            showMessage(result, '<strong>Completá los tres valores</strong><span>Usá números mayores que cero para realizar el cálculo.</span>', true);
            return;
        }
        if (c2 > c1) {
            showMessage(result, '<strong>No es una dilución</strong><span>La concentración final no puede ser mayor que la inicial.</span>', true);
            return;
        }

        const factor = c1 / c2;
        const stock = mode === 'available' ? volume : (c2 * volume) / c1;
        const finalVolume = mode === 'available' ? (c1 * volume) / c2 : volume;
        const diluent = finalVolume - stock;
        showMessage(result, `
            <strong>Preparación calculada</strong>
            <div class="result-values">
                <div><small>Stock (V₁)</small><b>${formatNumber(stock)} ${unit}</b></div>
                <div><small>Diluyente</small><b>${formatNumber(diluent)} ${unit}</b></div>
                <div><small>Volumen final (V₂)</small><b>${formatNumber(finalVolume)} ${unit}</b></div>
                <div><small>Factor de dilución</small><b>1 : ${formatNumber(factor)}</b></div>
            </div>
            <span>Mezclá <b>${formatNumber(stock)} ${unit}</b> de stock con <b>${formatNumber(diluent)} ${unit}</b> de diluyente.</span>
        `);
    };

    const calculateSerial = () => {
        const concentration = valueOf('serialConcentration');
        const factor = valueOf('serialFactor');
        const steps = Number.parseInt(document.getElementById('serialSteps')?.value, 10);
        const volume = valueOf('serialVolume');
        const unit = document.getElementById('serialVolumeUnit')?.value || 'mL';
        const result = document.getElementById('serialResult');

        if (!validPositive(concentration) || !validPositive(factor) || !Number.isInteger(steps) || steps < 1 || steps > 50 || !validPositive(volume) || factor < 1) {
            result.hidden = false;
            result.innerHTML = '<div class="calculation-result is-error"><strong>Revisá los datos</strong><span>Ingresá valores positivos y entre 1 y 50 tubos.</span></div>';
            return;
        }

        const transfer = volume / factor;
        const diluent = volume - transfer;
        let rows = '';
        for (let step = 1; step <= steps; step += 1) {
            const cumulative = factor ** step;
            rows += `<tr><th scope="row">${step}</th><td>1 : ${formatNumber(cumulative)}</td><td>${formatNumber(concentration / cumulative)}</td><td>${formatNumber(transfer)} ${unit}</td><td>${formatNumber(diluent)} ${unit}</td></tr>`;
        }
        result.hidden = false;
        result.innerHTML = `
            <p class="serial-summary">Por cada tubo: transferí <b>${formatNumber(transfer)} ${unit}</b> de la dilución anterior y agregá <b>${formatNumber(diluent)} ${unit}</b> de diluyente para completar ${formatNumber(volume)} ${unit}.</p>
            <div class="table-scroll"><table><thead><tr><th>Tubo</th><th>Dilución acumulada</th><th>Concentración</th><th>Transferir</th><th>Diluyente</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    };

    document.querySelectorAll('[data-dilution-tab]').forEach(button => button.addEventListener('click', () => {
        const activePanel = button.dataset.dilutionTab;
        document.querySelectorAll('[data-dilution-tab]').forEach(tab => {
            const active = tab === button;
            tab.classList.toggle('is-active', active);
            tab.setAttribute('aria-selected', String(active));
        });
        document.querySelectorAll('.dilution-panel').forEach(panel => { panel.hidden = panel.id !== activePanel; });
    }));

    document.querySelectorAll('input[name="dilutionMode"]').forEach(input => input.addEventListener('change', setGeneralMode));
    document.getElementById('calculateGeneral')?.addEventListener('click', calculateGeneral);
    document.getElementById('calculateSerial')?.addEventListener('click', calculateSerial);
    setGeneralMode();
})();
