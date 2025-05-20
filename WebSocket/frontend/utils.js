export function showMessage(statusElement,message, isError) {
    statusElement.textContent = message;
    statusElement.style.color = isError ? "red" : "green";
  }
  