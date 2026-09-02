export function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alert-box');
    const alertMessage = document.getElementById('alert-message');
    if (alertBox && alertMessage) {
        alertBox.className = `alert ${type}`;
        alertMessage.textContent = message;
        alertBox.classList.remove('hidden');
    }
}