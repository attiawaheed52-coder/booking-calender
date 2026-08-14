document.addEventListener("DOMContentLoaded", () => {

    // ── STATE ─────────────────────────────────────────────
    let currentMonth = 10;
    let currentYear = 2025;
    let selectedDate = "2025-11-12";
    let selectedTime = "1:00 PM";

    const months = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    // ── STATUS MAP ────────────────────────────────────────
    const STATUS_MAP = {
        "2025-11-19": "booked",
        "2025-11-26": "pending",
        "2025-11-09": "partial",
        "2025-11-22": "partial"
    };

    const getStatus = (dateStr) => STATUS_MAP[dateStr] || null;

    // ── LEGEND ────────────────────────────────────────────
    const updateLegend = () => {
        const status = getStatus(selectedDate);
        const dots = document.querySelectorAll(".l-box");

        dots.forEach(dot => {
            dot.style.outline = "none";
            dot.style.outlineOffset = "0";
            dot.style.transform = "scale(1)";
        });

        const map = { booked: 0, pending: 1, partial: 2 };

        if (status && dots[map[status]]) {
            dots[map[status]].style.outline = "3px solid #444";
            dots[map[status]].style.outlineOffset = "2px";
            dots[map[status]].style.transform = "scale(1.15)";
        }
    };

    // ── CALENDAR ──────────────────────────────────────────
    const renderCalendar = () => {
        const grid = document.getElementById("daysGrid");

        const headers = Array.from(grid.querySelectorAll(".day-name"));
        grid.innerHTML = "";
        headers.forEach(h => grid.appendChild(h));

        document.querySelector(".cal-header").childNodes[0].textContent =
            `${months[currentMonth]} ${currentYear}`;

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement("div");
            empty.className = "day empty";
            grid.appendChild(empty);
        }

        for (let d = 1; d <= daysInMonth; d++) {

            const mm = String(currentMonth + 1).padStart(2, "0");
            const dd = String(d).padStart(2, "0");
            const dateStr = `${currentYear}-${mm}-${dd}`;

            const cell = document.createElement("div");
            cell.className = "day";
            cell.textContent = d;
            cell.dataset.date = dateStr;

            const stat = getStatus(dateStr);
            if (stat) cell.classList.add(stat);

            if (selectedDate === dateStr) cell.classList.add("selected");

            cell.addEventListener("click", function () {
                if (this.classList.contains("booked")) return;
                selectedDate = this.dataset.date;
                renderCalendar();
                updateLegend();
            });

            grid.appendChild(cell);
        }

        updateLegend();
    };

    // ── MONTH NAVIGATION ──────────────────────────────────
    const calHeaderSpan = document.querySelector(".cal-header span");

    if (calHeaderSpan) {
        calHeaderSpan.innerHTML = `
            <span id="calPrev" style="cursor:pointer;padding:0 8px">&lt;</span>
            <span id="calNext" style="cursor:pointer;padding:0 8px">&gt;</span>
        `;

        document.getElementById("calPrev").addEventListener("click", () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });

        document.getElementById("calNext").addEventListener("click", () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
    }

    // ── TIME SLOT ─────────────────────────────────────────
    const timeGrid = document.getElementById("timeGrid");

    if (timeGrid) {
        timeGrid.addEventListener("click", (e) => {
            if (e.target.classList.contains("time-slot")) {
                document.querySelectorAll(".time-slot")
                    .forEach(s => s.classList.remove("selected"));

                e.target.classList.add("selected");
                selectedTime = e.target.innerText.trim();
            }
        });
    }

    // ── NAVIGATION ────────────────────────────────────────
    document.getElementById("nextBtn").onclick = () => {
        if (!selectedDate || !selectedTime) {
            alert("Please select both a date and a time slot.");
            return;
        }

        document.getElementById("step1").classList.add("hidden");
        document.getElementById("step2").classList.remove("hidden");
        document.getElementById("pLine").style.width = "100%";
        document.getElementById("dot3").classList.add("active");
    };

    document.getElementById("backBtn").onclick = () => {
        document.getElementById("step2").classList.add("hidden");
        document.getElementById("step1").classList.remove("hidden");
        document.getElementById("pLine").style.width = "50%";
        document.getElementById("dot3").classList.remove("active");
    };

    // ── SUBMIT + STORAGE (FIXED) ─────────────────────────
    document.getElementById("submitBtn").onclick = () => {

        const name = document.getElementById("userName").value.trim();
        const email = document.getElementById("userEmail").value.trim();

        if (!name || !email) {
            alert("Please provide both name and email.");
            return;
        }

        const rawStatus =
            (STATUS_MAP && STATUS_MAP[selectedDate]) || "Confirmed";

        const finalStatus =
            rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

        const newEntry = {
            name,
            email,
            date: selectedDate,
            time: selectedTime,
            status: finalStatus
        };

        // ✅ FIX: keep ALL history
        let existingData =
            JSON.parse(localStorage.getItem("bookings")) || [];

        existingData.push(newEntry);

        // ✅ SAVE FULL ARRAY (IMPORTANT FIX)
        localStorage.setItem("bookings", JSON.stringify(existingData));

        localStorage.setItem("userEmail", email);


        document.getElementById("step2").classList.add("hidden");
        document.getElementById("step3").classList.remove("hidden");
    };
    // ── INIT ──────────────────────────────────────────────
    renderCalendar();
});