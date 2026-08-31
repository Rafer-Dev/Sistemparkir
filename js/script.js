/* =====================================================
   SISTEM PARKIR - SCRIPT.JS
===================================================== */


/* =====================================================
   1. KONFIGURASI
===================================================== */

const STORAGE_ACTIVE = "parkirku_active";
const STORAGE_HISTORY = "parkirku_history";

const MOTOR_SLOTS = [
    "M1",
    "M2",
    "M3",
    "M4",
    "M5"
];

const CAR_SLOTS = [
    "C1",
    "C2",
    "C3",
    "C4",
    "C5"
];


/* =====================================================
   2. LOCAL STORAGE
===================================================== */

// Mengambil kendaraan yang sedang parkir
function getActive() {

    return JSON.parse(
        localStorage.getItem(STORAGE_ACTIVE) || "[]"
    );

}


// Menyimpan kendaraan yang sedang parkir
function setActive(data) {

    localStorage.setItem(
        STORAGE_ACTIVE,
        JSON.stringify(data)
    );

}


// Mengambil riwayat parkir
function getHistory() {

    return JSON.parse(
        localStorage.getItem(STORAGE_HISTORY) || "[]"
    );

}


// Menyimpan riwayat parkir
function setHistory(data) {

    localStorage.setItem(
        STORAGE_HISTORY,
        JSON.stringify(data)
    );

}


/* =====================================================
   3. FORMAT DATA
===================================================== */

// Format jam
function formatTime(value) {

    return new Date(value).toLocaleTimeString(
        "id-ID",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// Format tanggal dan jam
function formatDateTime(value) {

    return new Date(value).toLocaleString(
        "id-ID",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );

}


// Format Rupiah
function rupiah(value) {

    return "Rp " +
        Number(value).toLocaleString("id-ID");

}


// Mencegah HTML injection
function escapeHtml(value) {

    return String(value).replace(
        /[&<>"']/g,
        function (character) {

            const entities = {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            };

            return entities[character];

        }
    );

}


/* =====================================================
   4. LOAD SIDEBAR, HEADER, FOOTER
===================================================== */

async function loadComponents() {

    const sidebar =
        document.getElementById("sidebar");

    const header =
        document.getElementById("header");

    const footer =
        document.getElementById("footer");


    /*
        Jika halaman berada di dalam folder pages
        maka harus naik satu folder menggunakan ../
    */

    const base =
        location.pathname.includes("/pages/")
            ? "../"
            : "";


    async function readFile(file) {

        const response =
            await fetch(base + file);


        if (!response.ok) {

            throw new Error(
                "Gagal memuat " + file
            );

        }

        return response.text();

    }


    try {

        if (sidebar) {

            sidebar.innerHTML =
                await readFile(
                    "components/sidebar.html"
                );

        }


        if (header) {

            header.innerHTML =
                await readFile(
                    "components/header.html"
                );

        }


        if (footer) {

            footer.innerHTML =
                await readFile(
                    "components/footer.html"
                );

        }


        setActiveMenu();

        setDate();

    }

    catch (error) {

        console.error(error);

    }

}


/* =====================================================
   5. MENU SIDEBAR
===================================================== */

function setActiveMenu() {

    const path =
        location.pathname;


    let page =
        "dashboard";


    if (
        path.includes(
            "parkir.html"
        )
    ) {

        page = "parkir";

    }


    if (
        path.includes(
            "kendaraan.html"
        )
    ) {

        page = "kendaraan";

    }


    if (
        path.includes(
            "riwayat.html"
        )
    ) {

        page = "riwayat";

    }


    document
        .querySelectorAll(
            ".menu a[data-page]"
        )
        .forEach(
            function (link) {

                link.classList.toggle(
                    "active",
                    link.dataset.page === page
                );

            }
        );

}


/* =====================================================
   6. TANGGAL HEADER
===================================================== */

function setDate() {

    const element =
        document.getElementById(
            "currentDate"
        );


    if (!element) {

        return;

    }


    element.textContent =
        new Date().toLocaleDateString(
            "id-ID",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

}


/* =====================================================
   7. DASHBOARD
===================================================== */

function updateDashboard() {

    const active =
        getActive();


    const motor =
        active.filter(
            function (vehicle) {

                return vehicle.jenis === "Motor";

            }
        ).length;


    const mobil =
        active.filter(
            function (vehicle) {

                return vehicle.jenis === "Mobil";

            }
        ).length;


    const total =
        active.length;


    const totalSlot =
        MOTOR_SLOTS.length +
        CAR_SLOTS.length;


    const kosong =
        totalSlot - total;


    const totalElement =
        document.getElementById("total");


    const motorElement =
        document.getElementById("motor");


    const mobilElement =
        document.getElementById("mobil");


    const kosongElement =
        document.getElementById("kosong");


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (motorElement) {

        motorElement.textContent =
            motor;

    }


    if (mobilElement) {

        mobilElement.textContent =
            mobil;

    }


    if (kosongElement) {

        kosongElement.textContent =
            kosong;

    }


    renderMiniSlots(
        "dashboardMotor",
        MOTOR_SLOTS,
        active
    );


    renderMiniSlots(
        "dashboardMobil",
        CAR_SLOTS,
        active
    );


    renderRecentVehicles(active);

}


/* =====================================================
   8. SLOT MINI DASHBOARD
===================================================== */

function renderMiniSlots(
    elementId,
    slots,
    active
) {

    const container =
        document.getElementById(
            elementId
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        slots.map(
            function (slot) {

                const vehicle =
                    active.find(
                        function (item) {

                            return item.slot === slot;

                        }
                    );


                return `

                    <div class="mini-slot
                        ${vehicle ? "occupied" : ""}">

                        <div>
                            ${slot}
                        </div>

                        <small>

                            ${
                                vehicle
                                ? escapeHtml(vehicle.plat)
                                : "Kosong"
                            }

                        </small>

                    </div>

                `;

            }
        ).join("");

}


/* =====================================================
   9. KENDARAAN TERBARU
===================================================== */

function renderRecentVehicles(active) {

    const table =
        document.getElementById(
            "recentTable"
        );


    if (!table) {

        return;

    }


    const recent =
        active
            .slice()
            .reverse()
            .slice(0, 5);


    if (recent.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty">

                    Belum ada kendaraan
                    yang parkir.

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        recent.map(
            function (vehicle, index) {

                return `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            <strong>
                                ${escapeHtml(
                                    vehicle.plat
                                )}
                            </strong>
                        </td>

                        <td>

                            ${
                                vehicle.jenis === "Motor"
                                ? "🏍️ Motor"
                                : "🚘 Mobil"
                            }

                        </td>

                        <td>
                            ${vehicle.slot}
                        </td>

                        <td>
                            ${formatTime(
                                vehicle.jamMasuk
                            )}
                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* =====================================================
   10. AREA PARKIR
===================================================== */

function renderParkingSlots() {

    const active =
        getActive();


    renderParkingArea(
        "motorSlots",
        MOTOR_SLOTS,
        active,
        false
    );


    renderParkingArea(
        "carSlots",
        CAR_SLOTS,
        active,
        true
    );

}


/* =====================================================
   11. RENDER SLOT MOTOR / MOBIL
===================================================== */

function renderParkingArea(
    elementId,
    slots,
    active,
    isCar
) {

    const container =
        document.getElementById(
            elementId
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        slots.map(
            function (slot) {

                const vehicle =
                    active.find(
                        function (item) {

                            return item.slot === slot;

                        }
                    );


                return `

                    <div class="parking-slot

                        ${isCar ? "car" : ""}

                        ${vehicle ? "occupied" : ""}">

                        <div class="slot-name">

                            ${slot}

                        </div>


                        <div class="slot-status">

                            ${
                                vehicle
                                ? "Terisi"
                                : "Kosong"
                            }

                        </div>


                        <div class="plate">

                            ${
                                vehicle
                                ? escapeHtml(
                                    vehicle.plat
                                )
                                : "Slot tersedia"
                            }

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =====================================================
   12. PILIHAN SLOT
===================================================== */

function updateSlotOptions() {

    const jenis =
        document.getElementById(
            "jenis"
        );


    const slot =
        document.getElementById(
            "slot"
        );


    if (!jenis || !slot) {

        return;

    }


    function refreshSlots() {

        const active =
            getActive();


        const slots =
            jenis.value === "Motor"
                ? MOTOR_SLOTS
                : CAR_SLOTS;


        slot.innerHTML =
            slots.map(
                function (slotName) {

                    const occupied =
                        active.some(
                            function (vehicle) {

                                return (
                                    vehicle.slot ===
                                    slotName
                                );

                            }
                        );


                    return `

                        <option
                            value="${slotName}"
                            ${occupied ? "disabled" : ""}>

                            ${slotName}

                            ${
                                occupied
                                ? " - Terisi"
                                : " - Kosong"
                            }

                        </option>

                    `;

                }
            ).join("");

    }


    jenis.addEventListener(
        "change",
        refreshSlots
    );


    refreshSlots();

}


/* =====================================================
   13. FORM KENDARAAN MASUK
===================================================== */

function setupParkingForm() {

    const form =
        document.getElementById(
            "parkingForm"
        );


    if (!form) {

        return;

    }


    updateSlotOptions();


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const plat =
                document
                    .getElementById("plat")
                    .value
                    .trim()
                    .toUpperCase();


            const jenis =
                document
                    .getElementById("jenis")
                    .value;


            const slot =
                document
                    .getElementById("slot")
                    .value;


            const active =
                getActive();


            /* CEK NOMOR POLISI */

            if (!plat) {

                alert(
                    "Masukkan nomor polisi!"
                );

                return;

            }


            /* CEK KENDARAAN */

            const vehicleExists =
                active.some(
                    function (vehicle) {

                        return vehicle.plat === plat;

                    }
                );


            if (vehicleExists) {

                alert(
                    "Kendaraan tersebut masih berada di area parkir!"
                );

                return;

            }


            /* CEK SLOT */

            const slotExists =
                active.some(
                    function (vehicle) {

                        return vehicle.slot === slot;

                    }
                );


            if (slotExists) {

                alert(
                    "Slot tersebut sudah terisi!"
                );

                updateSlotOptions();

                return;

            }


            /* CEK MOTOR */

            if (
                jenis === "Motor" &&
                !slot.startsWith("M")
            ) {

                alert(
                    "Motor harus menggunakan slot motor!"
                );

                return;

            }


            /* CEK MOBIL */

            if (
                jenis === "Mobil" &&
                !slot.startsWith("C")
            ) {

                alert(
                    "Mobil harus menggunakan slot mobil!"
                );

                return;

            }


            /* BUAT DATA */

            const vehicle = {

                id: Date.now(),

                plat: plat,

                jenis: jenis,

                slot: slot,

                jamMasuk:
                    new Date().toISOString()

            };


            active.push(vehicle);


            setActive(active);


            /* RESET FORM */

            form.reset();


            /* UPDATE */

            updateSlotOptions();

            renderParkingSlots();

            updateDashboard();

            renderVehicleTable();


            alert(

                "Kendaraan " +
                plat +
                " berhasil masuk ke slot " +
                slot +
                "!"

            );

        }
    );

}


/* =====================================================
   14. KENDARAAN KELUAR
===================================================== */

function removeVehicle(id) {

    const active =
        getActive();


    const vehicle =
        active.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!vehicle) {

        return;

    }


    const jamKeluar =
        new Date();


    const jamMasuk =
        new Date(
            vehicle.jamMasuk
        );


    /* HITUNG DURASI */

    let durasi =
        Math.ceil(
            (
                jamKeluar -
                jamMasuk
            ) /
            3600000
        );


    if (durasi < 1) {

        durasi = 1;

    }


    /* TARIF */

    let tarifPerJam;


    if (
        vehicle.jenis === "Motor"
    ) {

        tarifPerJam = 2000;

    }

    else {

        tarifPerJam = 5000;

    }


    /* TOTAL */

    const biaya =
        durasi *
        tarifPerJam;


    const message =

        "KENDARAAN KELUAR\n\n" +

        "Plat       : " +
        vehicle.plat +

        "\nJenis      : " +
        vehicle.jenis +

        "\nSlot       : " +
        vehicle.slot +

        "\nDurasi     : " +
        durasi +
        " jam" +

        "\nBiaya      : " +
        rupiah(biaya) +

        "\n\nKeluarkan kendaraan?";


    if (!confirm(message)) {

        return;

    }


    /* SIMPAN RIWAYAT */

    const history =
        getHistory();


    history.unshift({

        ...vehicle,

        jamKeluar:
            jamKeluar.toISOString(),

        durasi:
            durasi,

        biaya:
            biaya

    });


    setHistory(history);


    /* HAPUS DARI PARKIR */

    const newActive =
        active.filter(
            function (item) {

                return item.id !== id;

            }
        );


    setActive(newActive);


    /* UPDATE SEMUA */

    renderVehicleTable();

    renderParkingSlots();

    updateSlotOptions();

    updateDashboard();

    renderHistory();


    alert(

        "Kendaraan berhasil keluar.\n" +
        "Total pembayaran: " +
        rupiah(biaya)

    );

}


/* =====================================================
   15. TABEL KENDARAAN
===================================================== */

function renderVehicleTable() {

    const table =
        document.getElementById(
            "vehicleTable"
        );


    if (!table) {

        return;

    }


    const search =
        document.getElementById(
            "searchVehicle"
        );


    const query =
        search
            ? search.value
                .trim()
                .toUpperCase()
            : "";


    const active =
        getActive().filter(
            function (vehicle) {

                return vehicle.plat.includes(
                    query
                );

            }
        );


    const count =
        document.getElementById(
            "vehicleCount"
        );


    if (count) {

        count.textContent =
            active.length +
            " kendaraan";

    }


    if (active.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty">

                    Tidak ada kendaraan.

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        active.map(
            function (vehicle, index) {

                return `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>


                        <td>

                            <strong>

                                ${escapeHtml(
                                    vehicle.plat
                                )}

                            </strong>

                        </td>


                        <td class="${
                            vehicle.jenis === "Motor"
                            ? "type-motor"
                            : "type-mobil"
                        }">

                            ${
                                vehicle.jenis === "Motor"
                                ? "🏍️ Motor"
                                : "🚘 Mobil"
                            }

                        </td>


                        <td>
                            ${vehicle.slot}
                        </td>


                        <td>
                            ${formatDateTime(
                                vehicle.jamMasuk
                            )}
                        </td>


                        <td>

                            <button
                                class="btn danger small-btn"
                                onclick="removeVehicle(${vehicle.id})">

                                Keluar

                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* =====================================================
   16. PENCARIAN KENDARAAN
===================================================== */

function setupSearch() {

    const search =
        document.getElementById(
            "searchVehicle"
        );


    if (!search) {

        return;

    }


    search.addEventListener(
        "input",
        function () {

            renderVehicleTable();

        }
    );

}


/* =====================================================
   17. RIWAYAT PARKIR
===================================================== */

function renderHistory() {

    const table =
        document.getElementById(
            "historyTable"
        );


    if (!table) {

        return;

    }


    const history =
        getHistory();


    /* TOTAL TRANSAKSI */

    const total =
        document.getElementById(
            "historyTotal"
        );


    if (total) {

        total.textContent =
            history.length;

    }


    /* TOTAL PENDAPATAN */

    const income =
        history.reduce(
            function (sum, vehicle) {

                return (
                    sum +
                    Number(
                        vehicle.biaya || 0
                    )
                );

            },
            0
        );


    const incomeElement =
        document.getElementById(
            "historyIncome"
        );


    if (incomeElement) {

        incomeElement.textContent =
            rupiah(income);

    }


    /* JIKA KOSONG */

    if (history.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty">

                    Belum ada riwayat parkir.

                </td>

            </tr>

        `;

        return;

    }


    /* TAMPILKAN RIWAYAT */

    table.innerHTML =
        history.map(
            function (vehicle, index) {

                return `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>


                        <td>

                            <strong>

                                ${escapeHtml(
                                    vehicle.plat
                                )}

                            </strong>

                        </td>


                        <td>

                            ${
                                vehicle.jenis === "Motor"
                                ? "🏍️ Motor"
                                : "🚘 Mobil"
                            }

                        </td>


                        <td>
                            ${vehicle.slot}
                        </td>


                        <td>
                            ${formatDateTime(
                                vehicle.jamMasuk
                            )}
                        </td>


                        <td>
                            ${formatDateTime(
                                vehicle.jamKeluar
                            )}
                        </td>


                        <td>
                            ${vehicle.durasi} jam
                        </td>


                        <td>

                            <strong>

                                ${rupiah(
                                    vehicle.biaya
                                )}

                            </strong>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* =====================================================
   18. HAPUS RIWAYAT
===================================================== */

function setupHistory() {

    const button =
        document.getElementById(
            "clearHistory"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            const history =
                getHistory();


            if (history.length === 0) {

                alert(
                    "Riwayat masih kosong."
                );

                return;

            }


            const confirmDelete =
                confirm(
                    "Apakah kamu yakin ingin menghapus seluruh riwayat?"
                );


            if (!confirmDelete) {

                return;

            }


            setHistory([]);


            renderHistory();


            alert(
                "Riwayat berhasil dihapus."
            );

        }
    );

}


/* =====================================================
   19. JALANKAN SISTEM
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        /* Load sidebar/header/footer */

        await loadComponents();


        /* Dashboard */

        updateDashboard();


        /* Area parkir */

        renderParkingSlots();


        /* Form parkir */

        setupParkingForm();


        /* Data kendaraan */

        renderVehicleTable();


        /* Search */

        setupSearch();


        /* Riwayat */

        renderHistory();


        /* Tombol hapus riwayat */

        setupHistory();

    }
);
