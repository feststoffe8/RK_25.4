document.addEventListener('DOMContentLoaded', () => {
    const hotelCostInput = document.getElementById('hotelCost');
    const dayCheckboxes = document.querySelectorAll('.day-checkbox');
    const dailyExpenseInputs = document.querySelectorAll('.daily-expense-input');
    const totalTravelCostOutput = document.getElementById('totalTravelCost');
    const generateReportButton = document.getElementById('generateReport');

    const dailyRates = {
        firstChecked: 25.00,
        intermediate: 33.40,
        lastChecked: 19.40
    };

    function calculateTotalDailyExpenses() {
        let totalDailyExpenses = 0;
        dailyExpenseInputs.forEach(input => {
            if (input.style.display !== 'none') { // Nur sichtbare Felder berücksichtigen
                totalDailyExpenses += parseFloat(input.value) || 0;
            }
        });
        return totalDailyExpenses;
    }

    function calculateTravelCosts() {
        let totalHotelCost = parseFloat(hotelCostInput.value) || 0;
        let dailyAllowance = 0;
        const checkedDays = Array.from(dayCheckboxes).filter(checkbox => checkbox.checked);

        if (checkedDays.length > 0) {
            dailyAllowance += dailyRates.firstChecked; // Erstes angehaktes Kästchen

            if (checkedDays.length > 1) {
                // Kästchen zwischen dem ersten und letzten
                for (let i = 1; i < checkedDays.length - 1; i++) {
                    dailyAllowance += dailyRates.intermediate;
                }
                dailyAllowance += dailyRates.lastChecked; // Letztes angehaktes Kästchen
            }
        }

        const totalDailyExpenses = calculateTotalDailyExpenses();
        const totalCost = totalHotelCost + dailyAllowance + totalDailyExpenses;
        totalTravelCostOutput.textContent = totalCost.toFixed(2);
    }

    // Event Listener für Änderungen an Hotelkosten und Checkboxen
    hotelCostInput.addEventListener('input', calculateTravelCosts);

    dayCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const day = event.target.dataset.day;
            const dailyExpenseInput = document.querySelector(`.daily-expense-input[data-day="${day}"]`);
            if (event.target.checked) {
                dailyExpenseInput.style.display = 'block'; // Eingabefeld anzeigen
            } else {
                dailyExpenseInput.style.display = 'none'; // Eingabefeld ausblenden
                dailyExpenseInput.value = ''; // Wert zurücksetzen, wenn Checkbox deaktiviert wird
            }
            calculateTravelCosts();
        });
    });

    dailyExpenseInputs.forEach(input => {
        input.addEventListener('input', calculateTravelCosts);
    });

    // Initialberechnung beim Laden der Seite
    calculateTravelCosts();

    generateReportButton.addEventListener('click', () => {
        const calendarWeek = document.getElementById('calendarWeek').value;
        const caseName = document.getElementById('caseName').value;
        const hotelName = document.getElementById('hotelName').value;
        const totalHotelCost = parseFloat(hotelCostInput.value) || 0;
        const totalTravelCost = parseFloat(totalTravelCostOutput.textContent);
        
        const checkedDays = Array.from(dayCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.dataset.day);

        let totalDailyExpensesInReport = 0;
        let dailyExpensesDetails = '';
        dailyExpenseInputs.forEach(input => {
            if (input.style.display !== 'none' && input.value) {
                const day = input.dataset.day;
                const expense = parseFloat(input.value) || 0;
                totalDailyExpensesInReport += expense;
                dailyExpensesDetails += `<p>- ${day}: ${expense.toFixed(2)} €</p>`;
            }
        });


        let reportContent = `
            <h2>Reisekostenbericht ${calendarWeek ? `(KW ${calendarWeek})` : ''}</h2>
            <p><strong>Fall-Name:</strong> ${caseName || 'Nicht angegeben'}</p>
            <p><strong>Hotel-Name:</strong> ${hotelName || 'Nicht angegeben'}</p>
            <p><strong>Gesamtbetrag Hotelkosten:</strong> ${totalHotelCost.toFixed(2)} €</p>
            <p><strong>Reisetage:</strong> ${checkedDays.length > 0 ? checkedDays.join(', ') : 'Keine'}</p>
            <p>---</p>
            <p>Berechnung der Reisetagepauschale:</p>
        `;

        let dailyAllowanceDetails = 0;
        if (checkedDays.length > 0) {
            reportContent += `<p>- Erster Tag (${checkedDays[0]}): ${dailyRates.firstChecked.toFixed(2)} €</p>`;
            dailyAllowanceDetails += dailyRates.firstChecked;

            if (checkedDays.length > 1) {
                for (let i = 1; i < checkedDays.length - 1; i++) {
                    reportContent += `<p>- Zwischenliegender Tag (${checkedDays[i]}): ${dailyRates.intermediate.toFixed(2)} €</p>`;
                    dailyAllowanceDetails += dailyRates.intermediate;
                }
                reportContent += `<p>- Letzter Tag (${checkedDays[checkedDays.length - 1]}): ${dailyRates.lastChecked.toFixed(2)} €</p>`;
                dailyAllowanceDetails += dailyRates.lastChecked;
            }
        } else {
            reportContent += `<p>Keine Reisetagepauschale berechnet.</p>`;
        }
        reportContent += `<p><strong>Summe Tagespauschalen:</strong> ${dailyAllowanceDetails.toFixed(2)} €</p>`;
        
        reportContent += `<p>---</p>`;
        reportContent += `<p>Tagesausgaben:</p>`;
        if (dailyExpensesDetails) {
            reportContent += dailyExpensesDetails;
            reportContent += `<p><strong>Gesamte Tagesausgaben:</strong> ${totalDailyExpensesInReport.toFixed(2)} €</p>`;
        } else {
            reportContent += `<p>Keine Tagesausgaben eingetragen.</p>`;
        }

        reportContent += `<p>---</p>`;
        reportContent += `<p><strong>Gesamtbetrag Reisekosten (Hotel + Pauschalen + Tagesausgaben):</strong> ${totalTravelCost.toFixed(2)} €</p>`;


        // Berichtsseite in einem neuen Tab öffnen
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reisekostenbericht</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; padding: 20px; line-height: 1.6; }
                    h2 { color: #333; }
                    p { margin-bottom: 8px; }
                    strong { font-weight: bold; }
                    @media print {
                        button { display: none; } /* Button beim Drucken ausblenden */
                    }
                </style>
            </head>
            <body>
                ${reportContent}
                <button onclick="window.print()">Bericht drucken</button>
            </body>
            </html>
        `);
        newWindow.document.close();
    });
});
