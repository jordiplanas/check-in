const TOKEN = "REPLACE_ME_WITH_TOKEN";
const API_URL = "https://cupra.metaversotechnologies.com/items/users";

const scanBtn = document.getElementById('scanBtn');
const messageEl = document.getElementById('message');
const userInfoEl = document.getElementById('user-info');
const firstNameEl = document.getElementById('first_name');
const lastNameEl = document.getElementById('last_name');
const displayTagEl = document.getElementById('display-tag');
const countryEl = document.getElementById('country');
const languageEl = document.getElementById('language');
const jobRoleEl = document.getElementById('job_role');

scanBtn.addEventListener('click', async () => {
    if (!('NDEFReader' in window)) {
        updateMessage("❌ Tu navegador no soporta Web NFC. Usa Chrome en Android.");
        return;
    }

    try {
        const ndef = new NDEFReader();
        await ndef.scan();
        
        updateMessage("📡 Buscando pulsera... Acerca el dispositivo.");
        scanBtn.innerText = "ESPERANDO PULSERA...";
        scanBtn.disabled = true;

        ndef.onreadingerror = () => {
            updateMessage("❌ Error al leer la pulsera. Inténtalo de nuevo.");
        };

  ndef.onreading = async (event) => {
    // 1. Limpiamos el ID: eliminamos ":" y pasamos a minúsculas
    const tagId = event.serialNumber.replace(/:/g, '').toLowerCase();
    
    console.log("Tag detectado original:", event.serialNumber);
    console.log("Tag procesado para API:", tagId);

    updateMessage(`✅ Pulsera: ${tagId}. Consultando...`);
    
    // 2. Llamamos a la API con el ID limpio
    await fetchUser(tagId);
    
    // 3. Reactivamos la interfaz
    scanBtn.innerText = "ESCANEAR OTRA VEZ";
    scanBtn.disabled = false;
};

    } catch (error) {
        updateMessage(`❌ Error: ${error.message}`);
        console.error(error);
    }
});

async function fetchUser(tagId) {
    const url = `${API_URL}?filter[tagId][_eq]=${tagId}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.data && result.data.length > 0) {
            const user = result.data[0];
            showUser(user, tagId);
        } else {
            updateMessage("⚠️ Usuario no encontrado para esta pulsera.");
            userInfoEl.classList.add('hidden');
        }
    } catch (error) {
        updateMessage("❌ Error de conexión con la API.");
        console.error(error);
    }
}

function showUser(user, tagId) {
    messageEl.innerText = "¡Lectura exitosa!";
    
    // Datos principales
    firstNameEl.innerText = user.first_name || "N/A";
    lastNameEl.innerText = user.last_name || "N/A";
    
    // Nuevos datos (usamos || por si el campo viene vacío en la API)
    countryEl.innerText = user.country || "No especificado";
    languageEl.innerText = user.language || "No especificado";
    jobRoleEl.innerText = user.job_role || "No especificado";
    
    displayTagEl.innerText = tagId;
    userInfoEl.classList.remove('hidden');
}

function updateMessage(msg) {
    messageEl.innerText = msg;
}
