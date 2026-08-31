let dataParkir = [];

function parkirMasuk() {

    let plat = document.getElementById("plat").value;
    let jenis = document.getElementById("jenis").value;

    if (plat === "") {
        alert("Masukkan nomor kendaraan!");
        return;
    }

    // Cek kendaraan yang sama
    let sudahAda = dataParkir.some(
        kendaraan => kendaraan.plat.toUpperCase() === plat.toUpperCase()
    );

    if (sudahAda) {
        alert("Kendaraan tersebut masih berada di area parkir!");
        return;
    }

    let kendaraan = {
        plat: plat.toUpperCase(),
        jenis: jenis,
        jamMasuk: new Date()
    };

    dataParkir.push(kendaraan);

    document.getElementById("plat").value = "";

    tampilkanData();
}


function tampilkanData() {

    let tabel = document.getElementById("daftarParkir");

    tabel.innerHTML = "";

    dataParkir.forEach((kendaraan, index) => {

        let jam = kendaraan.jamMasuk.toLocaleTimeString(
            "id-ID",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

        tabel.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${kendaraan.plat}</td>
                <td>${kendaraan.jenis}</td>
                <td>${jam}</td>
                <td>
                    <button 
                        class="keluar"
                        onclick="parkirKeluar(${index})">
                        Keluar
                    </button>
                </td>
            </tr>
        `;
    });

    updateStatus();
}


function parkirKeluar(index) {

    let kendaraan = dataParkir[index];

    let sekarang = new Date();

    let lamaParkir = Math.ceil(
        (sekarang - kendaraan.jamMasuk) / (1000 * 60 * 60)
    );

    if (lamaParkir < 1) {
        lamaParkir = 1;
    }

    let tarif;

    if (kendaraan.jenis === "Motor") {
        tarif = 2000;
    } else {
        tarif = 5000;
    }

    let biaya = lamaParkir * tarif;

    alert(
        "Kendaraan: " + kendaraan.plat +
        "\nJenis: " + kendaraan.jenis +
        "\nLama parkir: " + lamaParkir + " jam" +
        "\nBiaya: Rp " + biaya.toLocaleString("id-ID")
    );

    dataParkir.splice(index, 1);

    tampilkanData();
}


function updateStatus() {

    let jumlahMotor = dataParkir.filter(
        kendaraan => kendaraan.jenis === "Motor"
    ).length;

    let jumlahMobil = dataParkir.filter(
        kendaraan => kendaraan.jenis === "Mobil"
    ).length;

    document.getElementById("total").textContent =
        dataParkir.length;

    document.getElementById("motor").textContent =
        jumlahMotor;

    document.getElementById("mobil").textContent =
        jumlahMobil;
}
