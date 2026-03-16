const TOKEN = "2v7k141f3zIWKosOjtHUYdaiUbBqI6g6";
const API_URL = "https://cupra.metaversotechnologies.com/items/users";

const scanBtn = document.getElementById('scanBtn');
const messageEl = document.getElementById('message');
const userInfoEl = document.getElementById('user-info');
const firstNameEl = document.getElementById('first_name');
const lastNameEl = document.getElementById('last_name');
const displayTagEl = document.getElementById('display-tag');

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
            const tagId = event.serialNumber;
            updateMessage("✅ Pulsera detectada. Consultando...");
            await fetchUser(tagId);
            
            // Reactivamos el botón después de la lectura
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
    firstNameEl.innerText = user.first_name;
    lastNameEl.innerText = user.last_name;
    displayTagEl.innerText = tagId;
    userInfoEl.classList.remove('hidden');
}

function updateMessage(msg) {
    messageEl.innerText = msg;
}
