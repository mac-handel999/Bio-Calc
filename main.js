        // Sidebar navigation logic
        const sidebarLinks = document.querySelectorAll('#sidebarNav .sidebar-link');
        const calculatorSections = document.querySelectorAll('.calculator-section');
        const welcomeMessage = document.getElementById('welcome-message');

        // Function to show a specific calculator section
        function showSection(targetId) {
            let sectionFound = false;
            calculatorSections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active');
                    sectionFound = true;
                } else {
                    section.classList.remove('active');
                }
            });
            if (welcomeMessage) {
                 welcomeMessage.style.display = sectionFound ? 'none' : 'block';
            }
        }

        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const targetId = this.getAttribute('data-target');

                // Update active link styling
                sidebarLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                showSection(targetId);
            });
        });

        // Initialize: Show the first section (Prevalence) by default
        if (sidebarLinks.length > 0) {
            showSection(sidebarLinks[0].getAttribute('data-target'));
        } else if (welcomeMessage) {
            welcomeMessage.style.display = 'block';
        }


        // --- Utility Functions ---
        function getNumValue(id) {
            const value = parseFloat(document.getElementById(id).value);
            return isNaN(value) ? null : value;
        }

        function displayOutput(formulaElId, workingElId, resultElId, formula, working, result, error = false) {
            const formulaEl = document.getElementById(formulaElId);
            const workingEl = document.getElementById(workingElId);
            const resultEl = document.getElementById(resultElId);

            formulaEl.style.display = 'block';
            workingEl.style.display = 'block';
            resultEl.style.display = 'block';

            formulaEl.innerHTML = `<strong>Formula:</strong><br>${formula}`;
            workingEl.innerHTML = `<strong>Working:</strong><br>${working}`;
            
            if (error) {
                resultEl.innerHTML = `<strong class="text-red-600">Error:</strong><br>${result}`;
                resultEl.classList.remove('bg-e0f2fe', 'border-blue-500'); // Default success colors
                resultEl.classList.add('bg-red-100', 'border-red-500'); // Error colors
            } else {
                resultEl.innerHTML = `<strong>Result:</strong><br>${result}`;
                resultEl.classList.remove('bg-red-100', 'border-red-500'); // Error colors
                resultEl.classList.add('bg-e0f2fe', 'border-blue-500'); // Default success colors
            }
        }
        
        function clearInputs(sectionId) {
            const section = document.getElementById(sectionId);
            if (section) {
                const inputs = section.querySelectorAll('input[type="number"], input[type="text"]');
                inputs.forEach(input => input.value = '');
                
                // Also clear output fields for that section
                const formulaEl = document.getElementById(`${sectionId.replace('-', '_')}_formula`);
                const workingEl = document.getElementById(`${sectionId.replace('-', '_')}_working`);
                const resultEl = document.getElementById(`${sectionId.replace('-', '_')}_result`);

                if (formulaEl) formulaEl.style.display = 'none';
                if (workingEl) workingEl.style.display = 'none';
                if (resultEl) resultEl.style.display = 'none';
            }
        }

        // --- Calculation Functions ---

        // 1. Prevalence
        function calculatePrevalence() {
            const cases = getNumValue('prev_cases');
            const population = getNumValue('prev_population');
            const formulaId = 'prevalence_formula';
            const workingId = 'prevalence_working';
            const resultId = 'prevalence_result';

            const formulaStr = `Prevalence = (Number of Existing Cases) / (Total Population)`;

            if (cases === null || population === null) {
                displayOutput(formulaId, workingId, resultId, formulaStr, "Please enter valid numbers for all fields.", "Input error.", true);
                return;
            }
            if (population <= 0) {
                displayOutput(formulaId, workingId, resultId, formulaStr, "Total population must be greater than 0.", "Invalid population.", true);
                return;
            }
            if (cases > population) {
                displayOutput(formulaId, workingId, resultId, formulaStr, "Number of cases cannot exceed total population.", "Input error.", true);
                return;
            }


            const prevalence = (cases / population);
            const workingStr = `Prevalence = ${cases} / ${population} = ${prevalence.toFixed(4)}`;
            const resultStr = `The prevalence is <strong>${(prevalence * 100).toFixed(2)}%</strong> (or ${prevalence.toFixed(4)}).`;
            
            displayOutput(formulaId, workingId, resultId, formulaStr, workingStr, resultStr);
        }

        // 2. Incidence Rate
        function calculateIncidenceRate() {
            const newCases = getNumValue('ir_new_cases');
            const personTime = getNumValue('ir_person_time');
            const multiplier = getNumValue('ir_multiplier') || 1; // Default multiplier if not provided
            const formulaId = 'ir_formula';
            const workingId = 'ir_working';
            const resultId = 'ir_result';

            const formulaStr = `Incidence Rate = (Number of New Cases / Total Person-Time at Risk) * Multiplier`;

            if (newCases === null || personTime === null || multiplier === null) {
                displayOutput(formulaId, workingId, resultId, formulaStr, "Please enter valid numbers for all fields.", "Input error.", true);
                return;
            }
            if (personTime <= 0) {
                displayOutput(formulaId, workingId, resultId, formulaStr, "Total person-time at risk must be greater than 0.", "Invalid person-time.", true);
                return;
            }
             if (multiplier <= 0) {
                displayOutput(formulaId, workingId, resultId, formulaStr, "Multiplier must be greater than 0.", "Invalid multiplier.", true);
                return;
            }

            const incidenceRate = (newCases / personTime) * multiplier;
            const workingStr = `Incidence Rate = (${newCases} / ${personTime}) * ${multiplier} = ${incidenceRate.toFixed(4)}`;
            const resultStr = `The incidence rate is <strong>${incidenceRate.toFixed(2)} per ${multiplier.toLocaleString()} person-time units</strong>.`;
            
            displayOutput(formulaId, workingId, resultId, formulaStr, workingStr, resultStr);
        }

        // 3. Relative Risk (RR)
        function calculateRelativeRisk() {
            const a = getNumValue('rr_a'); // Exposed, Disease Yes
            const b = getNumValue('rr_b'); // Exposed, Disease No
            const c = getNumValue('rr_c'); // Unexposed, Disease Yes
            const d = getNumValue('rr_d'); // Unexposed, Disease No
            const formulaId = 'rr_formula';
            const workingId = 'rr_working';
            const resultId = 'rr_result';

            const formulaStr = `
                Incidence in Exposed (Ie) = a / (a + b)<br>
                Incidence in Unexposed (Iu) = c / (c + d)<br>
                Relative Risk (RR) = Ie / Iu
            `;

            if (a === null || b === null || c === null || d === null) {
                displayOutput(formulaId, workingId, resultId, formulaStr, "Please enter valid numbers for a, b, c, and d.", "Input error.", true);
                return;
            }
            if (a < 0 || b < 0 || c < 0 || d < 0) {
                displayOutput(formulaId, workingId, resultId, formulaStr, "Values cannot be negative.", "Input error.", true);
                return;
            }

            const totalExposed = a + b;
            const totalUnexposed = c + d;

            if (totalExposed === 0 || totalUnexposed === 0) {
                displayOutput(formulaId, workingId, resultId, formulaStr, "Total exposed (a+b) and total unexposed (c+d) must be greater than 0.", "Division by zero error.", true);
                return;
            }

            const ie = a / totalExposed;
            const iu = c / totalUnexposed;
            
            let workingStr = `
                Incidence in Exposed (Ie) = ${a} / (${a} + ${b}) = ${a} / ${totalExposed} = ${ie.toFixed(4)}<br>
                Incidence in Unexposed (Iu) = ${c} / (${c} + ${d}) = ${c} / ${totalUnexposed} = ${iu.toFixed(4)}<br>
            `;

            if (iu === 0) {
                 workingStr += `Relative Risk (RR) = ${ie.toFixed(4)} / ${iu.toFixed(4)}<br>`;
                displayOutput(formulaId, workingId, resultId, formulaStr, workingStr + "Cannot calculate RR if incidence in unexposed is zero (division by zero).", "Calculation error.", true);
                return;
            }

            const rr = ie / iu;
            workingStr += `Relative Risk (RR) = ${ie.toFixed(4)} / ${iu.toFixed(4)} = ${rr.toFixed(2)}`;
            
            let interpretation = "";
            if (rr > 1) {
                interpretation = `This suggests an increased risk of the outcome in the exposed group compared to the unexposed group. The risk is <strong>${rr.toFixed(2)} times higher</strong>.`;
            } else if (rr < 1) {
                interpretation = `This suggests a decreased risk (protective effect) of the outcome in the exposed group compared to the unexposed group. The risk is <strong>${rr.toFixed(2)} times lower</strong> (or ${(1-rr).toFixed(2)*100}% lower).`;
            } else {
                interpretation = `This suggests no difference in risk of the outcome between the exposed and unexposed groups.`;
            }
            const resultStr = `The Relative Risk (RR) is <strong>${rr.toFixed(2)}</strong>.<br>${interpretation}`;
            
            displayOutput(formulaId, workingId, resultId, formulaStr, workingStr, resultStr);
        }

        // 4. Odds Ratio (OR)
        function calculateOddsRatio() {
            const a = getNumValue('or_a'); // Cases, Exposed
            const b = getNumValue('or_b'); // Controls, Exposed
            const c = getNumValue('or_c'); // Cases, Unexposed
            const d = getNumValue('or_d'); // Controls, Unexposed
            const formulaId = 'or_formula';
            const workingId = 'or_working';
            const resultId = 'or_result';
            
            // Note: For case-control studies, 'a' are exposed cases, 'b' are exposed controls,
            // 'c' are unexposed cases, 'd' are unexposed controls.
            // The input labels are slightly different from RR for clarity in case-control context.
            // The formula is (a*d) / (b*c)
            // Odds of exposure in cases = a/c
            // Odds of exposure in controls = b/d
            // OR = (a/c) / (b/d) = (a*d) / (b*c)

            const formulaStr = `
                Odds of Exposure in Cases = a / c<br>
                Odds of Exposure in Controls = b / d<br>
                Odds Ratio (OR) = (Odds of Exposure in Cases) / (Odds of Exposure in Controls) = (a * d) / (b * c)
            `;

            if (a === null || b === null || c === null || d === null) {
                displayOutput(formulaId, workingId, resultId, formulaStr, "Please enter valid numbers for a, b, c, and d.", "Input error.", true);
                return;
            }
             if (a < 0 || b < 0 || c < 0 || d < 0) {
                displayOutput(formulaId, workingId, resultId, formulaStr, "Values cannot be negative.", "Input error.", true);
                return;
            }

            if (b === 0 || c === 0) {
                let workingStrError = `Odds Ratio (OR) = (${a} * ${d}) / (${b} * ${c})<br>`;
                displayOutput(formulaId, workingId, resultId, formulaStr, workingStrError + "Cannot calculate OR if b or c is zero (division by zero in the denominator b*c).", "Calculation error.", true);
                return;
            }

            const oddsRatio = (a * d) / (b * c);
            
            const workingStr = `
                Odds of Exposure in Cases = ${a} / ${c} = ${(a/c).toFixed(4)} (assuming c > 0)<br>
                Odds of Exposure in Controls = ${b} / ${d} = ${(b/d).toFixed(4)} (assuming d > 0)<br>
                Odds Ratio (OR) = (${a} * ${d}) / (${b} * ${c}) = (${a*d}) / (${b*c}) = ${oddsRatio.toFixed(2)}
            `;
            
            let interpretation = "";
            if (oddsRatio > 1) {
                interpretation = `This suggests that the odds of exposure are <strong>${oddsRatio.toFixed(2)} times higher</strong> among cases than controls. This indicates an association between the exposure and the disease.`;
            } else if (oddsRatio < 1) {
                interpretation = `This suggests that the odds of exposure are <strong>${oddsRatio.toFixed(2)} times lower</strong> among cases than controls. This indicates a protective association of the exposure.`;
            } else {
                interpretation = `This suggests that the odds of exposure are the same for cases and controls, indicating no association between the exposure and the disease.`;
            }
            const resultStr = `The Odds Ratio (OR) is <strong>${oddsRatio.toFixed(2)}</strong>.<br>${interpretation}`;
            
            displayOutput(formulaId, workingId, resultId, formulaStr, workingStr, resultStr);
        }

